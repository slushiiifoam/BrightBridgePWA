import express from 'express';
import { z } from 'zod';
import { resource_service } from '../services/setupService.js';

const router = express.Router();

// 1. Zod Schemas (equivalent to Pydantic models)
const selectBodySchema = z.object({
  limit: z.coerce.number().default(50),
  query: z.string().optional().nullable(),
});

const upsertBodySchema = z.object({
  id: z.union([z.string(), z.number()]).optional().nullable(),
  title: z.string(),
  link: z.string().url(),
  description: z.string(),
});

/**
 * Health check endpoint
 * GET /api/resources/
 */
router.get('/', (req, res) => {
  return res.status(200).json({ detail: 'resources router is healthy' });
});

/**
 * Retrieve resources
 * POST /api/resources/retrieve
 * (Note: FastAPI allow GET requests with a JSON body; Express standardly uses POST for request body payloads)
 */
router.post('/retrieve', async (req, res) => {
  try {
    const body = selectBodySchema.parse(req.body || {});
    const resources = await resource_service.getResources(body);

    return res.status(200).json(resources);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ detail: 'Invalid parameters', errors: error.errors });
    }
    return res.status(500).json({ detail: error.message || 'Internal Server Error' });
  }
});

/**
 * Upsert resource data
 * POST /api/resources/upsert
 */
router.post('/upsert', async (req, res) => {
  try {
    const userUuid = req.uuid; // Injected by verifyAuthCookie middleware
    const validatedBody = upsertBodySchema.parse(req.body);

    // Clone payload and remove null/undefined `id` field for new inserts
    const docInfoDict = { ...validatedBody };
    if (docInfoDict.id === null || docInfoDict.id === undefined) {
      delete docInfoDict.id;
    }

    const resultStatus = await resource_service.upsertResource(userUuid, docInfoDict);

    return res.status(200).json({ status: resultStatus });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ detail: 'Invalid request payload', errors: error.errors });
    }
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ detail: error.message || 'Failed to upsert resource' });
  }
});

/**
 * Remove a resource by ID
 * DELETE /api/resources/delete/:resource_id
 */
router.delete('/delete/:resource_id', async (req, res) => {
  try {
    const userUuid = req.uuid; // Injected by verifyAuthCookie middleware
    const resourceId = parseInt(req.params.resource_id, 10);

    if (isNaN(resourceId)) {
      return res.status(400).json({ detail: 'resource_id must be a valid integer' });
    }

    const resultStatus = await resource_service.removeResource(userUuid, resourceId);

    return res.status(200).json({ status: resultStatus });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ detail: error.message || 'Failed to remove resource' });
  }
});

export default router;