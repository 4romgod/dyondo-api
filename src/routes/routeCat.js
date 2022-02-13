const express = require("express");
const router = express.Router();

// Controllers Auth
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// Controllers Category
const { create, list, read, remove } = require("../controllers/controllerCat");

// Validators
const {isValidated} = require("../validators/authValidator");
const { catCreateValidator } = require("../validators/catValidationRules");


// Routes
router.post("/category", catCreateValidator, isValidated, controllerRequireSignin, adminMiddleware,  create);
router.get("/categories", list);
router.get("/category/:slug", read);
router.delete("/category/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;

