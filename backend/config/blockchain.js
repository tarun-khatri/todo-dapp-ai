const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config()
// Create a provider using the RPC URL from .env
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Read the contract ABI from the JSON file
const contractABI = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'abi', 'TaskManager.json'), 'utf8')
);

// Create a read-only contract instance
const taskManagerContract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);

module.exports = taskManagerContract;
