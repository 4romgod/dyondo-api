const Category = require("../models/category");
const Topic = require("../models/topic");
const Tag = require("../models/tag");
const {categories} = require('../data/category');
const {topics} = require('../data/topic');
const {tags} = require('../data/tag');
const slugify = require("slugify");

exports.bootStrapCategory = async () => {
    for (const cat of categories) {
        const { name } = cat;
        let slug = slugify(name, '-');
        slug = slug.toLowerCase();
        let category = new Category({ name, slug });
    
        category.save(function (err, data) {});
    };
}

exports.bootStrapTopic = async () => {
    for (const top of topics) {
        console.log(`creating ${top} topic...`)
        const { name } = top;
        let slug = slugify(name, '-');
        slug = slug.toLowerCase();
        let topic = new Topic({ name, slug });
    
        topic.save(function (err, data) {
            if (err) {
                // console.log(err);
                return;
            }
            console.log(`Topic ${data} created!!!`)
        });
    };
}
