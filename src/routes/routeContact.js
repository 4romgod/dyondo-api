const express = require("express");
const router = express.Router();
const { contactNodemailer, contactBlogAuthorForm, newsletter } = require("../controllers/controllerForm");
const { contactFormValidator } = require("../validators/contactValidationRules");
const { isValidated } = require("../validators/authValidator");

router.post("/contact", contactFormValidator,  contactNodemailer);
router.post("/contact-blog-author", contactFormValidator, isValidated,  contactBlogAuthorForm);
router.post("/newsletter", newsletter);

module.exports = router;

