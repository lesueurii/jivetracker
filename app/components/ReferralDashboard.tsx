import { useState, useCallback, useEffect, useRef } from 'react';
import { copyToClipboard } from '../utils/common';
import { fetchSpotifyUserId, handleTokenExpiration } from '../utils/spotify';
import Tooltip from './Tooltip';

export default function ReferralDashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [spotifyUserId, setSpotifyUserId] = useState<string | null>(null);
    const [bonusStreams, setBonusStreams] = useState(0);
    const [referrals, setReferrals] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const getSpotifyUserId = async () => {
        let token = localStorage.getItem('spotify_access_token');
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        const clientId = localStorage.getItem('spotify_client_id');

        if (token) {
            try {
                const id = await fetchSpotifyUserId(token);
                setSpotifyUserId(id);
            } catch (error: any) {
                if (error.message === 'Failed to fetch Spotify user profile' && refreshToken && clientId) {
                    try {
                        const newToken = await handleTokenExpiration(refreshToken, clientId);
                        localStorage.setItem('spotify_access_token', newToken);
                        const id = await fetchSpotifyUserId(newToken);
                        setSpotifyUserId(id);
                    } catch (refreshError) {
                        console.error('Error refreshing Spotify token:', refreshError);
                        localStorage.removeItem('spotify_access_token');
                        localStorage.removeItem('spotify_refresh_token');
                        window.dispatchEvent(new CustomEvent('showToast', {
                            detail: {
                                message: 'Failed to refresh Spotify token. Please log in again.',
                                type: 'error'
                            }
                        }));
                    }
                } else {
                    console.error('Error fetching Spotify user ID:', error);
                    window.dispatchEvent(new CustomEvent('showToast', {
                        detail: {
                            message: 'Failed to fetch Spotify user ID',
                            type: 'error'
                        }
                    }));
                }
            }
        }
    };

    useEffect(() => {
        getSpotifyUserId();
        fetchReferralStats();

        // Add event listener for streamCountUpdated
        window.addEventListener('streamCountUpdated', fetchReferralStats);

        // Cleanup function
        return () => {
            window.removeEventListener('streamCountUpdated', fetchReferralStats);
        };
    }, []);

    const fetchReferralStats = () => {
        const streamCountData = localStorage.getItem('streamCountData');
        if (streamCountData) {
            const { bonusStreams, referrals } = JSON.parse(streamCountData);
            setBonusStreams(bonusStreams);
            setReferrals(referrals || 0);
        }
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
        const referralLink = generateReferralLink();
        if (referralLink) {
            copyToClipboard(referralLink);
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 2000); // Hide tooltip after 2 seconds
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
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="flex justify-center mb-8">
                <div className="relative">
                    <button
                        ref={buttonRef}
                        onClick={handleCopyReferralLink}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out flex items-center space-x-2"
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                            </svg>
                        )}
                        <span>{isLoading ? 'Copying...' : 'Copy Referral Link'}</span>
                    </button>
                    <Tooltip text="Copied!" visible={showTooltip} targetRef={buttonRef} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-5xl font-bold text-green-600 mb-2">{referrals}</p>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Your Referrals</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-5xl font-bold text-blue-600 mb-2">{bonusStreams}</p>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Your Bonus Streams</p>
                </div>
            </div>
            <p className="text-sm text-gray-600 mt-8 text-center bg-blue-50 border border-blue-100 rounded-lg p-4">
                When someone starts tracking their streams using your referral link, you will receive one bonus stream for every four streams they generate.
            </p>
        </div>
    );
}