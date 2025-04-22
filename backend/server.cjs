const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { create } = require('ipfs-http-client');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Configure IPFS client
const ipfs = create({
  host: '127.0.0.1',
  port: 5001,
  protocol: 'http'
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    
    // Upload to IPFS with explicit CID version
    const options = {
      cidVersion: 0
    };
    
    const result = await ipfs.add(fileBuffer, options);
    const cid = result.cid.toString();
    
    console.log("File uploaded to IPFS with CID:", cid);
    
    // Return CID directly at the top level to avoid nesting issues
    res.json({
      success: true,
      cid: cid,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to list files from IPFS
app.get('/api/ipfs/files', async (req, res) => {
  try {
    // Get list of pinned items
    const pins = await ipfs.pin.ls();
    
    // Array to store file details
    const files = [];
    
    // Process each pin to get file details
    for await (const pin of pins) {
      try {
        // Get stats for the CID
        const stat = await ipfs.files.stat(`/ipfs/${pin.cid}`);
        
        // Determine if it's a directory
        let isDirectory = false;
        let contentType = 'application/octet-stream';
        
        try {
          // First check if it's a directory using ls
          const dirTest = await ipfs.ls(pin.cid, { timeout: 1000 });
          for await (const _ of dirTest) {
            isDirectory = true;
            break; // Just need to check if there are any items
          }
          
          // Only try to get content type if it's not a directory
          if (!isDirectory) {
            try {
              const chunks = [];
              for await (const chunk of ipfs.cat(pin.cid, { length: 16, timeout: 1000 })) {
                chunks.push(chunk);
                break;
              }
              
              if (chunks.length > 0) {
                const buffer = Buffer.concat(chunks);
                try {
                  // Use simple MIME detection based on magic numbers
                  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
                    contentType = 'image/jpeg';
                  } else if (buffer[0] === 0x89 && buffer[1] === 0x50) {
                    contentType = 'image/png';
                  } else if (buffer[0] === 0x47 && buffer[1] === 0x49) {
                    contentType = 'image/gif';
                  } else if (buffer[0] === 0x25 && buffer[1] === 0x50) {
                    contentType = 'application/pdf';
                  }
                  // Add more types as needed
                } catch (typeErr) {
                  console.log('Error identifying file type:', typeErr);
                }
              }
            } catch (catErr) {
              console.log('Error reading file content:', catErr);
            }
          }
        } catch (err) {
          console.log(`Cannot determine if ${pin.cid} is a directory:`, err);
          // If we can't check, just assume it's a file
        }
        
        files.push({
          cid: pin.cid.toString(),
          size: stat.size,
          fileType: isDirectory ? 'directory' : contentType,
          timestamp: new Date().toISOString(),
          name: isDirectory ? `Dir-${pin.cid.toString().substring(0, 8)}` : `File-${pin.cid.toString().substring(0, 8)}`
        });
      } catch (err) {
        console.error(`Error processing CID ${pin.cid}:`, err);
        // Still add the CID with limited information
        files.push({
          cid: pin.cid.toString(),
          size: 0,
          fileType: 'unknown',
          timestamp: new Date().toISOString(),
          name: `Unknown-${pin.cid.toString().substring(0, 8)}`
        });
      }
    }
    
    console.log(`Found ${files.length} pinned items`);
    res.json({ files });
  } catch (error) {
    console.error("Error listing IPFS files:", error);
    res.status(500).json({ error: error.message });
  }
});

// Usage example
app.get('/ipfs/:cid', async (req, res) => {
  try {
    const result = await getIPFSContent(ipfs, req.params.cid);
    res.json(result);
  } catch (error) {
    console.error('IPFS error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});