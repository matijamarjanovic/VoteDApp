import Link from 'next/link';
import {useWallet} from "@/context/WalletContext";
import {useState} from "react";
import { ethers } from 'ethers'; // Correct import for ethers with utils

interface NavbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery }) => {
    const { isAdmin, contract } = useWallet(); // Get isAdmin from context
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleRegisterVoter = () => {
        setErrorMessage(null);
        setSuccessMessage(null);

        // Validate if searchQuery is a valid Ethereum address
        if (!ethers.getAddress(searchQuery)) {
            setErrorMessage('Invalid Ethereum address.');
            setTimeout(() => {
                setErrorMessage(null);
                setSearchQuery('');
            }, 5000);
            return;
        }

        try {
            // Ensure the contract is available
            if (!contract) {
                throw new Error('Smart contract is not connected.');
            }

            // Call the contract method to register the voter
            contract.registerVoter(searchQuery);

            // Set success message
            setSuccessMessage(`Voter ${searchQuery} registered successfully.`);
            setTimeout(() => {
                setSuccessMessage(null);
                setSearchQuery('');
            }, 5000);
        } catch (error: any) {
            console.error("Error registering voter:", error);
            if(error.message && error.message.includes("The voter is already registered")){
                setErrorMessage('The voter is already registered.');
                setTimeout(() => {
                    setErrorMessage(null);
                    setSearchQuery('');
                }, 5000);

            }
        }
    };

    return (
        <nav className="bg-gray-700 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                    <div className="text-white text-lg font-bold">Voting App</div>
                </Link>
                <div className="space-x-4">
                    <Link href="/">
                        <span className="text-gray-300 hover:text-white cursor-pointer">Home</span>
                    </Link>
                    <Link href="/about">
                        <span className="text-gray-300 hover:text-white cursor-pointer">About</span>
                    </Link>
                    <input
                        key="search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="px-3 py-1 rounded-lg bg-gray-800 text-white outline-none focus:ring focus:ring-blue-300"
                    />
                    {isAdmin && (
                        <button
                            onClick={handleRegisterVoter}
                            className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                        >
                            Register Voter
                        </button>
                    )}
                    {errorMessage && <p className="text-red-500">{errorMessage}</p>}
                    {successMessage && <p className="text-green-500">{successMessage}</p>}

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
