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
    const [isModalOpen, setIsModalOpen] = useState(false);  // State to handle modal visibility
    const [newMatterDescription, setNewMatterDescription] = useState<string>(''); // New state for matter input
    const { account, loading, error, contract } = useWallet();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // State to track submission status

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
                setIsModalOpen(false);
            } catch (error) {
                console.error('Error fetching matters:', error);
            }
        }
    }

    const handleNewMatterSubmit = async () => {
        if (newMatterDescription.trim() === '') {
            alert('Matter description cannot be empty');
            return;
        }

        setIsSubmitting(true); // Set submitting state to true

        try {
            const tx = await contract.registerMatter(newMatterDescription); // Smart contract call
            await tx.wait(); // Wait for transaction to complete
            fetchMatters(); // Refetch matters after creating a new one
            setNewMatterDescription(''); // Clear input
        } catch (error : any) {
            console.error('Error creating new matter:', error);
            if(error.message && error.message.includes("Only registered voters can register a matter")){
                alert('Only registered voters can register a matter');
            }
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    };


    const filteredMatters = matters.filter((matter) =>
        matter.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchMatters();
    }, [account, contract]);

    return (
        <div className="min-h-screen bg-gray-800">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            <div className="container mx-auto py-10">
                <h1 className="text-4xl font-bold text-center mb-8 text-dark">Matters to Vote On</h1>

                {/* Plus Button to open the modal */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setIsModalOpen(true)} // Open modal
                        className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition duration-200"
                    >
                        + Add Matter
                    </button>
                </div>

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

                {/* Modal for adding a new matter */}
                {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white rounded-lg p-8 shadow-lg w-96">
                            <h2 className="text-xl font-semibold text-black mb-4">Register a New Matter</h2>
                            <input
                                type="text"
                                value={newMatterDescription}
                                onChange={(e) => setNewMatterDescription(e.target.value)}
                                placeholder="Enter matter description..."
                                className="w-full px-3 py-2 text-black mb-4 border rounded-lg outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={handleNewMatterSubmit}
                                    className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isSubmitting} // Disable button while submitting
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button
                                    onClick={() => setIsModalOpen(false)} // Close modal
                                    className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
