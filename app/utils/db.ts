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
    const existingStreamRecords = await getStreamRecords(spotifyUserId)
    const newStreamRecords = streamRecords.filter(record => !existingStreamRecords.includes(record))
    const updatedStreamRecords = [...existingStreamRecords, ...newStreamRecords]
    const updatedCount = updatedStreamRecords.length
    const bonusStreams = user.bonus_streams || 0

    // Only update referrer if it hasn't been set before
    if (!user.referrer && referralCode && referralCode !== spotifyUserId) {
        const referrer = await getUserBySpotifyId(referralCode)
        if (referrer) {
            await incrementReferralCount(referralCode, referrer)
            user.referrer = referralCode
            // Set the referral_start_stream_count when the referrer is first set
            user.referral_counted_streams = existingStreamRecords.length
        }
    }

    // Increment bonus stream count for the referrer
    if (user.referrer && user.referrer !== spotifyUserId) {
        const uniqueNewStreamsCount = newStreamRecords.length;
        await incrementBonusStreamCount(user.referrer, uniqueNewStreamsCount, spotifyUserId)
    }

    const userReferrals = user.referrals || 0

    // Update stream records separately
    await updateStreamRecords(spotifyUserId, updatedStreamRecords)

    await updateUser(spotifyUserId, {
        solana_wallet_address: solanaWalletAddress,
        streams: updatedCount,
        stream_records: updatedStreamRecords,
        bonus_streams: user.bonus_streams || 0,
        fractional_bonuses: user.fractional_bonuses || {},  // Update this line
        referrer: user.referrer,
        referrals: userReferrals,
        referral_counted_streams: user.referral_counted_streams
    })

    return { updatedCount, bonusStreams, referrals: userReferrals }
}

async function getStreamRecords(spotifyUserId: string): Promise<string[]> {
    const key = `stream_records:${spotifyUserId}`
    return await kv.get(key) || []
}

async function updateStreamRecords(spotifyUserId: string, records: string[]) {
    const key = `stream_records:${spotifyUserId}`
    await kv.set(key, records)
}

async function incrementBonusStreamCount(spotifyUserId: string, newStreamsCount: number, referrerId: string) {
    const user = await getUserBySpotifyId(spotifyUserId)
    if (user) {
        const currentBonusStreams = user.bonus_streams || 0
        const fractionalBonuses = user.fractional_bonuses || {}
        const currentFractionalBonus = fractionalBonuses[referrerId] || 0
        const newFractionalBonus = currentFractionalBonus + (newStreamsCount / 4)
        const newBonusStreams = Math.floor(newFractionalBonus)
        const remainingFraction = newFractionalBonus - newBonusStreams

        fractionalBonuses[referrerId] = remainingFraction

        await updateUser(spotifyUserId, {
            bonus_streams: currentBonusStreams + newBonusStreams,
            fractional_bonuses: fractionalBonuses
        })
    }
}

async function incrementReferralCount(referrerSpotifyId: string, referrer: any) {
    await updateUser(referrerSpotifyId, {
        referrals: (referrer.referrals || 0) + 1
    })
}

export async function getLeaderboard(limit: number, dateRange: string, leaderboardType: 'streams' | 'referrals' = 'streams') {
    const users = await getUsers() || {}
    const now = new Date()
    const dateLimit = getDateLimit(dateRange, now)

    const sortedUsers = await Promise.all(Object.entries(users).map(async ([spotifyUserId, userData]: [string, any]) => {
        const streamRecords = await getStreamRecords(spotifyUserId)
        const validStreams = streamRecords.filter((timestamp: string) => new Date(timestamp) > dateLimit).length
        return {
            spotifyUserId,
            streamCount: validStreams + (userData.bonus_streams || 0),
            referralCount: userData.referrals || 0,
            bonusStreams: userData.bonus_streams || 0,
            solanaWalletAddress: userData.solana_wallet_address
        }
    }))

    // ... rest of the function remains the same ...
}

function getDateLimit(dateRange: string, now: Date) {
    switch (dateRange) {
        case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000)
        case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        default: return new Date(0) // 'all' time
    }
}

export async function migrateStreamRecords(batchSize = 10) {
    const users = await getUsers() || {}
    let migratedCount = 0
    let processedCount = 0

    for (const [spotifyUserId, userData] of Object.entries(users)) {
        // Only migrate users who haven't been migrated yet
        if (!userData.streamRecordsMigrated && userData.stream_records && userData.stream_records.length > 0) {
            try {
                await updateStreamRecords(spotifyUserId, userData.stream_records)

                // Remove stream_records from the user object and set the migration flag
                delete userData.stream_records
                userData.streamRecordsMigrated = true
                await updateUser(spotifyUserId, userData)

                migratedCount++
            } catch (error) {
                console.error(`Failed to migrate user ${spotifyUserId}:`, error)
            }
        }

        processedCount++

        // Process in batches to avoid overwhelming the KV store
        if (processedCount % batchSize === 0) {
            console.log(`Processed ${processedCount} users, migrated ${migratedCount}`)
            await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay between batches
        }
    }

    console.log(`Migration completed. Processed ${processedCount} users, migrated ${migratedCount}`)
    return { processedCount, migratedCount }
}