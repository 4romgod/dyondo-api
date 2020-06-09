const express = require("express");
const router = express.Router();

// middleware auth controllers
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// validators
const {isValidated} = require("../validators/authValidator");
const { catCreateValidator } = require("../validators/catValidationRules");


const { create, list, read, remove } = require("../controllers/controllerCat");


router.post("/category", catCreateValidator, isValidated, controllerRequireSignin, adminMiddleware,  create);
router.get("/categories", list);
router.get("/category/:slug", read);
router.delete("/category/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;

