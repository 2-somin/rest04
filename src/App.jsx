import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import ScrollToTopButton from './components/ScrollToTopButton'
import ChatWidget from './components/ChatWidget'

import Home from './pages/Home'
import Contents from './pages/Contents'
import ContentDetail from './pages/ContentDetail'
import About from './pages/About'
import SimplePage from './pages/SimplePage'
import Login from './pages/Login'
import Board from './pages/Board'
import BoardDetail from './pages/BoardDetail'
import BoardWrite from './pages/BoardWrite'
import OAuthCallback from './pages/OAuthCallback'

export default function App() {
  return (
    <div className="min-w-[320px] flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />

          {/* 주제별 콘텐츠 */}
          <Route path="/contents" element={<Navigate to="/contents/all" replace />} />
          <Route path="/contents/:category" element={<Contents mode="category" />} />

          {/* 유형별 콘텐츠 */}
          <Route path="/types" element={<Navigate to="/types/free" replace />} />
          <Route path="/types/:type" element={<Contents mode="type" />} />

          {/* 콘텐츠 상세 */}
          <Route path="/content/:id" element={<ContentDetail />} />

          {/* 소개 / 기타 */}
          <Route path="/about" element={<About />} />
          <Route path="/level-test" element={<SimplePage title="레벨테스트" />} />
          <Route path="/guide" element={<SimplePage title="이용안내" />} />
          <Route path="/privacy" element={<SimplePage title="개인정보처리방침" />} />

          {/* 로그인 */}
          <Route path="/login" element={<Login />} />

          {/* 게시판 — /board/write가 /board/:id 보다 먼저 와야 함 */}
          <Route path="/board/write" element={<BoardWrite />} />
          <Route path="/board/free" element={<Board type="free" />} />
          <Route path="/board/qna" element={<Board type="qna" />} />
          <Route path="/board/:id" element={<BoardDetail />} />
          <Route path="/board" element={<Navigate to="/board/free" replace />} />

          <Route path="*" element={<OAuthCallback />} />
        </Routes>
      </main>
      <Footer />
      <ScrollToTopButton />
      <ChatWidget />
    </div>
  )
}
