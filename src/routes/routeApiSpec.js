const express = require("express");
const router = express.Router();
const path = require('path');

router.get("/dyondo-api", (req, res) => {
    res.set("Content-Type", "application/x-yaml");
    return res.status(200).sendFile(path.resolve("./build/swagger/dyondo.api.yaml"));
});

module.exports = router;