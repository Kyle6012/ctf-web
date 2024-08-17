const express = require('express');
const path = require('path');
const fs = require('fs');

module.exports = (db, upload) => {
    const router = express.Router();

    // Homepage
    router.get('/', (req, res) => {
        res.render('index');
    });

    // File upload (vulnerable to RFI)
    router.post('/upload', upload.single('file'), (req, res) => {
        const filePath = path.join(__dirname, '../public/uploads/', req.file.filename);
        res.send(`File uploaded! Access it <a href="/uploads/${req.file.filename}">here</a>.`);
    });

    // Access flags (vulnerable to LFI)
    router.get('/flag', (req, res) => {
        const filePath = req.query.file ? path.join(__dirname, '../flags/', req.query.file) : null;
        if (filePath && fs.existsSync(filePath)) {
            const flag = fs.readFileSync(filePath, 'utf8');
            res.render('flag', { flag });
        } else {
            res.send('Flag not found.');
        }
    });

    return router;
};
