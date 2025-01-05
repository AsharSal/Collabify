// src/pages/CreateDocumentPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios"; // Axios instance to call the API

const CreateDocumentPage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form submission to create a new document
  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await axios.post("/documents/create", {
        title,
        content,
      });

      // On success, navigate to the newly created document page
      navigate(`/document/${response.data._id}`);
    } catch (err) {
      setError("There was an error creating the document. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Create New Document</h2>

        {/* Show error message if any */}
        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleCreateDocument} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              required
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document Content"
              required
              className="w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-40"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isSubmitting ? "Creating..." : "Create Document"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDocumentPage;
