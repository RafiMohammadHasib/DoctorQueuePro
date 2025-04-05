import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';
import { requireAuth, requireRole } from '../auth';
import { hashPassword } from '../auth';

const usersRouter = Router();

// Create a new user (admin only)
usersRouter.post('/users', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsedBody = insertUserSchema
      .extend({
        role: z.enum(['admin', 'doctor', 'receptionist', 'user']),
        fullName: z.string().min(2)
      })
      .parse(req.body);

    // Check if username already exists
    const existingUser = await storage.getUserByUsername(parsedBody.username);
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(parsedBody.password);
    
    const newUser = await storage.createUser({
      ...parsedBody,
      password: hashedPassword,
      email: parsedBody.email || null,
      verified: true, // Admin-created users don't need email verification
      verificationToken: null
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = newUser;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Get all users (admin only)
usersRouter.get('/users', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    
    // Remove sensitive data
    const sanitizedUsers = users.map(({ password, verificationToken, ...rest }) => rest);
    
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
});

// Get user by ID (admin or self only)
usersRouter.get('/users/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check permissions - admin can view any user, regular users can only view themselves
    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to view this user' });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data
    const { password, verificationToken, ...userWithoutSensitiveData } = user;
    
    res.json(userWithoutSensitiveData);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ message: 'Failed to retrieve user' });
  }
});

// Update user (admin or self only)
usersRouter.patch('/users/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Check permissions - admin can update any user, regular users can only update themselves
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && req.user?.id !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this user' });
    }
    
    // Only admins can update role
    if (!isAdmin && req.body.role) {
      return res.status(403).json({ message: 'You are not authorized to change roles' });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Validate update data
    const updateSchema = z.object({
      fullName: z.string().min(2).optional(),
      email: z.string().email().optional().nullable(),
      password: z.string().min(6).optional(),
      role: z.enum(['admin', 'doctor', 'receptionist', 'user']).optional(),
    });
    
    const parsedBody = updateSchema.parse(req.body);
    
    // Hash password if provided
    let updatedUser = { ...parsedBody };
    if (parsedBody.password) {
      updatedUser.password = await hashPassword(parsedBody.password);
    }
    
    const result = await storage.updateUser(userId, updatedUser);
    
    // Remove sensitive data
    const { password, verificationToken, ...userWithoutSensitiveData } = result;
    
    res.json(userWithoutSensitiveData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid user data', errors: error.errors });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user (admin only)
usersRouter.delete('/users/:id', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent deleting your own account
    if (req.user?.id === userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    
    const user = await storage.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await storage.deleteUser(userId);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default usersRouter;