import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Priority level enum
export const priorityLevelEnum = pgEnum("priority_level", ["normal", "priority", "urgent"]);

// Status enum
export const statusEnum = pgEnum("status", ["waiting", "in-progress", "completed", "no-show", "cancelled"]);

// Appointment type enum
export const appointmentTypeEnum = pgEnum("appointment_type", ["new", "followup", "urgent"]);

// Schema definitions
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("staff"),
  name: text("name").notNull(),
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialization: text("specialization"),
  roomNumber: text("room_number"),
  isAvailable: boolean("is_available").default(true),
  userId: integer("user_id").references(() => users.id),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age"),
  gender: text("gender"),
  phoneNumber: text("phone_number").notNull(),
  email: text("email"),
});

export const queues = pgTable("queues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id),
});

export const queueItems = pgTable("queue_items", {
  id: serial("id").primaryKey(),
  queueId: integer("queue_id").references(() => queues.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  priorityLevel: text("priority_level").notNull().default("normal"), // normal, priority, urgent
  status: text("status").notNull().default("waiting"), // waiting, in-progress, completed, no-show, cancelled
  appointmentType: text("appointment_type").notNull().default("new"), // new, followup, urgent
  estimatedWaitTime: integer("estimated_wait_time"), // in minutes
  timeAdded: timestamp("time_added").defaultNow().notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  notes: text("notes"),
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId]
  }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id]
  }),
  queues: many(queues)
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  queueItems: many(queueItems)
}));

export const queuesRelations = relations(queues, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [queues.doctorId],
    references: [doctors.id]
  }),
  items: many(queueItems)
}));

export const queueItemsRelations = relations(queueItems, ({ one }) => ({
  queue: one(queues, {
    fields: [queueItems.queueId],
    references: [queues.id]
  }),
  patient: one(patients, {
    fields: [queueItems.patientId],
    references: [patients.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
});

export const insertDoctorSchema = createInsertSchema(doctors).pick({
  name: true,
  specialization: true,
  roomNumber: true,
  isAvailable: true,
  userId: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  name: true,
  age: true,
  gender: true,
  phoneNumber: true,
  email: true,
});

export const insertQueueSchema = createInsertSchema(queues).pick({
  name: true,
  doctorId: true,
});

export const insertQueueItemSchema = createInsertSchema(queueItems).pick({
  queueId: true,
  patientId: true,
  priorityLevel: true,
  status: true,
  appointmentType: true,
  estimatedWaitTime: true,
  notes: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Queue = typeof queues.$inferSelect;
export type InsertQueue = z.infer<typeof insertQueueSchema>;

export type QueueItem = typeof queueItems.$inferSelect;
export type InsertQueueItem = z.infer<typeof insertQueueItemSchema>;

// For API responses
export type QueueItemWithPatient = QueueItem & {
  patient: Patient;
};

export type QueueWithItems = Queue & {
  doctor: Doctor;
  items: QueueItemWithPatient[];
  currentItem?: QueueItemWithPatient;
};

export type DoctorWithQueue = Doctor & {
  queue: Queue;
  currentPatient?: QueueItemWithPatient;
};

export type QueueStats = {
  patientsSeen: number;
  totalPatients: number;
  averageWaitTime: number;
  averageConsultTime: number;
};

export type Notification = {
  id: string;
  type: string;
  message: string;
  timestamp: Date;
  read: boolean;
};
