const express = require("express");
const router = express.Router();
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");
const { create, list, read, remove } = require("../controllers/controllerTopic");

router.post("/topics", controllerRequireSignin, adminMiddleware,  create);
router.get("/topics", list);
router.get("/topic/:slug", read);
router.delete("/topic/:slug", controllerRequireSignin, adminMiddleware, remove);

module.exports = router;