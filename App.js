const dotenv = require('dotenv');
const express = require('express');
const mysql = require('mysql2')
const { dirname } = require('path')
const app = express();
const hostname = 'localhost';
const port = process.env.port || 3000;
const path = require('path');
const cookie = require('cookie-parser');

dotenv.config({ path: './.env' });

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
});
db.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack)
        return
    } else {
        console.log('SQL Connected')
    }
});
app.set('view engine', 'hbs');
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.use('/', require('./routes/enrollroutes'))
app.use('/auth', require('./routes/auth'))

const publicdr = path.join(__dirname, './public/');
app.use(express.static(publicdr));

app.use(cookie());

app.get('/', (req, res) => {
    res.send('enroll')
});

app.listen(port, hostname, () => {
    console.log(`Server running at @http://${hostname}:${port}`)
});