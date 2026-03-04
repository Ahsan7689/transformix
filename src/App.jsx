import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'

import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { CreditProvider } from './context/CreditContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import ImageToPDF from './pages/ImageToPDF'
import FileConverter from './pages/FileConverter'
import LinkShortener from './pages/LinkShortener'
import MetadataRemover from './pages/MetadataRemover'
import AIImageGenerator from './pages/AIImageGenerator'
import Profile from './pages/Profile'
import About from './pages/About'
import ShortLinkRedirect from './pages/ShortLinkRedirect'
import NotFound from './pages/NotFound'

import useLenis from './hooks/useLenis'

function LenisWrapper({ children }) {
  useLenis()
  return children
}

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppInner() {
  return (
    <>
      <ScrollReset />
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/img-to-pdf" element={<ImageToPDF />} />
        <Route path="/convert"    element={<FileConverter />} />
        <Route path="/shorten"    element={<LinkShortener />} />
        <Route path="/metadata"   element={<MetadataRemover />} />
        <Route path="/imagine"    element={<AIImageGenerator />} />
        <Route path="/profile"    element={<Profile />} />
        <Route path="/about"      element={<About />} />
        <Route path="/s/:code"    element={<ShortLinkRedirect />} />
        <Route path="*"           element={<NotFound />} />
      </Routes>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CreditProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <LenisWrapper>
              <div className="noise-overlay">
                <AppInner />
              </div>
            </LenisWrapper>
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.88rem',
                  boxShadow: 'var(--card-shadow)',
                },
                success: { iconTheme: { primary: 'var(--primary)', secondary: 'var(--bg)' } },
                error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
              }}
            />
          </BrowserRouter>
        </CreditProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}