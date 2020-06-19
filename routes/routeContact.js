const express = require("express");
const router = express.Router();

// controller
const { contactForm, contactNodemailer, contactBlogAuthorForm, newsletter } = require("../controllers/controllerForm");

// validators
const {isValidated} = require("../validators/authValidator");
const { contactFormValidator } = require("../validators/contactValidationRules");

// route
router.post("/contact", contactFormValidator,  contactNodemailer);
router.post("/contact-blog-author", contactFormValidator, isValidated,  contactForm);

router.post("/newsletter", newsletter);

module.exports = router;

