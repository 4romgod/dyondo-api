const User = require("../models/user");
const Blog = require("../models/blog");
const _ = require("lodash");
const formidable = require("formidable");
const fs = require('fs');
const { errorHandler } = require("../helpers/dbErrorHandler");
const path = require('path');



// gives user that is available in req.profile
exports.read = (req, res) => {
    req.profile.hashed_password = undefined;    //we don't want to send the password
    return res.json(req.profile);
}

// any user can see this public profile
exports.publicProfile = (req, res) => {
    let username = req.params.username;
    let user;
    let blogs;

    User.findOne({ username }).exec((err, userFromDB) => {
        if (err || !userFromDB) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        user = userFromDB;
        let userId = user._id;

        Blog.find({ author: userId })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('author', '_id name')
            .limit(10)
            .select('_id title slug excerpt categories tags author createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    res.status(400).json({
                        error: errorHandler(err)
                    });
                }

                user.photo = undefined;
                user.hashed_password = undefined;
                res.json(
                    {
                        user,
                        blogs: data
                    }
                );
            });


    });

}

// user can update their profile  
exports.update = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    // 1. Parse the form data
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // 2. get user from the request profile
        let user = req.profile;

        // 3. combine user object with field data, using lodash
        user = _.extend(user, fields);

        // 4. validate password
        if(fields.password && fields.password.length<6){
            return res.status(400).json({
                error: "Password should be ben 6 characters long"
            });
        }

        // 5. handle files
        if (files.photo) {

            // 5.1. if file is too large
            if (files.photo.size/1024/1024 > 1) {
                return res.status(400).json({
                    error: "Image should be less than 1MB"
                });
            }

            // 5.2. if file is the right size, add it to user object
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;

        }

        // 5. save the user to the database
        user.save((err, result) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            user.hashed_password = undefined;
            user.salt = undefined;
            user.photo = undefined;
            res.json(user);
        });

    });
}

// get a user's profile photo
exports.photo = (req, res) => {
    const username = req.params.username;

    // Search for the user in the database
    User.findOne({ username }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        // send the user's photo if it exists.
        if (user.photo.data) {
            res.set("Content-Type", user.photo.contentType);
            return res.send(user.photo.data);
        }
        else{
            res.set("Content-Type", "image/png");
            return res.sendFile(path.resolve("public/user.png"));
        }
    });

}

