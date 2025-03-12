const hre = require("hardhat");

async function main() {
    const IPFSStorage = await ethers.getContractFactory("IPFSStorage");
    const ipfsStorage = await IPFSStorage.deploy();
    await ipfsStorage.waitForDeployment(); // ✅ Corrected line
    console.log("Contract deployed at:", await ipfsStorage.getAddress()); // ✅ Updated
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  