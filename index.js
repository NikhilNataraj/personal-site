const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
require('dotenv').config();
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();
const port = process.env.PORT || 9001;

app.set('view engine', 'ejs');
app.set('port', port);
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public/"));

function getCurrentYear() {
    return new Date().getFullYear();
}

app.get("/", function(req, res){
    res.render("Home", { currentYear: getCurrentYear() });
});

app.get("/work", function(req, res){
    const d1 = new Date("2022-05-16");
    const d2 = new Date("2025-06-25");
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();

    const years = Math.floor(months / 12);
    months = months % 12;

    res.render("Work", {
        currentYear: d2.getFullYear(),
        noOfYears : years,
        noOfMonths : months,
        sy : years > 1 ? "s" : "",
        sm : months != 1 ? "s" : ""
    });
});

app.get("/contact", function(req, res){
    res.render("Contact", { currentYear: getCurrentYear(), errors: [] });
});
  
app.post('/send-email', [
    body('email').isEmail().withMessage('Valid email required'),
    body('message').notEmpty().withMessage('Message cannot be empty')
], function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("Contact", { currentYear: getCurrentYear(), errors: errors.array() });
    }

    const { email, message } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL, pass: process.env.PASSWORD }
    });

    const mailOptions = {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: 'New Contact Form Submission',
        text: `Email: ${email}\nMessage:\n${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error(error);
        res.redirect("/contact");
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

app.listen(port, () => console.log("Server running on port " + port));