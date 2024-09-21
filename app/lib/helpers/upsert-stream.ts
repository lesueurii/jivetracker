import Toast from '../../components/Toast';

const upsertStream = async ({
    spotify_access_token,
    solana_wallet_address
}: {
    spotify_access_token: string,
    solana_wallet_address: string
}) => {
    if (!spotify_access_token || !solana_wallet_address || !solana_wallet_address.length) {
        console.error('Spotify access token and Solana wallet address are required');
        return;
    }

    // Make an API call to count-streams.ts
    try {
        const countStreamsResponse = await fetch('/api/count-streams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ spotify_access_token, solana_wallet_address }),
        });

        if (!countStreamsResponse.ok) {
            throw new Error('Failed to count streams');
        }

        const countStreamsData = await countStreamsResponse.json();

        console.log('Stream count response:', countStreamsData);
    } catch (countError) {
        if (countError === 'Failed to fetch Spotify user profile') {
            console.error('Failed to fetch Spotify user profile');
            localStorage.removeItem('spotify_access_token');
            window.dispatchEvent(new Event('spotifyTokenChanged'));
            Toast({ message: 'Spotify session expired. Please reconnect your Spotify account.', type: 'error' });
            return;
        }
        console.error('Error counting streams:', countError);
        // Handle error (e.g., show error message to user)
    }
}

export default upsertStream;
