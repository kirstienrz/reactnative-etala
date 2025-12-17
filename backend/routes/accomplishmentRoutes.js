const express = require("express");
const router = express.Router();
const { 
  createAccomplishment,
  getAccomplishments,
  getArchivedAccomplishments,
  archiveAccomplishment,
  restoreAccomplishment 
} = require("../controllers/accomplishmentController");

const { uploadAccomplishment } = require("../config/multer");

router.get("/", getAccomplishments);
router.get("/archived", getArchivedAccomplishments);
router.post("/", uploadAccomplishment.single("file"), createAccomplishment);
router.put("/:id/archive", archiveAccomplishment);
router.put("/:id/restore", restoreAccomplishment);

module.exports = router;
