const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('Deploying IPFSStorage contract...');
  
  try {
    // Get the contract factory
    const IPFSStorage = await ethers.getContractFactory('IPFSStorage');
    console.log('Contract factory created');
    
    // Deploy the contract
    const contract = await IPFSStorage.deploy();
    console.log('Contract deployment transaction sent');
    
    // Wait for deployment to complete
    await contract.waitForDeployment();
    console.log('Contract deployed successfully');
    
    // Get the contract address
    const contractAddress = await contract.getAddress();
    console.log('Contract address:', contractAddress);
    
    // Save the contract address to .env file
    const envPath = path.join(__dirname, '../.env');
    fs.writeFileSync(envPath, `CONTRACT_ADDRESS=${contractAddress}`);
    console.log('Contract address saved to .env file');
    
    return contractAddress;
  } catch (error) {
    console.error('Error deploying contract:', error);
    process.exit(1);
  }
}

main()
  .then((address) => {
    console.log('Deployment complete. Contract address:', address);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 