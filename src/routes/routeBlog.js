const express = require("express");
const router = express.Router();

const { 
    create,
    list,
    listByUser,
    listBlogsCatTag,
    listRelated,
    read,
    update,
    remove,
    photo
} = require("../controllers/controllerBlog");

const { 
    controllerRequireSignin, 
    adminMiddleware, 
    authMiddleware, 
    canUpdateDeleteBlog 
} = require("../controllers/controllerAuth");

router.get("/blogs", list);
router.get("/blogs/:slug", read);
router.post("/blogs", controllerRequireSignin, authMiddleware, create);
router.put("/blogs/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, update);
router.delete("/blogs/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, remove);
router.post('/blogs/related', listRelated);

router.post("/blogs-categories-tags", listBlogsCatTag);
router.get("/:username/blogs", listByUser);
router.get("/blogs/photo/:slug", photo);

module.exports = router;