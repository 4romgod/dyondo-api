const express = require("express");
const router = express.Router();
const { controllerRequireSignin, adminMiddleware } = require("../controllers/controllerAuth");
const { create, list, read, update, remove } = require("../controllers/controllerTag");

router.post("/tags", controllerRequireSignin, adminMiddleware, create);
router.get("/tags", list);
router.get("/tags/:slug", read);
router.put("/tags/:slug", controllerRequireSignin, adminMiddleware, update);
router.delete("/tags/:slug", controllerRequireSignin, adminMiddleware, remove);

module.exports = router;