# Asteroid Backend

This is the backend server for the Asteroid project, which handles file uploads and provides mock IPFS and blockchain functionality.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/upload
Uploads a file and returns mock IPFS CID and transaction hash.

Request:
- Content-Type: multipart/form-data
- Body: file (file to upload)

Response:
```json
{
  "success": true,
  "data": {
    "filename": "example.pdf",
    "size": 12345,
    "cid": "QmMockIPFSCID123456789",
    "txHash": "0xMockTransactionHash123456789"
  }
}
```

## Project Structure

- `server.js` - Main server file
- `uploads/` - Directory for storing uploaded files
- `package.json` - Project dependencies and scripts

## Notes

- This is a mock server that simulates file uploads to IPFS and blockchain transactions
- Files are stored locally in the `uploads` directory
- The server runs on port 3000 by default
- CORS is enabled for all origins 