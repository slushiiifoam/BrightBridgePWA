const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({details: "privileges system is healthy"})
});

module.exports = router