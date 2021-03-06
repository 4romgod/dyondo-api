const User = require("../models/user");
const Blog = require("../models/blog");
const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const { errorHandler } = require("../helpers/dbErrorHandler");
const path = require("path");
const { SUCCESS, BAD_REQUEST, NOT_FOUND } = require("../constants").STATUS_CODES;
require("dotenv").config();

exports.read = (req, res) => {
    const user = req.profile;
    user.hashed_password = undefined;
    return res.status(SUCCESS).json(user);
}

exports.publicProfile = (req, res) => {
    const username = req.params.username;
    let user;

    User.findOne({ username }).exec((err, userFromDB) => {
        if (err || !userFromDB) {
            return res.status(NOT_FOUND).json({ error: 'User not found' });
        }
        user = userFromDB;
        let userId = user._id;

        Blog.find({ author: userId })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('author', '_id name surname')
            .limit(10)
            .select('_id title slug excerpt categories tags author createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                }
                user.photo = undefined;
                user.hashed_password = undefined;
                return res.status(SUCCESS).json({ user, blogs: data });
            });
    });
}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: "Photo could not be uploaded" });
        }

        let user = req.profile;
        user = _.extend(user, fields);
        user.profile = `${process.env.CLIENT_URL}/profile/${user.username}`

        if (fields.password && fields.password.length < 6) {
            return res.status(BAD_REQUEST).json({ error: "Password should be ben 6 characters long" });
        }

        if (files.photo) {
            if (files.photo.size / 1024 / 1024 > 1) {
                return res.status(BAD_REQUEST).json({ error: "Image should be less than 1MB" });
            }

            user.photo.data = fs.readFileSync(files.photo.filepath);
            user.photo.contentType = files.photo.mimetype;
        }

        user.save((err, result) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            user.hashed_password = undefined;
            user.salt = undefined;
            user.photo = undefined;

            return res.status(SUCCESS).json(user);
        });
    });
}

exports.photo = (req, res) => {
    const username = req.params.username;

    User.findOne({ username }).exec((err, user) => {
        if (err || !user) {
            return res.status(NOT_FOUND).json({ error: "User not found" });
        }

        if (user.photo.data) {
            res.set("Content-Type", user.photo.contentType);
            return res.status(SUCCESS).send(user.photo.data);
        } else {
            res.set("Content-Type", "image/png");
            return res.status(SUCCESS).sendFile(path.resolve("src/public/user.png"));
        }
    });
}