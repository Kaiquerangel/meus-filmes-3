import { useAppStore } from '../store/useAppStore'

const STACK = [
  { nome: 'React 19',      icone: 'ti-brand-react',    cor: '#61dafb', url: 'https://react.dev' },
  { nome: 'Vite',          icone: 'ti-bolt',           cor: '#646cff', url: 'https://vitejs.dev' },
  { nome: 'Firebase',      icone: 'ti-brand-firebase', cor: '#ffa000', url: 'https://firebase.google.com' },
  { nome: 'Tailwind 4',    icone: 'ti-wind',           cor: '#38bdf8', url: 'https://tailwindcss.com' },
  { nome: 'Zustand',       icone: 'ti-box',            cor: '#a78bfa', url: 'https://zustand-demo.pmnd.rs' },
  { nome: 'React Router',  icone: 'ti-route',          cor: '#f44250', url: 'https://reactrouter.com' },
  { nome: 'TMDB',          icone: 'ti-movie',          cor: '#01b4e4', url: 'https://www.themoviedb.org' },
  { nome: 'OMDb',          icone: 'ti-database',       cor: '#f5c518', url: 'https://www.omdbapi.com' },
  { nome: 'YouTube API',   icone: 'ti-brand-youtube',  cor: '#ff0000', url: 'https://developers.google.com/youtube' },
  { nome: 'Recharts',      icone: 'ti-chart-bar',      cor: '#8884d8', url: 'https://recharts.org' },
]

const LINKS = [
  { label: 'GitHub', icone: 'ti-brand-github', url: 'https://github.com/Kaiquerangel' },
]

export default function Sobre() {
  const userProfile = useAppStore(s => s.userProfile)
  const ano = new Date().getFullYear()

  return (
    <div style={{
      padding: '24px 16px 32px',
      background: 'var(--bg)',
      minHeight: '100vh',
    }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--text-4)',
          textTransform: 'uppercase',
          letterSpacing: '0.10em',
          marginBottom: 6,
        }}>
          Aplicativo
        </p>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.03em',
          marginBottom: 4,
        }}>
          Sobre o <span style={{ color: 'var(--accent)' }}>Meus Filmes</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
          Sua coleção pessoal de filmes — feito com carinho por Kaique Rangel.
        </p>
      </div>

      {/* Card do app */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px',
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 4px 16px rgba(10,132,255,0.3)',
        }}>
          <i className="ti ti-movie" style={{ fontSize: 26, color: 'var(--btn-text)' }} />
        </div>
        <div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
          }}>
            Meus Filmes
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
            Versão 3.0
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 3 }}>
            © {ano} Kaique Rangel
          </div>
        </div>
      </div>

      {/* Desenvolvedor */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Desenvolvedor
          </span>
        </div>
        <div style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--btn-text)',
            flexShrink: 0,
          }}>
            K
          </div>
          <div>
            <div style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-1)',
              letterSpacing: '-0.01em',
            }}>
              Kaique Rangel
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 1 }}>
              @kaiquerangel
            </div>
          </div>
          <a
            href="https://github.com/Kaiquerangel"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 14px',
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-2)',
              textDecoration: 'none',
              transition: 'color 0.14s',
              flexShrink: 0,
            }}
          >
            <i className="ti ti-brand-github" style={{ fontSize: 14 }} />
            GitHub
          </a>
        </div>
      </div>

      {/* Stack técnica */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        marginBottom: 16,
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Feito com
          </span>
        </div>
        <div style={{ padding: '8px 0' }}>
          {STACK.map((item, i) => (
            <a
              key={item.nome}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderBottom: i < STACK.length - 1 ? '1px solid var(--border)' : 'none',
                textDecoration: 'none',
                transition: 'background 0.12s',
              }}
              onTouchStart={e => e.currentTarget.style.background = 'var(--surface2)'}
              onTouchEnd={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: `${item.cor}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <i
                  className={`ti ${item.icone}`}
                  style={{ fontSize: 16, color: item.cor }}
                />
              </div>
              <span style={{
                fontSize: 14,
                color: 'var(--text-1)',
                fontWeight: 500,
                flex: 1,
              }}>
                {item.nome}
              </span>
              <i
                className="ti ti-external-link"
                style={{ fontSize: 12, color: 'var(--text-4)' }}
              />
            </a>
          ))}
        </div>
      </div>

      {/* Dados do usuário logado */}
      {userProfile && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 16px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <i className="ti ti-user-check" style={{ fontSize: 16, color: 'var(--accent)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Logado como</div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-1)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {userProfile.nome}
            </div>
          </div>
          <span style={{
            marginLeft: 'auto',
            fontSize: 11,
            color: 'var(--accent)',
            flexShrink: 0,
          }}>
            @{userProfile.nickname}
          </span>
        </div>
      )}

      {/* Rodapé de copyright */}
      <div style={{
        textAlign: 'center',
        paddingTop: 8,
      }}>
        <p style={{ fontSize: 11, color: 'var(--text-4)', lineHeight: 1.6 }}>
          © {ano}{' '}
          <strong style={{ color: 'var(--text-3)', fontWeight: 600 }}>Meus Filmes</strong>
          {' '}— todos os direitos reservados.
        </p>
        <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 2 }}>
          Dados de filmes fornecidos por TMDB e OMDb.
        </p>
      </div>
    </div>
  )
}
