'use strict';
 
/**
 * Get unique error field name
 */
function uniqueMessage(error){
    let output;
    try {
        let fieldName = error.message.substring(error.message.lastIndexOf('.$') + 2, error.message.lastIndexOf('_1'));
        output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';
    } catch (ex) {
        output = 'Unique field already exists';
    }
 
    return output;
};
 
/**
 * Get the error message from error object
 */
exports.errorHandler = error => {
    let message = '';
 
    if (error.code) {
        switch (error.code) {
            case 11000:
                message = "Title already exists";
                break;
            case 11001:
                message = uniqueMessage(error);
                break;
            case 10334:
                message = "Your Content is Too Large, Max size is 15MB";
                break;
            default:
                message = 'Something went wrong';
        }
    } 
    else {
        for (let errorName in error.errorors) {
            if (error.errorors[errorName].message) message = error.errorors[errorName].message;
        }
    }
 
    return message;
};