import { NavLink, useLocation } from 'react-router-dom'
import { useAppStore } from '../store/useAppStore'
import { useEffect, useRef, useState } from 'react'

const links = [
  { to: '/',         icon: 'ti-home',          label: 'Início' },
  { to: '/cadastro', icon: 'ti-circle-plus',    label: 'Cadastrar' },
  { to: '/lista',    icon: 'ti-list',           label: 'Minha Lista' },
  { to: '/colecoes', icon: 'ti-stack-2',        label: 'Coleções' },
  { to: '/stats',    icon: 'ti-chart-bar',      label: 'Estatísticas' },
  { to: '/graficos', icon: 'ti-chart-dots',     label: 'Gráficos' },
  { to: '/ano',      icon: 'ti-calendar-stats', label: 'Meu Ano' },
  { to: '/perfil',   icon: 'ti-user',           label: 'Perfil' },
]

const COLLAPSED = 56
const EXPANDED  = 204

export default function Sidebar({ userProfile, onLogout }) {
  const inicial     = userProfile?.nome?.charAt(0).toUpperCase() || '?'
  const location    = useLocation()
  const navRef      = useRef(null)
  const expanded    = useAppStore(s => s.sidebarExpanded)
  const setExpanded = useAppStore(s => s.setSidebarExpanded)
  const [barTop, setBarTop]       = useState(0)
  const [barHeight, setBarHeight] = useState(0)
  const [barVisible, setBarVisible] = useState(false)

  useEffect(() => {
    if (!navRef.current) return
    const activeEl = navRef.current.querySelector('[data-active="true"]')
    if (activeEl) {
      const navRect  = navRef.current.getBoundingClientRect()
      const itemRect = activeEl.getBoundingClientRect()
      setBarTop(itemRect.top - navRect.top + itemRect.height / 2 - 10)
      setBarHeight(20)
      setBarVisible(true)
    } else {
      setBarVisible(false)
    }
  }, [location.pathname])

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .kra-sidebar { display: none !important; }
        }
      `}</style>

      <aside
        className="kra-sidebar"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: expanded ? EXPANDED : COLLAPSED,
          minHeight: '100vh',
          padding: '14px 0',
          position: 'fixed',
          left: 0, top: 0, zIndex: 50,
          background: 'var(--surface)',
          backgroundImage: 'var(--surface-gradient)',
          borderRight: '1px solid var(--border)',
          overflow: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: expanded
            ? '4px 0 32px rgba(0,0,0,0.25)'
            : 'none',
        }}
      >
        {/* Logo */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '0 10px',
          marginBottom: 20,
          flexShrink: 0,
          height: 40,
        }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(124,106,247,0.35)',
            transition: 'box-shadow 0.2s',
          }}>
            <i className="ti ti-movie" style={{ fontSize: 16, color: 'var(--btn-text)' }} />
          </div>
          <div style={{
            opacity: expanded ? 1 : 0,
            transform: expanded ? 'translateX(0)' : 'translateX(-6px)',
            transition: 'opacity 0.18s, transform 0.18s',
            transitionDelay: expanded ? '0.06s' : '0s',
            minWidth: 0,
          }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--text-1)',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}>
              Meus Filmes
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'var(--text-4)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginTop: 1,
            }}>
              v3.0
            </div>
          </div>
        </div>

        {/* Nav links */}
        <div
          ref={navRef}
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            padding: '0 8px',
          }}
        >
          {/* Indicador animado */}
          <div style={{
            position: 'absolute',
            left: 0,
            top: barTop,
            width: 3,
            height: barHeight,
            background: 'linear-gradient(180deg, var(--accent-hover) 0%, var(--accent) 100%)',
            borderRadius: '0 2px 2px 0',
            transition: 'top 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.15s',
            opacity: barVisible ? 1 : 0,
            zIndex: 1,
          }} />

          {links.map(link => {
            const isActive = link.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.to)

            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                data-active={isActive}
                title={!expanded ? link.label : undefined}
                style={{
                  width: '100%',
                  height: 38,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '0 9px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 14,
                  color: isActive ? 'var(--accent)' : 'var(--text-3)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  transition: 'color 0.14s, background 0.14s',
                  position: 'relative',
                  zIndex: 2,
                  textDecoration: 'none',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-1)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-3)'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <i
                  className={`ti ${link.icon}`}
                  style={{ flexShrink: 0, fontSize: 17 }}
                />
                <span style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  opacity: expanded ? 1 : 0,
                  transform: expanded ? 'translateX(0)' : 'translateX(-5px)',
                  transition: 'opacity 0.16s, transform 0.16s',
                  transitionDelay: expanded ? '0.05s' : '0s',
                  pointerEvents: 'none',
                }}>
                  {link.label}
                </span>
              </NavLink>
            )
          })}
        </div>

        <div style={{ flex: 1 }} />

        {/* Bottom — tema, logout, avatar */}
        <div style={{
          width: '100%',
          padding: '0 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}>
          {/* Divisor */}
          <div style={{
            height: 1,
            background: 'var(--border)',
            margin: '6px 2px 8px',
            opacity: expanded ? 1 : 0,
            transition: 'opacity 0.15s',
          }} />

          {/* Tema */}
          <NavLink
            to="/tema"
            title={!expanded ? 'Tema' : undefined}
            style={({ isActive }) => ({
              width: '100%',
              height: 38,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 9px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--text-3)',
              background: isActive ? 'var(--accent-dim)' : 'transparent',
              transition: 'color 0.14s, background 0.14s',
            })}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text-1)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-3)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <i className="ti ti-palette" style={{ flexShrink: 0, fontSize: 17 }} />
            <span style={{
              fontSize: 13,
              whiteSpace: 'nowrap',
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-5px)',
              transition: 'opacity 0.16s, transform 0.16s',
              transitionDelay: expanded ? '0.05s' : '0s',
            }}>
              Tema
            </span>
          </NavLink>

          {/* Logout */}
          <button
            title={!expanded ? 'Sair' : undefined}
            onClick={onLogout}
            style={{
              width: '100%',
              height: 38,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '0 9px',
              borderRadius: 'var(--radius-md)',
              fontSize: 14,
              color: 'var(--text-3)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'color 0.14s, background 0.14s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--red)'
              e.currentTarget.style.background = 'var(--red-dim)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-3)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <i className="ti ti-logout" style={{ flexShrink: 0, fontSize: 17 }} />
            <span style={{
              fontSize: 13,
              whiteSpace: 'nowrap',
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-5px)',
              transition: 'opacity 0.16s, transform 0.16s',
              transitionDelay: expanded ? '0.05s' : '0s',
            }}>
              Sair
            </span>
          </button>

          {/* Avatar */}
          <div style={{
            width: '100%',
            height: 46,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '0 9px',
            marginTop: 4,
          }}>
            <NavLink
              to="/perfil"
              title={!expanded ? userProfile?.nome || 'Perfil' : undefined}
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-full)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                background: 'var(--accent)',
                color: 'var(--btn-text)',
                textDecoration: 'none',
                transition: 'transform 0.14s, box-shadow 0.14s',
                letterSpacing: '-0.02em',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.08)'
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              {inicial}
            </NavLink>
            <div style={{
              opacity: expanded ? 1 : 0,
              transform: expanded ? 'translateX(0)' : 'translateX(-5px)',
              transition: 'opacity 0.16s, transform 0.16s',
              transitionDelay: expanded ? '0.05s' : '0s',
              minWidth: 0,
            }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-1)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 120,
                letterSpacing: '-0.01em',
              }}>
                {userProfile?.nome || 'Perfil'}
              </div>
              {userProfile?.nickname && (
                <div style={{
                  fontSize: 10,
                  color: 'var(--text-4)',
                  whiteSpace: 'nowrap',
                  marginTop: 1,
                }}>
                  @{userProfile.nickname}
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
