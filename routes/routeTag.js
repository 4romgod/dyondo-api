const express = require("express");
const router = express.Router();



// middleware auth controllers
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");

// validators
const {isValidated} = require("../validators/authValidator");
const { tagCreateValidator } = require("../validators/tagValidationRules");


const { create, list, listByTopic, read, update, remove } = require("../controllers/controllerTag");


router.post("/tag", controllerRequireSignin, adminMiddleware,  create);

router.get("/tags", list);
router.get("/tags/:topic", listByTopic);
router.get("/tag/:slug", read);

router.put("/tag/:slug", controllerRequireSignin, adminMiddleware, update);

router.delete("/tag/:slug", controllerRequireSignin, adminMiddleware, remove);


module.exports = router;