const mysql = require('mysql2')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

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

//Enrollment
exports.enroll = (req, res) => {
    console.log(req.body);
    const { FirstName, MiddleName, LastName, Address, StudentEmail,
        StudentPassword, ConfirmPassword, Gender, Birthday, SchoolYear } = req.body;
    db.query('SELECT StudentEmail FROM student WHERE StudentEmail =?'
        , [StudentEmail], async (err, result) => {
            if (err) {
                console.log(err);
            }
            if (result.length > 0) {
                return res.render('enroll', { message: 'Student Email is already in use!' });
            }
            else if (StudentPassword !== ConfirmPassword) {
                return res.render('enroll', { message: 'Password entered do not much.' })
            }
            let encpass = await bcrypt.hash(StudentPassword, 8);

            db.query('INSERT INTO student SET ?', {
                FirstName: FirstName, MiddleName: MiddleName, LastName: LastName, Address: Address,
                StudentEmail: StudentEmail, StudentPassword: encpass, Gender: Gender, Birthday: Birthday, SchoolYear: SchoolYear
            }, (err, result) => {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(result)
                    return res.render('enroll', { message: 'Student has been successfully added!' })
                }
            })
        })
}
exports.login = (req, res) => {
    const { UserName, Password } = req.body;
    if (!UserName || !Password) return res.status(400).render('index', { message: 'Please provide Username and Password' });
    db.query('SELECT * FROM admin WHERE UserName = ?'
        , [UserName], (err, result) => {
            if (!result || !((Password, result[0].Password))) {
                res.status(401).render('index', { message: 'UserName or password is incorrect.' })
            } else {
                const id = result[0].AdminID;
                const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRESIN })
                const CookieOptions = {
                    expires: new Date(
                        Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true,
                };
                res.cookie('jwt', token, CookieOptions);
                db.query('SELECT * FROM student', (err, result) => {
                    if (err) throw err;
                    res.render('enrollees', { title: 'List of enrollees', user: result })
                })
            }
        }
    )
}
exports.updateform = (req, res) => {
    const StudentID = req.params.StudentID;
    db.query('SELECT * FROM student WHERE StudentID = ?',
        [StudentID], (err, result) => {
            if (err) throw err;
            res.render('updateform', { title: 'Edit Student', user: result[0] })
        })
}
exports.updatestudent = (req, res) => {
    const { FirstName, MiddleName, LastName, SchoolYear, Address, StudentEmail } = req.body;
    db.query(`UPDATE student SET FirstName = '${FirstName}',MiddleName = '${MiddleName}', 
    LastName = '${LastName}',SchoolYear = '${SchoolYear}',Address = '${Address}' WHERE StudentEmail='${StudentEmail}'`, (err, result) => {
        if (err) throw err;
        db.query(`SELECT * FROM student`, (err, result) => {
            res.render('enrollees', { title: 'List of enrollees', user: result })
        })
    })
}
exports.deletestudent = (req, res) => {
    const StudentID = req.params.StudentID;
    db.query(`DELETE FROM student WHERE StudentID = '${StudentID}'`, (err, result) => {
        if (err) throw err;
        db.query(`SELECT * FROM user`, (err, result) => {
            res.render('enrollees', { title: 'List of enrollees', user: result });
        })
    })
}