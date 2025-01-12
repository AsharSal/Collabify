import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import socket from "../utils/socket";
import { useParams } from "react-router-dom";

const CommentSection = ({ role }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { id } = useParams();

  // Fetch comments on load
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/documents/${id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error("Failed to fetch comments", error);
      }
    };

    fetchComments();
  }, [id]);

  useEffect(() => {
    socket.on("commentAdded", (newComment) => {
      setComments((prevComments) => [...prevComments, newComment]);
    });

    return () => {
      socket.off("commentAdded");
    };
  }, []);

  // Handle adding a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`/documents/${id}/comment`, {
        text: newComment,
      });
      socket.emit("newComment", response.data.comment);
      setComments([...comments, response.data.comment]);  // Append new comment
      setNewComment("");  // Reset input
    } catch (error) {
      console.error("Failed to add comment", error);
    }
  };

  return (
    <div className="w-96 p-4 bg-gray-50 border-l">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment._id} className="p-3 border rounded-md bg-white">
            <p className="text-sm">{comment.text}</p>
            <span className="text-xs text-gray-500">— {comment.username}</span>
          </div>
        ))}
      </div>

      {/* Add comment only for commentators and editors */}
      {(role === "commentator" || role === "editor") && (
        <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-2 border rounded-md focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Comment
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
