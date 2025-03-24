const fs = require('fs');
import { create } from 'kubo-rpc-client';

const { ethers } = require('hardhat');

// Contract address from deployment
const contractAddress = '0x611EC2ea8c13c4F363E066382bECe9A553E531bc';

async function main() {
  // Connect to local IPFS node
  const ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });

  try {
    // Get contract factory and attach to deployed address
    const IPFSStorage = await ethers.getContractFactory('IPFSStorage');
    const contract = await IPFSStorage.attach(contractAddress);

    // Read and upload file
    const filePath = './a.txt';
    const fileContent = fs.readFileSync(filePath, 'utf8');
    console.log('File content:', fileContent);

    // Upload to IPFS
    const result = await ipfs.add(fileContent);
    const cid = result.path;
    console.log('File uploaded to IPFS with CID:', cid);

    // Store CID in contract
    const tx = await contract.storeCID(cid);
    await tx.wait();
    console.log('Transaction hash:', tx.hash);

    console.log('File available at:');
    console.log(`http://localhost:8080/ipfs/${cid}`);

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