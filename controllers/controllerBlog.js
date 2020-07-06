const Blog = require("../models/blog");
const Category = require("../models/category");
const Tag = require("../models/tag");
const User = require("../models/user");
const formidable = require("formidable");
const slugify = require("slugify");
const stripHtml = require("string-strip-html");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
const fs = require("fs");

const { smartTrim } = require("../helpers/blogHandler");

const path = require('path');

// CREATE A BLOG
exports.create = (req, res) => {
    let form = new formidable.IncomingForm();

    form.keepExtensions = true;

    form.parse(req, function (err, fields, files) {
        if (err) {
            //console.log(err);

            return res.status(400).json({
                error: "Your Content is Too Large, Max size is 15MB"
            });
        }

        // handle fields
        const { title, body, categories, tags } = fields;

        // validate fields
        if (!title || !title.length) {
            return res.status(400).json({
                error: "Title is required"
            });
        }

        // if (!body || body.length < 200) {
        //     return res.status(400).json({
        //         error: "Content is too short"
        //     });
        // }

        if (!tags || !tags.length === 0) {
            return res.status(400).json({
                error: "Atleast one tag is required"
            });
        }

        // Create the Blog

        let blog = new Blog();
        blog.title = title;

        let slug = slugify(title);
        blog.slug = slug.toLowerCase();

        blog.mtitle = `${title} | ${process.env.APP_NAME}`;

        blog.body = body;
        //blog.excerpt = smartTrim(body, 320, " ", " ...");
        //blog.mdesc = stripHtml(body.substring(0, 160));
        blog.excerpt = title;
        blog.mdesc = title;

        blog.author = req.user._id;

        // handle files
        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(413).json({
                    error: "Image should be less than 1MB in size"
                });
            }
            // else if(files.photo){
            //     return res.status(400).json({
            //         error: "Plase upload an image"
            //     });
            // }

            // add the files
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }


        // split categories and tags
        let arrayOfCat = categories && categories.split(",");
        let arrayOfTag = tags && tags.split(",");

        // save blog without the categories or tags
        blog.save(function (err, result) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            //res.json(result);

            // add tags 
            Blog.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTag } }, { new: true })
                .exec(function (err, result) {
                    if (err) {
                        console.log(err);
                        
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


// UPDATE A BLOG BY ITS SLUG
exports.update = (req, res) => {
    let slug = req.params.slug;
    slug = slug.toLowerCase();

    Blog.findOne({ slug })
        .exec((err, oldBlog) => {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }

            let form = new formidable.IncomingForm();
            form.keepExtensions = true;

            form.parse(req, function (err, fields, files) {
                if (err) {
                    return res.status(400).json({
                        error: "Image could not upload"
                    });
                }

                // keep the old slug
                let slugBeforeMerge = oldBlog.slug;
                oldBlog = _.merge(oldBlog, fields);
                oldBlog.slug = slugBeforeMerge;

                const { body, desc, categories, tags } = fields;

                if (body) {
                    oldBlog.excerpt = smartTrim(body, 320, '', " ...");
                    oldBlog.desc = stripHtml(body.substring(0, 160));
                }

                if (tags) {
                    oldBlog.tags = tags.split(',');
                }

                // handle files
                if (files.photo) {
                    if (files.photo.size > 10000000) {
                        return res.status(400).json({
                            error: "Image should be less than 1MB in size"
                        });
                    }

                    // add the files
                    oldBlog.photo.data = fs.readFileSync(files.photo.path);
                    oldBlog.photo.contentType = files.photo.type;
                }

                oldBlog.save(function (err, result) {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }

                    res.json(result);
                });


            });

        });

}



// TO READ ONE BY BLOG BY SLUG
exports.read = (req, res) => {
    let slug = req.params.slug;
    slug = slug.toLowerCase();

    Blog.findOne({ slug })
        .select('_id title body slug mtitle mdesc categories tags author createdAt updatedAt')
        .populate('author', '_id name username profile')
        .populate({
            path: 'categories',
            select: '_id name slug',
            options: { sort: { 'name': 1 } }
        })
        .populate({
            path: 'tags',
            select: '_id name slug',
            options: { sort: { 'name': 1 } }
        })
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            res.json(data);
        });
}


