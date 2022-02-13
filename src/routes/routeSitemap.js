const express = require("express");
const router = express.Router();

// Models
const Blog = require("../models/blog");
const Tag = require("../models/tag");
const Topic = require("../models/topic");

// Route Sitemap
router.get("/sitemap.xml", (req, res) => {

    //generate sitemap
    let xmlText = ''
    xmlText += '<?xml version="1.0" encoding="UTF-8"?>'
    xmlText += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/</loc>`
    xmlText += `<changefreq>daily</changefreq>`
    xmlText += `<priority>1.0</priority>`
    xmlText += '</url>'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/blogs</loc>`
    xmlText += `<changefreq>daily</changefreq>`
    xmlText += `<priority>0.5</priority>`
    xmlText += '</url>'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/newsletter</loc>`
    xmlText += `<changefreq>daily</changefreq>`
    xmlText += `<priority>1.0</priority>`
    xmlText += '</url>'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/privacyPolicy</loc>`
    xmlText += `<changefreq>daily</changefreq>`
    xmlText += `<priority>0.5</priority>`
    xmlText += '</url>'

    Blog.find({})
        .select('_id slug updatedAt')
        .exec((err, data) => {

            if (data) {
                data.map((blog) => {
                    xmlText += '<url>'
                    xmlText += `<loc>${process.env.CLIENT_URL}/blogs/${blog.slug}</loc>`
                    xmlText += `<changefreq>daily</changefreq>`
                    xmlText += `<priority>1.0</priority>`
                    xmlText += '</url>'
                });

                Tag.find({})
                    .select('_id slug updatedAt')
                    .exec((err, tags) => {
                        if (tags) {
                            // map through tags
                            tags.map((tag) => {
                                xmlText += '<url>'
                                xmlText += `<loc>${process.env.CLIENT_URL}/tags/${tag.slug}</loc>`
                                xmlText += `<changefreq>daily</changefreq>`
                                xmlText += `<priority>1.0</priority>`
                                xmlText += '</url>'
                            })

                            Topic.find({})
                                .select("_id slug updatedAt")
                                .exec((err, topics) => {
                                    if (topics) {
                                        //map through topics
                                        topics.map((topic) => {
                                            xmlText += '<url>'
                                            xmlText += `<loc>${process.env.CLIENT_URL}/tags/topic/${topic.slug}</loc>`
                                            xmlText += `<changefreq>daily</changefreq>`
                                            xmlText += `<priority>1.0</priority>`
                                            xmlText += '</url>'
                                        })

                                        xmlText += '</urlset>'

                                        res.set('Content-Type', 'text/xml');
                                        res.send(xmlText);
                                    }
                                });

                        }
                    });

            }

        });

});


module.exports = router;
