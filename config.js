const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
require("dotenv").config();

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.EMAIL_BUSINESS, 
    pass: process.env.BUSINESS_PASSOWRD 
  }
}));

module.exports = transporter;