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
            const { message } = await response.json();
            if (message === 'Refresh Token') {
                handleTokenExpiration();
                return;
            }
            throw new Error('Failed to count streams');
        }

        const countStreamsData = await response.json();
        console.log('Stream count response:', countStreamsData);
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'Refresh Token') {
            handleTokenExpiration();
            return;
        }
        console.error('Error counting streams:', error);
    }
};

const handleTokenExpiration = () => {
    localStorage.removeItem('spotify_access_token');
    window.dispatchEvent(new Event('spotifyTokenChanged'));
    Toast({ message: 'Spotify session expired. Please reconnect your Spotify account.', type: 'error' });
};

export default upsertStream;
