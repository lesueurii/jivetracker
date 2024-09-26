import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { updateStreamCount, getUserBySpotifyId } from '@/app/utils/db'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'
const JIVE_TRACK_ID = '2iFxaYqQX6yNusMzEUiaPf'

export async function GET(req: NextRequest) {
  try {
    const spotify_access_token = req.nextUrl.searchParams.get('spotify_access_token')
    if (!spotify_access_token) {
      return NextResponse.json({ message: 'Missing spotify_access_token' }, { status: 400 })
    }

    const spotifyUser = await fetchSpotifyUserProfile(spotify_access_token)
    if (!spotifyUser || !spotifyUser.id) {
      return NextResponse.json({ message: 'Failed to fetch Spotify user profile' }, { status: 500 })
    }

    const user = await kv.hget('users', spotifyUser.id) as { streams?: number } | null
    const streamCount = user?.streams ?? 0

    return NextResponse.json({ streamCount })
  } catch (error) {
    console.error('Error in GET count-streams:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotifyAccessToken = searchParams.get('spotify_access_token')

    if (!spotifyAccessToken) {
      return NextResponse.json({ error: 'Missing Spotify access token' }, { status: 400 })
    }

    const spotifyUser = await fetchSpotifyUserProfile(spotifyAccessToken)
    const recentStreams = await fetchRecentStreams(spotifyAccessToken)

    const streamRecords = recentStreams.items
      .filter((item: any) => item.track.id === JIVE_TRACK_ID)
      .map((item: any) => item.played_at)

    const user = await getUserBySpotifyId(spotifyUser.id)
    const solanaWalletAddress = user?.solana_wallet_address || ''
    const referralCode = searchParams.get('referral_code')

    const { updatedCount, bonusStreams } = await updateStreamCount(spotifyUser.id, solanaWalletAddress, streamRecords, referralCode)

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