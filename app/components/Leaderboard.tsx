'use client'

import { useEffect, useState } from 'react'
import Toast from './Toast'

interface LeaderboardEntry {
    rank: number;
    spotifyUserId: string;
    streamCount: number;
    solanaWalletAddress: string;
}

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
    const [isInitialLoad, setIsInitialLoad] = useState(true)

    const fetchLeaderboard = (isButtonClick: boolean = false) => {
        setIsLoading(true)
        fetch('/api/leaderboard')
            .then(response => response.json())
            .then(data => {
                if (data && data.leaderboard && Array.isArray(data.leaderboard)) {
                    setLeaderboard(data.leaderboard);
                    if (isButtonClick) {
                        setToast({ message: 'Leaderboard refreshed successfully', type: 'success' });
                    }
                } else {
                    setLeaderboard([]);
                    if (isButtonClick) {
                        setToast({ message: 'No leaderboard data available', type: 'info' });
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
                setLeaderboard([]);
                if (isButtonClick) {
                    setToast({ message: 'Failed to refresh leaderboard', type: 'error' });
                }
            })
            .finally(() => {
                setIsLoading(false)
                setIsInitialLoad(false)
            });
    }

    useEffect(() => {
        fetchLeaderboard()
    }, []);

    const handleRefreshClick = () => {
        fetchLeaderboard(true)
    }

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="relative inline-block group">
                    <h3 className="text-xl font-semibold cursor-help">
                        Leaderboard
                    </h3>
                    <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm rounded py-2 px-4 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                        Showing top 25 entries
                        <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                    </div>
                </div>
                <button
                    onClick={handleRefreshClick}
                    disabled={isLoading}
                    className="p-2 text-blue-500 hover:text-blue-600 disabled:text-blue-300 transition-colors duration-200 text-xl"
                    aria-label="Refresh leaderboard"
                >
                    <span className={`inline-block ${isLoading ? 'animate-spin' : ''}`}>↻</span>
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solana Wallet</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream Count</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((entry: LeaderboardEntry) => (
                                <tr key={entry.solanaWalletAddress}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.rank}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.solanaWalletAddress}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.streamCount}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No entries in the leaderboard yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {!isInitialLoad && toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={3000}
                />
            )}
        </>
    )
}