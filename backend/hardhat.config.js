require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: [
        // Replace with your Ganache private key (demo only - do not share in production)
        "4798dfad472020e993ba599a493fa739d7d4fa32d72a07c96f99cb7d14cb3965"
      ]
    }
  }
};
