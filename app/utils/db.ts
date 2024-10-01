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
    const existingStreamRecords = user.stream_records || []
    const newStreamRecords = streamRecords.filter(record => !existingStreamRecords.includes(record))
    const updatedStreamRecords = [...existingStreamRecords, ...newStreamRecords]
    const updatedCount = updatedStreamRecords.length
    const bonusStreams = user.bonus_streams || 0

    // Only update referrer if it hasn't been set before
    if (!user.referrer && referralCode && referralCode !== spotifyUserId) {
        await incrementReferralCount(referralCode)
        user.referrer = referralCode
        // Set the referral_start_stream_count when the referrer is first set
        user.referral_counted_streams = existingStreamRecords.length
    }

    // Increment bonus stream count for the referrer
    if (user.referrer && user.referrer !== spotifyUserId) {
        const uniqueNewStreamsCount = newStreamRecords.length;
        await incrementBonusStreamCount(user.referrer, uniqueNewStreamsCount)
    }

    const userReferrals = user.referrals || 0

    await updateUser(spotifyUserId, {
        solana_wallet_address: solanaWalletAddress,
        streams: updatedCount,
        stream_records: updatedStreamRecords,
        bonus_streams: user.bonus_streams || 0,
        fractional_bonus: user.fractional_bonus || 0,
        referrer: user.referrer,
        referrals: userReferrals,
        referral_counted_streams: user.referral_counted_streams
    })

    return { updatedCount, bonusStreams, referrals: userReferrals }
}

async function incrementBonusStreamCount(spotifyUserId: string, newStreamsCount: number) {
    const user = await getUserBySpotifyId(spotifyUserId)
    if (user) {
        const currentBonusStreams = user.bonus_streams || 0
        const currentFractionalBonus = user.fractional_bonus || 0
        const newFractionalBonus = currentFractionalBonus + (newStreamsCount / 4)
        const newBonusStreams = Math.floor(newFractionalBonus)
        const remainingFraction = newFractionalBonus - newBonusStreams

        await updateUser(spotifyUserId, {
            bonus_streams: currentBonusStreams + newBonusStreams,
            fractional_bonus: remainingFraction
        })
    }
}

async function incrementReferralCount(referrerSpotifyId: string) {
    const referrer = await getUserBySpotifyId(referrerSpotifyId)
    if (referrer) {
        await updateUser(referrerSpotifyId, {
            referrals: (referrer.referrals || 0) + 1
        })
    }
}

export async function getLeaderboard(limit: number, dateRange: string, leaderboardType: 'streams' | 'referrals' = 'streams') {
    const users = await getUsers() || {}
    const now = new Date()
    const dateLimit = getDateLimit(dateRange, now)

    const sortedUsers = Object.entries(users)
        .map(([spotifyUserId, userData]: [string, any]) => {
            const validStreams = (userData.stream_records || []).filter((timestamp: string) => new Date(timestamp) > dateLimit).length
            return {
                spotifyUserId,
                streamCount: validStreams + (userData.bonus_streams || 0),
                referralCount: userData.referrals || 0,
                bonusStreams: userData.bonus_streams || 0,
                solanaWalletAddress: userData.solana_wallet_address
            }
        })
        .sort((a, b) => {
            if (leaderboardType === 'referrals') {
                return b.referralCount - a.referralCount
            }
            return b.streamCount - a.streamCount
        })
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