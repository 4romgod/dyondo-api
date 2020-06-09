const Category = require("../models/category");
const Blog = require("../models/blog");
const slugify = require("slugify");

const { errorHandler } = require("../helpers/dbErrorHandler");


exports.create = function(req, res){
    const { name } = req.body;
    let slug = slugify(name, '-');
    slug = slug.toLowerCase();

    let category = new Category({name, slug});

    category.save(function(err, data){
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        };

        res.json(data);     //send to frontend

    });

}


exports.list = function(req, res){
    Category.find({}).exec(function(err, data){
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.json(data);
    });
}


exports.read = function(req, res){
    const slug = req.params.slug.toLowerCase();

    Category.findOne({slug}).exec(function(err, category){
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        //res.json(category);  
        Blog.find({categories: category})
            .populate('categories', '_id name slug')   
            .populate('tags', '_id name slug')   
            .populate('author', '_id username name') 
            .select('_id title slug excerpt categories tags author createdAt updatedAt')  
            .exec((err, data) =>{
                if(err){
                    return res.status(400).json({
                        error: errorHandler(err)
                    });
                }

                res.json({category: category, blogs: data});
            });

    });
}


exports.remove = function(req, res){
    const slug = req.params.slug.toLowerCase();

    Category.findOneAndRemove({slug}).exec(function(err, data){
        if(err){
            return res.status(400).json({
                error: errorHandler(err)
            });
        }

        res.json({
            message: 'Category deleted successfully'
        });     
    });
}


