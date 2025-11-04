const express = require("express");
const {
  getWebinars,
  createWebinar,
  updateWebinar,
  deleteWebinar,
} = require("../controllers/webinarController");

const router = express.Router();

router.get("/", getWebinars);
router.post("/", createWebinar);
router.put("/:id", updateWebinar);
router.delete("/:id", deleteWebinar);

module.exports = router;
