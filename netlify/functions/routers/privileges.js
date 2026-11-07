import express from 'express';
import { z } from 'zod';
import { privilege_service } from '../services/setupService.js';

const router = express.Router();

// 1. Zod Schema for payload validation
const privilegeBodySchema = z.object({
  target_uuid: z.string().min(1, 'target_uuid is required'),
  role: z.enum(['admin', 'editor'], {
    errorMap: () => ({ message: 'role must be either "admin" or "editor"' }),
  }),
});

/**
 * Endpoint for checking router health
 * GET /api/privileges/
 */
router.get('/', (req, res) => {
  return res.status(200).json({ detail: 'privileges router is healthy' });
});

/**
 * Endpoint for getting the calling user's own role
 * GET /api/privileges/me
 */
router.get('/me', async (req, res) => {
  try {
    const userUuid = req.uuid; // Injected by verifyAuthCookie middleware
    const role = await privilege_service.getRole(userUuid);

    return res.status(200).json({
      uuid: userUuid,
      role: role,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ detail: error.message || 'Server error' });
  }
});

/**
 * Endpoint for granting a privilege to another user (Caller must be an admin)
 * POST /api/privileges/grant
 */
router.post('/grant', async (req, res) => {
  try {
    const requesterUuid = req.uuid; // Injected by verifyAuthCookie middleware
    const { target_uuid, role } = privilegeBodySchema.parse(req.body);

    const result = await privilege_service.grantPrivilege(requesterUuid, target_uuid, role);

    return res.status(200).json({ status: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ detail: 'Invalid request payload', errors: error.errors });
    }
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ detail: error.message || 'Failed to grant privilege' });
  }
});

/**
 * Endpoint for revoking a privilege from another user (Caller must be an admin)
 * POST /api/privileges/revoke
 */
router.post('/revoke', async (req, res) => {
  try {
    const requesterUuid = req.uuid; // Injected by verifyAuthCookie middleware
    const { target_uuid, role } = privilegeBodySchema.parse(req.body);

    const result = await privilege_service.revokePrivilege(requesterUuid, target_uuid, role);

    return res.status(200).json({ status: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ detail: 'Invalid request payload', errors: error.errors });
    }
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ detail: error.message || 'Failed to revoke privilege' });
  }
});

export default router;