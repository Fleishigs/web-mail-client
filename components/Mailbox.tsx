import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import ComposeModal from './ComposeModal'

interface Email {
  messageId: string
  subject: string
  fromAddress: string
  summary: string
  receivedTime: number
  isRead: boolean
}

interface MailboxProps {
  theme: string
  toggleTheme: () => void
  onLogout: () => void
}

export default function Mailbox({ theme, toggleTheme, onLogout }: MailboxProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    fetchAccountAndEmails()
  }, [])

  const fetchAccountAndEmails = async () => {
    try {
      const token = localStorage.getItem('zoho_token')
      
      const accountRes = await axios.get('/api/accounts', {
        params: { token }
      })
      
      if (accountRes.data.data && accountRes.data.data.length > 0) {
        const account = accountRes.data.data[0]
        setAccountId(account.accountId)
        setUserEmail(account.primaryEmailAddress)
        
        const emailRes = await axios.get('/api/emails/list', {
          params: { token, accountId: account.accountId }
        })
        
        if (emailRes.data.data) {
          setEmails(emailRes.data.data)
        }
      }
      
      setLoading(false)
    } catch (error: any) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 401) {
        onLogout()
      }
      setLoading(false)
    }
  }

  const fetchEmailContent = async (messageId: string) => {
    try {
      const token = localStorage.getItem('zoho_token')
      const response = await axios.get('/api/emails/get', {
        params: { token, accountId, messageId }
      })
      
      setSelectedEmail(response.data.data)
    } catch (error) {
      console.error('Error fetching email:', error)
    }
  }

  const handleSendEmail = async (to: string, subject: string, body: string) => {
    try {
      const token = localStorage.getItem('zoho_token')
      await axios.post('/api/emails/send', {
        token,
        accountId,
        to,
        subject,
        body
      })
      
      setShowCompose(false)
      alert('Email sent successfully!')
      fetchAccountAndEmails()
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    }
  }

  const themeClasses = {
    light: {
      bg: 'bg-white',
      sidebar: 'bg-gray-50 border-gray-200',
      header: 'bg-white border-gray-200',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      hover: 'hover:bg-gray-100',
      selected: 'bg-blue-50 border-l-4 border-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    },
    dark: {
      bg: 'bg-gray-900',
      sidebar: 'bg-gray-800 border-gray-700',
      header: 'bg-gray-800 border-gray-700',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      hover: 'hover:bg-gray-700',
      selected: 'bg-gray-700 border-l-4 border-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200'
    },
    minimal: {
      bg: 'bg-gray-50',
      sidebar: 'bg-white border-gray-100',
      header: 'bg-white border-gray-100',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      hover: 'hover:bg-gray-50',
      selected: 'bg-gray-100 border-l-2 border-gray-900',
      button: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonSecondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
    }
  }

  const currentTheme = themeClasses[theme as keyof typeof themeClasses] || themeClasses.light

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme.bg}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex flex-col ${currentTheme.bg}`}>
      {/* Header */}
      <header className={`${currentTheme.header} border-b px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>KosherComm Mail</h1>
          <span className={currentTheme.textSecondary}>{userEmail}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-lg ${currentTheme.buttonSecondary} transition`}
          >
            {theme === 'light' ? '🌙' : theme === 'dark' ? '✨' : '☀️'} Theme
          </button>
          <button
            onClick={() => fetchAccountAndEmails()}
            className={`px-4 py-2 rounded-lg ${currentTheme.buttonSecondary} transition`}
          >
            🔄 Refresh
          </button>
          <button
            onClick={onLogout}
            className={`px-4 py-2 rounded-lg ${currentTheme.buttonSecondary} transition`}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`w-64 ${currentTheme.sidebar} border-r p-4`}>
          <button
            onClick={() => setShowCompose(true)}
            className={`w-full ${currentTheme.button} py-3 rounded-lg font-semibold mb-6 transition shadow-md`}
          >
            ✉️ Compose
          </button>
          
          <nav>
            <div className={`${currentTheme.selected} px-4 py-3 rounded-lg mb-2`}>
              <span className={`font-semibold ${currentTheme.text}`}>📥 Inbox</span>
              <span className={`ml-2 ${currentTheme.textSecondary}`}>({emails.length})</span>
            </div>
            <div className={`${currentTheme.hover} px-4 py-3 rounded-lg mb-2 cursor-pointer ${currentTheme.text}`}>
              ⭐ Starred
            </div>
            <div className={`${currentTheme.hover} px-4 py-3 rounded-lg mb-2 cursor-pointer ${currentTheme.text}`}>
              📤 Sent
            </div>
            <div className={`${currentTheme.hover} px-4 py-3 rounded-lg cursor-pointer ${currentTheme.text}`}>
              🗑️ Trash
            </div>
          </nav>
        </aside>

        {/* Email List */}
        <div className={`w-96 ${currentTheme.bg} border-r overflow-y-auto`}>
          {emails.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className={currentTheme.textSecondary}>No emails found</p>
            </div>
          ) : (
            emails.map((email) => (
              <div
                key={email.messageId}
                onClick={() => fetchEmailContent(email.messageId)}
                className={`border-b ${currentTheme.hover} cursor-pointer p-4 transition ${
                  selectedEmail?.messageId === email.messageId ? currentTheme.selected : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className={`font-semibold ${currentTheme.text} truncate flex-1`}>
                    {email.fromAddress}
                  </span>
                  <span className={`text-xs ${currentTheme.textSecondary} ml-2`}>
                    {email.receivedTime 
                      ? formatDistanceToNow(new Date(email.receivedTime), { addSuffix: true })
                      : 'Recently'}
                  </span>
                </div>
                <p className={`font-medium ${currentTheme.text} truncate mb-1`}>
                  {email.subject || '(No subject)'}
                </p>
                <p className={`text-sm ${currentTheme.textSecondary} truncate`}>
                  {email.summary}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Email Content */}
        <div className={`flex-1 ${currentTheme.bg} overflow-y-auto`}>
          {selectedEmail ? (
            <div className="p-8">
              <h2 className={`text-3xl font-bold mb-4 ${currentTheme.text}`}>
                {selectedEmail.subject || '(No subject)'}
              </h2>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className={`w-12 h-12 rounded-full ${currentTheme.button} flex items-center justify-center text-xl`}>
                  {selectedEmail.fromAddress?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className={`font-semibold ${currentTheme.text}`}>
                    {selectedEmail.fromAddress}
                  </p>
                  <p className={`text-sm ${currentTheme.textSecondary}`}>
                    {selectedEmail.receivedTime 
                      ? new Date(selectedEmail.receivedTime).toLocaleString()
                      : 'Date unknown'}
                  </p>
                </div>
              </div>
              <div
                className={`email-content ${currentTheme.text}`}
                dangerouslySetInnerHTML={{ __html: selectedEmail.content || selectedEmail.summary }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className={currentTheme.textSecondary}>Select an email to read</p>
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeModal
          theme={theme}
          onClose={() => setShowCompose(false)}
          onSend={handleSendEmail}
        />
      )}
    </div>
  )
}
