'use client'

import Navbar from "@/app/components/Navbar"; // Adjust the path if needed
import { useState } from 'react';

const Page = () => {
    const [searchQuery, setSearchQuery] = useState(''); // Optional search bar in the navbar

    return (
        <div className="min-h-screen bg-gray-800">
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <div className="container mx-auto py-10 px-4">
                <h1 className="text-4xl font-bold text-center mb-8 text-dark">About the Voting App</h1>
                <div className="text-lg text-dark bg-gray-700 p-6 rounded-lg shadow-lg">
                    <p>
                        Welcome to the Voting App! This application is designed to allow users to create and vote on
                        important matters. Whether you're part of an organization, a community, or just want to make
                        group decisions more democratically, this app provides the perfect platform for fair voting.
                    </p>
                    <p className="mt-4">
                        Key features of this app include:
                    </p>
                    <ul className="list-disc list-inside mt-4">
                        <li>Create matters and proposals</li>
                        <li>Vote on existing proposals</li>
                        <li>View voting results in real-time</li>
                        <li>Seamlessly integrated with smart contracts for secure and transparent voting</li>
                    </ul>
                    <p className="mt-4">
                        The app is powered by Ethereum smart contracts, ensuring that every vote is counted fairly and securely.
                        Using the latest web technologies like React, Next.js, and TypeScript, this app provides an intuitive
                        and fast user experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Page;
