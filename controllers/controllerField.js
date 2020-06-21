const Field = require("../models/field");
const formidable = require("formidable");
const slugify = require("slugify");
const fs = require("fs");


const { errorHandler } = require("../helpers/dbErrorHandler");
const tag = require("../models/tag");


exports.create = (req, res) => {
    let form = new formidable.IncomingForm();

    form.keepExtensions = true;

    //console.log("Incoming form");
    // console.log(form);   

    form.parse(req, function (err, fields, files) {
        //console.log("Parsing form data");
        
        if (err) {
            return res.status(400).json({
                error: "Image could not upload"
            });
        }

        // handle fields
        const { name, tags } = fields;
        console.log("fields");
        console.log(fields);
        
        // validate fields
        if (!name || !name.length) {
            return res.status(400).json({
                error: "Name is required"
            });
        }

        // if (!tags || !tags.length === 0) {
        //     return res.status(400).json({
        //         error: "Atleast one tag is required"
        //     });
        // }

        // Create the Field
        let field = new Field();
        field.name = name;

        let slug = slugify(name);
        field.slug = slug.toLowerCase();

        // handle files
        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: "Image should be less than 1MB in size"
                });
            }

            // add the files
            field.photo.data = fs.readFileSync(files.photo.path);
            field.photo.contentType = files.photo.type;
        }


        // split tags
        let arrayOfTag = tags && tags.split(",");

        // save field tags
        field.save(function (err, result) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            // add tags 
            Field.findByIdAndUpdate(result._id,
                { $push: { tags: arrayOfTag } }, { new: true })
                .exec(function (err, result) {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    else {
                        res.json(result);
                    }
                });

        });

    });

}


// LIST ALL THE Fields
exports.list = (req, res) => {
    Field.find({})
        .populate('tags', '_id name slug')
        .select('_id name slug tags photo createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }

            res.json(data);
        });
}


exports.read = (req, res) => {
    let slug = req.params.slug;
    slug = slug.toLowerCase();

    Field.findOne({ slug })
        .select('_id name slug tags photo createdAt updatedAt')
        .populate('tags', '_id name slug')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
}


exports.remove = function (req, res) {
    const slug = req.params.slug.toLowerCase();

    Field.findOneAndRemove({ slug }).exec(function (err, data) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.json({
            message: 'Field deleted successfully'
        });
    });
}


