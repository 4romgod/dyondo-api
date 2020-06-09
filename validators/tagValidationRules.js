const { check } = require("express-validator");


// Checks the validity of the inputs and stores them in an array
exports.tagCreateValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage("Name is required"),
];