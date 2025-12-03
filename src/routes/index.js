const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("Meetup API 서버 Running");
});

module.exports = router;
