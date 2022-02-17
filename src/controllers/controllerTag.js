const Tag = require("../models/tag");
const Topic = require("../models/topic");
const Blog = require("../models/blog");
const slugify = require("slugify");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { SUCCESS, BAD_REQUEST } = require("../constants").STATUS_CODES;

exports.create = function (req, res) {
    const { name, topics } = req.body;
    let slug = slugify(name);
    slug = slug.toLowerCase();
    let tag = new Tag({ name, topics, slug });

    tag.save(function (err, data) {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        };

        return res.status(SUCCESS).json(data);
    });
}

exports.list = function (req, res) {
    let topicSlug = req.query.topic;
    topicSlug = topicSlug ? topicSlug.toLowerCase() : undefined;

    if (topicSlug) {
        Topic.findOne({ slug: topicSlug })
            .then((topic) => {
                if (topic) {
                    if (topic.error) {
                        console.log(err);
                        return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                    }

                    Tag.find({ topics: topic._id })
                        .sort({ name: 'asc' })
                        .exec((err, data) => {
                            if (err) {
                                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                            }

                            return res.status(SUCCESS).json(data);
                        });
                } else {
                    return res.status(SUCCESS).json({});
                }
            }).catch((err) => {
                console.log(err);
                throw err;
            });
    } else {
        Tag.find({})
            .sort({ name: 'asc' })
            .exec(function (err, data) {
                if (err) {
                    return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                }
                return res.status(SUCCESS).json(data);
            });
    }
}

exports.read = function (req, res) {
    const slug = req.params.slug.toLowerCase();

    Tag.findOne({ slug }).exec(function (err, tag) {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        Blog.find({ tags: tag })
            .populate('tags', '_id name slug')
            .populate('categories', '_id name slug')
            .populate('author', '_id username name')
            .select('_id title slug excerpt categories tags author createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                }

                return res.status(SUCCESS).json({ tag: tag, blogs: data });
            });
    });
}


exports.remove = function (req, res) {
    const slug = req.params.slug.toLowerCase();

    Tag.findOneAndRemove({ slug }).exec(function (err, data) {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        return res.status(SUCCESS).json({ message: "Tag deleted successfully" });
    });
}


exports.update = function (req, res) {
    const { name, topics } = req.body;
    let oldSlug = req.params.slug;
    oldSlug = oldSlug.toLowerCase();

    Tag.findOne({ slug: oldSlug })
        .exec((err, oldTag) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            oldTag.name = name;
            oldTag.slug = oldSlug;
            oldTag.topics = topics;
            oldTag.save(function (err, data) {
                if (err) {
                    return res.status(BAD_REQUEST).json({ error: "Tag could not be updated!" });
                };
                return res.status(SUCCESS).json(data);
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
