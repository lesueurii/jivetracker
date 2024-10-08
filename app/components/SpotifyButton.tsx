"use client"

import { useState, useEffect, useCallback, useRef } from 'react';
import upsertStream from '../utils/upsert-stream';
import Tooltip from './Tooltip';
import { generateCodeVerifier, generateCodeChallenge, copyToClipboard } from '../utils/common';
import { handleTokenExpiration } from '../utils/spotify';
const REDIRECT_URI = typeof window !== 'undefined' ? window.location.origin : 'https://jivetracker.vercel.app';

const appDescriptions = [
    "Jive electrifies the dance floor with its infectious rhythm and soulful vibes!",
    "Experience the magic of Jive as it brings people together through music and dance!",
    "Jive: Where melody meets movement in a spectacular fusion of sound and style!",
    "Let Jive transport you to a world of pulsating beats and irresistible grooves!",
    "Discover the joy of Jive, where every track is a journey and every beat is an adventure!",
    "Jive: Unleashing the power of music to move your body and uplift your soul!",
    "Step into the rhythm of life with Jive, where every song tells a story!",
    "Jive: Transforming ordinary moments into extraordinary memories through music!",
    "Feel the pulse of Jive as it synchronizes hearts and feet on the dance floor!",
    "Jive: Your passport to a universe of captivating melodies and irresistible rhythms!"
];
const appDescription = appDescriptions[Math.floor(Math.random() * appDescriptions.length)];

const truncateDescription = (desc: string, maxLength: number) => {
    return desc.length > maxLength ? desc.substring(0, maxLength - 3) + '...' : desc;
};

export default function SpotifyButton() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!(localStorage.getItem('spotify_access_token') && sessionStorage.getItem('publicKey'));
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [clientId, setClientId] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('spotify_client_id') || '';
    });
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [copiedText, setCopiedText] = useState('');
    const [streamCount, setStreamCount] = useState(0);

    const runUpsertStream = useCallback(() => {
        const token = localStorage.getItem('spotify_access_token');
        const publicKey = sessionStorage.getItem('publicKey');
        if (token && publicKey) {
            console.log('Running upsertStream');
            upsertStream({
                spotify_access_token: token,
                solana_wallet_address: publicKey,
            });
        } else {
            console.error('Missing token or publicKey for upsertStream');
        }
    }, []);


    const exchangeCodeForToken = useCallback(async (code: string) => {
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

            console.log('Token exchange successful, running upsertStream');
            runUpsertStream();
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            // Handle error (e.g., show error message to user)
        } finally {
            setIsLoading(false);
        }
    }, [clientId, runUpsertStream]);

    useEffect(() => {
        console.log('SpotifyButton useEffect running');
        const token = localStorage.getItem('spotify_access_token');
        const publicKey = sessionStorage.getItem('publicKey');

        if (token && publicKey) {
            console.log('Token and publicKey found, setting up upsertStream');
            setIsAuthenticated(true);

            // Run immediately
            runUpsertStream();

            // Set up interval to run every hour
            const intervalId = setInterval(() => {
                console.log('Interval triggered, running upsertStream');
                handleTokenExpiration(localStorage.getItem('spotify_refresh_token') || '', clientId);
                runUpsertStream();
            }, 60 * 55 * 1000);

            // Clean up interval on component unmount
            return () => {
                console.log('Cleaning up interval');
                clearInterval(intervalId);
            };
        } else {
            console.log('No token or publicKey found');
            // Check for callback
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            if (code) {
                console.log('Code found in URL, exchanging for token');
                exchangeCodeForToken(code);
            }
        }

        // Check if client ID exists in local storage
        const storedClientId = localStorage.getItem('spotify_client_id');
        if (storedClientId) {
            setClientId(storedClientId);
        }
    }, [runUpsertStream, exchangeCodeForToken]);
    const handleLogin = useCallback(() => {
        const storedClientId = localStorage.getItem('spotify_client_id');
        if (storedClientId) {
            setClientId(storedClientId);
            startAuthProcess();
        } else {
            setShowModal(true);
        }
    }, []);

    const handleModalSubmit = useCallback(() => {
        if (!clientId) {
            alert('Please enter a valid Client ID');
            return;
        }

        localStorage.setItem('spotify_client_id', clientId);
        setShowModal(false);
        startAuthProcess();
    }, [clientId]);

    const startAuthProcess = useCallback(async () => {
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
            scope: 'user-read-recently-played user-read-private',
        });

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }, [clientId, generateCodeVerifier, generateCodeChallenge]);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_client_id');
        localStorage.removeItem('spotify_refresh_token');
        setIsAuthenticated(false);
        setClientId('');
        window.dispatchEvent(new Event('spotifyTokenChanged'));

        // Clear the interval when logging out
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const handleCopyToClipboard = useCallback((text: string) => {
        copyToClipboard(text).then((success) => {
            if (success) {
                setCopiedText(text);
                // Reset the copiedText after 2 seconds
                setTimeout(() => setCopiedText(''), 2000);
            }
        });
    }, []);

    const truncatedDescription = truncateDescription(appDescription, 50);

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
                            <li>For App Name, enter <Tooltip text={copiedText === `${sessionStorage.getItem('publicKey')?.slice(0, 6) || ''} - Jive Tracker` ? 'Copied!' : 'Click to copy'}>
                                <button onClick={() => handleCopyToClipboard(`${sessionStorage.getItem('publicKey')?.slice(0, 6) || ''} - Jive Tracker`)} className="font-medium text-purple-600 hover:text-purple-800 cursor-pointer inline-flex items-center">
                                    {sessionStorage.getItem('publicKey')?.slice(0, 6) || ''} - Jive Tracker
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </Tooltip></li>
                            <li>For App Description, enter <Tooltip text={copiedText === appDescription ? 'Copied!' : 'Click to copy'}>
                                <button
                                    onClick={() => handleCopyToClipboard(appDescription)}
                                    className="font-medium text-purple-600 hover:text-purple-800 cursor-pointer inline-flex items-center"
                                >
                                    {truncatedDescription}
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </button>
                            </Tooltip></li>
                            <li>For Redirect URIs, enter: <Tooltip text={copiedText === REDIRECT_URI ? 'Copied!' : 'Click to copy'}>
                                <button onClick={() => handleCopyToClipboard(REDIRECT_URI)} className="font-medium text-purple-600 hover:text-purple-800 cursor-pointer inline-flex items-center">
                                    {REDIRECT_URI}
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </Tooltip></li>
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