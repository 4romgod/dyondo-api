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
    authMiddleware, 
    canUpdateDeleteBlog 
} = require("../controllers/controllerAuth");

router.get("/blogs", list);
router.get("/blogs/:slug", read);
router.get("/blogs/:slug/related", listRelated);
router.get("/blogs/:slug/photo", photo);
router.get("/blogs/user/:username", listByUser);

router.post("/blogs", controllerRequireSignin, authMiddleware, create);
router.put("/blogs/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, update);
router.delete("/blogs/:slug", controllerRequireSignin, authMiddleware, canUpdateDeleteBlog, remove);

router.post("/blogs-categories-tags", listBlogsCatTag);

module.exports = router;