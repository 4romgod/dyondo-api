const express = require("express");
const router = express.Router();

// middleware auth controllers
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// validators
const {isValidated} = require("../validators/authValidator");
const { catCreateValidator } = require("../validators/catValidationRules");


const { create, list, read, remove } = require("../controllers/controllerTopic");


router.post("/topic", controllerRequireSignin, adminMiddleware,  create);
router.get("/topics", list);
router.get("/topic/:slug", read);
router.delete("/topic/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;

