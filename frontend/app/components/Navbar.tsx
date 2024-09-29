import Link from 'next/link';

const Navbar = () => {
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
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
