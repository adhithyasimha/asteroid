# Asteroid - Decentralized File Storage DApp

Asteroid is a decentralized file storage application that leverages **IPFS** for storing files and **Ethereum blockchain** for managing storage payments and metadata. Users can upload files securely, pay for storage, and retrieve them without relying on centralized servers.

---

## Features
- Upload files to a decentralized network using IPFS.
- Pay for file storage via Ethereum smart contracts.
- Browse uploaded files through a simple File Gallery.
- Protects privacy, ensures ownership, and avoids censorship.
- Connects seamlessly with MetaMask wallet.

---

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd asteroid
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Install IPFS
Follow the [official IPFS installation guide](https://docs.ipfs.tech/install/).

Example for Linux:
```bash
wget https://dist.ipfs.tech/kubo/v0.20.0/kubo_v0.20.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.20.0_linux-amd64.tar.gz
cd kubo
sudo bash install.sh
```

### 5. Install MetaMask
Install the [MetaMask extension](https://metamask.io/) in your browser.

---

## Configuration

### Smart Contracts
- Review or update smart contracts inside `backend/contracts/`.
- Deploy them following the steps in the Deployment section.
- Update deployed contract addresses in:
  - `frontend/src/components/FileUpload.js`
  - `frontend/src/components/FileGallery.js`

Example:
```javascript
const CONTRACT_ADDRESS = "your_contract_address_here";
const STORAGE_PAYMENT_ADDRESS = "your_storage_payment_contract_address_here";
```

### Backend Server
The backend server runs on **http://localhost:3001** by default.  
Ensure `BACKEND_URL` is correctly set inside your frontend code (`FileUpload.js` and `FileGallery.js`).

### IPFS Configuration
Before running the IPFS daemon, configure CORS headers:
```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["http://localhost:3000", "http://127.0.0.1:5001"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```
- IPFS API expected at `localhost:5001`
- IPFS Gateway expected at `localhost:8080`

---

## Deployment

### 1. Start IPFS Daemon
```bash
ipfs daemon
```

### 2. Deploy Smart Contracts
- Set up the network configuration in `hardhat.config.cjs`.
- Deploy using:
```bash
npx hardhat run scripts/deploy.js --network your_network_name
```
- Update contract addresses in the frontend.

### 3. Start Backend Server
```bash
cd backend
node server.cjs
```

### 4. Start Frontend Application
```bash
cd frontend
npm start
```

Open your browser at `http://localhost:3000`.

---

## Usage

- Connect your MetaMask wallet to the application.
- Upload a file using the upload form.
- Confirm the storage payment through MetaMask.
- View and manage your files in the File Gallery.

---

## Technologies Used
- **IPFS** - Distributed file storage.
- **Ethereum** - Smart contracts and payment processing.
- **Hardhat** - Smart contract deployment and testing.
- **React.js** - Frontend development.
- **Node.js** - Backend server.
- **MetaMask** - Wallet integration.

---

## License
This project is licensed under the [MIT License](LICENSE).

---

## Contributing
We welcome contributions. Feel free to open issues, suggest features, or submit pull requests.
