const { check } = require("express-validator");

exports.userSignupValidator = [
    check('name')
        .not().isEmpty()
        .withMessage("Name is required"),

    check('surname')
        .not().isEmpty()
        .withMessage("Surname is required"),

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
        .isEmail()
        .withMessage("Must be a valid email address"),
];

exports.resetPasswordValidator = [
    check('newPassword')
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
];