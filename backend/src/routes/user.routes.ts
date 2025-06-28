import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/me', (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Get user profile' });
});

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               timezone:
 *                 type: string
 *               locale:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/me', (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Update user profile' });
});

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deletion scheduled
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Delete user account' });
});

/**
 * @swagger
 * /api/v1/users/me/export:
 *   get:
 *     summary: Export all user data (GDPR)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data export initiated
 *       401:
 *         description: Unauthorized
 */
router.get('/me/export', (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Export user data' });
});

export default router;