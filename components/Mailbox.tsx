import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import ComposeModal from './ComposeModal'

interface Email {
  messageId: string
  subject: string
  fromAddress: string
  summary: string
  receivedTime: number | string
  sentDateInGMT?: number | string
  folderId: string
}

interface Folder {
  folderId: string
  folderName: string
  folderType: string
}

export default function Mailbox({ theme, toggleTheme, onLogout }: any) {
  const [emails, setEmails] = useState<Email[]>([])
  const [selectedEmail, setSelectedEmail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [accountId, setAccountId] = useState('')
  const [showCompose, setShowCompose] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAccountAndFolders()
  }, [])

  useEffect(() => {
    if (currentFolderId && accountId) {
      loadEmails()
    }
  }, [currentFolderId])

  const fetchAccountAndFolders = async () => {
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
        
        const foldersRes = await axios.get('/api/emails/folders', {
          params: { token, accountId: account.accountId }
        })
        
        if (foldersRes.data.data) {
          setFolders(foldersRes.data.data)
          const inbox = foldersRes.data.data.find((f: Folder) => f.folderType === 'Inbox')
          if (inbox) setCurrentFolderId(inbox.folderId)
        }
      }
      
      setLoading(false)
    } catch (error: any) {
      console.error('Error:', error)
      if (error.response?.status === 401) onLogout()
      setLoading(false)
    }
  }

  const loadEmails = async () => {
    try {
      const token = localStorage.getItem('zoho_token')
      const emailRes = await axios.get('/api/emails/list', {
        params: { token, accountId, folderId: currentFolderId }
      })
      
      if (emailRes.data.data) setEmails(emailRes.data.data)
      else setEmails([])
    } catch (error) {
      console.error('Error loading emails:', error)
      setEmails([])
    }
  }

  const fetchEmailContent = async (email: Email) => {
    try {
      const token = localStorage.getItem('zoho_token')
      const response = await axios.get('/api/emails/get', {
        params: { token, accountId, folderId: email.folderId, messageId: email.messageId }
      })
      
      setSelectedEmail({ ...email, content: response.data.data.content })
    } catch (error) {
      console.error('Error:', error)
      setSelectedEmail({ ...email, content: email.summary || 'Could not load content' })
    }
  }

  const handleSendEmail = async (to: string, subject: string, body: string) => {
    try {
      const token = localStorage.getItem('zoho_token')
      await axios.post('/api/emails/send', { token, accountId, fromAddress: userEmail, to, subject, body })
      setShowCompose(false)
      setShowReply(false)
      alert('Sent!')
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed: ' + (error.response?.data?.details?.message || 'Error'))
    }
  }

  const handleReply = () => {
    setShowReply(true)
  }

  const handleDelete = async () => {
    if (!selectedEmail || !confirm('Delete?')) return
    try {
      const token = localStorage.getItem('zoho_token')
      await axios.post('/api/emails/delete', { token, accountId, messageId: selectedEmail.messageId })
      setSelectedEmail(null)
      loadEmails()
    } catch (error) {
      alert('Could not delete')
    }
  }

  const filteredEmails = emails.filter(email => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return email.subject?.toLowerCase().includes(q) || email.fromAddress?.toLowerCase().includes(q) || email.summary?.toLowerCase().includes(q)
  })

  const formatDate = (ts: any) => {
    if (!ts) return 'Recently'
    try {
      const d = new Date(Number(ts))
      return isNaN(d.getTime()) ? 'Recently' : formatDistanceToNow(d, { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const themeClasses = {
    light: { bg: 'bg-white', sidebar: 'bg-gray-50 border-gray-200', header: 'bg-white border-gray-200', text: 'text-gray-900', textSecondary: 'text-gray-600', hover: 'hover:bg-gray-100', selected: 'bg-blue-50 border-l-4 border-blue-600', button: 'bg-blue-600 hover:bg-blue-700 text-white', buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700', input: 'bg-white border-gray-300' },
    dark: { bg: 'bg-gray-900', sidebar: 'bg-gray-800 border-gray-700', header: 'bg-gray-800 border-gray-700', text: 'text-gray-100', textSecondary: 'text-gray-400', hover: 'hover:bg-gray-700', selected: 'bg-gray-700 border-l-4 border-blue-500', button: 'bg-blue-600 hover:bg-blue-700 text-white', buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200', input: 'bg-gray-700 border-gray-600' },
    minimal: { bg: 'bg-gray-50', sidebar: 'bg-white border-gray-100', header: 'bg-white border-gray-100', text: 'text-gray-800', textSecondary: 'text-gray-500', hover: 'hover:bg-gray-50', selected: 'bg-gray-100 border-l-2 border-gray-900', button: 'bg-gray-900 hover:bg-gray-800 text-white', buttonSecondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200', input: 'bg-white border-gray-200' }
  }
  const t = themeClasses[theme as 'light' | 'dark' | 'minimal'] || themeClasses.light

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${t.bg}`}><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>

  return (
    <div className={`h-screen flex flex-col ${t.bg}`}>
      <header className={`${t.header} border-b px-6 py-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4 flex-1">
          <h1 className={`text-2xl font-bold ${t.text}`}>KosherComm Mail</h1>
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`px-4 py-2 rounded-lg border ${t.input} ${t.text} outline-none max-w-md`} />
        </div>
        <div className="flex items-center gap-3">
          <span className={t.textSecondary}>{userEmail}</span>
          <button onClick={toggleTheme} className={`px-4 py-2 rounded-lg ${t.buttonSecondary}`}>{theme === 'light' ? '🌙' : theme === 'dark' ? '✨' : '☀️'}</button>
          <button onClick={() => loadEmails()} className={`px-4 py-2 rounded-lg ${t.buttonSecondary}`}>🔄</button>
          <button onClick={onLogout} className={`px-4 py-2 rounded-lg ${t.buttonSecondary}`}>Logout</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-64 ${t.sidebar} border-r p-4`}>
          <button onClick={() => setShowCompose(true)} className={`w-full ${t.button} py-3 rounded-lg font-semibold mb-6 shadow-md`}>✉️ Compose</button>
          <nav>
            {folders.map(f => (
              <button key={f.folderId} onClick={() => setCurrentFolderId(f.folderId)} className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${currentFolderId === f.folderId ? t.selected : t.hover} ${t.text}`}>
                {f.folderType === 'Inbox' && '📥 '}{f.folderType === 'Sent' && '📤 '}{f.folderType === 'Trash' && '🗑️ '}{f.folderType === 'Drafts' && '📝 '}{f.folderName}
              </button>
            ))}
          </nav>
        </aside>

        <div className={`w-96 ${t.bg} border-r overflow-y-auto`}>
          {filteredEmails.length === 0 ? (
            <div className="flex items-center justify-center h-full"><p className={t.textSecondary}>{searchQuery ? 'No emails found' : 'No emails'}</p></div>
          ) : (
            filteredEmails.map((email) => (
              <div key={email.messageId} onClick={() => fetchEmailContent(email)} className={`border-b ${t.hover} cursor-pointer p-4 ${selectedEmail?.messageId === email.messageId ? t.selected : ''}`}>
                <div className="flex justify-between mb-1">
                  <span className={`font-semibold ${t.text} truncate flex-1`}>{email.fromAddress}</span>
                  <span className={`text-xs ${t.textSecondary} ml-2`}>{formatDate(email.receivedTime || email.sentDateInGMT)}</span>
                </div>
                <p className={`font-medium ${t.text} truncate mb-1`}>{email.subject || '(No subject)'}</p>
                <p className={`text-sm ${t.textSecondary} truncate`}>{email.summary}</p>
              </div>
            ))
          )}
        </div>

        <div className={`flex-1 ${t.bg} overflow-y-auto`}>
          {selectedEmail ? (
            <div className="p-8">
              <h2 className={`text-3xl font-bold mb-4 ${t.text}`}>{selectedEmail.subject || '(No subject)'}</h2>
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                <div className={`w-12 h-12 rounded-full ${t.button} flex items-center justify-center text-xl font-bold`}>{selectedEmail.fromAddress?.[0]?.toUpperCase() || '?'}</div>
                <div className="flex-1">
                  <p className={`font-semibold ${t.text}`}>{selectedEmail.fromAddress}</p>
                  <p className={`text-sm ${t.textSecondary}`}>{formatDate(selectedEmail.receivedTime || selectedEmail.sentDateInGMT)}</p>
                </div>
                <button onClick={handleReply} className={`px-4 py-2 rounded-lg ${t.button}`}>↩️ Reply</button>
                <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white">🗑️</button>
              </div>
              <div className={t.text} dangerouslySetInnerHTML={{ __html: selectedEmail.content || selectedEmail.summary }} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full"><p className={t.textSecondary}>Select an email</p></div>
          )}
        </div>
      </div>

      {showCompose && <ComposeModal theme={theme} onClose={() => setShowCompose(false)} onSend={handleSendEmail} />}
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
