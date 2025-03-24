import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Smart contract details
const CONTRACT_ABI = [
  // Your contract ABI
  "function getUserFiles() public view returns (tuple(string cid, string name, uint256 size, string fileType, uint256 timestamp, address owner)[] memory)"
];
const CONTRACT_ADDRESS = "0x..."; // Your contract address

const FileGallery = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts"
          });
          if (accounts.length > 0) {
            setConnected(true);
            fetchUserFiles();
          } else {
            setLoading(false);
            setConnected(false);
          }
        } catch (error) {
          console.error('Error checking connection:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    checkConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setConnected(true);
          fetchUserFiles();
        } else {
          setConnected(false);
          setFiles([]);
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);
  
  const fetchUserFiles = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Ethereum wallet not found");
      }
      
      setLoading(true);
      setError(null);
      
      // Using BrowserProvider for ethers v6
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      // Get user's files from the blockchain
      const userFiles = await contract.getUserFiles();
      
      // Format files for display
      const formattedFiles = userFiles.map(file => ({
        cid: file.cid,
        name: file.name,
        size: Number(file.size),
        fileType: file.fileType,
        timestamp: new Date(Number(file.timestamp) * 1000),
        accessLink: `https://ipfs.io/ipfs/${file.cid}`
      }));
      
      setFiles(formattedFiles);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError(err.message || "Failed to load your files");
    } finally {
      setLoading(false);
    }
  };
  
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getFileIcon = (fileType) => {
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎬';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('text')) return '📝';
    if (fileType.includes('application/json')) return '📊';
    return '📁';
  };
  
  return (
    <div className="files-gallery">
      <div className="gallery-header">
        <h2>My Stored Files</h2>
        {connected && (
          <button onClick={fetchUserFiles} className="refresh-button">
            ↻ Refresh
          </button>
        )}
      </div>
      
      {!connected ? (
        <div className="connect-prompt">
          <p>Please connect your wallet to view your files</p>
        </div>
      ) : loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your files...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      ) : files.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No files yet</h3>
          <p>Upload your first file to see it here</p>
        </div>
      ) : (
        <div className="files-grid">
          {files.map(file => (
            <div key={file.cid} className="file-card">
              <div className="file-icon">
                {getFileIcon(file.fileType)}
              </div>
              <div className="file-info">
                <h3 className="file-name" title={file.name}>
                  {file.name.length > 20 ? `${file.name.substring(0, 20)}...` : file.name}
                </h3>
                <p className="file-details">
                  {formatFileSize(file.size)} • {formatDate(file.timestamp)}
                </p>
              </div>
              <div className="file-actions">
                <a href={file.accessLink} className="file-button" target="_blank" rel="noopener noreferrer">
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileGallery;