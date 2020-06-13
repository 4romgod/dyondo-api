const express = require("express");
const router = express.Router();

// controller
const { contactForm, contactNodemailer, contactBlogAuthorForm } = require("../controllers/controllerForm");

// validators
const {isValidated} = require("../validators/authValidator");
const { contactFormValidator } = require("../validators/contactValidationRules");

// route
router.post("/contact", contactFormValidator, isValidated,  contactNodemailer);
router.post("/contact-blog-author", contactFormValidator, isValidated,  contactForm);

module.exports = router;

