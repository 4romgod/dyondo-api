const express = require("express");
const router = express.Router();

// auth controllers
const { controllerSignup,
    controllerPreSignup, 
    controllerSignin, 
    controllerSignout, 
    controllerRequireSignin,
    controllerResetPassword,
    controllerForgotPassword,
    googleLogin } = require("../controllers/controllerAuth");


// validators
const {isValidated} = require("../validators/authValidator");
const {userSignupValidator, userSigninValidator, forgotPasswordValidator, resetPasswordValidator} = require("../validators/authValidationRules");


router.post("/pre-signup", userSignupValidator, isValidated, controllerPreSignup);
router.post("/signup", controllerSignup);
router.post("/signin", userSigninValidator, isValidated, controllerSignin);
router.get("/signout", controllerSignout);

router.put("/forgot-password", forgotPasswordValidator, isValidated, controllerForgotPassword);
router.post("/reset-password", resetPasswordValidator, isValidated, controllerResetPassword);

//google login
router.post("/google-login", googleLogin);

module.exports = router;