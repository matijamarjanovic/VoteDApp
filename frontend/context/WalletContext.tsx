// context/WalletContext.tsx
'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { JsonRpcProvider } from 'ethers';
import { getContractHardhat } from '../../utils/ethers';

interface WalletContextType {
    account: string | null;
    contract: any | null;
    provider: JsonRpcProvider | null;
    loading: boolean;
    error: string | null;
    connectToHardhat: () => Promise<void>;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

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

    const connectToHardhat = async () => {
        setLoading(true);
        try {
            // Create a JSON-RPC provider to connect to the Hardhat node
            const provider = new JsonRpcProvider('http://127.0.0.1:8545');
            setProvider(provider);

            // Hardhat account address (for testing)
            const hardhatAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
            setAccount(hardhatAccount);

            // Fetch the smart contract instance
            const contract = await getContractHardhat();
            setContract(contract);
        } catch (error) {
            console.error('Error connecting to Hardhat node:', error);
            setError('Failed to connect to Hardhat node.');
        } finally {
            setLoading(false);
        }
    };

    // Optionally, connect automatically on app load
    useEffect(() => {
        connectToHardhat();
    }, []);

    return (
        <WalletContext.Provider value={{ account, contract, provider, loading, error, connectToHardhat }}>
            {children}
        </WalletContext.Provider>
    );
};
