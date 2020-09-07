const express = require("express");
const router = express.Router();

// Controllers Blog
const { 
    create,
    list,
    listByUser,
    listBlogsCatTag,
    listRelated,
    read,
    update,
    remove,
    photo, 
    listSearch } = require("../controllers/controllerBlog");

// Controllers Auth
const { controllerRequireSignin, adminMiddleware, authMiddleware, canUpdateDeleteBlog } = require("../controllers/controllerAuth");


// Routes Public
router.get("/blog/:slug", read);
router.get("/blogs", list);
router.post("/blogs-categories-tags", listBlogsCatTag);
router.post('/blogs/related', listRelated);
router.get("/:username/blogs", listByUser);
router.get("/blog/photo/:slug", photo);
router.get("/blogs/search", listSearch);

// Routes Admin
router.post("/blog", controllerRequireSignin, adminMiddleware, create);
router.put("/blog/:slug", controllerRequireSignin, adminMiddleware, update);
router.delete("/blog/:slug", controllerRequireSignin, adminMiddleware, remove);

// Routes Private User
router.post("/user/blog", controllerRequireSignin, authMiddleware, create);
router.put("/user/blog/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, update);
router.delete("/user/blog/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, remove);


module.exports = router;
