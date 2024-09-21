"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const CLIENT_ID = '079c06e1f5bf431c8b90e58e9443b217';
const REDIRECT_URI = `${typeof window !== 'undefined' ? window.location.origin : ''}/callback`;

export default function SpotifyCallback() {
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            exchangeCodeForToken(code);
        }
    }, []);

    const exchangeCodeForToken = async (code: string) => {
        const codeVerifier = localStorage.getItem('code_verifier');

        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            client_id: CLIENT_ID,
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
            router.push('/'); // Redirect to home page after successful authentication
        } catch (error) {
            console.error('Error:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    return <div>Processing Spotify authentication...</div>;
}