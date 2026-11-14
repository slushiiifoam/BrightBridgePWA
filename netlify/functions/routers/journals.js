import express from 'express';
import { z } from 'zod';
import { journal_service } from '../services/setupService.js';

const createJournalSchema = z.object({
  uuid : z.string().uuid('Invalid user UUID'),
  created_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  overall_emotion: z.string().regex(/^[01]+$/, 'overall_emotion must be a bit string containing only 0s and 1s').nullable().optional().default(null),
  entry: z.string().nullable().optional().default(null),
});

const todayJournalSchema = z.object({
    uuid : z.string().uuid('Invalid user UUID'),
    created_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
});

const updateJournalSchema = createJournalSchema.partial();

const journal_router = express.Router();

const upsertJournal = async (req, res, next) => {
    try {
        const uuid = req.uuid;
        const payload = {...req.body, uuid : uuid};

        const validatedData = createJournalSchema.parse(payload);
        const created = await journal_service.upsertJournal(validatedData);
        res.status(201).json({ success: true, data: created });
    } catch (err) {
        next(err);
    }
};

// CREATE: POST /api/journals
journal_router.post('/', async (req, res, next) => {
try {
    const uuid = req.uuid;
    const payload = {...req.body, uuid : uuid};

    const validatedData = createJournalSchema.parse(payload);
    const created = await journal_service.upsertJournal(validatedData);
    res.status(201).json({ success: true, data: created });
} catch (err) {
    next(err);
}
});

// READ ONE: GET /api/journals/:uuid
journal_router.get('/', async (req, res, next) => {
try {
    const journal = await journal_service.getJournalByUuid(req.uuid);
    if (!journal) {
        return res.status(404).json({ success: false, error: 'Journal entry not found' });
    }
    res.json({ success: true, data: journal });
} catch (err) {
    next(err);
}
});

// READ ONE: GET /api/journals/:uuid
journal_router.get('/today', async (req, res, next) => {
try {
    const uuid = req.uuid; 
    const payload = todayJournalSchema.parse({...req.body, uuid : uuid});

    const journal = await journal_service.getTodayJournal(payload);
    if (!journal) {
        return res.status(404).json({ success: false, error: 'Journal entry not found' });
    }
    res.json({ success: true, data: journal });
} catch (err) {
    next(err);
}
});

// UPDATE: PUT /api/journals/
journal_router.put('/', upsertJournal);

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