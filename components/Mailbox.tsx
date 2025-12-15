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

const formatDate = (timestamp: number | string | undefined) => {
  if (!timestamp) return 'Recently'
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Recently'
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return 'Recently'
  }
}

const formatFullDate = (timestamp: number | string | undefined) => {
  if (!timestamp) return 'Date unknown'
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return 'Date unknown'
    return date.toLocaleString()
  } catch {
    return 'Date unknown'
  }
}

export default function Mailbox({ theme, toggleTheme, onLogout }: MailboxProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAccountAndEmails()
  }, [])

  const fetchAccountAndEmails = async () => {
    setLoading(true)
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
      setShowReply(false)
      alert('Email sent successfully!')
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Failed to send email')
    }
  }

  const handleReply = () => {
    setShowReply(true)
  }

  const handleDelete = async () => {
    if (!selectedEmail) return
    if (!confirm('Delete this email?')) return

    try {
      const token = localStorage.getItem('zoho_token')
      await axios.delete('/api/emails/delete', {
        data: { token, accountId, messageId: selectedEmail.messageId }
      })
      
      setSelectedEmail(null)
      fetchAccountAndEmails()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Failed to delete email')
    }
  }

  const filteredEmails = emails.filter(email => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      email.subject?.toLowerCase().includes(q) ||
      email.fromAddress?.toLowerCase().includes(q) ||
      email.summary?.toLowerCase().includes(q)
    )
  })

  const themeClasses = {
    light: {
      bg: 'bg-white', sidebar: 'bg-gray-50 border-gray-200', header: 'bg-white border-gray-200',
      text: 'text-gray-900', textSecondary: 'text-gray-600', hover: 'hover:bg-gray-100',
      selected: 'bg-blue-50 border-l-4 border-blue-600', button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700', input: 'bg-white border-gray-300'
    },
    dark: {
      bg: 'bg-gray-900', sidebar: 'bg-gray-800 border-gray-700', header: 'bg-gray-800 border-gray-700',
      text: 'text-gray-100', textSecondary: 'text-gray-400', hover: 'hover:bg-gray-700',
      selected: 'bg-gray-700 border-l-4 border-blue-500', button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200', input: 'bg-gray-700 border-gray-600'
    },
    minimal: {
      bg: 'bg-gray-50', sidebar: 'bg-white border-gray-100', header: 'bg-white border-gray-100',
      text: 'text-gray-800', textSecondary: 'text-gray-500', hover: 'hover:bg-gray-50',
      selected: 'bg-gray-100 border-l-2 border-gray-900', button: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonSecondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200', input: 'bg-white border-gray-200'
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
      <header className={`${currentTheme.header} border-b px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4 flex-1">
          <h1 className={`text-2xl font-bold ${currentTheme.text}`}>KosherComm Mail</h1>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${currentTheme.input} ${currentTheme.text} outline-none focus:ring-2 focus:ring-blue-500 max-w-md`}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className={currentTheme.textSecondary}>{userEmail}</span>
          <button onClick={toggleTheme} className={`px-4 py-2 rounded-lg ${currentTheme.buttonSecondary}`}>
            {theme === 'light' ? '🌙' : theme === 'dark' ? '✨' : '☀️'}
          </button>
          <button onClick={() => fetchAccountAndEmails()} className={`px-4 py-2 rounded-lg ${currentTheme.buttonSecondary}`}>🔄</button>
          <button onClick={onLogout} className={`px-4 py-2 rounded-lg ${currentTheme.buttonSecondary}`}>Logout</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-64 ${currentTheme.sidebar} border-r p-4`}>
          <button onClick={() => setShowCompose(true)} className={`w-full ${currentTheme.button} py-3 rounded-lg font-semibold mb-6 shadow-md`}>
            ✉️ Compose
          </button>
          <nav>
            <div className={`${currentTheme.selected} px-4 py-3 rounded-lg mb-2`}>
              <span className={`font-semibold ${currentTheme.text}`}>📥 Inbox</span>
              <span className={`ml-2 ${currentTheme.textSecondary}`}>({filteredEmails.length})</span>
            </div>
          </nav>
        </aside>

        <div className={`w-96 ${currentTheme.bg} border-r overflow-y-auto`}>
          {filteredEmails.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8">
              <p className={currentTheme.textSecondary}>{searchQuery ? 'No emails found' : 'No emails'}</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`mt-4 px-4 py-2 rounded-lg ${currentTheme.buttonSecondary}`}>
                  Clear
                </button>
              )}
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.messageId}
                onClick={() => fetchEmailContent(email.messageId)}
                className={`border-b ${currentTheme.hover} cursor-pointer p-4 ${
                  selectedEmail?.messageId === email.messageId ? currentTheme.selected : ''
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className={`font-semibold ${currentTheme.text} truncate flex-1`}>{email.fromAddress}</span>
                  <span className={`text-xs ${currentTheme.textSecondary} ml-2`}>{formatDate(email.receivedTime)}</span>
                </div>
                <p className={`font-medium ${currentTheme.text} truncate mb-1`}>{email.subject || '(No subject)'}</p>
                <p className={`text-sm ${currentTheme.textSecondary} truncate`}>{email.summary}</p>
              </div>
            ))
          )}
        </div>

        <div className={`flex-1 ${currentTheme.bg} overflow-y-auto`}>
          {selectedEmail ? (
            <div className="p-8">
              <h2 className={`text-3xl font-bold mb-4 ${currentTheme.text}`}>{selectedEmail.subject || '(No subject)'}</h2>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className={`w-12 h-12 rounded-full ${currentTheme.button} flex items-center justify-center text-xl`}>
                  {selectedEmail.fromAddress?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${currentTheme.text}`}>{selectedEmail.fromAddress}</p>
                  <p className={`text-sm ${currentTheme.textSecondary}`}>{formatFullDate(selectedEmail.receivedTime)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleReply} className={`px-4 py-2 rounded-lg ${currentTheme.button}`}>↩️ Reply</button>
                  <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white">🗑️ Delete</button>
                </div>
              </div>
              <div className={`email-content ${currentTheme.text}`} dangerouslySetInnerHTML={{ __html: selectedEmail.content || selectedEmail.summary }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className={currentTheme.textSecondary}>Select an email</p>
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeModal theme={theme} onClose={() => setShowCompose(false)} onSend={handleSendEmail} />
      )}

      {showReply && selectedEmail && (
        <ComposeModal
          theme={theme}
          onClose={() => setShowReply(false)}
          onSend={handleSendEmail}
          replyTo={selectedEmail.fromAddress}
          replySubject={`Re: ${selectedEmail.subject}`}
        />
      )}
    </div>
  )
}
