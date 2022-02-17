const Category = require("../models/category");
const Topic = require("../models/topic");
const Tag = require("../models/tag");
const {categories} = require('./category');
const {topics} = require('./topic');
const {tags} = require('./tag');
const slugify = require("slugify");

exports.bootstrapCategory = async () => {
    for (const cat of categories) {
        const { name } = cat;
        let slug = slugify(name, '-');
        slug = slug.toLowerCase();
        let category = new Category({ name, slug });
        category.save(function (err, data) {});
    };
}

exports.bootstrapTopic = async () => {
    console.log('Bootstrapping Topic Table...');
    for (const top of topics) {
        const { name } = top;
        let slug = slugify(name, '-');
        slug = slug.toLowerCase();
        Topic.findOneAndUpdate({name}, {name, slug});
    };
}
