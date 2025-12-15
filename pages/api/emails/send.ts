import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { token, accountId, to, subject, body } = req.body

  try {
    const response = await axios.post(
      `https://mail.zoho.com/api/accounts/${accountId}/messages`,
      {
        toAddress: to,
        subject: subject,
        content: body,
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error: any) {
    console.error('Send email error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Unauthorized', needsRefresh: true })
    }
    
    res.status(500).json({ error: 'Failed to send email' })
  }
}
