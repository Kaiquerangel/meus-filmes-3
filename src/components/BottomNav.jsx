import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'

const principais = [
  { to: '/',         icon: 'ti-home',        label: 'Início' },
  { to: '/lista',    icon: 'ti-list',        label: 'Lista' },
  { to: '/cadastro', icon: 'ti-circle-plus', label: 'Cadastrar' },
  { to: '/stats',    icon: 'ti-chart-bar',   label: 'Stats' },
]

const maisItens = [
  { to: '/colecoes', icon: 'ti-stack-2',        label: 'Coleções' },
  { to: '/graficos', icon: 'ti-chart-dots',     label: 'Gráficos' },
  { to: '/ano',      icon: 'ti-calendar-stats', label: 'Meu Ano' },
  { to: '/perfil',   icon: 'ti-user',           label: 'Perfil' },
  { to: '/tema',     icon: 'ti-palette',        label: 'Tema' },
  { to: '/sobre',    icon: 'ti-info-circle',    label: 'Sobre' },
]

export default function BottomNav({ userProfile, onLogout }) {
  const location    = useLocation()
  const [maisAberto, setMaisAberto] = useState(false)
  const sheetRef    = useRef(null)
  const maisAtivo   = maisItens.some(i => location.pathname.startsWith(i.to))

  useEffect(() => { setMaisAberto(false) }, [location.pathname])

  useEffect(() => {
    if (!maisAberto) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [maisAberto])

  return (
    <>
      <style>{`
        .kra-bottomnav { display: none; }
        @media (max-width: 768px) {
          .kra-bottomnav { display: flex !important; }
        }
        @keyframes slideUpSheet {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>

      <nav
        className="kra-bottomnav"
        style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          zIndex: 50,
          height: 58,
          alignItems: 'center',
          justifyContent: 'space-around',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {principais.map(item => {
          const isActive = item.to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                color: isActive ? 'var(--accent)' : 'var(--text-4)',
                textDecoration: 'none',
                flex: 1,
                padding: '6px 0',
                transition: 'color 0.14s',
              }}
            >
              <i
                className={`ti ${item.icon}`}
                style={{
                  fontSize: 20,
                  transition: 'transform 0.18s var(--ease-bounce)',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                }}
              />
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.01em',
              }}>
                {item.label}
              </span>
            </NavLink>
          )
        })}

        <button
          onClick={() => setMaisAberto(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            color: maisAtivo ? 'var(--accent)' : 'var(--text-4)',
            background: 'none',
            border: 'none',
            flex: 1,
            padding: '6px 0',
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'color 0.14s',
          }}
        >
          <i className="ti ti-dots" style={{ fontSize: 20 }} />
          <span style={{ fontSize: 10, fontWeight: maisAtivo ? 600 : 400 }}>Mais</span>
        </button>
      </nav>

      {/* Bottom Sheet */}
      {maisAberto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
          onClick={() => setMaisAberto(false)}
        >
          <div
            ref={sheetRef}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              borderRadius: '20px 20px 0 0',
              padding: '12px 16px calc(24px + env(safe-area-inset-bottom, 0px))',
              animation: 'slideUpSheet 0.25s var(--ease-out) both',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: 'var(--border2)',
              margin: '0 auto 20px',
            }} />

            {/* Grid de itens */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              marginBottom: 14,
            }}>
              {maisItens.map(item => {
                const isActive = location.pathname.startsWith(item.to)
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 7,
                      padding: '14px 4px',
                      borderRadius: 'var(--radius-lg)',
                      background: isActive ? 'var(--accent-dim)' : 'var(--surface2)',
                      border: `1px solid ${isActive ? 'rgba(10,132,255,0.2)' : 'var(--border)'}`,
                      color: isActive ? 'var(--accent)' : 'var(--text-2)',
                      textDecoration: 'none',
                      transition: 'background 0.14s, color 0.14s',
                    }}
                  >
                    <i className={`ti ${item.icon}`} style={{ fontSize: 20 }} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: isActive ? 600 : 400,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}>
                      {item.label}
                    </span>
                  </NavLink>
                )
              })}
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '13px 16px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--red)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.14s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--red-dim)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <i className="ti ti-logout" style={{ fontSize: 16 }} />
              Sair
            </button>
          </div>
        </div>
      )}
    </>
  )
}
