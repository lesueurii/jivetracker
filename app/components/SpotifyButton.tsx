"use client"

import { useState, useEffect } from 'react';
import upsertStream from '../lib/helpers/upsert-stream';

const REDIRECT_URI = `${typeof window !== 'undefined' ? window.location.origin : ''}`;

export default function SpotifyButton() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [clientId, setClientId] = useState(localStorage.getItem('spotify_client_id') || '');

    useEffect(() => {
        const token = localStorage.getItem('spotify_access_token');
        if (token) {
            setIsAuthenticated(true);

            const runUpsertStream = () => {
                upsertStream({
                    spotify_access_token: token,
                    solana_wallet_address: sessionStorage.getItem('publicKey') || '',
                });
            };

            // Run immediately
            runUpsertStream();

            // Set up interval to run every hour
            const intervalId = setInterval(runUpsertStream, 60 * 60 * 1000);

            // Clean up interval on component unmount
            return () => clearInterval(intervalId);
        } else {
            // Check for callback
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            if (code) {
                exchangeCodeForToken(code);
            }
        }

        // Check if client ID exists in local storage
        const storedClientId = localStorage.getItem('spotify_client_id');
        if (storedClientId) {
            setClientId(storedClientId);
        }
    }, []);

    const generateCodeVerifier = (length: number) => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    const generateCodeChallenge = async (codeVerifier: string) => {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    };

    const exchangeCodeForToken = async (code: string) => {
        setIsLoading(true);
        const codeVerifier = localStorage.getItem('code_verifier');

        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: clientId,
            code_verifier: codeVerifier!,
        });

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body
            });

            if (!response.ok) {
                throw new Error('HTTP status ' + response.status);
            }

            const data = await response.json();
            localStorage.setItem('spotify_access_token', data.access_token);
            localStorage.setItem('spotify_refresh_token', data.refresh_token);
            setIsAuthenticated(true);
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            window.dispatchEvent(new Event('spotifyTokenChanged'));
        } catch (error) {
            console.error('Error:', error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        const storedClientId = localStorage.getItem('spotify_client_id');
        if (storedClientId) {
            setClientId(storedClientId);
            startAuthProcess();
        } else {
            setShowModal(true);
        }
    };

    const handleModalSubmit = () => {
        if (!clientId) {
            alert('Please enter a valid Client ID');
            return;
        }

        localStorage.setItem('spotify_client_id', clientId);
        setShowModal(false);
        startAuthProcess();
    };

    const startAuthProcess = async () => {
        const codeVerifier = generateCodeVerifier(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        localStorage.setItem('code_verifier', codeVerifier);
        window.dispatchEvent(new Event('spotifyTokenChanged'));

        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: REDIRECT_URI,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            scope: 'user-read-recently-played',
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    const handleLogout = () => {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_client_id');
        setIsAuthenticated(false);
        setClientId('');
        window.dispatchEvent(new Event('spotifyTokenChanged'));
    };

    if (isLoading) {
        return <div>Processing Spotify authentication...</div>;
    }

    return (
        <div className="flex justify-start">
            <button
                onClick={isAuthenticated ? handleLogout : handleLogin}
                className="bg-[#1DB954] hover:bg-[#1ed760] text-white font-bold py-2 px-4 rounded-full flex items-center transition duration-300 ease-in-out"
            >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                {isAuthenticated ? 'Disconnect' : 'Connect'}
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">Enter Spotify Client ID</h2>
                        <p className="mb-4">
                            To get your Spotify Client ID, please follow these steps:
                        </p>
                        <ol className="list-decimal list-inside mb-4 text-left">
                            <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Spotify Developer Dashboard</a></li>
                            <li>Click on &quot;Create an App&quot;</li>
                            <li>For App Name, enter <b>Jive Tracker</b></li>
                            <li>For App Description, enter <b>Track your Jives!</b></li>
                            <li>For Redirect URIs, enter: <b>{REDIRECT_URI}</b></li>
                            <li>Select &quot;Web API&quot; scopes for API/SDK scopes</li>
                            <li>Accept the terms and create the app</li>
                            <li>Navigate to &quot;Settings&quot;</li>
                            <li>Copy the Client ID and paste it below</li>
                        </ol>
                        <input
                            type="text"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            className="border p-2 mb-4 w-full"
                            placeholder="Paste Client ID here"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="mr-2 px-4 py-2 bg-gray-200 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalSubmit}
                                className="px-4 py-2 bg-[#1DB954] text-white rounded"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}