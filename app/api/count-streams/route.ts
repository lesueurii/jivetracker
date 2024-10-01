import { NextRequest, NextResponse } from 'next/server'
import { updateStreamCount } from '@/app/utils/db'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const JIVE_TRACK_ID = '2iFxaYqQX6yNusMzEUiaPf'

export async function POST(request: Request) {
  try {
    const { spotify_access_token, solana_wallet_address, referrer } = await request.json()

    if (!spotify_access_token) {
      return NextResponse.json({ error: 'Missing Spotify access token' }, { status: 400 })
    }

    const spotifyUser = await fetchSpotifyUserProfile(spotify_access_token)
    const recentStreams = await fetchRecentStreams(spotify_access_token)

    const streamRecords = recentStreams.items
      .filter((item: any) => item.track.id === JIVE_TRACK_ID)
      .map((item: any) => item.played_at)

    const { updatedCount, bonusStreams } = await updateStreamCount(spotifyUser.id, solana_wallet_address, streamRecords, referrer)

    return NextResponse.json({ streamCount: updatedCount, bonusStreams })
  } catch (error) {
    console.error('Error in count-streams:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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