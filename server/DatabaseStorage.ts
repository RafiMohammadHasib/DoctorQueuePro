import { eq, and, between, desc, asc } from 'drizzle-orm';
import { db } from './db';
import { users, doctors, patients, queues, queueItems } from '@shared/schema';
import { IStorage } from './storage';
import { 
  User, InsertUser,
  Doctor, InsertDoctor,
  Patient, InsertPatient,
  Queue, InsertQueue,
  QueueItem, InsertQueueItem, QueueItemWithPatient
} from '@shared/schema';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    return user;
  }
  
  async verifyUser(id: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        isVerified: true,
        verificationToken: null
      })
      .where(eq(users.id, id))
      .returning();
      
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Doctor operations
  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(insertDoctor).returning();
    return doctor;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return db.select().from(doctors);
  }

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor;
  }

  async updateDoctorAvailability(id: number, isAvailable: boolean): Promise<Doctor> {
    const [doctor] = await db
      .update(doctors)
      .set({ isAvailable })
      .where(eq(doctors.id, id))
      .returning();
    
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    
    return doctor;
  }

  // Patient operations
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getPatientByPhoneNumber(phoneNumber: string): Promise<Patient | undefined> {
    const [patient] = await db
      .select()
      .from(patients)
      .where(eq(patients.phoneNumber, phoneNumber));
    
    return patient;
  }

  async getAllPatients(): Promise<Patient[]> {
    return db.select().from(patients);
  }

  // Queue operations
  async createQueue(insertQueue: InsertQueue): Promise<Queue> {
    const [queue] = await db.insert(queues).values(insertQueue).returning();
    return queue;
  }

  async getQueueById(id: number): Promise<Queue | undefined> {
    const [queue] = await db.select().from(queues).where(eq(queues.id, id));
    return queue;
  }

  async getQueueByDoctorId(doctorId: number): Promise<Queue | undefined> {
    const [queue] = await db
      .select()
      .from(queues)
      .where(eq(queues.doctorId, doctorId));
    
    return queue;
  }

  async getAllQueues(): Promise<Queue[]> {
    return db.select().from(queues);
  }

  // Queue item operations
  async createQueueItem(insertQueueItem: InsertQueueItem): Promise<QueueItem> {
    const timeAdded = new Date();
    const [queueItem] = await db
      .insert(queueItems)
      .values({ ...insertQueueItem, timeAdded })
      .returning();
    
    return queueItem;
  }

  async getQueueItemById(id: number): Promise<QueueItem | undefined> {
    const [queueItem] = await db
      .select()
      .from(queueItems)
      .where(eq(queueItems.id, id));
    
    return queueItem;
  }

  async getQueueItemsByQueueId(queueId: number): Promise<QueueItemWithPatient[]> {
    // First, get items for the specific queue
    const items = await db
      .select()
      .from(queueItems)
      .where(eq(queueItems.queueId, queueId));
    
    // Then, add patient information to each item
    const itemsWithPatients = await Promise.all(
      items.map(async (item) => {
        const patient = await this.getPatientById(item.patientId);
        return {
          ...item,
          patient: patient!
        };
      })
    );
    
    // Sort items by priority and then by time added
    return itemsWithPatients.sort((a, b) => {
      const priorityOrder = { urgent: 0, priority: 1, normal: 2 };
      const aPriority = priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 2;
      const bPriority = priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.timeAdded.getTime() - b.timeAdded.getTime();
    });
  }

  async getQueueItemsByQueueIdAndStatus(queueId: number, status: string): Promise<QueueItemWithPatient[]> {
    // First, get items for the specific queue and status
    const items = await db
      .select()
      .from(queueItems)
      .where(
        and(
          eq(queueItems.queueId, queueId),
          eq(queueItems.status, status)
        )
      );
    
    // Then, add patient information to each item
    const itemsWithPatients = await Promise.all(
      items.map(async (item) => {
        const patient = await this.getPatientById(item.patientId);
        return {
          ...item,
          patient: patient!
        };
      })
    );
    
    // Sort items by priority and then by time added
    return itemsWithPatients.sort((a, b) => {
      const priorityOrder = { urgent: 0, priority: 1, normal: 2 };
      const aPriority = priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 2;
      const bPriority = priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.timeAdded.getTime() - b.timeAdded.getTime();
    });
  }

  async getInProgressQueueItem(queueId: number): Promise<QueueItemWithPatient | undefined> {
    const [item] = await db
      .select()
      .from(queueItems)
      .where(
        and(
          eq(queueItems.queueId, queueId),
          eq(queueItems.status, 'in-progress')
        )
      );
    
    if (!item) {
      return undefined;
    }
    
    const patient = await this.getPatientById(item.patientId);
    return {
      ...item,
      patient: patient!
    };
  }

  async updateQueueItemStatus(
    id: number, 
    status: string, 
    startTime?: Date, 
    endTime?: Date
  ): Promise<QueueItem> {
    // First get the current item to preserve existing startTime/endTime values if not provided
    const [currentItem] = await db
      .select()
      .from(queueItems)
      .where(eq(queueItems.id, id));
    
    if (!currentItem) {
      throw new Error('Queue item not found');
    }
    
    // Update the items, keeping existing values if not specified
    const [updatedItem] = await db
      .update(queueItems)
      .set({
        status,
        startTime: startTime || currentItem.startTime,
        endTime: endTime || currentItem.endTime
      })
      .where(eq(queueItems.id, id))
      .returning();
    
    if (!updatedItem) {
      throw new Error('Failed to update queue item');
    }
    
    return updatedItem;
  }

  async updateQueueItemEstimatedWaitTime(id: number, estimatedWaitTime: number): Promise<QueueItem> {
    const [updatedItem] = await db
      .update(queueItems)
      .set({ estimatedWaitTime })
      .where(eq(queueItems.id, id))
      .returning();
    
    if (!updatedItem) {
      throw new Error('Queue item not found');
    }
    
    return updatedItem;
  }

  async getCompletedQueueItemsByDoctorId(doctorId: number, startDate: Date, endDate: Date): Promise<QueueItemWithPatient[]> {
    // First find the queue for this doctor
    const queue = await this.getQueueByDoctorId(doctorId);
    
    if (!queue) {
      return [];
    }
    
    // Get completed items in the date range
    const items = await db
      .select()
      .from(queueItems)
      .where(
        and(
          eq(queueItems.queueId, queue.id),
          eq(queueItems.status, 'completed'),
          between(queueItems.endTime, startDate, endDate)
        )
      );
    
    // Add patient information
    return Promise.all(
      items.map(async (item) => {
        const patient = await this.getPatientById(item.patientId);
        return {
          ...item,
          patient: patient!
        };
      })
    );
  }
}