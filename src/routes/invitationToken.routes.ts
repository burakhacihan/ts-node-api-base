import { Router } from 'express';
import { InvitationTokenController } from '../controllers/invitationToken.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { getController } from '../middlewares/di.middleware';

const router = Router();

// Create a factory function to get controller instance
const getInvitationTokenController = (): InvitationTokenController => {
  return getController<InvitationTokenController>('InvitationTokenController');
};

/**
 * @swagger
 * /api/v1/invitation-tokens:
 *   post:
 *     tags:
 *       - Invitation Tokens
 *     summary: Create an invitation token
 *     description: Creates an invitation token for the authenticated user. Requires roles to be present on the user context.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresInHours:
 *                 type: number
 *                 default: 24
 *     responses:
 *       201:
 *         description: Invitation token created
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  asyncHandler((req, res, next) => {
    const invitationTokenController = getInvitationTokenController();
    return invitationTokenController.create.bind(invitationTokenController)(req, res, next);
  }),
);

/**
 * @swagger
 * /api/v1/invitation-tokens:
 *   get:
 *     tags:
 *       - Invitation Tokens
 *     summary: List invitation tokens
 *     description: Lists invitation tokens (admin context expected).
 *     responses:
 *       200:
 *         description: Invitation tokens fetched
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/',
  asyncHandler((req, res, next) => {
    const invitationTokenController = getInvitationTokenController();
    return invitationTokenController.list.bind(invitationTokenController)(req, res, next);
  }),
);

export default router;
