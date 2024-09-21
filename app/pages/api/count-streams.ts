'use server'

import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

// Spotify API base URL
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

export async function POST(req: NextRequest) {
  try {
    const { spotify_access_token, solana_wallet_address } = await req.json()

    // Fetch Spotify user profile
    const userProfile = await fetchSpotifyUserProfile(spotify_access_token)
    const spotifyUserId = userProfile.id

    // Fetch recent streams
    const recentStreams = await fetchRecentStreams(spotify_access_token)
    const streamCount = recentStreams.items.length

    // Update or insert record in Vercel KV
    await updateStreamCount(spotifyUserId, solana_wallet_address, streamCount)

    return NextResponse.json({ message: 'Stream count updated successfully' })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 })
  }
}

// ... existing code ...

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

async function updateStreamCount(spotifyUserId: string, solanaWalletAddress: string, streamCount: number) {
  const existingRecord = await kv.get(spotifyUserId)
  
  if (existingRecord) {
    await kv.incr(`${spotifyUserId}:streams`, streamCount)
  } else {
    await kv.set(spotifyUserId, {
      solana_wallet_address: solanaWalletAddress,
      streams: streamCount
    })
  }
}