// LIST ALL THE BLOGS
exports.list = (req, res) => {
    Blog.find({})
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('author', '_id name username')
        .select('_id title slug excerpt photo categories tags author createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }

            res.json(data);
        });
}


// LIST LIMITED NUMBER OF BLOGS {pagination}, ALL CATS AND TAGS
exports.listBlogsCatTag = (req, res) => {
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    let blogs;
    let categories;
    let tags;

    Blog.find({})
        .sort({ createdAt: -1 })
        .select('_id title slug excerpt categories tags author createdAt updatedAt')
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'categories',
            select: '_id name slug',
            options: { sort: { 'name': 1 } }
        })
        .populate({
            path: 'tags',
            select: '_id name slug',
            options: { sort: { 'name': 1 } }
        })
        .populate('author', '_id name username profile')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }
            blogs = data;

            // get all categories
            Category.find({})
                .sort({ name: 'asc' })
                .exec((err, cats) => {
                    if (err) {
                        return res.json({
                            error: errorHandler(err)
                        });
                    }
                    categories = cats;

                    // get all tags
                    Tag.find({})
                        .sort({ name: 'asc' })
                        .exec((err, t) => {
                            if (err) {
                                return res.json({
                                    error: errorHandler(err)
                                });
                            }
                            tags = t;

                            // return all blogs, categories and tags
                            res.json({ blogs, categories, tags, size: blogs.length });
                        });

                });


        });
}


// LIST RELATED BLOGS
exports.listRelated = (req, res) => {
    //console.log(req.body.blog);
    let limit = req.body.limit ? parseInt(req.body.limit) : 3;
    const { _id, categories } = req.body.blog;

    Blog.find({ _id: { $ne: _id }, categories: { $in: categories } })
        .limit(limit)
        .populate('author', '_id name username profile')
        .select('title slug excerpt author createdAt updatedAt')
        .exec((err, blogs) => {
            if (err) {
                return res.status(400).json({
                    error: 'Blogs not found'
                });
            }
            res.json(blogs);
        });
};

// TO GET BLOGS BY WAY OF SEARCH
exports.listSearch = (req, res) => {
    console.log(req.query);
    const { search } = req.query;


    if (search) {
        Blog.find({
            $or: [{ title: { $regex: search, $options: 'i' } }, { body: { $regex: search, $options: 'i' } }]
        }, (err, blogs) => {
            if (err) {
                res.status(400).json({
                    error: errorHandler(err)
                });
            }

            res.json(blogs);
        }).select('-photo -body');
    }

}


// TO GET BLOGS WRITTEN BY USER
exports.listByUser = (req, res) => {
    User.findOne({ username: req.params.username }).exec((err, user) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let userId = user._id;

        Blog.find({ author: userId })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate("author", "_id name username")
            .select("_id title slug author createdAt updatedAt")
            .exec((err, data) => {
                if (err) {
                    res.status(400).json({
                        error: errorHandler(err)
                    });
                }
                res.json(data);
            });
    });
}


// TO DELETE A BLOG
exports.remove = (req, res) => {
    let slug = req.params.slug;
    slug = slug.toLowerCase();

    Blog.findOneAndRemove({ slug })
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }

            res.json({
                message: "blog deleted successfully"
            });
        });

}


// TO GET A PHOTO BY SLUG
exports.photo = (req, res) => {
    let slug = req.params.slug;
    slug = slug.toLowerCase();

    Blog.findOne({ slug })
        .select('photo')
        .exec((err, blog) => {
            if (err || !blog) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            }

            if (blog.photo.data) {
                res.set("Content-Type", blog.photo.contentType);
                return res.send(blog.photo.data);
            }
            else {
                res.set("Content-Type", "image/png");
                res.set('Content-Disposition', 'attachment; filename=defaltImage');
                return res.sendFile(path.resolve("public/blog.png"));

            }
        });
}
