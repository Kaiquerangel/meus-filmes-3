import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from './store/useAppStore'
import { useAuth } from './services/useAuth'
import { useMovies } from './services/useMovies'
import { useColecoes } from './services/useColecoes'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Lista from './pages/Lista'
import Cadastro from './pages/Cadastro'
import Stats from './pages/Stats'
import Graficos from './pages/Graficos'
import Perfil from './pages/Perfil'
import Colecoes from './pages/Colecoes'
import Tema from './pages/Tema'
import Anuario from './pages/Anuario'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Sobre from './pages/Sobre'
import TourManager from './components/Tour'
import ScrollToTop from './components/ScrollToTop'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div
      key={location.pathname}
      style={{ animation: 'pageFadeIn 0.18s ease both' }}
    >
      <Routes location={location}>
        <Route path="/"         element={<Home />} />
        <Route path="/lista"    element={<Lista />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/colecoes" element={<Colecoes />} />
        <Route path="/stats"    element={<Stats />} />
        <Route path="/graficos" element={<Graficos />} />
        <Route path="/perfil"   element={<Perfil />} />
        <Route path="/tema"     element={<Tema />} />
        <Route path="/ano"      element={<Anuario />} />
        <Route path="/sobre"    element={<Sobre />} />
        <Route path="*"         element={<NotFound />} />
      </Routes>
    </div>
  )
}

const SIDEBAR_COLLAPSED = 56
const SIDEBAR_EXPANDED  = 204

function Layout() {
  const { logout }      = useAuth()
  const userProfile     = useAppStore(s => s.userProfile)
  const sidebarExpanded = useAppStore(s => s.sidebarExpanded)

  useMovies()
  useColecoes()

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--bg)',
    }}>
      <style>{`
        .kra-main {
          margin-left: ${sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED}px;
        }
        @media (max-width: 768px) {
          .kra-main {
            margin-left: 0 !important;
            padding-bottom: 58px;
          }
        }
      `}</style>

      <Sidebar userProfile={userProfile} onLogout={logout} />

      <main
        className="kra-main"
        style={{
          flex: 1,
          transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
        }}
      >
        <div style={{ flex: 1 }}>
          <AnimatedRoutes />
        </div>
        <Footer />
      </main>

      <BottomNav userProfile={userProfile} onLogout={logout} />
      <TourManager />
      <ScrollToTop />
    </div>
  )
}

export default function App() {
  useAuth()
  const user      = useAppStore(s => s.user)
  const carregando = useAppStore(s => s.carregando)

  if (carregando) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg)',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          animation: 'fadeIn 0.3s ease both',
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(124,106,247,0.4)',
          }}>
            <i className="ti ti-movie" style={{ fontSize: 22, color: 'var(--btn-text)' }} />
          </div>
          <div style={{
            display: 'flex',
            align: 'center',
            gap: 6,
          }}>
            <i
              className="ti ti-loader-2 animate-spin"
              style={{ fontSize: 14, color: 'var(--text-4)' }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-4)' }}>
              Carregando...
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/*"     element={user  ? <Layout /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}
