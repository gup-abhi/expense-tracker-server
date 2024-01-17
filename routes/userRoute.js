const express = require("express");
const router = express.Router();

const { getUser, createUser } = require("../controllers/userController");

router.route("/:username/:password").get(getUser);
router.route("/").post(createUser);

module.exports = router;
