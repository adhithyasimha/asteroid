// backend/scripts/upload.cjs
const fs = require('fs');
const { create } = require('ipfs-http-client');
const { ethers } = require('hardhat');
const path = require('path');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

// Express app setup
const app = express();
const port = 3000;

// Enable CORS for frontend requests
app.use(cors());

// Configure multer for file uploads
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// Verify contract address is available
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  console.error('Contract address not found in .env file');
  process.exit(1);
}

// Connect to local IPFS node
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
});

// API endpoint for file upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get contract factory and attach to deployed address
    const IPFSStorage = await ethers.getContractFactory('IPFSStorage');
    const contract = await IPFSStorage.attach(contractAddress);

    // Read uploaded file
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath);
    
    // Upload to IPFS
    const result = await ipfs.add({
      content: fileContent,
      pin: true
    });
    
    const cidString = result.cid.toString();
    console.log('File uploaded to IPFS with CID:', cidString);

    // Store CID in contract
    const tx = await contract.storeCID(cidString);
    await tx.wait();
    console.log('Transaction hash:', tx.hash);

    // Clean up - remove the uploaded file
    fs.unlinkSync(filePath);

    // Return success response
    res.json({
      success: true,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      cid: cidString,
      txHash: tx.hash,
      accessLink: `http://localhost:8080/ipfs/${cidString}`
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// API endpoint to get file info by CID
app.get('/api/file/:cid', async (req, res) => {
  const cid = req.params.cid;
  try {
    // Verify the CID exists in IPFS
    const stat = await ipfs.files.stat(`/ipfs/${cid}`);
    
    res.json({
      cid: cid,
      size: stat.size,
      accessLink: `http://localhost:8080/ipfs/${cid}`
    });
  } catch (error) {
    res.status(404).json({ error: 'File not found' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
  console.log(`Upload endpoint: http://localhost:${port}/api/upload`);
});

// Export the app for potential testing
module.exports = app;