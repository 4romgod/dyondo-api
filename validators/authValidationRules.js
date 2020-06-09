const { check } = require("express-validator");

// Checks the validity of the inputs and stores them in an arraygit add .
exports.userSignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage("Name is required"),

    check('email')
        .isEmail()
        .withMessage("Must be a valid email address"),

    check('password')
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")

];

exports.userSigninValidator = [
    check('email')
        .isEmail()
        .withMessage("Must be a valid email address"),

    check('password')
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")

];


exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage("Must be a valid email address"),
];

exports.resetPasswordValidator = [
    check('newPassword')
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")

];