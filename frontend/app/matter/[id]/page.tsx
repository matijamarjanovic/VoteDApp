// app/matter/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import Navbar from '@/app/components/Navbar'; // Adjust the path as per your folder structure
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'; // Import icons for showing/hiding description


interface Proposal {
    id: number;
    title: string;
    description: string;
    votesCount: number;
}

interface Matter {
    id: number;
    description: string;
    proposalCount: number;
}

interface MatterPageProps {
    params: { id: string }; // Next.js automatically passes dynamic route params
}

export default function MatterPage({ params }: MatterPageProps) {
    const { id } = params; // Extract the id from params
    const { contract, loading, error } = useWallet();
    const [matter, setMatter] = useState<Matter | null>(null);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loadingProposals, setLoadingProposals] = useState<boolean>(true);
    const [errorFetching, setErrorFetching] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>(''); // New state for search query
    const [expandedProposal, setExpandedProposal] = useState<number | null>(null); // For toggling description view
    const [winner, setWinner] = useState<Proposal | null>(null); // State for winning proposal
    const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false); // Modal visibility state


    // Function to fetch matter details and proposals
    async function fetchMatterAndProposals() {
        if (!contract || !id) return;

        try {
            // Fetch the matter details
            const matterData = await contract.getMatterById(id);
            const fetchedMatter = {
                id: matterData.id,
                description: matterData.description,
                proposalCount: matterData.proposalsCount,
            };

            setMatter(fetchedMatter);

            // Fetch proposals related to the matter
            const fetchedProposals: Proposal[] = [];
            for (let i = 0; i < matterData.proposalsCount; i++) {
                const proposalData = await contract.getProposalById(id, i); // assuming this is the correct contract call
                console.log(proposalData.voteCount);
                fetchedProposals.push({
                    id: proposalData.id,
                    title: proposalData.title,
                    description: proposalData.description,
                    votesCount: proposalData.voteCount,
                });
            }

            setProposals(fetchedProposals);
        } catch (error) {
            console.error('Error fetching matter or proposals:', error);
            setErrorFetching('Failed to fetch matter details or proposals.');
        } finally {
            setLoadingProposals(false);
        }
    }

    const filteredProposals = proposals.filter((prop) =>
        prop.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleDescription = (proposalId: number) => {
        setExpandedProposal(expandedProposal === proposalId ? null : proposalId);
    };
    // Function to handle voting on a proposal
    const handleVote = async (proposalId: number) => {
        if (!contract) return;

        try {
            // Call the voting function on your contract
            await contract.vote(id, proposalId);
            // Optionally, refresh the proposals after voting
            fetchMatterAndProposals();
        } catch (error) {
            const err = error as Error; // Assert the error as an Error type
            console.error('Error voting on proposal:', err);

            // Check if the error message includes a specific string
            if (err.message && err.message.includes('The voter has already voted on this matter')) {
                alert('You have already voted on this proposal.'); // Alert the user
            } else if (err.message && err.message.includes('Only registered voters can vote')){
                alert('Only registered voters can vote.'); // General error message for other errors
            }
        }
    };

    const chooseWinner = async () => {
        if (!contract || !id) return;

        try {
            const winningProposalId = await contract.getWinningProposal(id); // Call the smart contract function
            const winningProposal = proposals.find(proposal => proposal.id === winningProposalId);
            setWinner(winningProposal || null); // Set the winner
            setIsWinnerModalOpen(true); // Open modal
        } catch (error) {
            console.error('Error choosing winner:', error);
        }
    };

    useEffect(() => {
        if (contract && id) {
            fetchMatterAndProposals();
        }
    }, [contract, id]);

    if (loading || loadingProposals) {
        return <div className="text-center text-lg">Loading...</div>;
    }

    if (error || errorFetching) {
        return <div className="text-center text-red-500">{error || errorFetching}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-800">
            {/* Navbar */}
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> {/* Pass search props */}
            {/* Main Content */}
            <div className="container mx-auto py-10">
                {matter && (
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">{matter.description}</h1>
                        <button
                            onClick={chooseWinner}
                            className="bg-yellow-500 text-gray-600 px-4 py-2 rounded mb-4 hover:bg-green-600 transition duration-200 ml-4"
                        >
                            Choose Winner
                        </button>
                    </div>
                )}

                {filteredProposals.length > 0 ? (
                    filteredProposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className="p-6 mb-4 rounded-lg shadow-lg bg-gray-700 hover:scale-105 transform transition-transform flex justify-between items-center"
                        >
                            <div className="flex-grow">
                                <h2 className="text-xl font-semibold text-dark mb-2">{proposal.title}</h2> {/* Title Display */}
                                <p className="text-gray-300">Votes: {proposal.votesCount.toString()}</p>

                                {/* Button to toggle full description */}
                                <button
                                    onClick={() => toggleDescription(proposal.id)}
                                    className="text-gray-400 hover:text-white transition duration-200 mt-2 flex items-center"
                                >
                                    {expandedProposal === proposal.id ? (
                                        <>
                                            <IoIosArrowUp className="mr-1" />
                                            <span>Show Less</span>
                                        </>
                                    ) : (
                                        <>
                                            <IoIosArrowDown className="mr-1" />
                                            <span>Show More</span>
                                        </>
                                    )}
                                </button>

                                {/* Expanded description */}
                                {expandedProposal === proposal.id && (
                                    <div className="mt-4 text-gray-300">
                                        <p>{proposal.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Vote Button */}
                            <button
                                onClick={() => handleVote(proposal.id)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 ml-4"
                            >
                                Vote
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-lg">No proposals available for this matter.</p>
                )}

                {/* Winner Modal */}
                {isWinnerModalOpen && winner && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-gray-700 rounded-lg p-8 shadow-lg w-96">
                            <h2 className="text-xl font-bold text-yellow-500 mb-4">Winning Proposal</h2>
                            <p className="text-lg text-yellow-500 font-bold">Title: {winner.title}</p>
                            <p className="text-yellow-500 font-semibold">Votes: {winner.votesCount.toString()}</p>
                            <p className="text-yellow-500 font-semibold">Description:</p>
                            <p className="text-yellow-500">{winner.description}</p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setIsWinnerModalOpen(false)} // Close modal
                                    className="bg-gray-600 text-yellow-500 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
