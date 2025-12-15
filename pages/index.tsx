import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Mailbox from '@/components/Mailbox'

export default function Home({ theme, toggleTheme }: any) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('zoho_token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_ZOHO_CLIENT_ID
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI
    const scope = 'ZohoMail.messages.ALL,ZohoMail.accounts.READ'
    
    const authUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}`
    
    window.location.href = authUrl
  }

  const handleLogout = () => {
    localStorage.removeItem('zoho_token')
    localStorage.removeItem('zoho_refresh_token')
    setIsAuthenticated(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">KosherComm Mail</h1>
            <p className="text-gray-600">Professional email platform</p>
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
          >
            Sign in with Zoho
          </button>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Secure authentication via Zoho Mail</p>
          </div>
        </div>
      </div>
    )
  }

  return <Mailbox theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />
}
