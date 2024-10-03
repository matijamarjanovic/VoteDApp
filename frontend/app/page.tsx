'use client';

import type { AppProps } from 'next/app';
import Navbar from "@/app/components/Navbar";
import { useEffect, useState } from "react";
import Link from 'next/link';  // Import Link component
import { JsonRpcProvider } from 'ethers';
import {useWallet} from "@/context/WalletContext";

class Matter {
    id: number;
    description: string;
    proposalsCount: number;

    constructor(id: number, description: string, proposalsCount: number) {
        this.id = id;
        this.description = description;
        this.proposalsCount = proposalsCount;
    }
}

export default function Home() {
    const [matters, setMatters] = useState<Matter[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search query
    const { account, loading, error, contract } = useWallet();

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
            }
        }
    }

    const filteredMatters = matters.filter((matter) =>
        matter.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchMatters();
    }, [account, contract]);

    return (
        <div className="min-h-screen bg-gray-800">
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
                            <Link key={matter.id} href={`/matter/${matter.id}`}>
                            <div className="p-6 rounded-lg shadow-lg transition-transform bg-gray-700 transform hover:scale-105">
                                <h2 className="text-xl font-semibold text-dark">{matter.description}</h2>
                                <p className="mt-2 text-white">Proposals Count: {matter.proposalsCount.toString()}</p>
                            </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
