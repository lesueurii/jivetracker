import { NextResponse } from 'next/server'
import { updateStreamCount, getUserBySpotifyId } from '@/app/utils/db'

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const spotifyAccessToken = searchParams.get('spotify_access_token')

    if (!spotifyAccessToken) {
      return NextResponse.json({ error: 'Missing Spotify access token' }, { status: 400 })
    }

    const spotifyUser = await fetchSpotifyUserProfile(spotifyAccessToken)
    const recentStreams = await fetchRecentStreams(spotifyAccessToken)

    const streamRecords = recentStreams.items
      .filter((item: any) => item.track.album.id === '4ZiO4maXhoFYHXvYOU4UWb')
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