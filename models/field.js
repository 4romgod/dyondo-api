const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const fieldSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
    },
    slug: {         //replace space by -
        type: String,
        unique: true,
        index: true,
    },
    tags: [{
        type: ObjectId,
        ref: "Tag",
        required: true
    }],
    photo: {
        data: Buffer,
        contentType: String
    },

}, {timestamps: true});


module.exports = mongoose.model("Field", fieldSchema);

