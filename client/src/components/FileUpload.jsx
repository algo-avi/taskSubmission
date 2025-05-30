"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, Button, Alert, Typography, LinearProgress } from "@mui/material";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

const BASE_URL = import.meta.env.REACT_APP_BASE_URL || "http://localhost:5000";

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    setError("");
    setSuccess("");
    setUploadResult(null);

    if (!selectedFile) return;

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please select a valid CSV, XLS, or XLSX file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("🔍 Sending file upload request:", file.name); // ✅ Debugging 

      const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ File Upload Response:", response.data); // ✅ Debugging 

      setSuccess("File uploaded and distributed successfully!");
      setUploadResult(response.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("❌ Upload failed:", error.response?.data?.message || error.message); // ✅ Debugging 
      setError(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader title="Upload and Distribute Lists" subheader="CSV, XLS, or XLSX files under 10MB" />
        <CardContent className="space-y-4">
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (allowedTypes.includes(droppedFile.type)) {
                setFile(droppedFile);
                setError("");
              } else {
                setError("Please drop a valid file");
              }
            }}
            className="border-2 border-dashed border-gray-400 p-6 text-center rounded-lg cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Typography>{file ? file.name : "Drop file here or click to browse"}</Typography>
            <Typography variant="caption" className="text-gray-500">Required: FirstName, Phone, Notes</Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileSelect}
              hidden
            />
          </div>

          {file && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Typography>{file.name}</Typography>
                <Typography variant="body2" className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
              </div>
              <Button variant="contained" fullWidth onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload & Distribute"}
              </Button>
              {uploading && <LinearProgress />}
            </div>
          )}

          {uploadResult && (
            <div className="mt-4 space-y-2">
              <Typography variant="h6">Distribution Summary</Typography>
              <div className="grid grid-cols-2 gap-2">
                <Typography>Total: {uploadResult.totalRecords}</Typography>
                <Typography>Valid: {uploadResult.validRecords}</Typography>
                <Typography>Invalid: {uploadResult.invalidRecords}</Typography>
                <Typography>Agents: {uploadResult.agentCount}</Typography>
              </div>
              {uploadResult.distribution?.map((d, i) => (
                <div key={i} className="flex justify-between">
                  <Typography>{d.agentName}</Typography>
                  <Typography>{d.recordCount} records</Typography>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
