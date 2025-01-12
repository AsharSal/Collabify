import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import socket from "../utils/socket";
import CommentSection from "../components/CommentSection";

const DocumentEditorPage = () => {
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState("");
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const hasJoinedRoom = useRef(false);

  const username = localStorage.getItem("username") || "Guest";

  // Fetch the document on mount
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await axios.get(`/documents/${id}`);
        setDocument(response.data);
        setContent(response.data.content);
      } catch (error) {
        console.error("Failed to fetch document", error);
      }
    };

    fetchDocument();
  }, [id]);

  // Join the WebSocket room and set up listeners
  useEffect(() => {
    if (!id || hasJoinedRoom.current) return;

    socket.emit("joinDocument", id, username);
    hasJoinedRoom.current = true;

    // Cleanup listeners on unmount
    return () => {
      socket.off("joinDocument");
    };
  }, [id, username]);


  useEffect(() => {
    if (!id ) return;

    // Listen for document updates
    socket.on("documentUpdated", (newContent) => {
      setContent(newContent);
    });

    // Listen for typing indicator
    socket.on("typing", (username) => {
      setIsTyping(`${username} is typing...`);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("documentUpdated");
      socket.off("typing");
    };
  }, [id, username]);

  // Handle content change and emit updates to other users (Only for editors)
  const handleContentChange = (e) => {
    if (document?.role !== "editor") return;  // Prevent non-editors from typing

    const updatedContent = e.target.value;
    setContent(updatedContent);
    socket.emit("updateDocument", id, updatedContent);
    socket.emit("userTyping", username);
  };

  // Save manually through API
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(`/documents/${id}/edit`, { content });
      alert("Document saved successfully!");
    } catch (error) {
      console.error("Failed to save document", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg flex-1">
        <h2 className="text-3xl font-semibold mb-6">
          {document?.title || "Untitled Document"}
        </h2>

        {isTyping && (
          <p className="text-sm text-blue-500">
            {isTyping}
          </p>
        )}

        <textarea
          ref={textareaRef}
          className={`w-full h-[300px] border p-4 rounded-lg bg-gray-50 focus:outline-none ${
            document?.role !== "editor"
              ? "cursor-not-allowed bg-gray-100"
              : "focus:ring-2 focus:ring-blue-500"
          }`}
          value={content}
          onChange={handleContentChange}
          readOnly={document?.role !== "editor"}  // Disable textarea if not editor
        />

        {document?.role === "editor" && (
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
      <CommentSection role={document?.role} />
    </div>
  );
};

export default DocumentEditorPage;
