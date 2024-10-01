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

export const handleTokenExpiration = async (refreshToken: string, clientId: string) => {
    console.log('Attempting to refresh token', refreshToken, clientId);
    if (refreshToken) {
        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: clientId
                }),
            });

            if (response.ok) {
                const { access_token, refresh_token: new_refresh_token, expires_in } = await response.json();

                // Store the new access token and refresh token (if provided)
                localStorage.setItem('access_token', access_token);
                if (new_refresh_token) {
                    localStorage.setItem('refresh_token', new_refresh_token);
                }

                return access_token;
            } else {
                throw new Error('Failed to refresh token');
            }
        } catch (error) {
            console.error('Error refreshing Spotify token:', error);
            throw new Error('Error refreshing Spotify token');
        }
    }

    throw new Error('No refresh token provided');
};