import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      const { code } = router.query

      if (code) {
        try {
          const response = await fetch('/api/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
          })

          const data = await response.json()

          if (data.access_token) {
            localStorage.setItem('zoho_token', data.access_token)
            localStorage.setItem('zoho_refresh_token', data.refresh_token)
            router.push('/')
          } else {
            console.error('Failed to get token')
            router.push('/')
          }
        } catch (error) {
          console.error('Auth error:', error)
          router.push('/')
        }
      }
    }

    if (router.isReady) {
      handleCallback()
    }
  }, [router.isReady, router.query])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Authenticating...</p>
      </div>
    </div>
  )
}
