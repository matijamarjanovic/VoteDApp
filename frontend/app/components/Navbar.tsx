import Link from 'next/link';

interface NavbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ searchQuery, setSearchQuery }) => {
    return (
        <nav className="bg-gray-700 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-lg font-bold">Voting App</div>
                <div className="space-x-4">
                    <Link href="/">
                        <span className="text-gray-300 hover:text-white cursor-pointer">Home</span>
                    </Link>
                    <Link href="/about">
                        <span className="text-gray-300 hover:text-white cursor-pointer">About</span>
                    </Link>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        className="px-3 py-1 rounded-lg bg-gray-800 text-white outline-none focus:ring focus:ring-blue-300"
                    />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
