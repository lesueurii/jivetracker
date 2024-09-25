'use client'

import { useEffect, useState } from 'react'
import Tooltip from './Tooltip'

export default function StreamCount() {
    const [streamCount, setStreamCount] = useState(0)
    const [bonusStreams, setBonusStreams] = useState(0)

    const fetchStreamCount = () => {
        const spotifyAccessToken = localStorage.getItem('spotify_access_token');
        if (spotifyAccessToken) {
            fetch(`/api/count-streams?spotify_access_token=${encodeURIComponent(spotifyAccessToken)}`)
                .then(response => response.json())
                .then(data => {
                    setStreamCount(data.streamCount)
                    setBonusStreams(data.bonusStreams || 0)
                })
        }
    }

    useEffect(() => {
        fetchStreamCount();

        window.addEventListener('streamCountUpdated', fetchStreamCount);

        return () => {
            window.removeEventListener('streamCountUpdated', fetchStreamCount);
        };
    }, [])

    const totalStreams = streamCount + bonusStreams
    const tooltipText = `Referral Streams: ${bonusStreams}`

    return (
        <Tooltip text={tooltipText}>
            <span>{totalStreams}</span>
        </Tooltip>
    )
}