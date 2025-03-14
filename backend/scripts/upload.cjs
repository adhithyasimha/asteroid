const fs = require('fs');
const { create } = require('ipfs-http-client');
const { ethers } = require('hardhat');
const path = require('path');
require('dotenv').config();

// Verify contract address is available
const contractAddress = process.env.CONTRACT_ADDRESS;
if (!contractAddress) {
  console.error('Contract address not found in .env file');
  process.exit(1);
}

async function main() {
  try {
    // Connect to local IPFS node
    const ipfs = create({
      host: 'localhost',
      port: 5001,
      protocol: 'http'
    });

    // Get contract factory and attach to deployed address
    const IPFSStorage = await ethers.getContractFactory('IPFSStorage');
    const contract = await IPFSStorage.attach(contractAddress);

    // Read and upload file using correct path
    const filePath = path.join(__dirname, 'a.txt');
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

    console.log('File available at:');
    console.log(`http://localhost:8080/ipfs/${cidString}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });