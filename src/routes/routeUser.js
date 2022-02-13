const express = require("express");
const router = express.Router();

// Controllers Auth
// controllerRequireSignin checks if it is an authenticated user
// authMiddleware makes user available in the request profile
const { controllerRequireSignin, authMiddleware, adminMiddleware } = require("../controllers/controllerAuth");

// Controllers Users
const { read, publicProfile, update, photo } = require("../controllers/controllerUser");


// LOGIN TO USER PAGE
router.get("/user/profile", controllerRequireSignin, authMiddleware,  read);

// VIEW USER PUBLIC PAGE
router.get("/user/:username", publicProfile);

// UPDATE USER PROFILE
router.put('/user/update', controllerRequireSignin, authMiddleware, update)

// LOGIN TO ADMIN PAGE
router.get("/admin", controllerRequireSignin, adminMiddleware,  read);

// GET USER PROFILE PHOTO
router.get("/user/photo/:username", photo);


module.exports = router;