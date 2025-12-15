import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, accountId, messageId } = req.body

  try {
    const response = await axios.delete(
      `https://mail.zoho.com/api/accounts/${accountId}/messages/${messageId}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Accept': 'application/json',
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error: any) {
    console.error('Delete email error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized', needsRefresh: true })
    }
    
    res.status(500).json({ error: 'Failed to delete email' })
  }
}
