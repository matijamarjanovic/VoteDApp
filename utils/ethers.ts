import { ethers, JsonRpcProvider } from "ethers";
import ToDoListAbi from "../artifacts/contracts/VotingApp.sol/VotingApp.json"; // Import the contract ABI

const HARDHAT_LOCAL_NODE_URL = "http://127.0.0.1:8545";
// Replace with the deployed contract address
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getContractHardhat = async () => {
    try {
        // Create a provider connected to Hardhat's local node
        const provider = new JsonRpcProvider(HARDHAT_LOCAL_NODE_URL);

        // Fetch all available accounts
        const accounts = await provider.listAccounts();

        // Check if any accounts are available
        if (accounts.length === 0) {
            throw new Error("No accounts found in Hardhat local node.");
        }

        // Use the first account as the signer
        const signer = provider.getSigner(0); // No argument needed here

        // Initialize the contract with ABI, address, and signer
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ToDoListAbi.abi, await signer);
        console.log("Contract initialized with signer:", (await signer).getAddress());

        return contract;
    } catch (error) {
        console.error("Error connecting to Hardhat or initializing contract:", error);
        return undefined; // Return undefined in case of error
    }
};


export const getContractMetaMask = async () => {
    // Ensure MetaMask is available
    if (typeof window.ethereum !== "undefined") {
        try {
            // Request account access if needed
            await window.ethereum.request({ method: "eth_requestAccounts" });

            // Create an ethers provider connected to MetaMask
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Get the signer (currently selected MetaMask account)
            const signer = await provider.getSigner();

            // Initialize the contract with ABI, address, and signer
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ToDoListAbi.abi, signer);

            return contract;
        } catch (error) {
            console.error("Error connecting to MetaMask:", error);
            return undefined; // Explicitly return undefined in case of an error
        }
    } else {
        console.error("MetaMask is not installed.");
        return undefined;
    }
};
