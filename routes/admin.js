const express = require('express');
const path = require('path');
const fs = require('fs');

module.exports = (db, upload) => {
    const router = express.Router();

    // Middleware to redirect root path to login if not logged in
    router.get('/', (req, res) => {
        if (req.session.admin) {
            return res.redirect('/index');
        }
        res.redirect('/login');
    });

    // Serve the login page
    router.get('/login', (req, res) => {
        res.render('login');
    });

    // Admin login (vulnerable to SQL Injection)
    router.post('/login', (req, res) => {
        const { username, password } = req.body;
        db.get(`SELECT * FROM users WHERE username='${username}' AND password='${password}'`, (err, row) => {
            if (row) {
                req.session.admin = true;
                res.redirect('/index');
            } else {
                res.send('Login failed');
            }
        });
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

    // Admin panel (vulnerable to LFI)
    router.get('/panel', (req, res) => {
        if (!req.session.admin) {
            return res.redirect('/login');
        }
        const filePath = req.query.file ? path.join(__dirname, '../flags/', req.query.file) : null;
        if (filePath && fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.render('admin');
        }
    });

    // Command Injection vulnerability
    router.post('/exec', (req, res) => {
        const { command } = req.body;
        require('child_process').exec(command, (err, stdout, stderr) => {
            if (err) {
                res.send(`Error: ${stderr}`);
            } else {
                res.send(`Output: ${stdout}`);
            }
        });
    });

    // New route for the index page after login
    router.get('/index', (req, res) => {
        if (!req.session.admin) {
            return res.redirect('/login');
        }
        res.render('index');
    });

    return router;
};
