// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../utils/axios"; // Using axios instance we created earlier

const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("/documents");
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents", error);
      }
    };
    fetchDocuments();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-semibold mb-6">Your Documents</h2>
        <button
          onClick={() => navigate("/document/create")}
          className="mb-6 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Create New Document
        </button>
        <ul className="space-y-4">
          {documents.map((doc) => (
            <li
              key={doc._id}
              className="p-4 bg-white rounded-md shadow-md hover:bg-blue-50 cursor-pointer"
              onClick={() => navigate(`/document/${doc._id}`)}
            >
              <h3 className="text-xl font-semibold">{doc.title}</h3>
              <p className="text-gray-600">{doc.content.substring(0, 100)}...</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
