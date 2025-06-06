import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { queueService } from "./services/queueService";
import { notificationService } from "./services/notificationService";
import { emailService } from "./services/emailService";
import { z } from "zod";
import { insertPatientSchema, insertQueueItemSchema, users } from "@shared/schema";
import { setupAuth, requireAuth, requireRole } from "./auth";
import { db } from "./db";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

// WebSocket client management
const clients = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Stripe
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('Missing STRIPE_SECRET_KEY environment variable. Stripe payments will not work.');
  }
  
  const stripe = process.env.STRIPE_SECRET_KEY 
    ? new Stripe(process.env.STRIPE_SECRET_KEY) 
    : undefined;
  
  // Set up authentication
  setupAuth(app);
  
  const httpServer = createServer(app);
  
  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);
    
    console.log(`Client connected: ${clientId}`);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle message based on type
        if (data.type === 'subscribe') {
          // Subscribe to updates for a specific queue
          ws.on('close', () => {
            clients.delete(clientId);
            console.log(`Client disconnected: ${clientId}`);
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
  });

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });
  
  // Email verification route - using link with token
  app.get('/api/verify-email/:token', async (req, res) => {
    try {
      const token = req.params.token;
      const user = await storage.getUserByVerificationToken(token);
      
      if (!user) {
        return res.status(404).json({ message: 'Invalid or expired verification token.' });
      }
      
      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified. You can now log in.' });
      }
      
      const verifiedUser = await storage.verifyUser(user.id);
      
      // If the user is already logged in, update their session
      if (req.isAuthenticated() && req.user.id === verifiedUser.id) {
        req.login(verifiedUser, (err) => {
          if (err) {
            console.error('Error updating session:', err);
          }
        });
      }
      
      return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error('Error verifying email:', error);
      return res.status(500).json({ message: 'An error occurred during verification.' });
    }
  });

  // Manual email verification using code
  app.post('/api/verify-email/code', async (req, res) => {
    try {
      const { email, code } = req.body;
      
      if (!email || !code) {
        return res.status(400).json({ message: 'Email and verification code are required.' });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with the provided email.' });
      }
      
      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified. You can now log in.' });
      }
      
      // Check if the provided code matches the verification token
      if (user.verificationToken !== code) {
        return res.status(400).json({ message: 'Invalid verification code.' });
      }
      
      // Verify the user
      const verifiedUser = await storage.verifyUser(user.id);
      
      // If the user is already logged in, update their session
      if (req.isAuthenticated() && req.user.id === verifiedUser.id) {
        req.login(verifiedUser, (err) => {
          if (err) {
            console.error('Error updating session:', err);
          }
        });
      }
      
      return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
      console.error('Error verifying email with code:', error);
      return res.status(500).json({ message: 'An error occurred during verification.' });
    }
  });

  // Resend verification email
  app.post('/api/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with the provided email.' });
      }
      
      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified. You can now log in.' });
      }
      
      // Generate a new verification code (6 digits)
      const newVerificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update the user's verification token
      await db.update(users)
        .set({ verificationToken: newVerificationCode })
        .where(eq(users.id, user.id));
      
      // Get the updated user
      const updatedUser = await storage.getUserByEmail(email);
      
      if (!updatedUser) {
        return res.status(500).json({ message: 'Error updating verification code.' });
      }
      
      // Resend verification email
      const sent = await emailService.sendVerificationEmail(updatedUser, newVerificationCode);
      
      // Always return the verification code to make development easier
      return res.status(200).json({ 
        message: sent ? 'Verification email sent successfully.' : 'Email service unavailable. Use the verification code below.',
        verificationCode: newVerificationCode,
        verificationUrl: `${process.env.BASE_URL || 'http://localhost:5000'}/verify-email/${newVerificationCode}`
      });
    } catch (error) {
      console.error('Error resending verification email:', error);
      return res.status(500).json({ message: 'An error occurred while resending verification email.' });
    }
  });
  
  // Development shortcut to bypass email verification
  app.post('/api/dev/verify-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
      }
      
      // Get user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found with the provided email.' });
      }
      
      if (user.isVerified) {
        return res.status(200).json({ message: 'Email already verified. You can now log in.' });
      }
      
      // Directly verify the user without email
      const verifiedUser = await storage.verifyUser(user.id);
      
      return res.status(200).json({ 
        message: 'Email verified successfully via development shortcut. You can now log in.',
        user: {
          id: verifiedUser.id,
          email: verifiedUser.email,
          isVerified: verifiedUser.isVerified
        }
      });
    } catch (error) {
      console.error('Error using development verification shortcut:', error);
      return res.status(500).json({ message: 'An error occurred during verification.' });
    }
  });

  // Doctor routes
  app.get('/api/doctors', async (_req, res) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch doctors' });
    }
  });

  app.get('/api/doctors/:id', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await storage.getDoctorById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch doctor' });
    }
  });

  app.post('/api/doctors/:id/toggle-availability', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await storage.getDoctorById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      const updatedDoctor = await storage.updateDoctorAvailability(doctorId, !doctor.isAvailable);
      
      // Broadcast status change to clients
      broadcastToAll({
        type: 'doctor_status_changed',
        doctorId,
        isAvailable: updatedDoctor.isAvailable
      });
      
      res.json(updatedDoctor);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update doctor availability' });
    }
  });

  // Queue routes
  app.get('/api/queues', async (_req, res) => {
    try {
      const queues = await storage.getAllQueues();
      res.json(queues);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch queues' });
    }
  });

  app.get('/api/queues/:id', async (req, res) => {
    try {
      const queueId = parseInt(req.params.id);
      const queue = await storage.getQueueById(queueId);
      
      if (!queue) {
        return res.status(404).json({ message: 'Queue not found' });
      }
      
      // Get all items in the queue with patient details
      const items = await storage.getQueueItemsByQueueId(queueId);
      const queueWithItems = {
        ...queue,
        items
      };
      
      res.json(queueWithItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch queue' });
    }
  });

  app.get('/api/doctors/:id/queue', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await storage.getDoctorById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      const queue = await storage.getQueueByDoctorId(doctorId);
      
      if (!queue) {
        return res.status(404).json({ message: 'Queue not found for this doctor' });
      }
      
      // Get all items in the queue with patient details
      const items = await storage.getQueueItemsByQueueId(queue.id);
      
      // Get current patient
      const currentPatient = items.find(item => item.status === 'in-progress');
      
      const queueWithItems = {
        ...queue,
        doctor,
        items,
        currentItem: currentPatient
      };
      
      res.json(queueWithItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch doctor queue' });
    }
  });

  // Patient registration and queue management
  app.post('/api/patients', async (req, res) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      
      // Check if patient already exists
      let patient = await storage.getPatientByPhoneNumber(patientData.phoneNumber);
      
      if (!patient) {
        // Create new patient
        patient = await storage.createPatient(patientData);
      }
      
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid patient data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create patient' });
    }
  });

  app.post('/api/queues/:queueId/add-patient', async (req, res) => {
    try {
      const queueId = parseInt(req.params.queueId);
      const queue = await storage.getQueueById(queueId);
      
      if (!queue) {
        return res.status(404).json({ message: 'Queue not found' });
      }
      
      const { patientId, appointmentType, priorityLevel, notes } = req.body;
      
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required' });
      }
      
      const patient = await storage.getPatientById(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found' });
      }
      
      // Get the average consultation time for the queue's doctor
      if (!queue.doctorId) {
        return res.status(400).json({ message: 'Queue does not have an assigned doctor' });
      }
      
      const doctorId = queue.doctorId as number; // Type assertion since we've checked it's not null
      const doctor = await storage.getDoctorById(doctorId);
      const waitingItems = await storage.getQueueItemsByQueueIdAndStatus(queueId, 'waiting');
      
      // Calculate estimated wait time
      const avgConsultTime = await queueService.calculateAverageConsultationTime(doctorId);
      const estimatedWaitTime = waitingItems.length * avgConsultTime;
      
      // Create queue item
      const queueItemData = {
        queueId,
        patientId,
        priorityLevel: priorityLevel || 'normal',
        status: 'waiting',
        appointmentType: appointmentType || 'new',
        estimatedWaitTime,
        notes: notes || ''
      };
      
      const queueItem = await storage.createQueueItem(queueItemData);
      
      // Get position in queue (considering priority)
      const position = await queueService.getPositionInQueue(queueId, queueItem.id);
      
      // Generate response with additional info
      const response = {
        ...queueItem,
        patient,
        position,
        estimatedWaitTime
      };
      
      // Broadcast queue update to clients
      broadcastToAll({
        type: 'queue_updated',
        queueId,
        action: 'patient_added'
      });
      
      res.status(201).json(response);
    } catch (error) {
      console.error('Error adding patient to queue:', error);
      res.status(500).json({ message: 'Failed to add patient to queue' });
    }
  });

  app.post('/api/queues/:queueId/call-next', async (req, res) => {
    try {
      const queueId = parseInt(req.params.queueId);
      const queue = await storage.getQueueById(queueId);
      
      if (!queue) {
        return res.status(404).json({ message: 'Queue not found' });
      }
      
      // Check if there's already a patient in progress
      const inProgressItem = await storage.getInProgressQueueItem(queueId);
      
      if (inProgressItem) {
        return res.status(400).json({ 
          message: 'Cannot call next patient. There is already a patient in progress.',
          currentPatient: inProgressItem
        });
      }
      
      // Find the next patient in queue (respecting priority)
      const nextPatient = await queueService.findNextPatientInQueue(queueId);
      
      if (!nextPatient) {
        return res.status(404).json({ message: 'No patients in queue' });
      }
      
      // Update queue item status
      const updatedItem = await storage.updateQueueItemStatus(
        nextPatient.id, 
        'in-progress', 
        new Date()
      );
      
      // Update estimated wait times for remaining patients
      await queueService.updateWaitTimes(queueId);
      
      // Broadcast queue update to clients
      broadcastToAll({
        type: 'queue_updated',
        queueId,
        action: 'next_patient_called',
        patientId: nextPatient.patientId
      });
      
      // Get full patient details
      const patient = await storage.getPatientById(nextPatient.patientId);
      const response = {
        ...updatedItem,
        patient
      };
      
      res.json(response);
    } catch (error) {
      console.error('Error calling next patient:', error);
      res.status(500).json({ message: 'Failed to call next patient' });
    }
  });

  app.post('/api/queue-items/:id/complete', async (req, res) => {
    try {
      const queueItemId = parseInt(req.params.id);
      const queueItem = await storage.getQueueItemById(queueItemId);
      
      if (!queueItem) {
        return res.status(404).json({ message: 'Queue item not found' });
      }
      
      // Complete the consultation
      const updatedItem = await storage.updateQueueItemStatus(
        queueItemId, 
        'completed', 
        undefined, 
        new Date()
      );
      
      // Get the queue for broadcasting
      const queueId = queueItem.queueId;
      
      // Update estimated wait times for remaining patients
      await queueService.updateWaitTimes(queueId);
      
      // Broadcast queue update to clients
      broadcastToAll({
        type: 'queue_updated',
        queueId,
        action: 'consultation_completed',
        queueItemId
      });
      
      res.json(updatedItem);
    } catch (error) {
      console.error('Error completing consultation:', error);
      res.status(500).json({ message: 'Failed to complete consultation' });
    }
  });

  app.post('/api/queue-items/:id/cancel', async (req, res) => {
    try {
      const queueItemId = parseInt(req.params.id);
      const queueItem = await storage.getQueueItemById(queueItemId);
      
      if (!queueItem) {
        return res.status(404).json({ message: 'Queue item not found' });
      }
      
      // Cancel the queue item
      const updatedItem = await storage.updateQueueItemStatus(queueItemId, 'cancelled');
      
      // Get the queue for broadcasting
      const queueId = queueItem.queueId;
      
      // Update estimated wait times for remaining patients
      await queueService.updateWaitTimes(queueId);
      
      // Broadcast queue update to clients
      broadcastToAll({
        type: 'queue_updated',
        queueId,
        action: 'consultation_cancelled',
        queueItemId
      });
      
      res.json(updatedItem);
    } catch (error) {
      console.error('Error cancelling queue item:', error);
      res.status(500).json({ message: 'Failed to cancel queue item' });
    }
  });

  app.get('/api/doctors/:id/stats', async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const doctor = await storage.getDoctorById(doctorId);
      
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found' });
      }
      
      const stats = await queueService.getDoctorStats(doctorId);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
      res.status(500).json({ message: 'Failed to fetch doctor stats' });
    }
  });

  // Initialize some sample data if needed
  await initializeSampleData();

  // Stripe payment routes
  if (stripe) {
    // Payment intent creation for one-time payments
    app.post('/api/create-payment-intent', async (req, res) => {
      try {
        const { amount, planId } = req.body;
        
        if (!amount) {
          return res.status(400).json({ message: 'Amount is required' });
        }
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            planId: planId || ''
          }
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ 
          message: 'Failed to create payment intent',
          error: error.message 
        });
      }
    });
    
    // Webhook for handling Stripe events (payment succeeded, failed, etc.)
    app.post('/api/stripe-webhook', async (req, res) => {
      const signature = req.headers['stripe-signature'] as string;
      
      if (!signature) {
        return res.status(400).json({ message: 'Stripe signature is missing' });
      }
      
      try {
        const event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        );
        
        // Handle the event based on its type
        switch (event.type) {
          case 'payment_intent.succeeded':
            // Handle successful payment
            const paymentIntent = event.data.object;
            console.log('Payment succeeded:', paymentIntent.id);
            break;
            
          case 'payment_intent.payment_failed':
            // Handle failed payment
            const failedPayment = event.data.object;
            console.log('Payment failed:', failedPayment.id);
            break;
            
          default:
            console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
      } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(400).json({ message: 'Webhook signature verification failed' });
      }
    });
  }

  return httpServer;
}

