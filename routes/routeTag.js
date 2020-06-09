const express = require("express");
const router = express.Router();



// middleware auth controllers
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// validators
const {isValidated} = require("../validators/authValidator");
const { tagCreateValidator } = require("../validators/tagValidationRules");


const { create, list, read, remove } = require("../controllers/controllerTag");


router.post("/tag", tagCreateValidator, isValidated, controllerRequireSignin, adminMiddleware,  create);
router.get("/tags", list);
router.get("/tag/:slug", read);
router.delete("/tag/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;