import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Spotify API base URL
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Jive Spotify track ID
const JIVE_TRACK_ID = '2iFxaYqQX6yNusMzEUiaPf'

export async function GET(req: NextRequest) {
  try {
    const spotify_access_token = req.nextUrl.searchParams.get('spotify_access_token')
    if (!spotify_access_token) {
      return NextResponse.json({ message: 'Missing spotify_access_token' }, { status: 400 })
    }

    const { id: spotifyUserId } = await fetchSpotifyUserProfile(spotify_access_token) || {}
    const users = await kv.get('users') as Record<string, any> | null
    const streamCount = users?.[spotifyUserId]?.streams ?? null

    return NextResponse.json({ streamCount })
  } catch (error: any) {
    return handleError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { spotify_access_token, solana_wallet_address, referralCode } = await req.json()
    const { id: spotifyUserId } = await fetchSpotifyUserProfile(spotify_access_token)

    const recentStreams = await fetchRecentStreams(spotify_access_token)

    const streamRecords = recentStreams.items
      .filter((item: any) => item.track.id === JIVE_TRACK_ID)
      .map((item: any) => item.played_at)

    await updateStreamCount(spotifyUserId, solana_wallet_address, streamRecords, referralCode)
    return NextResponse.json({ message: 'Stream count updated successfully' })
  } catch (error) {
    return handleError(error)
  }
}

async function fetchSpotifyUserProfile(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  if (!response.ok) throw new Error('Failed to fetch Spotify user profile')
  return response.json()
}

async function fetchRecentStreams(accessToken: string) {
  const response = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?limit=50`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  })
  if (!response.ok) throw new Error('Failed to fetch recent streams')
  return response.json()
}

async function updateStreamCount(spotifyUserId: string, solanaWalletAddress: string, streamRecords: string[], referralCode: string | null) {
  const usersKey = 'users'
  const users = await kv.get(usersKey) as Record<string, any> || {}

  const existingUser = users[spotifyUserId] || {}
  const updatedStreamRecords = Array.from(new Set([
    ...(existingUser.stream_records || []),
    ...(streamRecords || [])
  ]))
  const updatedCount = updatedStreamRecords.length
  const bonusStreams = existingUser.bonus_streams || 0

  users[spotifyUserId] = {
    ...existingUser,
    solana_wallet_address: solanaWalletAddress,
    streams: updatedCount,
    stream_records: updatedStreamRecords,
    bonus_streams: bonusStreams,
    referral_code: existingUser.referral_code || (updatedCount > 500 ? spotifyUserId : null)
  }

  if (referralCode && referralCode !== spotifyUserId) {
    const referrer = users[referralCode]
    if (referrer) {
      const newStreams = streamRecords.length
      referrer.bonus_streams = (referrer.bonus_streams || 0) + Math.floor(newStreams * 0.25)
      users[referralCode] = referrer
    }
  }

  await kv.set(usersKey, users)
}

function handleError(error: any) {
  if (error.message === 'Failed to fetch Spotify user profile') {
    return NextResponse.json({ message: 'Refresh Token' }, { status: 401 })
  }

  console.error('Error processing request:', error)
  return NextResponse.json({ message: 'Error processing request' }, { status: 500 })
}