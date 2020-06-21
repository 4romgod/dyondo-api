const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const tagSchema = new mongoose.Schema({

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
    photo: {
        data: Buffer,
        contentType: String
    },
    topics: [{
        type: ObjectId,
        ref: "Field",
        required: true
    }]


}, {timestamps: true});


module.exports = mongoose.model("Tag", tagSchema);