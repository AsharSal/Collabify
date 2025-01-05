const Document = require("../models/Document");
const User = require("../models/User");


exports.getDocuments = async (req, res) => {
    try {
      // Get user from JWT token (userId is attached in JWT middleware)
      const userId = req.user.id;

      // Fetch documents created by the authenticated user

    //   const documents = await Document.find({ creator: userId });

    // Fetch documents where the userId exists in the permissions array
      const documents = await Document.find({
        "permissions.userId": userId,
      }).select("id title content permissions");

      if (!documents || documents.length === 0) {
        return res.status(200).json([]);
      }

      const result = documents.map((doc) => {
        // Find the current user's role from the permissions array
        const userPermission = doc.permissions.find((permission) => permission.userId.toString() === userId.toString());
  
        return {
          _id: doc.id,
          title: doc.title,
          content: doc.content,
          role: userPermission ? userPermission.role : null, // Set the role of the current user
        };
      });
  
      return res.json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
};

// Create a new document
exports.createDocument = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    const document = new Document({
      title,
      content,
      creator: userId,
      permissions: [
        { userId, role: "editor" }, // The creator is always the editor
      ],
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

// Share document with another user (by assigning a role)
exports.shareDocument = async (req, res) => {
    const { documentId, userId, role } = req.body;
    const loggedInUserId = req.user.id;
  
    try {
      const document = await Document.findById(documentId);
      if (!document) return res.status(404).json({ msg: "Document not found" });
  
      // Check if the logged-in user is an editor to give permissions
      const docPermissions = document.permissions.find(
        (perm) => perm.userId.toString() === loggedInUserId.toString()
      );
      if (!docPermissions || docPermissions.role !== "editor") {
        return res.status(403).json({ msg: "You are not authorized to share this document" });
      }
  
      // Check if the user already has access
      const userPermissions = document.permissions.find(
        (perm) => perm.userId.toString() === userId.toString()
      );
  
      if (userPermissions) {
        return res.status(400).json({ msg: "User already has access to this document" });
      }
  
      // Add new user with the specified role
      document.permissions.push({ userId, role });
      await document.save();
  
      res.status(200).json({ msg: "Document shared successfully" });
    } catch (error) {
      res.status(500).json({ msg: "Server Error" });
    }
};

exports.viewDocument = async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user.id;
    try {
      const document = await Document.findById(documentId).select("id title content permissions");
      if(!document){
        return res.status(404).json({ msg: "No document found against this id" });
      }
      const userPermission = document.permissions.find((permission) => permission.userId.toString() === userId.toString());
      const result =  {
        _id: document.id,
        title: document.title,
        content: document.content,
        role: userPermission ? userPermission.role : null,
      };
      res.json(result);
    } catch (error) {
        console.log(error);
      res.status(500).json({ msg: "Error fetching document" });
    }
};
exports.editDocument = async (req, res) => {
    const { documentId } = req.params;
    const { content } = req.body;
    try {
      const document = await Document.findById(documentId);
      document.content = content; // Update the content
      await document.save();
      res.status(200).json(document);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error updating document" });
    }
};

// Add a comment to a document
exports.addComment = async (req, res) => {
    const { documentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;
  
    try {
      // Find the document by ID
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ msg: "Document not found" });
      }
  
      // Check if the user has 'commentator' role
      const userPermission = document.permissions.find(
        (perm) => perm.userId.toString() === userId.toString()
      );
  
      if (!userPermission) {
        return res.status(403).json({ msg: "You do not have access to comment on this document" });
      }
  
      if (userPermission.role !== "commentator" && userPermission.role !== "editor") {
        return res.status(403).json({ msg: "Only commentators or editors can comment" });
      }
  
      // Add the comment to the document
      document.comments.push({ userId, text });
      await document.save();
  
      res.status(200).json({ msg: "Comment added successfully", comments: document.comments });
    } catch (error) {
      res.status(500).json({ msg: "Server Error" });
    }
};
  
  
