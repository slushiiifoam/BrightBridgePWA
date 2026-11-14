import express from 'express'

const router = express.Router();

router.get('/', (req, res) => {
    return res.json({ message: "This is the test endpoint!" })
});

export default router;