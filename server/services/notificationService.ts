import { Patient, Doctor } from '@shared/schema';

class NotificationService {
  /**
   * Send a notification to a patient that they've been added to the queue
   * @param {Patient} patient - The patient to notify
   * @param {number} position - Position in queue
   * @param {number} estimatedWaitTime - Estimated wait time in minutes
   * @param {Doctor} doctor - The doctor information
   */
  async sendQueueConfirmation(
    patient: Patient,
    position: number,
    estimatedWaitTime: number,
    doctor: Doctor
  ): Promise<void> {
    try {
      // In a production system, this would send an email or SMS
      // For our demo, we'll just log the notification
      console.log(`[NOTIFICATION] Queue confirmation sent to ${patient.name}`);
      console.log(`- Position: ${position}`);
      console.log(`- Estimated wait time: ${estimatedWaitTime} minutes`);
      console.log(`- Doctor: ${doctor.name}`);
      
      // Example of email notification (would use a library like nodemailer)
      if (patient.email) {
        this.sendEmail(
          patient.email,
          'Queue Registration Confirmation',
          `
          Dear ${patient.name},

          You have been successfully added to Dr. ${doctor.name}'s queue.
          
          Your position: ${position}
          Estimated wait time: ${estimatedWaitTime} minutes
          
          We will notify you when it's almost your turn.
          
          Thank you,
          MediQueue System
          `
        );
      }
      
      // Example of SMS notification (would use a library like Twilio)
      if (patient.phoneNumber) {
        this.sendSMS(
          patient.phoneNumber,
          `MediQueue: You're #${position} in Dr. ${doctor.name}'s queue. Est. wait: ${estimatedWaitTime} mins.`
        );
      }
    } catch (error) {
      console.error('Error sending queue confirmation:', error);
    }
  }

  /**
   * Send a notification to a patient that they're next in line
   * @param {Patient} patient - The patient to notify
   * @param {Doctor} doctor - The doctor information
   */
  async sendUpNextNotification(
    patient: Patient,
    doctor: Doctor
  ): Promise<void> {
    try {
      console.log(`[NOTIFICATION] Up next notification sent to ${patient.name}`);
      console.log(`- Doctor: ${doctor.name}`);
      
      // Example of email notification
      if (patient.email) {
        this.sendEmail(
          patient.email,
          'You\'re Next in Line',
          `
          Dear ${patient.name},

          You're next in line to see Dr. ${doctor.name}.
          Please make your way to Room ${doctor.roomNumber}.
          
          Thank you,
          MediQueue System
          `
        );
      }
      
      // Example of SMS notification
      if (patient.phoneNumber) {
        this.sendSMS(
          patient.phoneNumber,
          `MediQueue: You're next to see Dr. ${doctor.name}. Please head to Room ${doctor.roomNumber}.`
        );
      }
    } catch (error) {
      console.error('Error sending up next notification:', error);
    }
  }

  /**
   * Send a notification to a patient that they'll be seen soon
   * @param {Patient} patient - The patient to notify
   * @param {number} position - Position in queue
   * @param {number} estimatedWaitTime - Estimated wait time in minutes
   * @param {Doctor} doctor - The doctor information
   */
  async sendSoonNotification(
    patient: Patient,
    position: number,
    estimatedWaitTime: number,
    doctor: Doctor
  ): Promise<void> {
    try {
      console.log(`[NOTIFICATION] Soon notification sent to ${patient.name}`);
      console.log(`- Position: ${position}`);
      console.log(`- Estimated wait time: ${estimatedWaitTime} minutes`);
      console.log(`- Doctor: ${doctor.name}`);
      
      // Example of email notification
      if (patient.email) {
        this.sendEmail(
          patient.email,
          'Your Appointment is Coming Up Soon',
          `
          Dear ${patient.name},

          You'll be seen by Dr. ${doctor.name} soon.
          
          Your position: ${position}
          Estimated wait time: ${estimatedWaitTime} minutes
          
          Please be ready when called.
          
          Thank you,
          MediQueue System
          `
        );
      }
      
      // Example of SMS notification
      if (patient.phoneNumber) {
        this.sendSMS(
          patient.phoneNumber,
          `MediQueue: You're #${position} in Dr. ${doctor.name}'s queue. Est. wait: ${estimatedWaitTime} mins. Please be ready.`
        );
      }
    } catch (error) {
      console.error('Error sending soon notification:', error);
    }
  }

  /**
   * Send an SMS notification (mock implementation)
   * @param {string} phoneNumber - The phone number to send to
   * @param {string} message - The message to send
   */
  private async sendSMS(phoneNumber: string, message: string): Promise<void> {
    // In a production system, this would use a service like Twilio
    console.log(`[SMS to ${phoneNumber}] ${message}`);
  }

  /**
   * Send an email notification (mock implementation)
   * @param {string} email - The email address to send to
   * @param {string} subject - The email subject
   * @param {string} body - The email body
   */
  private async sendEmail(email: string, subject: string, body: string): Promise<void> {
    // In a production system, this would use a service like Nodemailer or SendGrid
    console.log(`[EMAIL to ${email}]`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
  }
}

export const notificationService = new NotificationService();
