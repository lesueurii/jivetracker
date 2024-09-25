'use client'

import { useEffect, useState, useCallback } from 'react'
import Toast from './Toast'
import { getAbbreviatedAddress } from '../utils/common'

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
    const [limit, setLimit] = useState<number>(10)
    const [dateRange, setDateRange] = useState<string>('all')

    const fetchLeaderboard = useCallback((isButtonClick: boolean = false) => {
        setIsLoading(true)
        fetch(`/api/leaderboard?limit=${limit}&dateRange=${dateRange}`)
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
            })
    }, [limit, dateRange])

    useEffect(() => {
        fetchLeaderboard()
    }, [fetchLeaderboard])

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
                        Showing top 10 entries {/* Changed from 25 to 10 */}
                        <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value={10}>Top 10</option>
                        <option value={25}>Top 25</option>
                        <option value={50}>Top 50</option>
                    </select>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    >
                        <option value="all">All Time</option>
                        <option value="24h">Last 24 Hours</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                    </select>
                    <button
                        onClick={handleRefreshClick}
                        disabled={isLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300 transition-colors duration-200"
                        aria-label="Refresh leaderboard"
                    >
                        <span className={`inline-block ${isLoading ? 'animate-spin' : ''}`}>↻</span>
                    </button>
                </div>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getAbbreviatedAddress(entry.solanaWalletAddress)}</td>
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

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={3000}
                />
            )}
        </>
    )
}