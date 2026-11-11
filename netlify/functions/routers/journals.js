import express from 'express';
import { z } from 'zod';
import { journal_service } from '../services/setupService.js';

const createJournalSchema = z.object({
  created_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  overall_emotion: z.boolean().nullable().optional().default(null),
  entry: z.string().nullable().optional().default(null),
});

const updateJournalSchema = createJournalSchema.partial();

const journal_router = express.Router();

// CREATE: POST /api/journals
journal_router.post('/', async (req, res, next) => {
try {
    const validatedData = createJournalSchema.parse(req.body);
    const created = await journal_service.createJournal(validatedData);
    res.status(201).json({ success: true, data: created });
} catch (err) {
    next(err);
}
});

// READ ALL: GET /api/journals
journal_router.get('/', async (req, res, next) => {
try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const journals = await journal_service.getAllJournals(limit);
    res.json({ success: true, data: journals });
} catch (err) {
    next(err);
}
});

// READ ONE: GET /api/journals/:uuid
journal_router.get('/:uuid', async (req, res, next) => {
try {
    const journal = await journal_service.getJournalByUuid(req.params.uuid);
    if (!journal) {
    return res.status(404).json({ success: false, error: 'Journal entry not found' });
    }
    res.json({ success: true, data: journal });
} catch (err) {
    next(err);
}
});

// UPDATE: PUT /api/journals/:uuid
journal_router.put('/:uuid', async (req, res, next) => {
try {
    const validatedData = updateJournalSchema.parse(req.body);
    const updated = await journal_service.updateJournal(req.params.uuid, validatedData);
    
    if (!updated) {
    return res.status(404).json({ success: false, error: 'Journal entry not found or no changes made' });
    }

    res.json({ success: true, data: updated });
} catch (err) {
    next(err);
}
});

// DELETE: DELETE /api/journals/:uuid
journal_router.delete('/:uuid', async (req, res, next) => {
try {
    const deleted = await journal_service.deleteJournal(req.params.uuid);
    if (!deleted) {
    return res.status(404).json({ success: false, error: 'Journal entry not found or already deleted' });
    }
    res.json({ success: true, message: 'Journal deleted successfully' });
} catch (err) {
    next(err);
}
});

export default journal_router;