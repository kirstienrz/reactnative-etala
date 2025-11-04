const express = require("express");
const {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} = require("../controllers/resourceController");

const router = express.Router();

router.get("/", getResources);
router.post("/", createResource);
router.put("/:id", updateResource);
router.delete("/:id", deleteResource);

module.exports = router;
