const Document = require("../models/Document");

const checkPermissions = (action) => {
  return async (req, res, next) => {
    const { documentId } = req.params;
    const userId = req.user.id;

    try {
      const document = await Document.findById(documentId);
      if (!document) return res.status(404).json({ msg: "Document not found" });

      const userPermission = document.permissions.find(
        (perm) => perm.userId.toString() === userId.toString()
      );

      if (!userPermission) {
        return res.status(403).json({ msg: "You do not have access to this document" });
      }

      if (action === "edit" && userPermission.role !== "editor") {
        return res.status(403).json({ msg: "You do not have edit access" });
      }

      if (action === "comment" && !["editor", "commentator"].includes(userPermission.role)) {
        return res.status(403).json({ msg: "Only commentators or editors can comment" });
      }

      if (action === "view" && userPermission.role === "viewer") {
        return next(); // Viewer can only view
      }

      if (userPermission.role === "viewer") {
        return res.status(403).json({ msg: "You have only viewer access" });
      }

      next(); // Proceed if permissions are valid for the given action
    } catch (error) {
      res.status(500).json({ msg: "Server Error" });
    }
  };
};

module.exports = checkPermissions;
