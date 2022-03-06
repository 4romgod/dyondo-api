const Blog = require("../models/blog");
const Category = require("../models/category");
const Tag = require("../models/tag");
const User = require("../models/user");
const formidable = require("formidable");
const slugify = require("slugify");
const stripHtml = require("string-strip-html");
const _ = require("lodash");
const { errorHandler } = require("../helpers/dbErrorHandler");
const { smartTrim } = require("../helpers/blogHandler");
const fs = require("fs");
const path = require('path');
const { SUCCESS, BAD_REQUEST, TOO_LARGE } = require("../constants").STATUS_CODES;
require("dotenv").config();

exports.create = (req, res) => {
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: "Your Content is Too Large" });
        }

        const { title, body, tags } = fields;

        if (!title || !title.length) {
            return res.status(BAD_REQUEST).json({ error: "Title is required" });
        }

        if (!body || body.length < 200) {
            return res.status(BAD_REQUEST).json({ error: "Content is too short" });
        }

        if (!tags || !tags.length === 0) {
            return res.status(BAD_REQUEST).json({ error: "Atleast one tag is required" });
        }

        const blog = new Blog();
        blog.title = title;
        blog.slug = slugify(title).toLowerCase();
        blog.mtitle = `${title} | ${process.env.APP_NAME}`;
        blog.body = body;
        // blog.excerpt = smartTrim(body, 320, " ", " ...");
        //blog.mdesc = stripHtml(body.substring(0, 160));
        blog.excerpt = title;
        blog.mdesc = title;
        blog.author = req.user._id;

        if (files.photo) {
            console.log("Processing Photo...");
            if (files.photo.size > 1000000) {
                return res.status(TOO_LARGE).json({ error: "Image should be less than 1MB in size" });
            } else if (files.photo) {
                return res.status(BAD_REQUEST).json({ error: "Plase upload an image" });
            }

            console.log(`Reading file...`)
            blog.photo.data = fs.readFileSync(files.photo.path);
            blog.photo.contentType = files.photo.type;
        }

        blog.save((err, result) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            const arrayOfTags = tags && tags.split(",");
            Blog.findByIdAndUpdate(result._id, { $push: { tags: arrayOfTags } }, { new: true })
                .exec((err, result) => {
                    if (err) {
                        return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                    } else {
                        return res.status(SUCCESS).json(result);
                    }
                });
        });
    });
}

exports.list = async (req, res) => {
    console.log(`queryString: ${JSON.stringify(req.query)}`);
    const { search="",  tag, author, limit = 10, skip = 0 } = req.query;
    
    if (search) {
        performSearch(req, res, search)
    } else {
        await performList(req, res, {tag, author, limit, skip});
    }
}

exports.read = (req, res) => {
    const slug = req.params.slug && slugify(req.params.slug).toLowerCase();

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
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            res.status(SUCCESS).json(data);
        });
}

exports.update = (req, res) => {
    const slug = req.params.slug && slugify(req.params.slug).toLowerCase();

    Blog.findOne({ slug })
        .exec((err, oldBlog) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            const form = new formidable.IncomingForm();
            form.keepExtensions = true;
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return res.status(BAD_REQUEST).json({ error: "Image could not upload" });
                }

                const slugBeforeMerge = oldBlog.slug;
                oldBlog = _.merge(oldBlog, fields);
                oldBlog.slug = slugBeforeMerge;

                const { body, tags } = fields;

                if (body) {
                    oldBlog.excerpt = smartTrim(body, 320, '', " ...");
                    oldBlog.desc = stripHtml(body.substring(0, 160));
                }

                if (tags) {
                    oldBlog.tags = tags.split(',');
                }

                if (files.photo) {
                    if (files.photo.size > 10000000) {
                        return res.status(BAD_REQUEST).json({ error: "Image should be less than 1MB in size" });
                    }

                    oldBlog.photo.data = fs.readFileSync(files.photo.path);
                    oldBlog.photo.contentType = files.photo.type;
                }

                oldBlog.save((err, result) => {
                    if (err) {
                        return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                    }

                    res.status(SUCCESS).json(result);
                });
            });
        });
}

exports.remove = (req, res) => {
    const slug = req.params.slug && slugify(req.params.slug).toLowerCase();

    Blog.findOneAndRemove({ slug })
        .exec((err, data) => {
            if (err) {
                return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
            }

            return res.status(SUCCESS).json({ message: "Blog Deleted Successfully" });
        });
}

const performSearch = (req, res, searchTerm) => {
    const searchQuery = {
        $or: [
            { title: { $regex: searchTerm, $options: 'i' } },
            { body: { $regex: searchTerm, $options: 'i' } },
            { tags: { $elemMatch: { name: searchTerm } } }
        ]
    }
    Blog.find(searchQuery, (err, blogs) => {
        if (err) {
            return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
        }

        return res.status(SUCCESS).json(blogs);
    }).select('-photo -body');
}

const performList = async (req, res, query) => {
    try {
        let searchQuery = { $or: [] };
        if (query.tag) {
            const tagRes = await Tag.findOne({ slug: query.tag });
            if (tagRes) {
                searchQuery.$or.push({ tags: tagRes._id });
            } else {
                return res.status(SUCCESS).json([]);
            }
        }

        if (query.author) {
            const userRes = await User.findOne({ username: query.author });
            if (userRes) {
                searchQuery.$or.push({ author: userRes._id });
            } else {
                return res.status(SUCCESS).json([]);
            }
        }

        Blog.find({ ...(searchQuery.$or.length > 0 && searchQuery) })
            .skip(query.skip)
            .limit(query.limit)
            .populate('author', '_id name username profile')
            .populate('tags', '_id slug name topics')
            .exec((err, blogs) => {
                if (err) {
                    console.log(err)
                    return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
                }

                return res.status(SUCCESS).json(blogs);
            });
    } catch (err) {
        console.log(err);
        return res.status(BAD_REQUEST).json({ error: errorHandler(err) });
    }
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
    const { _id, tags } = req.body.blog;

    Blog.find({ _id: { $ne: _id }, tags: { $in: tags } })
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
