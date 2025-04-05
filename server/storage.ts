import { 
  User, InsertUser,
  Doctor, InsertDoctor,
  Patient, InsertPatient,
  Queue, InsertQueue,
  QueueItem, InsertQueueItem, QueueItemWithPatient
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>; // Alias for getUser for consistency
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyUser(id: number): Promise<User>;

  // Doctor operations
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  getAllDoctors(): Promise<Doctor[]>;
  getDoctorById(id: number): Promise<Doctor | undefined>;
  updateDoctorAvailability(id: number, isAvailable: boolean): Promise<Doctor>;

  // Patient operations
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatientById(id: number): Promise<Patient | undefined>;
  getPatientByPhoneNumber(phoneNumber: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;

  // Queue operations
  createQueue(queue: InsertQueue): Promise<Queue>;
  getQueueById(id: number): Promise<Queue | undefined>;
  getQueueByDoctorId(doctorId: number): Promise<Queue | undefined>;
  getAllQueues(): Promise<Queue[]>;

  // Queue item operations
  createQueueItem(queueItem: InsertQueueItem): Promise<QueueItem>;
  getQueueItemById(id: number): Promise<QueueItem | undefined>;
  getQueueItemsByQueueId(queueId: number): Promise<QueueItemWithPatient[]>;
  getQueueItemsByQueueIdAndStatus(queueId: number, status: string): Promise<QueueItemWithPatient[]>;
  getInProgressQueueItem(queueId: number): Promise<QueueItemWithPatient | undefined>;
  updateQueueItemStatus(id: number, status: string, startTime?: Date, endTime?: Date): Promise<QueueItem>;
  updateQueueItemEstimatedWaitTime(id: number, estimatedWaitTime: number): Promise<QueueItem>;
  getCompletedQueueItemsByDoctorId(doctorId: number, startDate: Date, endDate: Date): Promise<QueueItemWithPatient[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctors: Map<number, Doctor>;
  private patients: Map<number, Patient>;
  private queues: Map<number, Queue>;
  private queueItems: Map<number, QueueItem>;
  
  private userIdCounter: number;
  private doctorIdCounter: number;
  private patientIdCounter: number;
  private queueIdCounter: number;
  private queueItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.doctors = new Map();
    this.patients = new Map();
    this.queues = new Map();
    this.queueItems = new Map();
    
    this.userIdCounter = 1;
    this.doctorIdCounter = 1;
    this.patientIdCounter = 1;
    this.queueIdCounter = 1;
    this.queueItemIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserById(id: number): Promise<User | undefined> {
    return this.getUser(id); // Using the existing getUser method
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.verificationToken === token,
    );
  }
  
  async verifyUser(id: number): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    const updatedUser = { 
      ...user, 
      isVerified: true,
      verificationToken: null 
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    // Ensure required fields are provided
    const user: User = { 
      ...insertUser, 
      id, 
      role: insertUser.role || 'user', // Default role if not provided
      isVerified: insertUser.isVerified !== undefined ? insertUser.isVerified : false,
      verificationToken: insertUser.verificationToken || null
    };
    this.users.set(id, user);
    return user;
  }

  // Doctor operations
  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.doctorIdCounter++;
    // Ensure all required fields have appropriate values
    const doctor: Doctor = { 
      ...insertDoctor, 
      id,
      specialization: insertDoctor.specialization ?? null,
      roomNumber: insertDoctor.roomNumber ?? null,
      isAvailable: insertDoctor.isAvailable ?? false,
      userId: insertDoctor.userId ?? null
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  async getAllDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async getDoctorById(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async updateDoctorAvailability(id: number, isAvailable: boolean): Promise<Doctor> {
    const doctor = this.doctors.get(id);
    if (!doctor) {
      throw new Error('Doctor not found');
    }
    
    const updatedDoctor = { ...doctor, isAvailable };
    this.doctors.set(id, updatedDoctor);
    return updatedDoctor;
  }

  // Patient operations
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.patientIdCounter++;
    // Ensure all required fields have appropriate values
    const patient: Patient = { 
      ...insertPatient, 
      id,
      age: insertPatient.age ?? null,
      gender: insertPatient.gender ?? null,
      email: insertPatient.email ?? null
    };
    this.patients.set(id, patient);
    return patient;
  }

  async getPatientById(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientByPhoneNumber(phoneNumber: string): Promise<Patient | undefined> {
    return Array.from(this.patients.values()).find(
      (patient) => patient.phoneNumber === phoneNumber,
    );
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  // Queue operations
  async createQueue(insertQueue: InsertQueue): Promise<Queue> {
    const id = this.queueIdCounter++;
    // Ensure all required fields have appropriate values
    const queue: Queue = { 
      ...insertQueue, 
      id,
      doctorId: insertQueue.doctorId ?? null
    };
    this.queues.set(id, queue);
    return queue;
  }

  async getQueueById(id: number): Promise<Queue | undefined> {
    return this.queues.get(id);
  }

  async getQueueByDoctorId(doctorId: number): Promise<Queue | undefined> {
    return Array.from(this.queues.values()).find(
      (queue) => queue.doctorId === doctorId,
    );
  }

  async getAllQueues(): Promise<Queue[]> {
    return Array.from(this.queues.values());
  }

  // Queue item operations
  async createQueueItem(insertQueueItem: InsertQueueItem): Promise<QueueItem> {
    const id = this.queueItemIdCounter++;
    const timeAdded = new Date();
    // Ensure all required fields have appropriate values
    const queueItem: QueueItem = { 
      ...insertQueueItem, 
      id, 
      timeAdded,
      startTime: null,
      endTime: null,
      status: insertQueueItem.status || 'waiting',
      priorityLevel: insertQueueItem.priorityLevel || 'normal',
      appointmentType: insertQueueItem.appointmentType || 'new',
      estimatedWaitTime: insertQueueItem.estimatedWaitTime ?? null,
      notes: insertQueueItem.notes ?? null
    };
    this.queueItems.set(id, queueItem);
    return queueItem;
  }

  async getQueueItemById(id: number): Promise<QueueItem | undefined> {
    return this.queueItems.get(id);
  }

  async getQueueItemsByQueueId(queueId: number): Promise<QueueItemWithPatient[]> {
    const items = Array.from(this.queueItems.values()).filter(
      (item) => item.queueId === queueId
    );
    
    // Sort by priority and time added
    items.sort((a, b) => {
      const priorityOrder = { urgent: 0, priority: 1, normal: 2 };
      const aPriority = priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 2;
      const bPriority = priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.timeAdded.getTime() - b.timeAdded.getTime();
    });
    
    // Add patient information
    return Promise.all(items.map(async (item) => {
      const patient = await this.getPatientById(item.patientId);
      return {
        ...item,
        patient: patient!
      };
    }));
  }

  async getQueueItemsByQueueIdAndStatus(queueId: number, status: string): Promise<QueueItemWithPatient[]> {
    const items = Array.from(this.queueItems.values()).filter(
      (item) => item.queueId === queueId && item.status === status
    );
    
    // Sort by priority and time added
    items.sort((a, b) => {
      const priorityOrder = { urgent: 0, priority: 1, normal: 2 };
      const aPriority = priorityOrder[a.priorityLevel as keyof typeof priorityOrder] || 2;
      const bPriority = priorityOrder[b.priorityLevel as keyof typeof priorityOrder] || 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.timeAdded.getTime() - b.timeAdded.getTime();
    });
    
    // Add patient information
    return Promise.all(items.map(async (item) => {
      const patient = await this.getPatientById(item.patientId);
      return {
        ...item,
        patient: patient!
      };
    }));
  }

  async getInProgressQueueItem(queueId: number): Promise<QueueItemWithPatient | undefined> {
    const item = Array.from(this.queueItems.values()).find(
      (item) => item.queueId === queueId && item.status === 'in-progress'
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
    const queueItem = this.queueItems.get(id);
    if (!queueItem) {
      throw new Error('Queue item not found');
    }
    
    const updatedItem = { 
      ...queueItem, 
      status,
      startTime: startTime || queueItem.startTime,
      endTime: endTime || queueItem.endTime
    };
    
    this.queueItems.set(id, updatedItem);
    return updatedItem;
  }

  async updateQueueItemEstimatedWaitTime(id: number, estimatedWaitTime: number): Promise<QueueItem> {
    const queueItem = this.queueItems.get(id);
    if (!queueItem) {
      throw new Error('Queue item not found');
    }
    
    const updatedItem = { ...queueItem, estimatedWaitTime };
    this.queueItems.set(id, updatedItem);
    return updatedItem;
  }

  async getCompletedQueueItemsByDoctorId(doctorId: number, startDate: Date, endDate: Date): Promise<QueueItemWithPatient[]> {
    // First find the queue for this doctor
    const queue = await this.getQueueByDoctorId(doctorId);
    
    if (!queue) {
      return [];
    }
    
    // Get completed items in the date range
    const items = Array.from(this.queueItems.values()).filter(
      (item) => {
        return item.queueId === queue.id && 
               item.status === 'completed' && 
               item.endTime !== null && 
               item.endTime >= startDate && 
               item.endTime <= endDate;
      }
    );
    
    // Add patient information
    return Promise.all(items.map(async (item) => {
      const patient = await this.getPatientById(item.patientId);
      return {
        ...item,
        patient: patient!
      };
    }));
  }
}

// Import the DatabaseStorage class
import { DatabaseStorage } from './DatabaseStorage';

// Use DatabaseStorage instead of MemStorage for persistent storage
export const storage = new DatabaseStorage();
