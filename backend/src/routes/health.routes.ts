import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation';
import { HealthProfileSchema, FoodLogEntrySchema, WeightEntrySchema } from '../models/health.model';

const router = Router();

// All health routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/health/profile:
 *   get:
 *     summary: Get health profile
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Health profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Get health profile' });
});

/**
 * @swagger
 * /api/v1/health/profile:
 *   put:
 *     summary: Update health profile
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HealthProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', validateRequest(HealthProfileSchema), (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Update health profile' });
});

/**
 * @swagger
 * /api/v1/health/food-logs:
 *   get:
 *     summary: Get food logs
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Food logs retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/food-logs', (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Get food logs' });
});

/**
 * @swagger
 * /api/v1/health/food-logs:
 *   post:
 *     summary: Add food log entry
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FoodLogEntry'
 *     responses:
 *       201:
 *         description: Food log entry added
 *       401:
 *         description: Unauthorized
 */
router.post('/food-logs', validateRequest(FoodLogEntrySchema), (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Add food log entry' });
});

/**
 * @swagger
 * /api/v1/health/weight-history:
 *   get:
 *     summary: Get weight history
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Weight history retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/weight-history', (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Get weight history' });
});

/**
 * @swagger
 * /api/v1/health/weight-entries:
 *   post:
 *     summary: Add weight entry
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WeightEntry'
 *     responses:
 *       201:
 *         description: Weight entry added
 *       401:
 *         description: Unauthorized
 */
router.post('/weight-entries', validateRequest(WeightEntrySchema), (_req, res) => {
  // TODO: Implement
  res.json({ message: 'Add weight entry' });
});

export default router;