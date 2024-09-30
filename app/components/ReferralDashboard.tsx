import { useState, useCallback, useEffect } from 'react';
import { copyToClipboard } from '../utils/common';

export default function ReferralDashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [spotifyUserId, setSpotifyUserId] = useState<string | null>(null);
    const [bonusStreams, setBonusStreams] = useState(0);
    const [generatedStreams, setGeneratedStreams] = useState(0);

    useEffect(() => {
        fetchSpotifyUserId();
        fetchReferralStats();
    }, []);

    const fetchSpotifyUserId = async () => {
        const token = localStorage.getItem('spotify_access_token');
        if (token) {
            try {
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const { id } = await response.json();
                    setSpotifyUserId(id);
                } else {
                    throw new Error('Failed to fetch Spotify user profile');
                }
            } catch (error) {
                console.error('Error fetching Spotify user ID:', error);
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: 'Failed to fetch Spotify user ID',
                        type: 'error'
                    }
                }));
            }
        }
    };

    const fetchReferralStats = async () => {
        // This is a placeholder. You'll need to implement an API endpoint to fetch these stats.
        // For now, we'll use dummy data.
        setBonusStreams(10);
        setGeneratedStreams(40);
    };

    const generateReferralLink = useCallback(() => {
        if (spotifyUserId) {
            const baseUrl = window.location.origin;
            return `${baseUrl}?ref=${spotifyUserId}`;
        }
        return '';
    }, [spotifyUserId]);

    const handleCopyReferralLink = async () => {
        setIsLoading(true);
        setIsButtonDisabled(true);
        const referralLink = generateReferralLink();
        if (referralLink) {
            await copyToClipboard(referralLink);
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: {
                    message: 'Referral link copied to clipboard!',
                    type: 'success'
                }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: {
                    message: 'Unable to generate referral link. Please reconnect your Spotify account.',
                    type: 'error'
                }
            }));
        }
        setIsLoading(false);
        setTimeout(() => setIsButtonDisabled(false), 3000); // Disable for 3 seconds
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <div className="flex justify-center mb-8">
                <button
                    onClick={handleCopyReferralLink}
                    disabled={isLoading || isButtonDisabled}
                    className="text-blue-600 hover:text-blue-800 font-medium py-1 px-3 text-sm rounded-md border border-blue-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out flex items-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                    )}
                    {isLoading ? 'Copying...' : 'Copy Referral Link'}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                    <p className="text-4xl font-bold text-green-600 mb-2">{generatedStreams}</p>
                    <p className="text-sm text-gray-600">Referral Streams</p>
                </div>
                <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600 mb-2">{bonusStreams}</p>
                    <p className="text-sm text-gray-600">Your Bonus Streams</p>
                </div>
            </div>
            <p className="text-sm text-gray-500 mt-8 text-center">When someone starts streaming & competing using your referral link, you will receive one bonus stream for every four streams they generate.</p>
        </div>
    );
}