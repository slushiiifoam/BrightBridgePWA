import express from 'express'

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({details: "resources system is healthy"})
});

export default router;