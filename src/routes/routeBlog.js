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

router.post("/blogs", controllerRequireSignin, create); //TODO put back the middleware
router.get("/blogs", list);
router.get("/blogs/:slug", read);
router.put("/blogs/:slug", controllerRequireSignin, adminMiddleware, update);
router.delete("/blogs/:slug", controllerRequireSignin, adminMiddleware, remove);

router.post("/blogs-categories-tags", listBlogsCatTag);
router.post('/blogs/related', listRelated);
router.get("/:username/blogs", listByUser);
router.get("/blogs/photo/:slug", photo);

router.post("/user/blog", controllerRequireSignin, authMiddleware, create);
router.put("/user/blog/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, update);
router.delete("/user/blog/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, remove);

module.exports = router;