import { storage } from '../storage';
import { QueueItemWithPatient, QueueStats } from '@shared/schema';

class QueueService {
  /**
   * Calculate the average consultation time for a doctor
   * @param {number} doctorId - The doctor's ID
   * @returns {Promise<number>} Average time in minutes
   */
  async calculateAverageConsultationTime(doctorId: number): Promise<number> {
    try {
      // Get completed consultations from the last 7 days
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const completedItems = await storage.getCompletedQueueItemsByDoctorId(
        doctorId,
        sevenDaysAgo,
        now
      );
      
      if (completedItems.length === 0) {
        return 15; // Default 15 minutes if no data
      }
      
      // Calculate average duration in minutes
      let totalMinutes = 0;
      let validItems = 0;
      
      for (const item of completedItems) {
        if (item.startTime && item.endTime) {
          const startTime = new Date(item.startTime);
          const endTime = new Date(item.endTime);
          const durationMs = endTime.getTime() - startTime.getTime();
          totalMinutes += durationMs / 60000; // Convert ms to minutes
          validItems++;
        }
      }
      
      if (validItems === 0) {
        return 15; // Default 15 minutes if no valid data
      }
      
      return Math.ceil(totalMinutes / validItems);
    } catch (error) {
      console.error('Error calculating average time:', error);
      return 15; // Default fallback
    }
  }

  /**
   * Find the next patient to be called from the queue
   * @param {number} queueId - The queue ID
   * @returns {Promise<QueueItemWithPatient | undefined>} The next patient in queue
   */
  async findNextPatientInQueue(queueId: number): Promise<QueueItemWithPatient | undefined> {
    try {
      // Get all waiting patients in priority order
      const waitingItems = await storage.getQueueItemsByQueueIdAndStatus(queueId, 'waiting');
      
      if (waitingItems.length === 0) {
        return undefined;
      }
      
      // The items are already sorted by priority and time added in the storage layer
      return waitingItems[0];
    } catch (error) {
      console.error('Error finding next patient:', error);
      throw error;
    }
  }

  /**
   * Update estimated wait times for all patients in a queue
   * @param {number} queueId - The queue ID
   */
  async updateWaitTimes(queueId: number): Promise<void> {
    try {
      // Get all waiting patients in priority order
      const waitingItems = await storage.getQueueItemsByQueueIdAndStatus(queueId, 'waiting');
      
      if (waitingItems.length === 0) {
        return;
      }
      
      // Get queue to fetch doctor ID
      const queue = await storage.getQueueById(queueId);
      if (!queue) {
        throw new Error('Queue not found');
      }
      
      // Calculate average consultation time
      const avgConsultTime = await this.calculateAverageConsultationTime(queue.doctorId);
      
      // Update estimated wait times for each patient
      for (let i = 0; i < waitingItems.length; i++) {
        const position = i;
        const estimatedWaitTime = position * avgConsultTime;
        
        await storage.updateQueueItemEstimatedWaitTime(
          waitingItems[i].id,
          estimatedWaitTime
        );
      }
    } catch (error) {
      console.error('Error updating wait times:', error);
      throw error;
    }
  }

  /**
   * Get a patient's position in the queue
   * @param {number} queueId - The queue ID
   * @param {number} queueItemId - The queue item ID
   * @returns {Promise<number>} Position in queue (1-based)
   */
  async getPositionInQueue(queueId: number, queueItemId: number): Promise<number> {
    try {
      // Get all waiting patients in priority order
      const waitingItems = await storage.getQueueItemsByQueueIdAndStatus(queueId, 'waiting');
      
      const position = waitingItems.findIndex(item => item.id === queueItemId);
      
      if (position === -1) {
        throw new Error('Queue item not found in waiting list');
      }
      
      // Return 1-based position (position + 1)
      return position + 1;
    } catch (error) {
      console.error('Error getting position in queue:', error);
      throw error;
    }
  }

  /**
   * Get doctor's queue statistics
   * @param {number} doctorId - The doctor's ID
   * @returns {Promise<QueueStats>} Queue statistics
   */
  async getDoctorStats(doctorId: number): Promise<QueueStats> {
    try {
      // Get queue for this doctor
      const queue = await storage.getQueueByDoctorId(doctorId);
      
      if (!queue) {
        throw new Error('Queue not found for doctor');
      }
      
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get completed items for today
      const completedItems = await storage.getCompletedQueueItemsByDoctorId(
        doctorId,
        today,
        tomorrow
      );
      
      // Get all queue items for today
      const allItems = await storage.getQueueItemsByQueueId(queue.id);
      const todayItems = allItems.filter(item => {
        const itemDate = new Date(item.timeAdded);
        return itemDate >= today && itemDate < tomorrow;
      });
      
      // Calculate stats
      const patientsSeen = completedItems.length;
      const totalPatients = todayItems.length;
      
      // Calculate average wait time
      let totalWaitTime = 0;
      let waitCount = 0;
      
      for (const item of completedItems) {
        if (item.startTime) {
          const timeAdded = new Date(item.timeAdded);
          const startTime = new Date(item.startTime);
          const waitMinutes = (startTime.getTime() - timeAdded.getTime()) / 60000;
          totalWaitTime += waitMinutes;
          waitCount++;
        }
      }
      
      const averageWaitTime = waitCount > 0 
        ? Math.ceil(totalWaitTime / waitCount) 
        : 0;
      
      // Calculate average consultation time
      const averageConsultTime = await this.calculateAverageConsultationTime(doctorId);
      
      return {
        patientsSeen,
        totalPatients,
        averageWaitTime,
        averageConsultTime
      };
    } catch (error) {
      console.error('Error getting doctor stats:', error);
      throw error;
    }
  }
}

export const queueService = new QueueService();
