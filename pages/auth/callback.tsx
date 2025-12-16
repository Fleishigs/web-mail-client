import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AuthCallback() {
  const router = useRouter()
  const [error, setError] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const { code, error: oauthError } = router.query

      console.log('Callback query:', router.query)

      if (oauthError) {
        console.error('OAuth error:', oauthError)
        setError(`OAuth error: ${oauthError}`)
        return
      }

      if (code) {
        try {
          console.log('Exchanging code for token...')
          const response = await fetch('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          })

          const data = await response.json()
          console.log('Token response:', data)

          if (data.access_token) {
            console.log('Saving token to localStorage')
            localStorage.setItem('zoho_token', data.access_token)
            if (data.refresh_token) {
              localStorage.setItem('zoho_refresh_token', data.refresh_token)
            }
            console.log('Redirecting to home...')
            router.push('/')
          } else {
            console.error('No access token in response:', data)
            setError(data.error || 'Failed to get access token')
          }
        } catch (error: any) {
          console.error('Auth error:', error)
          setError(`Auth error: ${error.message}`)
        }
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router.isReady, router.query])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  )
}
