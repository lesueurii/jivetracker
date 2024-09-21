'use client'

import { useEffect, useState } from 'react'

export default function StreamCount() {
    const [streamCount, setStreamCount] = useState(0)

    useEffect(() => {
        const spotifyAccessToken = localStorage.getItem('spotify_access_token');
        if (spotifyAccessToken) {
            fetch(`/api/count-streams?spotify_access_token=${encodeURIComponent(spotifyAccessToken)}`)
                .then(response => response.json())
                .then(data => setStreamCount(data.streamCount))
        }
    }, [])

    return <span>{streamCount || 0}</span>
}