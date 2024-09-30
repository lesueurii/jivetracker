import { useState, useCallback } from 'react';
import Toast from './Toast';

export default function ReferralButton() {
    const [isLoading, setIsLoading] = useState(false);

    const generateReferralLink = useCallback(async () => {
        setIsLoading(true);
        const token = localStorage.getItem('spotify_access_token');
        if (token) {
            try {
                const response = await fetch('/api/generate-referral', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ spotify_access_token: token }),
                });
                if (response.ok) {
                    const { referralLink } = await response.json();
                    navigator.clipboard.writeText(referralLink);
                    window.dispatchEvent(new CustomEvent('showToast', {
                        detail: {
                            message: 'Referral link copied to clipboard!',
                            type: 'success'
                        }
                    }));
                } else {
                    throw new Error('Failed to generate referral link');
                }
            } catch (error) {
                console.error('Error generating referral link:', error);
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: 'Failed to generate referral link',
                        type: 'error'
                    }
                }));
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    return (
        <button
            onClick={generateReferralLink}
            disabled={isLoading}
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-purple-300"
        >
            {isLoading ? 'Generating...' : 'Generate Referral Link'}
        </button>
    );
}