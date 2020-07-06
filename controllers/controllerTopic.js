const Topic = require("../models/topic");
const formidable = require("formidable");
const slugify = require("slugify");
const fs = require("fs");


const { errorHandler } = require("../helpers/dbErrorHandler");


exports.create = (req, res) => {
    const { name } = req.body;
    console.log(req.body);
    

    if (!name || !name.length) {
        return res.status(400).json({
            error: "Name is required"
        });
    }

    let topic = new Topic();
    topic.name = name;

    let slug = slugify(name);
    topic.slug = slug.toLowerCase();

    // save topic
    topic.save(function (err, result) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.status(400).json({
            message: "Topic created!"
        });

    });
}


// LIST ALL THE TOPICS
exports.list = (req, res) => {
    Topic.find({})
        .select('_id name slug createdAt updatedAt')
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

    Topic.findOne({ slug })
        .select('_id name slug createdAt updatedAt')
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

    Topic.findOneAndRemove({ slug }).exec(function (err, data) {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.json({
            message: 'Topic deleted successfully'
        });
    });
}


