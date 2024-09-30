'use client'

import { useEffect, useState } from 'react'
import Tooltip from './Tooltip'
import { formatDistanceToNow } from 'date-fns';

interface StreamCountData {
    streamCount: number;
    bonusStreams: number;
    lastUpdated: string;
}

export default function StreamCount() {
    const [streamCountData, setStreamCountData] = useState<StreamCountData>({
        streamCount: 0,
        bonusStreams: 0,
        lastUpdated: ''
    });

    useEffect(() => {
        const loadStreamCountData = () => {
            const storedData = localStorage.getItem('streamCountData');
            if (storedData) {
                setStreamCountData(JSON.parse(storedData));
            }
        };

        loadStreamCountData();

        const handleStreamCountUpdate = () => loadStreamCountData();
        window.addEventListener('streamCountUpdated', handleStreamCountUpdate);

        return () => {
            window.removeEventListener('streamCountUpdated', handleStreamCountUpdate);
        };
    }, []);

    const { streamCount, bonusStreams, lastUpdated } = streamCountData;
    const totalStreams = streamCount + bonusStreams;
    const tooltipText = `Referral Streams: ${bonusStreams}`;

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