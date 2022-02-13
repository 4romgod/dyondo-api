const express = require("express");
const router = express.Router();

// Controllers Auth
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// Controllers Topic
const { create, list, read, remove } = require("../controllers/controllerTopic");

// Validators
const {isValidated} = require("../validators/authValidator");
const { catCreateValidator } = require("../validators/catValidationRules");


// Routes
router.post("/topic", controllerRequireSignin, adminMiddleware,  create);
router.get("/topics", list);
router.get("/topic/:slug", read);
router.delete("/topic/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;

