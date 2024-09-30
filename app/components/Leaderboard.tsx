'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Toast from './Toast'
import { getAbbreviatedAddress, copyToClipboard } from '../utils/common'
import Tooltip from './Tooltip'

interface LeaderboardEntry {
    rank: number;
    spotifyUserId: string;
    streamCount: number;
    bonusCount?: number;  // Make bonusCount optional
    solanaWalletAddress: string;
}

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
    const [limit, setLimit] = useState<number>(10)
    const [dateRange, setDateRange] = useState<string>('all')
    const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current)
        }
        setToast({ message, type })
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null)
        }, 3000)
    }, [])

    const fetchLeaderboard = useCallback((limit: number, dateRange: string, isButtonClick: boolean = false) => {
        setIsLoading(true)
        fetch(`/api/leaderboard?limit=${limit}&dateRange=${dateRange}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.leaderboard && Array.isArray(data.leaderboard)) {
                    // Set default bonusCount to 0 if it's not provided
                    const processedLeaderboard = data.leaderboard.map((entry: LeaderboardEntry) => ({
                        ...entry,
                        bonusCount: entry.bonusCount || 0
                    }));
                    setLeaderboard(processedLeaderboard);
                    if (isButtonClick) {
                        showToast('Leaderboard refreshed successfully', 'success');
                    }
                } else {
                    setLeaderboard([]);
                    if (isButtonClick) {
                        showToast('No leaderboard data available', 'info');
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
                setLeaderboard([]);
                if (isButtonClick) {
                    showToast('Failed to refresh leaderboard', 'error');
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }, [showToast])

    useEffect(() => {
        fetchLeaderboard(limit, dateRange)
    }, [fetchLeaderboard, limit, dateRange])

    const handleRefreshClick = () => {
        fetchLeaderboard(limit, dateRange, true)
    }

    const handleCopyToClipboard = (text: string) => {
        copyToClipboard(text).then((success) => {
            if (success) {
                showToast('Address copied to clipboard', 'success');
            } else {
                showToast('Failed to copy address', 'error');
            }
        });
    };

    const WalletAddress = ({ address }: { address: string }) => (
        <Tooltip text={address}>
            <span
                className="cursor-pointer hover:text-blue-500"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent the tooltip from interfering
                    handleCopyToClipboard(address);
                }}
            >
                {getAbbreviatedAddress(address)}
            </span>
        </Tooltip>
    );

    return (
        <>
            <div className="mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                    <div className="relative inline-block group mb-4 sm:mb-0">
                        <h3 className="text-xl font-semibold cursor-help">
                            Leaderboard
                        </h3>
                        <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-sm rounded py-2 px-4 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
                            Showing top {limit} entries
                            <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <select
                            value={limit}
                            onChange={(e) => setLimit(Number(e.target.value))}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 w-full sm:w-auto"
                        >
                            <option value={10}>Top 10</option>
                            <option value={25}>Top 25</option>
                            <option value={50}>Top 50</option>
                        </select>
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 w-full sm:w-auto"
                        >
                            <option value="all">All Time</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                        <button
                            onClick={handleRefreshClick}
                            disabled={isLoading}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-blue-300 transition-colors duration-200 w-full sm:w-auto"
                            aria-label="Refresh leaderboard"
                        >
                            <span className={`inline-block ${isLoading ? 'animate-spin' : ''}`}>↻</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="hidden sm:block"> {/* Table view for larger screens */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solana Wallet</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Streams</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus Streams</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((entry: LeaderboardEntry) => (
                                    <tr key={entry.solanaWalletAddress}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.rank}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <WalletAddress address={entry.solanaWalletAddress} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.streamCount + (entry.bonusCount || 0)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{entry.bonusCount || 0}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">No entries in the leaderboard yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="sm:hidden"> {/* Card view for mobile screens */}
                    {leaderboard.length > 0 ? (
                        leaderboard.map((entry: LeaderboardEntry) => (
                            <div key={entry.solanaWalletAddress} className="bg-white shadow rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-lg font-semibold">#{entry.rank}</span>
                                    <span className="text-sm text-gray-500">{entry.streamCount + (entry.bonusCount || 0)} total streams</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    Wallet: <WalletAddress address={entry.solanaWalletAddress} />
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    Bonus Streams: {entry.bonusCount || 0}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 py-4">No entries in the leaderboard yet.</div>
                    )}
                </div>
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