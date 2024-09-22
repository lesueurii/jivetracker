import Toast from '../../components/Toast';

interface UpsertStreamParams {
    spotify_access_token: string;
    solana_wallet_address: string;
}

const upsertStream = async ({ spotify_access_token, solana_wallet_address }: UpsertStreamParams) => {
    if (!spotify_access_token || !solana_wallet_address) {
        console.error('Spotify access token and Solana wallet address are required');
        return;
    }

    try {
        const response = await fetch('/api/count-streams', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ spotify_access_token, solana_wallet_address }),
        });

        if (!response.ok) {
            if (response.status === 401) {
                handleTokenExpiration();
                return;
            }
            const { message } = await response.json();
            if (message === 'Refresh Token') {
                handleTokenExpiration();
                return;
            }
            throw new Error('Failed to count streams');
        }

        const countStreamsData = await response.json();
        console.log('Stream count response:', countStreamsData);

        window.dispatchEvent(new Event('streamCountUpdated'));
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'Refresh Token') {
            handleTokenExpiration();
            return;
        }
        console.error('Error counting streams:', error);
    }
};

const handleTokenExpiration = async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (refreshToken) {
        try {
            const response = await fetch('/api/refresh-spotify-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (response.ok) {
                const { access_token } = await response.json();
                localStorage.setItem('spotify_access_token', access_token);
                window.dispatchEvent(new Event('spotifyTokenChanged'));
                return;
            }
        } catch (error) {
            console.error('Error refreshing Spotify token:', error);
        }
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
