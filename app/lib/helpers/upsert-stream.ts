import Toast from '../../components/Toast';

interface UpsertStreamParams {
    spotify_access_token: string;
    solana_wallet_address: string;
}

const upsertStream = async ({ spotify_access_token, solana_wallet_address }: UpsertStreamParams) => {
    try {
        const referralCode = localStorage.getItem('referralCode');
        const response = await fetchCountStreams(spotify_access_token, solana_wallet_address, referralCode);

        if (!response.ok) {
            await handleResponseError(response);
            return;
        }

        const countStreamsData = await response.json();
        console.log('Stream count response:', countStreamsData);
        window.dispatchEvent(new Event('streamCountUpdated'));
    } catch (error) {
        console.error('Error counting streams:', error);
        await handleError(error);
    }
};

const fetchCountStreams = async (spotify_access_token: string, solana_wallet_address: string, referralCode: string | null) => {
    return fetch('/api/count-streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spotify_access_token, solana_wallet_address, referralCode }),
    });
};

const handleResponseError = async (response: Response) => {
    if (response.status === 401 || (await response.json()).message === 'Refresh Token') {
        await refreshAndRetry();
    } else {
        throw new Error('Failed to count streams');
    }
};

const handleError = async (error: unknown) => {
    if (error instanceof Error && error.message === 'Refresh Token') {
        await refreshAndRetry();
    }
};

const refreshAndRetry = async () => {
    const refreshed = await refreshSpotifyToken();
    if (refreshed) {
        const newToken = localStorage.getItem('spotify_access_token');
        if (newToken) {
            await upsertStream({
                spotify_access_token: newToken,
                solana_wallet_address: localStorage.getItem('solana_wallet_address') || ''
            });
        }
    } else {
        handleTokenExpiration();
    }
};

const refreshSpotifyToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) return false;

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
            return true;
        }
    } catch (error) {
        console.error('Error refreshing Spotify token:', error);
    }
    return false;
};

const handleTokenExpiration = () => {
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
