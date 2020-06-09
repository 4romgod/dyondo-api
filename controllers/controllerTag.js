const Tag = require("../models/tag");
const Blog = require("../models/blog");
const slugify = require("slugify");

const { errorHandler } = require("../helpers/dbErrorHandler");


exports.create = function (req, res) {
    const { name } = req.body;
    let slug = slugify(name, '-');
    slug = slug.toLowerCase();

    let tag = new Tag({ name, slug });

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
    Tag.find({}).exec(function (err, data) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.json(data);
    });
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


