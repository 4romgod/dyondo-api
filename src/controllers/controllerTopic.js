const Topic = require("../models/topic");
const formidable = require("formidable");
const slugify = require("slugify");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { SUCCESS, BAD_REQUEST } = require("../constants").STATUS_CODES;

exports.create = (req, res) => {
    const { name } = req.body;
    if (!name || !name.length) {
        return res.status(BAD_REQUEST).json({ error: "Name is required" });
    }

    let topic = new Topic();
    topic.name = name;
    let slug = slugify(name);
    topic.slug = slug.toLowerCase();
    topic.save(function (err, result) {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        return res.status(SUCCESS).json({ message: "Topic created!" });
    });
}

exports.list = (req, res) => {
    Topic.find({})
        .select('_id name slug createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            return res.status(SUCCESS).json(data);
        });
}

exports.read = (req, res) => {
    let slug = req.params.slug;
    slug = slug.toLowerCase();

    Topic.findOne({ slug })
        .select('_id name slug createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }
            
            return res.status(SUCCESS).json(data);
        });
}

exports.remove = function (req, res) {
    const slug = req.params.slug.toLowerCase();

    Topic.findOneAndRemove({ slug }).exec(function (err, data) {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        return res.status(SUCCESS).json({ message: "Topic deleted successfully" });
    });
}