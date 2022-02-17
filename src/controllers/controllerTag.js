const Tag = require("../models/tag");
const Topic = require("../models/topic");
const slugify = require("slugify");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { SUCCESS, BAD_REQUEST } = require("../constants").STATUS_CODES;

exports.create = (req, res) => {
    const { name, topics } = req.body;
    const slug = name && slugify(name).toLowerCase();
    const tag = new Tag({ name, topics, slug });

    tag.save((err, data) => {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        };

        return res.status(SUCCESS).json(data);
    });
}

exports.list = (req, res) => {
    const slug = req.query.topic && slugify(req.query.topic).toLowerCase();

    if (slug) {
        Topic.findOne({ slug: slug })
            .then((topic) => {
                if (topic) {
                    if (topic.error) {
                        console.log(topic.error);
                        return res.status(BAD_REQUEST).json({ error: errorHandler(topic.error) });
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
            .exec((err, data) => {
                if (err) {
                    return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                }
                return res.status(SUCCESS).json(data);
            });
    }
}

exports.read = (req, res) => {
    const slug = req.params.slug && slugify(req.params.slug).toLowerCase();

    Tag.findOne({ slug }).exec((err, tag) => {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        return res.status(SUCCESS).json({tag});
    });
}

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase();

    Tag.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        return res.status(SUCCESS).json({ message: "Tag deleted successfully" });
    });
}

exports.update = (req, res) => {
    const { name, topics } = req.body;
    const slug = req.params.slug;

    Tag.findOne({ slug: slug })
        .exec((err, tag) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            tag.slug = slug;
            tag.name = name;
            tag.topics = topics;
            tag.save((err, data) => {
                if (err) {
                    return res.status(BAD_REQUEST).json({ error: "Tag could not be updated!" });
                };

                return res.status(SUCCESS).json(data);
            });
        });
}