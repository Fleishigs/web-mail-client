import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { code } = req.body

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' })
  }

  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        code,
        client_id: process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
    })

    res.status(200).json(response.data)
  } catch (error: any) {
    console.error('Token exchange error:', error.response?.data || error.message)
    
    const errorMessage = error.response?.data?.error || 'Failed to exchange token'
    res.status(500).json({ 
      error: errorMessage,
      details: error.response?.data 
    })
  }
}
