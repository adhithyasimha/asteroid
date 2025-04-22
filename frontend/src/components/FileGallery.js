import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './FileGallery.css';

const FileGallery = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const CONTRACT_ADDRESS = "0x611EC2ea8c13c4F363E066382bECe9A553E531bc";
  const CONTRACT_ABI = [
    "function getUserFiles() public view returns (tuple(string cid, string name, uint256 size, string fileType, uint256 timestamp, address owner)[] memory)"
  ];

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      const filesList = await contract.getUserFiles();
      
      // Format the files data
      const formattedFiles = filesList.map(file => {
        return {
          cid: file.cid,
          name: file.name,
          size: Number(file.size),
          fileType: file.fileType,
          timestamp: new Date(Number(file.timestamp) * 1000).toLocaleString(),
          owner: file.owner
        };
      });
      
      setFiles(formattedFiles);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to load files. Make sure your wallet is connected.");
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const downloadFile = async (cid, fileName) => {
    try {
      // Use IPFS gateway to download the file
      const url = `https://ipfs.io/ipfs/${cid}`;
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Create download link
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

  return (
    <div className="file-gallery">
      <h2>Your Files</h2>
      {loading ? (
        <p>Loading files...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : files.length === 0 ? (
        <p>No files found. Upload some files first!</p>
      ) : (
        <div className="files-container">
          {files.map((file, index) => (
            <div key={index} className="file-card">
              <div className="file-icon">
                {file.fileType.startsWith('image/') ? (
                  <img src={`https://ipfs.io/ipfs/${file.cid}`} alt={file.name} className="file-preview" />
                ) : (
                  <i className="file-icon-generic">📄</i>
                )}
              </div>
              <div className="file-details">
                <h3 className="file-name">{file.name}</h3>
                <p>Type: {file.fileType}</p>
                <p>Size: {formatFileSize(file.size)}</p>
                <p>Uploaded: {file.timestamp}</p>
                <button 
                  onClick={() => downloadFile(file.cid, file.name)}
                  className="download-btn"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button onClick={fetchFiles} className="refresh-btn">
        Refresh Files
      </button>
    </div>
  );
};

export default FileGallery;