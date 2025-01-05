const express = require("express");
const { createDocument, shareDocument, viewDocument, editDocument, addComment, getDocuments } = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");
const checkPermissions = require("../middleware/permissionMiddleware");
const router = express.Router();

router.get("/", authMiddleware, getDocuments);

// Create a document (only authenticated users can create)
router.post("/create", authMiddleware, createDocument);
// Share document with another user
router.post("/share", authMiddleware, shareDocument);

// Access control for viewing, commenting, and editing
router.get("/:documentId", authMiddleware, checkPermissions("view"), viewDocument);
router.post("/:documentId/edit", authMiddleware, checkPermissions("edit"), editDocument);
router.post("/:documentId/comment", authMiddleware, checkPermissions("comment"), addComment);

module.exports = router;
