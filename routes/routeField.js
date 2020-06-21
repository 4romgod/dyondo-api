const express = require("express");
const router = express.Router();

// middleware auth controllers
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// validators
const {isValidated} = require("../validators/authValidator");
const { catCreateValidator } = require("../validators/catValidationRules");


const { create, list, read, remove } = require("../controllers/controllerField");


router.post("/field", controllerRequireSignin, adminMiddleware,  create);
router.get("/fields", list);
router.get("/field/:slug", read);
router.delete("/field/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;

