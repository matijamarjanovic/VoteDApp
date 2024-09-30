'use client';

import type { AppProps } from 'next/app';
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import { JsonRpcProvider } from 'ethers';
import { getContractHardhat } from "../../utils/ethers";

class Matter {
    id: number;
    description: string;
    proposalCount: number;

    constructor(id: number, description: string, proposalCount: number) {
        this.id = id;
        this.description = description;
        this.proposalCount = proposalCount;
    }
}

export default function Home() {
    const [matters, setMatters] = useState<Matter[]>([]);
    const [account, setAccount] = useState<string | null>(null);
    const [contract, setContract] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search query


    async function connectToHardhat() {
        try {
            // Create a JSON-RPC provider to connect to Hardhat node
            const provider = new JsonRpcProvider('http://127.0.0.1:8545');

            // Use a known Hardhat account (address 0) for testing
            const hardhatAccount = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Replace with one of Hardhat's default addresses

            // Set the connected account
            setAccount(hardhatAccount);
            setContract(await getContractHardhat());


            // Fetch matters after connecting
            await fetchMatters();
        } catch (error) {
            console.error('Error connecting to Hardhat node:', error);
            setError("Failed to connect to Hardhat node.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchMatters() {
        if (contract) {
            try {
                const mattersCount = await contract.getMattersCount();
                const fetchedMatters: Matter[] = [];

                for (let i = 0; i < mattersCount; i++) {
                    const matter = await contract.getMatterById(i);
                    fetchedMatters.push(new Matter(matter.id, matter.description, matter.proposalsCount));
                }

                setMatters(fetchedMatters);
            } catch (error) {
                console.error('Error fetching matters:', error);
                setError("Failed to fetch matters.");
            }
        }
    }

    const filteredMatters = matters.filter((matter) =>
        matter.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        connectToHardhat();
        //connectToWeb3();

    }, [account, contract]);
    return (
        <div className="min-h-screen bg-gray-500">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> {/* Pass search props */}
            <div className="container mx-auto py-10">
                <h1 className="text-4xl font-bold text-center mb-8 text-dark">Matters to Vote On</h1>
                {loading ? (
                    <div className="text-center text-lg text-dark">Loading matters...</div>
                ) : error ? (
                    <div className="text-red-500 text-center text-lg text-dark">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMatters.map((matter) => (
                            <div key={matter.id} className="p-6 rounded-lg shadow-lg transition-transform bg-gray-700 transform hover:scale-105">
                                <h2 className="text-xl font-semibold text-dark">{matter.description}</h2>
                                <p className="mt-2 text-dark">Proposals Count: {matter.proposalCount}</p>
                                <button className="mt-4 bg-blue-600 text-dark px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
                                    View Proposals
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
