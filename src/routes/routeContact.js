const express = require("express");
const router = express.Router();

// Controllers Form
const { contactForm, contactNodemailer, contactBlogAuthorForm, newsletter } = require("../controllers/controllerForm");

// Validators
const {isValidated} = require("../validators/authValidator");
const { contactFormValidator } = require("../validators/contactValidationRules");


// Routes
router.post("/contact", contactFormValidator,  contactNodemailer);
router.post("/contact-blog-author", contactFormValidator, isValidated,  contactBlogAuthorForm);
router.post("/newsletter", newsletter);


module.exports = router;

