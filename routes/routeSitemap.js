const express = require("express");
const router = express.Router();
const xml = require('xml');

const Blog = require("../models/blog");

router.get("/sitemap.xml", (req, res) => {
    Blog.find({})
        .select('_id title slug createdAt updatedAt')
        .exec((err, data) => {
            if (err) {
                return res.json({
                    error: errorHandler(err)
                });
            }

            //generate sitemap
            let xmlText = ''
            xmlText += '<?xml version="1.0" encoding="UTF-8"?>'
            xmlText += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'

            data.map((blog) => {
                xmlText += '<url>'
                xmlText += `<loc>${process.env.CLIENT_URL}/blog/${blog.slug}</loc>`
                xmlText += `<lastmod>${blog.updatedAt}</lastmod>`
                xmlText += `<changefreq>always</changefreq>`
                xmlText += `<priority>0.5</priority>`
                xmlText += '</url>'
            });

            xmlText += '</urlset>'

            // console.log(`Wrote Sitemap`);

            res.set('Content-Type', 'text/xml');
            res.send(xmlText);
        });
});

module.exports = router;
