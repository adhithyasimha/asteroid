module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,  // Ganache default
      network_id: "*",
    },
    sepolia: {
      provider: () => new HDWalletProvider("YOUR_METAMASK_SEED_PHRASE", "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"),
      network_id: 11155111,  // Sepolia's network ID
      gas: 5500000,
    },
  },
  compilers: {
    solc: {
      version: "0.8.0",
    },
  },
};