// context/WalletContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {ethers, JsonRpcProvider} from 'ethers';
import ToDoListAbi from "../../artifacts/contracts/VotingApp.sol/VotingApp.json";

interface WalletContextType {
    account: string | null;
    contract: any | null;
    provider: JsonRpcProvider | null;
    loading: boolean;
    error: string | null;
    connectToHardhat: () => Promise<void>;
    isAdmin: boolean;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ACCOUNT_NUMBER = 0;

// Custom hook for accessing the wallet context
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};

interface WalletProviderProps {
    children: ReactNode;
}

// WalletProvider component
export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<JsonRpcProvider | null>(null);
    const [contract, setContract] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);


    const connectToHardhat = async () => {
        setLoading(true);
        try {
            // Create a JSON-RPC provider to connect to the Hardhat node
            const provider = new JsonRpcProvider('http://127.0.0.1:8545');
            setProvider(provider);

            const accounts = await provider.listAccounts();

            // Check if any accounts are available
            if (accounts.length === 0) {
                throw new Error("No accounts found in Hardhat local node.");
            }

            // Use the first account as the signer
            const signer = provider.getSigner(ACCOUNT_NUMBER);
            const signerAddress = await (await signer).getAddress();
            setAccount(signerAddress);

            // Initialize the contract with ABI, address, and signer
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ToDoListAbi.abi, await signer);
            setContract(contract);


        } catch (error) {
            console.error('Error connecting to Hardhat node:', error);
            setError('Failed to connect to Hardhat node.');
        } finally {
            setLoading(false);
        }
    };

    const checkAdmin = async () => {
        if (contract && account) { // Ensure both contract and account are ready
            const adminAddress = await contract.getAdmin();
            console.log("contract admin: ", adminAddress);
            console.log("account: ", account);

            if (account === adminAddress) {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        }
    };



    useEffect(() => {
        connectToHardhat();
        checkAdmin();
    }, [account]);

    return (
        <WalletContext.Provider value={{ account, contract, provider, loading, error, connectToHardhat, isAdmin }}>
            {children}
        </WalletContext.Provider>
    );
};
