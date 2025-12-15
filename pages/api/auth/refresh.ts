import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { refresh_token } = req.body

  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        refresh_token,
        client_id: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        grant_type: 'refresh_token',
      },
    })

    res.status(200).json(response.data)
  } catch (error: any) {
    console.error('Token refresh error:', error.response?.data || error.message)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
}
