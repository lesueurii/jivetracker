import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Spotify API base URL
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Jive Spotify track ID
const JIVE_TRACK_ID = '2iFxaYqQX6yNusMzEUiaPf'

export async function GET(req: NextRequest) {
  console.log('Received get request')
  try {

    const spotify_access_token = req.nextUrl.searchParams.get('spotify_access_token')
    if (!spotify_access_token) {
      return NextResponse.json({ message: 'Missing spotify_access_token' }, { status: 400 })
    }
    console.log('Fetching Spotify user profile')
    const userProfile = await fetchSpotifyUserProfile(spotify_access_token)
    const spotifyUserId = userProfile.id
    const streamCount = await kv.get(`${spotifyUserId}:streams`) as number | null
    console.log('Fetched stream count:', streamCount)
    return NextResponse.json({ streamCount })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log('Received request')
  try {
    const { spotify_access_token, solana_wallet_address } = await req.json()

    // Fetch Spotify user profile
    const userProfile = await fetchSpotifyUserProfile(spotify_access_token)
    const spotifyUserId = userProfile.id

    // Fetch recent streams
    const recentStreams = await fetchRecentStreams(spotify_access_token)
    const streamRecords = recentStreams.items
      .filter((item: any) => item.track.id === JIVE_TRACK_ID)
      .map((item: any) => item.played_at);
    const streamCount = streamRecords.length

    // Update or insert record in Vercel KV
    await updateStreamCount(spotifyUserId, solana_wallet_address, streamCount, streamRecords)

    return NextResponse.json({ message: 'Stream count updated successfully' })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 })
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

async function updateStreamCount(spotifyUserId: string, solanaWalletAddress: string, streamCount: number, streamRecords: any[]) {
  const key = `${spotifyUserId}:streams`
  const existingCount = await kv.get(key) as number | null

  if (existingCount !== null) {
    const existingStreamRecords = await kv.get(`${spotifyUserId}:stream_records`) as any[] | null || []
    const updatedStreamRecords = Array.from(new Set([...existingStreamRecords, ...streamRecords]));

    await kv.set(`${spotifyUserId}:stream_records`, updatedStreamRecords)

    const updatedCount = updatedStreamRecords.length;
    console.log('Updating existing stream count for', spotifyUserId, solanaWalletAddress, updatedCount)
    await kv.set(key, updatedCount)
  } else {
    console.log('Inserting new stream count for', spotifyUserId, solanaWalletAddress, streamCount)
    await kv.set(spotifyUserId, {
      solana_wallet_address: solanaWalletAddress,
      streams: streamCount,
      stream_records: streamRecords
    })
  }
}