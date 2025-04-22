import React, { useState, useEffect } from 'react';
import { create } from 'ipfs-http-client';
import './FileGallery.css';

const FileGallery = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const BACKEND_URL = "http://localhost:3001"; // Update to match your backend port
  
  // Initialize IPFS client (only for direct node interaction if needed)
  const ipfs = create({
    host: 'localhost',
    port: 5001,
    protocol: 'http'
  });
  
  useEffect(() => {
    fetchIPFSFiles();
  }, []);

  const fetchIPFSFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching IPFS files from:", `${BACKEND_URL}/api/ipfs/files`);
      const response = await fetch(`${BACKEND_URL}/api/ipfs/files`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("IPFS files:", data.files);
      
      setFiles(data.files || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching IPFS files:", err);
      setError(`Failed to load IPFS files: ${err.message}`);
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const viewFile = (cid) => {
    const cleanCid = cid.trim();
    window.open(`http://127.0.0.1:8080/ipfs/${cleanCid}`, '_blank');
  };

  const downloadFile = async (cid, fileName) => {
    try {
      const url = `http://127.0.0.1:8080/ipfs/${cid}`;
      const response = await fetch(url);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download file");
    }
  };

  // Helper function to determine if a CID is a file or directory and handle accordingly
  async function getIPFSContent(ipfs, cid) {
    try {
      // Check if it's a directory first
      const dirInfo = await ipfs.ls(cid);
      // If we reach here without error, it's a directory
      return {
        isDirectory: true,
        content: Array.from(dirInfo).map(item => ({
          name: item.name,
          cid: item.cid.toString(),
          size: item.size,
          type: item.type
        }))
      };
    } catch (dirError) {
      try {
        // If ls fails, try cat as it might be a file
        const chunks = [];
        for await (const chunk of ipfs.cat(cid)) {
          chunks.push(chunk);
        }
        const content = Buffer.concat(chunks).toString();
        return {
          isDirectory: false,
          content: content
        };
      } catch (fileError) {
        throw new Error(`Failed to retrieve IPFS content: ${fileError.message}`);
      }
    }
  }

  return (
    <div className="file-gallery">
      <h2>IPFS Files</h2>
      
      {loading ? (
        <p className="loading">Loading files from IPFS...</p>
      ) : error ? (
        <div>
          <p className="error">{error}</p>
          <button onClick={fetchIPFSFiles} className="retry-btn">Retry</button>
        </div>
      ) : files.length === 0 ? (
        <p>No files found in IPFS. Upload some files first!</p>
      ) : (
        <div className="table-container">
          <table className="files-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>CID</th>
                <th>Type</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td className="cid-cell">
                    <span className="cid-text" title={file.cid}>{file.cid}</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText(file.cid)}
                      className="copy-btn" 
                      title="Copy CID"
                    >
                      📋
                    </button>
                  </td>
                  <td>{file.fileType}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td className="actions-cell">
                    <button 
                      onClick={() => downloadFile(file.cid, file.name)}
                      className="download-btn"
                      title="Download file"
                    >
                      ⬇️
                    </button>
                    <button 
                      onClick={() => viewFile(file.cid)}
                      className="view-btn"
                      title="View file"
                    >
                      👁️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <button onClick={fetchIPFSFiles} className="refresh-btn">
        Refresh IPFS Files
      </button>
    </div>
  );
};

export default FileGallery;