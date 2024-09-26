'use client'

import { useEffect, useState } from 'react'
import Tooltip from './Tooltip'
import { formatDistanceToNow } from 'date-fns';

export default function StreamCount() {
    const [streamCount, setStreamCount] = useState(0)
    const [bonusStreams, setBonusStreams] = useState(0)
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    const fetchStreamCount = () => {
        const spotifyAccessToken = localStorage.getItem('spotify_access_token');
        if (spotifyAccessToken) {
            fetch(`/api/count-streams?spotify_access_token=${encodeURIComponent(spotifyAccessToken)}`)
                .then(response => response.json())
                .then(data => {
                    setStreamCount(data.streamCount)
                    setBonusStreams(data.bonusStreams || 0)
                    const now = new Date().toISOString();
                    localStorage.setItem('lastStreamCountUpdate', now);
                    setLastUpdated(now);
                })
        }
    }

    useEffect(() => {
        fetchStreamCount();

        const storedLastUpdated = localStorage.getItem('lastStreamCountUpdate');
        if (storedLastUpdated) {
            setLastUpdated(storedLastUpdated);
        }

        window.addEventListener('streamCountUpdated', fetchStreamCount);

        return () => {
            window.removeEventListener('streamCountUpdated', fetchStreamCount);
        };
    }, [])

    const totalStreams = streamCount + bonusStreams || 0
    const tooltipText = `Referral Streams: ${bonusStreams}`

    const formattedLastUpdated = lastUpdated
        ? `Last updated ${formatDistanceToNow(new Date(lastUpdated))} ago`
        : 'Not updated yet';

    return (
        <div className="bg-white p-4 rounded-md shadow">
            <div className="text-2xl font-bold text-center">
                <Tooltip text={tooltipText}>
                    <span className="text-2xl font-bold">{totalStreams}</span>
                </Tooltip>
            </div>
            <div className="text-xs text-gray-400 mt-1">{formattedLastUpdated}</div>
            <div className="text-xs text-gray-400 mt-1">
                Stream count refreshes automatically every hour
            </div>
        </div>
    )
}