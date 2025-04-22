const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { create } = require('ipfs-http-client');
const fs = require('fs/promises'); // fs.promises to use async/await
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend communication
app.use(cors());

// Configure multer to save files to the 'uploads/' directory
const upload = multer({ dest: 'uploads/' });

// Set up IPFS client
const ipfs = create({
  host: 'localhost',
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
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path; // File path on disk
    const fileBuffer = await fs.readFile(filePath); // Read file buffer from disk

    // Upload the file to IPFS
    const result = await ipfs.add(fileBuffer, { cidVersion: 0 });
    const cid = result.cid.toString(); // Get the CID of the uploaded file

    // Delete the file from local disk after uploading to IPFS
    await fs.unlink(filePath);

    // Send response with file details and CID
    res.json({
      success: true,
      cid: cid,
      name: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to list files from IPFS (example, you can extend it)
app.get('/api/ipfs/files', async (req, res) => {
  try {
    // Get list of pinned items
    const pins = await ipfs.pin.ls();

    const files = [];
    for await (const pin of pins) {
      try {
        // Get stats for the CID
        const stat = await ipfs.files.stat(`/ipfs/${pin.cid}`);

        let isDirectory = false;
        let contentType = 'application/octet-stream';

        try {
          // Check if it's a directory using ls
          const dirTest = await ipfs.ls(pin.cid, { timeout: 1000 });
          for await (const _ of dirTest) {
            isDirectory = true;
            break;
          }

          // Get content type for non-directory files
          if (!isDirectory) {
            const chunks = [];
            for await (const chunk of ipfs.cat(pin.cid, { length: 16, timeout: 1000 })) {
              chunks.push(chunk);
              break;
            }

            if (chunks.length > 0) {
              const buffer = Buffer.concat(chunks);
              if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
                contentType = 'image/jpeg';
              } else if (buffer[0] === 0x89 && buffer[1] === 0x50) {
                contentType = 'image/png';
              } else if (buffer[0] === 0x47 && buffer[1] === 0x49) {
                contentType = 'image/gif';
              } else if (buffer[0] === 0x25 && buffer[1] === 0x50) {
                contentType = 'application/pdf';
              }
            }
          }
        } catch (err) {
          console.log('Error processing directory:', err);
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
        files.push({
          cid: pin.cid.toString(),
          size: 0,
          fileType: 'unknown',
          timestamp: new Date().toISOString(),
          name: `Unknown-${pin.cid.toString().substring(0, 8)}`
        });
      }
    }

    res.json({ files });
  } catch (err) {
    console.error('Error listing IPFS files:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
