const express = require("express");
const router = express.Router();


// Controllers Auth 
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// Controllers Tag
const { create, list, listByTopic, read, update, remove } = require("../controllers/controllerTag");

// Validators
const {isValidated} = require("../validators/authValidator");
const { tagCreateValidator } = require("../validators/tagValidationRules");


// Routes
router.post("/tag", controllerRequireSignin, adminMiddleware,  create);
router.get("/tags", list);
router.get("/tags/:topic", listByTopic);
router.get("/tag/:slug", read);
router.put("/tag/:slug", controllerRequireSignin, adminMiddleware, update);
router.delete("/tag/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;