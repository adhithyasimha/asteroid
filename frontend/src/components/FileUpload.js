import React, { useState } from 'react';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';  // Add this import

// Configure IPFS client with your preferred gateway
const ipfsClient = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
});

// Near the top of your component file, with other constants
const BACKEND_URL = "http://localhost:3000"; // Make sure this matches your backend port

// Smart contract details
const CONTRACT_ABI = [
  "function storeFile(string memory _cid, string memory _name, uint256 _size, string memory _fileType) public",
  "function storeCID(string memory cid) public"
];
const CONTRACT_ADDRESS = "0x611EC2ea8c13c4F363E066382bECe9A553E531bc"; // Replace placeholder with actual address

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    
    try {
      // Show upload progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) clearInterval(progressInterval);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Upload directly to backend
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Server response:", data); // Debug log
      setProgress(100);
      
      // More defensive approach to extract CID from response
      const cid = data.cid || (data.data && data.data.cid) || "";
      
      if (!cid) {
        throw new Error("No CID returned from server");
      }
      
      // Set result with the CID from the server
      setResult({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        cid: cid,
        txHash: (data.txHash || data.data?.txHash || "N/A"),
        accessLink: `http://127.0.0.1:8080/ipfs/${cid}`
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="upload-container">
      <h2>Store Your Files Securely on IPFS</h2>
      <p className="description">
        Files are stored on IPFS and references are saved on the blockchain.
      </p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="file-drop-area">
          <input 
            type="file" 
            id="fileInput" 
            onChange={handleFileChange}
            className="file-input"
          />
          <label htmlFor="fileInput" className="file-label">
            {file ? file.name : 'Choose a file or drag it here'}
          </label>
        </div>
        
        <button 
          type="submit" 
          className="upload-button" 
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <span className="spinner"></span>
              Uploading...
            </>
          ) : 'Upload to Decentralized Storage'}
        </button>
      </form>
      
      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{width: `${progress}%`}}
            ></div>
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {result && (
        <div className="result-container">
          <h3>File Successfully Uploaded!</h3>
          <div className="result-details">
            <p><strong>File:</strong> {result.fileName} ({formatFileSize(result.fileSize)})</p>
            <p><strong>IPFS CID:</strong> <code>{result.cid}</code></p>
            <p><strong>Transaction:</strong> <a href={`https://etherscan.io/tx/${result.txHash}`} target="_blank" rel="noopener noreferrer">{result.txHash?.substring(0,10)}...</a></p>
          </div>
          <a href={result.accessLink} className="view-file-button" target="_blank" rel="noopener noreferrer">
            View Your File
          </a>
        </div>
      )}
    </div>
  );
};

export default FileUpload;