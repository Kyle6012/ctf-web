const express = require('express');
const path = require('path');
const fs = require('fs');

module.exports = (db) => {
    const router = express.Router();

    // Serve the admin login page
    router.get('/login', (req, res) => {
        res.render('login');
    });

    // Admin login (vulnerable to SQL Injection)
    router.post('/login', (req, res) => {
        const { username, password } = req.body;
        db.get(`SELECT * FROM users WHERE username='${username}' AND password='${password}'`, (err, row) => {
            if (row) {
                req.session.admin = true;
                res.redirect('/admin/panel');
            } else {
                res.send('Login failed');
            }
        });
    });

    // Admin panel (vulnerable to LFI)
    router.get('/panel', (req, res) => {
        if (!req.session.admin) {
            return res.redirect('/admin/login');
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

    return router;
};
