"use client"

import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import SpotifyButton from "./SpotifyButton";
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function RegistrationForm() {
    const { publicKey } = useWallet();

    useEffect(() => {
        if (publicKey) {
            // Save public key to session storage
            sessionStorage.setItem('publicKey', publicKey.toString());
        } else {
            // Remove public key from session storage
            sessionStorage.removeItem('publicKey');
        }
    }, [publicKey]);


    const walletStyling = {
        backgroundColor: '#4a5568',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    }

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
                    {publicKey && localStorage.getItem('spotify_access_token') && (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Your Stream Counts</h3>
                            <p className="text-gray-600 mb-3">Here&apos;s how many times you&apos;ve streamed Jive:</p>
                            <div className="bg-white p-4 rounded-md shadow">
                                <p className="text-2xl font-bold text-center">
                                    34
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
