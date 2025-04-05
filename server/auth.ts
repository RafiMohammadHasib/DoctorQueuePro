import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { emailService } from "./services/emailService";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'doctor-qms-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: process.env.NODE_ENV === 'production'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }
      
      // Generate verification token
      const verificationToken = randomBytes(32).toString('hex');
      
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        verificationToken,
        isVerified: false,
      });

      // Send verification email
      try {
        await emailService.sendVerificationEmail(user, verificationToken);
        console.log(`Verification email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send verification email:', error);
        // Continue with registration even if email fails
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({...user, verificationToken: undefined});
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Check if email is verified
    if (!req.user?.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in.',
        needsVerification: true
      });
    }
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  
  // Email verification endpoint
  app.get("/api/verify-email/:token", async (req, res, next) => {
    try {
      const { token } = req.params;
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired verification token" });
      }
      
      await storage.verifyUser(user.id);
      
      // If user is already logged in, update their session
      if (req.isAuthenticated() && req.user.id === user.id) {
        req.user.isVerified = true;
      }
      
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      next(error);
    }
  });
}

// Middleware to ensure user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Authentication required' });
}

// Middleware to ensure user has the right role
export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (req.user?.role !== role && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    next();
  };
}