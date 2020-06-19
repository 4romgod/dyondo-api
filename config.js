const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
require("dotenv").config();

var transporter = nodemailer.createTransport(smtpTransport({
  host: 'smtp.gmail.com',
  service: 'gmail',
  secure: false,
  auth: {
    user: process.env.EMAIL_BUSINESS, 
    pass: process.env.BUSINESS_PASSOWRD 
  }
}));

module.exports = transporter;