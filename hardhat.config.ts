import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades"
require("@nomiclabs/hardhat-ganache");

const { mnemonic } = require('./secrets.json');

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545" // Replace with your local node's RPC URL if different
    },
    eth: {
      url: "https://ethereum.publicnode.com",
      chainId: 1,
      accounts: {mnemonic: mnemonic}
    },
    sepolia: {
      url: "https://ethereum-sepolia.publicnode.com",
      chainId: 11155111,
      accounts: {mnemonic: mnemonic}
    },
    bsc: {
      url: "https://bsc-dataseed.bnbchain.org",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: {mnemonic: mnemonic}
    },
    polygon: {
      url: "https://polygon.llamarpc.com",
      chainId: 127,
      accounts: {mnemonic: mnemonic}
    },
    arbitrum: {
      url: "https://arbitrum.llamarpc.com",
      chainId: 42161,
      accounts: {mnemonic: mnemonic}
    },
    optimism: {
      url: "https://optimism.publicnode.com",
      chainId: 10,
      accounts: {mnemonic: mnemonic}
    },
    avalanche: {
      url: "https://rpc.ankr.com/avalanche",
      chainId: 43114,
      accounts: {mnemonic: mnemonic}
    },
    base: {
      url: "https://base.llamarpc.com",
      chainId: 8453,
      accounts: {mnemonic: mnemonic}
    }
  },
  solidity: {
    version: "0.8.21",
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  
};

export default config;
