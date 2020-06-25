const express = require("express");
const router = express.Router();
// const xml = require('xml');

const Blog = require("../models/blog");
const Tag = require("../models/tag");
const Topic = require("../models/topic");

router.get("/sitemap.xml", (req, res) => {

    //generate sitemap
    let xmlText = ''
    xmlText += '<?xml version="1.0" encoding="UTF-8"?>'
    xmlText += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/</loc>`
    xmlText += `<lastmod>Wed Jun 10 2020 00:22:31 GMT+0000 (Coordinated Universal Time)</lastmod>`
    xmlText += `<changefreq>always</changefreq>`
    xmlText += `<priority>0.5</priority>`
    xmlText += '</url>'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/blogs</loc>`
    xmlText += `<lastmod>Wed Jun 10 2020 00:22:31 GMT+0000 (Coordinated Universal Time)</lastmod>`
    xmlText += `<changefreq>always</changefreq>`
    xmlText += `<priority>0.5</priority>`
    xmlText += '</url>'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/newsletter</loc>`
    xmlText += `<lastmod>Wed Jun 10 2020 00:22:31 GMT+0000 (Coordinated Universal Time)</lastmod>`
    xmlText += `<changefreq>always</changefreq>`
    xmlText += `<priority>0.5</priority>`
    xmlText += '</url>'

    xmlText += '<url>'
    xmlText += `<loc>${process.env.CLIENT_URL}/privacyPolicy</loc>`
    xmlText += `<lastmod>Wed Jun 10 2020 00:22:31 GMT+0000 (Coordinated Universal Time)</lastmod>`
    xmlText += `<changefreq>always</changefreq>`
    xmlText += `<priority>0.5</priority>`
    xmlText += '</url>'

    Blog.find({})
        .select('_id slug updatedAt')
        .exec((err, data) => {

            if (data) {
                data.map((blog) => {
                    xmlText += '<url>'
                    xmlText += `<loc>${process.env.CLIENT_URL}/blog/${blog.slug}</loc>`
                    xmlText += `<lastmod>${blog.updatedAt}</lastmod>`
                    xmlText += `<changefreq>always</changefreq>`
                    xmlText += `<priority>0.5</priority>`
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
                                xmlText += `<lastmod>${tag.updatedAt}</lastmod>`
                                xmlText += `<changefreq>always</changefreq>`
                                xmlText += `<priority>0.5</priority>`
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
                                            xmlText += `<lastmod>${topic.updatedAt}</lastmod>`
                                            xmlText += `<changefreq>always</changefreq>`
                                            xmlText += `<priority>0.5</priority>`
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
