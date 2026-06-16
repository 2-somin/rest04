import { useState, useRef, useEffect } from 'react'

const WELCOME = '안녕하세요! 홈글리시 AI 도우미입니다. 영어 교육 콘텐츠나 학습 방법에 대해 궁금한 점을 물어보세요!'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'assistant', content: WELCOME }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // 메시지가 추가될 때마다 스크롤을 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 팝업이 열리면 입력창 포커스
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg]
      const res = await fetch(
        'https://xbcttwrqsepxvytjcjft.supabase.co/functions/v1/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhiY3R0d3Jxc2VweHZ5dGpjamZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNjc2NjMsImV4cCI6MjA5NjY0MzY2M30.ouVXJiDFqYffAiNusfAfABbqiTGGexuKIYQyyuvG6s0',
          },
          body: JSON.stringify({ messages: history }),
        }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      console.error('[ChatWidget] error:', err)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '죄송합니다, 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* 채팅 패널 */}
      {open && (
        <div
          role="dialog"
          aria-label="AI 채팅 도우미"
          className="fixed bottom-[4.5rem] right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden
                     w-[calc(100vw-3rem)] sm:w-96
                     bg-white dark:bg-surface-dark
                     border border-gray-200 dark:border-gray-700"
          style={{ height: '480px', maxHeight: 'calc(100vh - 8rem)' }}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand dark:bg-brand-dark text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-base">
                💬
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">홈글리시 AI</p>
                <p className="text-xs opacity-75">영어 교육 도우미</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="채팅 닫기"
              className="rounded-full p-1 hover:bg-white/20 transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 메시지 목록 */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                    msg.role === 'user'
                      ? 'bg-brand text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* 로딩 인디케이터 */}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-none bg-gray-100 dark:bg-gray-700 px-4 py-3">
                  <span className="flex gap-1 items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* 입력창 */}
          <div className="shrink-0 border-t border-gray-200 dark:border-gray-700 p-3 flex gap-2 bg-white dark:bg-surface-dark">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-800
                         px-3 py-2 text-sm text-gray-800 dark:text-gray-100
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-brand dark:focus:ring-brand-light
                         disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              aria-label="전송"
              className="shrink-0 flex items-center justify-center h-9 w-9 rounded-xl
                         bg-brand hover:bg-brand-dark dark:bg-brand-light dark:hover:bg-brand
                         text-white dark:text-bg-dark
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? '채팅 닫기' : '채팅 열기'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full
                   bg-brand dark:bg-brand-dark text-white
                   shadow-lg hover:scale-110 active:scale-95 transition-transform"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  )
}
