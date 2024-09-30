'use server'

import { kv } from '@vercel/kv'

export async function getUsers() {
    return await kv.get('users') as Record<string, any> | null
}

export async function updateUser(spotifyUserId: string, userData: any) {
    const users = await getUsers() || {}
    users[spotifyUserId] = { ...users[spotifyUserId], ...userData }
    await kv.set('users', users)
}

export async function getUserBySpotifyId(spotifyUserId: string) {
    const users = await getUsers()
    return users ? users[spotifyUserId] : null
}

export async function updateStreamCount(spotifyUserId: string, solanaWalletAddress: string, streamRecords: string[], referralCode: string | null) {
    const user = await getUserBySpotifyId(spotifyUserId) || {}
    const updatedStreamRecords = Array.from(new Set([
        ...(user.stream_records || []),
        ...streamRecords
    ]))
    const updatedCount = updatedStreamRecords.length
    const bonusStreams = user.bonus_streams || 0

    await updateUser(spotifyUserId, {
        solana_wallet_address: solanaWalletAddress,
        streams: updatedCount,
        stream_records: updatedStreamRecords,
        bonus_streams: bonusStreams,
        referral_code: user.referral_code || spotifyUserId
    })

    return { updatedCount, bonusStreams }
}

export async function getLeaderboard(limit: number, dateRange: string) {
    const users = await getUsers() || {}
    const now = new Date()
    const dateLimit = getDateLimit(dateRange, now)

    const sortedUsers = Object.entries(users)
        .map(([spotifyUserId, userData]: [string, any]) => {
            const validStreams = (userData.stream_records || []).filter((timestamp: string) => new Date(timestamp) > dateLimit).length
            return {
                spotifyUserId,
                streamCount: validStreams + (userData.bonus_streams || 0),
                solanaWalletAddress: userData.solana_wallet_address
            }
        })
        .sort((a, b) => b.streamCount - a.streamCount)
        .slice(0, limit)
        .map((entry, index) => ({ ...entry, rank: index + 1 }))

    return sortedUsers
}

function getDateLimit(dateRange: string, now: Date) {
    switch (dateRange) {
        case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
        case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        default: return new Date(0) // 'all' time
    }
}