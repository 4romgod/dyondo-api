const { validationResult } = require("express-validator");

// checks the array of validation errors
exports.isValidated = (req, res, next) =>{
    const errors = validationResult(req);
    
    // if there are validation errors, returns the first error
    if(!errors.isEmpty()){
        return res.status(422).json({error: errors.array()[0].msg})
    }

    // if no errors exist, move to next
    next();
};