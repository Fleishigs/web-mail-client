import { useState, useEffect } from 'react'

interface ComposeModalProps {
  theme: string
  onClose: () => void
  onSend: (to: string, subject: string, body: string) => void
  replyTo?: string
  replySubject?: string
}

export default function ComposeModal({ theme, onClose, onSend, replyTo, replySubject }: ComposeModalProps) {
  const [to, setTo] = useState(replyTo || '')
  const [subject, setSubject] = useState(replySubject || '')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!to || !subject) {
      alert('Please fill in recipient and subject')
      return
    }

    setSending(true)
    await onSend(to, subject, body)
    setSending(false)
  }

  const themeClasses = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      textSecondary: 'text-gray-600',
      input: 'bg-white border-gray-300 text-gray-900',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-gray-100',
      textSecondary: 'text-gray-400',
      input: 'bg-gray-700 border-gray-600 text-gray-100',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      buttonSecondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200'
    },
    minimal: {
      bg: 'bg-white',
      text: 'text-gray-800',
      textSecondary: 'text-gray-500',
      input: 'bg-white border-gray-200 text-gray-800',
      button: 'bg-gray-900 hover:bg-gray-800 text-white',
      buttonSecondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }
  }

  const currentTheme = themeClasses[theme as keyof typeof themeClasses] || themeClasses.light

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${currentTheme.bg} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className={`text-2xl font-bold ${currentTheme.text}`}>{replyTo ? 'Reply' : 'New Message'}</h2>
          <button onClick={onClose} className={`${currentTheme.textSecondary} hover:${currentTheme.text} text-2xl`}>×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>To:</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${currentTheme.input}`}
              placeholder="recipient@example.com"
              disabled={!!replyTo}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${currentTheme.input}`}
              placeholder="Email subject"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${currentTheme.text}`}>Message:</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none ${currentTheme.input}`}
              placeholder="Write your message..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-semibold transition ${currentTheme.buttonSecondary}`}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className={`px-6 py-2 rounded-lg font-semibold transition ${currentTheme.button} disabled:opacity-50`}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
