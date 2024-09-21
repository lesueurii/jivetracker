'use server'

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()
    // Process the code here
    return NextResponse.json({ message: 'Authentication successful' })
  } catch (error) {
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 })
  }
}