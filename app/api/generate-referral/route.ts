import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function POST(req: NextRequest) {
    try {
        const { spotify_access_token, base_url } = await req.json()
        const { id: spotifyUserId } = await fetchSpotifyUserProfile(spotify_access_token)

        const users = await kv.get('users') as Record<string, any> | null
        const user = users?.[spotifyUserId]

        if (!user || user.streams < 500) {
            return NextResponse.json({ message: 'Not eligible for referral' }, { status: 403 })
        }

        const referralLink = `${base_url}?ref=${spotifyUserId}`
        return NextResponse.json({ referralLink })
    } catch (error: any) {
        console.error('Error generating referral link:', error)
        return NextResponse.json({ message: 'Error generating referral link' }, { status: 500 })
    }
}

async function fetchSpotifyUserProfile(accessToken: string) {
    const response = await fetch(`https://api.spotify.com/v1/me`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    if (!response.ok) throw new Error('Failed to fetch Spotify user profile')
    return response.json()
}