
CREATE TABLE `users` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `username` text NOT NULL,
    `password` text NOT NULL,
    `email` text NOT NULL,
    `role` text DEFAULT 'staff' NOT NULL,
    `name` text NOT NULL,
    `is_verified` integer DEFAULT false NOT NULL,
    `verification_token` text
);

CREATE TABLE `doctors` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL,
    `specialization` text,
    `room_number` text,
    `is_available` integer DEFAULT true NOT NULL,
    `user_id` integer,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

CREATE TABLE `patients` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL,
    `age` integer,
    `gender` text,
    `phone_number` text NOT NULL,
    `email` text
);

CREATE TABLE `queues` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL,
    `doctor_id` integer,
    FOREIGN KEY (`doctor_id`) REFERENCES `doctors`(`id`)
);

CREATE TABLE `queue_items` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `queue_id` integer NOT NULL,
    `patient_id` integer NOT NULL,
    `priority_level` text DEFAULT 'normal' NOT NULL,
    `status` text DEFAULT 'waiting' NOT NULL,
    `appointment_type` text DEFAULT 'new' NOT NULL,
    `estimated_wait_time` integer,
    `time_added` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `start_time` text,
    `end_time` text,
    `notes` text,
    FOREIGN KEY (`queue_id`) REFERENCES `queues`(`id`),
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`)
);

CREATE UNIQUE INDEX `users_username_unique` ON `users`(`username`);
CREATE UNIQUE INDEX `users_email_unique` ON `users`(`email`);
