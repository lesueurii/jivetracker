

export const fetchSpotifyUserId = async (token: string) => {
    if (token) {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const { id } = await response.json();
                return id;
            } else {
                throw new Error('Failed to fetch Spotify user profile');
            }
        } catch (error) {
            console.error('Failed to fetch SpotifyUserId', error);
            throw new Error('Failed to fetch Spotify user profile');
        }
    }
};