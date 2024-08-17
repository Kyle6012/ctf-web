const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// SQLite Database Setup
const db = new sqlite3.Database('./database/ctf.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected');
    }
});

// File upload setup
const upload = multer({ dest: 'public/uploads/' });

// Routes
const indexRouter = require('./routes/index')(db, upload);
const adminRouter = require('./routes/admin')(db);

app.use('/', indexRouter);
app.use('/admin', adminRouter);

// Start server
app.listen(port, () => {
    console.log(`CTF website running at http://localhost:${port}`);
});
