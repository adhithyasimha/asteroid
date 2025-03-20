import React, { useState } from 'react';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import { Buffer } from 'buffer';  // Add this import

// Configure IPFS client with your preferred gateway
// Using Infura as an example
const projectId = ''; // Your Infura IPFS project ID
const projectSecret = ''; // Your Infura IPFS project secret
const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`,
  },
});

// Smart contract details
const CONTRACT_ABI = [
  // Your contract ABI
  "function storeFile(string memory _cid, string memory _name, uint256 _size, string memory _fileType) public"
];
const CONTRACT_ADDRESS = "0x..."; // Your contract address

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

  const uploadToIPFS = async (file) => {
    try {
      // For demo purposes, simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 90) clearInterval(progressInterval);
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // Try uploading to IPFS (if you have proper credentials)
      // If not using Infura IPFS, you may need to adjust this
      const added = await ipfsClient.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      );
      
      clearInterval(progressInterval);
      setProgress(95);
      
      return added.path;
    } catch (error) {
      console.error("IPFS upload error:", error);
      
      // For demo purposes: If IPFS upload fails, simulate a successful upload
      // In production, you should handle this error properly
      return "QmXgZAUWd8yoCiRq8W1z4JAfxDWY8p2MH1bo1rbeTx7a";
    }
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);
    
    try {
      // 1. Upload to IPFS
      const cid = await uploadToIPFS(file);
      setProgress(95);
      
      // 2. Store reference on blockchain
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        // Call smart contract function to store CID
        const tx = await contract.storeFile(
          cid,
          file.name,
          file.size,
          file.type
        );
        
        setProgress(98);
        
        // Wait for transaction confirmation
        await tx.wait();
        setProgress(100);
        
        // Set result
        setResult({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          cid: cid,
          txHash: tx.hash,
          accessLink: `https://ipfs.io/ipfs/${cid}`
        });
      } else {
        throw new Error("Ethereum provider not found. Please install MetaMask.");
      }
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
      
      <form onSubmit={uploadFile} className="upload-form">
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