// Utility function to broadcast to all connected WebSocket clients
function broadcastToAll(data: any) {
  const message = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Function to initialize sample data
async function initializeSampleData() {
  try {
    // Check if we already have doctors
    const existingDoctors = await storage.getAllDoctors();
    
    if (existingDoctors.length === 0) {
      // Create sample doctor user
      const doctorUser = await storage.createUser({
        username: 'drjohnson',
        password: 'password123',
        email: 'sarah.johnson@example.com',
        role: 'doctor',
        name: 'Dr. Sarah Johnson',
        isVerified: true,
        verificationToken: null
      });
      
      // Create sample doctor
      const doctor = await storage.createDoctor({
        name: 'Dr. Sarah Johnson',
        specialization: 'General Practice',
        roomNumber: '204',
        isAvailable: true,
        userId: doctorUser.id
      });
      
      // Create queue for the doctor
      await storage.createQueue({
        name: `Dr. ${doctor.name}'s Queue`,
        doctorId: doctor.id
      });
      
      // Create admin user
      await storage.createUser({
        username: 'admin',
        password: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        name: 'System Administrator',
        isVerified: true,
        verificationToken: null
      });
      
      // Create receptionist user
      await storage.createUser({
        username: 'receptionist',
        password: 'password123',
        email: 'reception@example.com',
        role: 'receptionist',
        name: 'Front Desk',
        isVerified: true,
        verificationToken: null
      });
      
      console.log('Sample data initialized');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
