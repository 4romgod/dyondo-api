const Tag = require("../models/tag");
const Field = require("../models/topic");
const Blog = require("../models/blog");
const slugify = require("slugify");
const fs = require("fs");
const formidable = require("formidable");

const { errorHandler } = require("../helpers/dbErrorHandler");


exports.create = function (req, res) {
    const { name, topics } = req.body;
    let slug = slugify(name);
    slug = slug.toLowerCase();

    let tag = new Tag({ name, topics, slug });
    //console.log(tag);

    tag.save(function (err, data) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        };
        res.json(data);     //send to frontend
    });
}


exports.list = function (req, res) {
    Tag.find({})
        .sort({ name: 'asc' })
        .exec(function (err, data) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            res.json(data);
        });
}


exports.listByTopic = function (req, res) {
    let topicSlug = req.params.topic;
    topicSlug = topicSlug.toLowerCase();

    // console.log("FIELD NAME: ");
    // console.log(topicSlug);

    if (topicSlug) {
        Field.findOne({ slug: topicSlug })
            .then((topic) => {
                if (topic.error) {
                    console.log(err);
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }

                // console.log("FIELD OBJECT: ");
                // console.log(topic._id);

                if (topic) {
                    Tag.find({ topics: topic._id }, null, function (err, data) {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                        // console.log("Tags from topic");
                        // console.log(data);

                        res.json(data);
                    });
                }
                else {
                    return;
                }

            })
            .catch((err) => console.log(err));

    }
}


exports.read = function (req, res) {
    const slug = req.params.slug.toLowerCase();

    Tag.findOne({ slug }).exec(function (err, tag) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        //res.json(tag);     // return blogs also
        Blog.find({ tags: tag })
            .populate('tags', '_id name slug')
            .populate('categories', '_id name slug')
            .populate('author', '_id username name')
            .select('_id title slug excerpt categories tags author createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }

                res.json({ tag: tag, blogs: data });
            });
    });
}


exports.remove = function (req, res) {
    const slug = req.params.slug.toLowerCase();

    Tag.findOneAndRemove({ slug }).exec(function (err, data) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.json({
            message: 'Tag deleted successfully'
        });
    });
}


exports.update = function (req, res) {
    const { name, topics } = req.body;
    console.log(req.body);
    
    let oldSlug = req.params.slug;
    oldSlug = oldSlug.toLowerCase();

    Tag.findOne({ slug: oldSlug })
        .exec((err, oldTag) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            oldTag.name = name;

            oldTag.slug = oldSlug;

            oldTag.topics = topics;

            console.log("About to save");
            console.log(oldTag);
            
            

            oldTag.save(function (err, data) {
                if (err) {
                    return res.status(400).json({
                        error: "Tag could not be updated!"
                    });
                };
                res.json(data);     //send to frontend
            });

        });


}

// exports.create = function (req, res) {
//     let form = new formidable.IncomingForm();
//     form.keepExtensions = true;

//     form.parse(req, function (err, fields, files) {
//         console.log(err);
//         console.log(fields);
//         console.log(files);

//         if (err) {
//             return res.status(400).json({
//                 error: "Image could not upload"
//             });
//         }

//         //console.log(fields);


//         // handle fields
//         const { name, topics } = fields;

//         if (!topics || !topics.length === 0) {
//             return res.status(400).json({
//                 error: "Atleast one Topic is required"
//             });
//         }

//         let slug = slugify(name);
//         slug = slug.toLowerCase();

//         let tag = new Tag({ name, slug, topics });

//         // handle files
//         if (files.photo) {
//             if (files.photo.size > 1000000) {
//                 return res.status(400).json({
//                     error: "Image should be less than 1MB in size"
//                 });
//             }

//             // add the files
//             tag.photo.data = fs.readFileSync(files.photo.path);
//             tag.photo.contentType = files.photo.type;
//         }

//         tag.save(function (err, data) {
//             if (err) {
//                 return res.status(400).json({
//                     error: errorHandler(err)
//                 });
//             };

//             res.json(data);     //send to frontend
//         });


//     });

// }
