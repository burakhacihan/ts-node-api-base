import { Router } from 'express';
import { EmailController } from '../controllers/email.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getController } from '../middlewares/di.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Create a factory function to get controller instance
const getEmailController = (): EmailController => {
  return getController<EmailController>('EmailController');
};

/**
 * @swagger
 * /api/v1/email/send:
 *   post:
 *     tags:
 *       - Email
 *     summary: Send an email immediately
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [to, from, subject]
 *             properties:
 *               to:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *               from:
 *                 type: string
 *               subject:
 *                 type: string
 *               htmlContent:
 *                 type: string
 *               textContent:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename: { type: string }
 *                     content: { type: string }
 *                     contentType: { type: string }
 *               headers:
 *                 type: object
 *                 additionalProperties: { type: string }
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  '/send',
  authenticate,
  authorize,
  asyncHandler((req, res, next) => {
    const emailController = getEmailController();
    return emailController.sendEmail.bind(emailController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/email/send-with-retry:
 *   post:
 *     tags:
 *       - Email
 *     summary: Send an email with retry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailData]
 *             properties:
 *               emailData:
 *                 type: object
 *                 additionalProperties: true
 *               retryConfig:
 *                 type: object
 *                 properties:
 *                   maxAttempts: { type: number, default: 3 }
 *                   baseDelay: { type: number, default: 1000 }
 *                   maxDelay: { type: number, default: 30000 }
 *                   backoffMultiplier: { type: number, default: 2 }
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  '/send-with-retry',
  authenticate,
  authorize,
  asyncHandler((req, res, next) => {
    const emailController = getEmailController();
    return emailController.sendEmailWithRetry.bind(emailController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/email/queue:
 *   post:
 *     tags:
 *       - Email
 *     summary: Queue an email for background processing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailData]
 *             properties:
 *               emailData:
 *                 type: object
 *                 additionalProperties: true
 *               delay:
 *                 type: number
 *                 description: Delay in milliseconds
 *     responses:
 *       202:
 *         description: Email queued
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.post(
  '/queue',
  authenticate,
  authorize,
  asyncHandler((req, res, next) => {
    const emailController = getEmailController();
    return emailController.queueEmail.bind(emailController)(req, res, next);
  }),
);

export default router;
