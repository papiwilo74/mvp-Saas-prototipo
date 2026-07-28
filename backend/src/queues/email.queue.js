import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../services/email.service.js';

export const emailQueue = new Queue('email-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: true
  }
});

export const emailWorker = new Worker(
  'email-queue',
  async (job) => {
    const { type, payload } = job.data;

    if (type === 'ORDER_CONFIRMATION') {
      await sendOrderConfirmationEmail(payload);
    } else if (type === 'ORDER_STATUS_CHANGE') {
      await sendOrderStatusEmail(payload);
    }
  },
  { connection: redisConnection }
);

emailWorker.on('failed', (job, err) => {
  console.error(`[BullMQ Email Worker] Job ${job?.id} failed:`, err.message);
});
