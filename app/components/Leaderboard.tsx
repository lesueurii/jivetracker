'use client'

import { useEffect, useState } from 'react'

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([])

    useEffect(() => {
        fetch('/api/leaderboard')
            .then(response => response.json())
            .then(data => {
                if (data && data.leaderboard && Array.isArray(data.leaderboard) && data.leaderboard.length > 0) {
                    setLeaderboard(data.leaderboard);
                } else {
                    setLeaderboard([]);
                }
            })
            .catch(error => {
                console.error('Error fetching leaderboard:', error);
                setLeaderboard([]);
            });
    }, []);

    const getAbbreviatedAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <div>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stream Count</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.length > 0 ? (
                        leaderboard.map((user: any, index: number) => (
                            <tr key={user.userId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getAbbreviatedAddress(user.userId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.streamCount}</td>
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
    )
}