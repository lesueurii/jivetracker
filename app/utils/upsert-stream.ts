import { handleTokenExpiration } from './spotify';

interface UpsertStreamParams {
    spotify_access_token: string;
    solana_wallet_address: string;
}

const upsertStream = async ({ spotify_access_token, solana_wallet_address }: UpsertStreamParams) => {
    try {
        const referralCode = localStorage.getItem('referralCode');
        const response = await fetch('/api/count-streams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spotify_access_token, solana_wallet_address, referralCode }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                rotateSpotifyToken();
                return;
            }
            const { message } = await response.json();
            if (message === 'Refresh Token') {
                rotateSpotifyToken();
                return;
            }
            throw new Error('Failed to count streams');
        }

        const countStreamsData = await response.json();
        console.log('Stream count response:', countStreamsData);

        window.dispatchEvent(new Event('streamCountUpdated'));
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'Refresh Token') {
            rotateSpotifyToken();
            return;
        }
        console.error('Error counting streams:', error);
    }
};

const rotateSpotifyToken = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    const clientId = localStorage.getItem('spotify_client_id');
    if (refreshToken && clientId) {
        const accessToken = await handleTokenExpiration(refreshToken, clientId);
        localStorage.setItem('spotify_access_token', accessToken);
        window.dispatchEvent(new Event('spotifyTokenChanged'));
        return;
    }

    // If refresh fails or no refresh token, proceed with logout
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    window.dispatchEvent(new Event('spotifyTokenChanged'));
    window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
            message: 'Spotify session expired. Please reconnect your Spotify account.',
            type: 'error'
        }
    }));
};

export default upsertStream;
