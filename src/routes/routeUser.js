const express = require("express");
const router = express.Router();
const { 
    controllerRequireSignin,
    authMiddleware,
    adminMiddleware
} = require("../controllers/controllerAuth");

const {
    read,
    publicProfile,
    update,
    photo
} = require("../controllers/controllerUser");

router.get("/users/:username", publicProfile);
router.put("/users/:username", controllerRequireSignin, authMiddleware, update);
router.get("/users/:username/photo", photo);
router.get("/users/profile/read", controllerRequireSignin, authMiddleware,  read);
router.get("/admin", controllerRequireSignin, adminMiddleware,  read);

module.exports = router;
