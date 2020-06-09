const express = require("express");
const router = express.Router();

// controller
const { contactForm, contactBlogAuthorForm } = require("../controllers/controllerForm");

// validators
const {isValidated} = require("../validators/authValidator");
const { contactFormValidator } = require("../validators/contactValidationRules");

// route
router.post("/contact", contactFormValidator, isValidated,  contactForm);
router.post("/contact-blog-author", contactFormValidator, isValidated,  contactBlogAuthorForm);

module.exports = router;

