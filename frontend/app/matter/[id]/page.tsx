// app/matter/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import Navbar from '@/app/components/Navbar'; // Adjust the path as per your folder structure

interface Proposal {
    id: number;
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
                console.log(proposalData);
                fetchedProposals.push({
                    id: proposalData.id,
                    description: proposalData.description,
                    votesCount: proposalData.votesCount,
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
        <div className="bg-gray-800">
            {/* Navbar */}
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> {/* Pass search props */}
            {/* Main Content */}
            <div className="container mx-auto py-10">
                {matter && (
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">{matter.description}</h1>
                        <p className="text-lg">Proposals for this matter:</p>
                    </div>
                )}

                {filteredProposals.length > 0 ? (
                    filteredProposals.map((proposal) => (
                        <div
                            key={proposal.id}
                            className="p-6 mb-4 rounded-lg shadow-lg bg-gray-700 hover:scale-105 transform transition-transform"
                        >
                            <h2 className="text-xl font-semibold text-dark mb-2">{proposal.description}</h2>
                            <p className="text-gray-300">Votes: {proposal.votesCount}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-lg">No proposals available for this matter.</p>
                )}

            </div>
        </div>
    );
}
