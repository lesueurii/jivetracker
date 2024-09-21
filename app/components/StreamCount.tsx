'use client'

import { useEffect, useState } from 'react'

export default function StreamCount() {
    const [streamCount, setStreamCount] = useState(0)

    const fetchStreamCount = () => {
        const spotifyAccessToken = localStorage.getItem('spotify_access_token');
        if (spotifyAccessToken) {
            fetch(`/api/count-streams?spotify_access_token=${encodeURIComponent(spotifyAccessToken)}`)
                .then(response => response.json())
                .then(data => setStreamCount(data.streamCount))
        }
    }

    useEffect(() => {
        fetchStreamCount();

        // Add event listener for stream count updates
        window.addEventListener('streamCountUpdated', fetchStreamCount);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('streamCountUpdated', fetchStreamCount);
        };
    }, [])

    return <span>{streamCount || 0}</span>
}