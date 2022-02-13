const Topic = require("../models/topic");
const formidable = require("formidable");
const slugify = require("slugify");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");

exports.create = (req, res) => {
    const { name } = req.body;
    let slug = slugify(name);

    if (!name || !name.length) {
        return res.status(400).json({ error: "Name is required" });
    }

    let topic = new Topic();
    topic.name = name;
    topic.slug = slug.toLowerCase();
    topic.save(function (err, result) {
        if (err) {
            return res.status(400).json({ error: errorHandler(err) });
        }

        return res.status(200).json({ message: "Topic created!" });
    });
}

exports.list = (req, res) => {
    Topic.find({})
        .select('_id name slug createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({ error: errorHandler(err) });
            }

            return res.status(200).json(data);
        });
}

exports.read = (req, res) => {
    let slug = req.params.slug;
    slug = slug.toLowerCase();

    Topic.findOne({ slug })
        .select('_id name slug createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({ error: errorHandler(err) });
            }
            
            return res.status(200).json(data);
        });
}

exports.remove = function (req, res) {
    const slug = req.params.slug.toLowerCase();

    Topic.findOneAndRemove({ slug }).exec(function (err, data) {
        if (err) {
            return res.status(400).json({ error: errorHandler(err) });
        }

        return res.status(200).json({ message: 'Topic deleted successfully' });
    });
}