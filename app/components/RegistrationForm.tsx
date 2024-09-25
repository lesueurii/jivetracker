"use client"

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import SpotifyButton from "./SpotifyButton";
import dynamic from 'next/dynamic';
import StreamCount from "./StreamCount";

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

const walletStyling = {
    backgroundColor: '#4a5568',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
}

export default function RegistrationForm() {
    const { publicKey } = useWallet();
    const [hasSpotifyToken, setHasSpotifyToken] = useState(false);

    useEffect(() => {
        const checkSpotifyToken = () => {
            const token = localStorage.getItem('spotify_access_token');
            setHasSpotifyToken(!!token);
        };

        checkSpotifyToken();
        window.addEventListener('spotifyTokenChanged', checkSpotifyToken);

        return () => {
            window.removeEventListener('spotifyTokenChanged', checkSpotifyToken);
        };
    }, []);

    return (
        <>
            <div className="max-w-md mx-auto bg-gray-50 shadow-md rounded-lg p-6 ">
                <h2 className="text-2xl font-bold mb-4 text-center">Registration</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Step 1: Connect Your Wallet</h3>
                        <p className="text-gray-600 mb-3">Connect your Solana wallet to get started.</p>
                        <WalletMultiButtonDynamic style={walletStyling} />
                    </div>
                    {publicKey && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Step 2: Connect Spotify</h3>
                            <p className="text-gray-600 mb-3">Link your Spotify account to track your jives.</p>
                            <div className="flex justify-center">
                                <SpotifyButton />
                            </div>
                        </div>
                    )}
                    {publicKey && hasSpotifyToken && (
                        <div>
                            <div className="relative inline-block group">
                                <h3 className="text-lg font-semibold mb-2">Your Stream Counts</h3>
                                <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm rounded py-2 px-4 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                                    Updates every hour
                                    <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-3">Here&apos;s how many times you&apos;ve streamed Jive:</p>
                            <div className="bg-white p-4 rounded-md shadow">
                                <p className="text-2xl font-bold text-center">
                                    <StreamCount />
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
