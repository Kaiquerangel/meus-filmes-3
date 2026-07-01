import { useState, useEffect, useRef } from 'react'

// ── Etapas do tour ────────────────────────────────────────────
// selector: elemento que vai ser destacado na tela
// position: onde o balão aparece em relação ao elemento
// route: rota que precisa estar ativa para essa etapa
const ETAPAS = [
  {
    id: 'boas-vindas',
    titulo: 'Bem-vindo ao Meus Filmes 🎬',
    texto: 'Aqui é o seu catálogo pessoal de filmes. Vou te mostrar como funciona cada parte em menos de 1 minuto.',
    selector: null, // tela cheia, sem highlight
    position: 'center',
  },
  {
    id: 'lista',
    titulo: 'Sua Lista',
    texto: 'Aqui ficam todos os filmes que você cadastrou. Você pode catalogar, relembrar o que já assistiu, ver os atores e diretores, e mostrar pra qualquer pessoa o seu histórico de filmes.',
    selector: '[href="/lista"], a[to="/lista"]',
    position: 'right',
    route: '/',
  },
  {
    id: 'cadastro',
    titulo: 'Cadastrar Filme',
    texto: 'Quer adicionar um filme? É só digitar o nome aqui — o Meus Filmes já puxa tudo automaticamente: atores, diretores, gêneros, pôster, tudo. Você não precisa preencher nada na mão.',
    selector: '[href="/cadastro"], a[to="/cadastro"]',
    position: 'right',
    route: '/',
  },
  {
    id: 'sugerir',
    titulo: 'Não sabe o que assistir?',
    texto: 'Vai em Lista → clica em "Sugerir" e o app escolhe um filme pra você dentro do seu próprio catálogo. Útil quando você tem muita coisa cadastrada e trava na hora de escolher.',
    selector: null,
    position: 'center',
  },
  {
    id: 'graficos',
    titulo: 'Gráficos',
    texto: 'Aqui tem vários gráficos interativos sobre tudo que você assistiu — gêneros favoritos, diretores, atores, períodos, datas. Dá pra você se conhecer melhor como espectador.',
    selector: '[href="/graficos"], a[to="/graficos"]',
    position: 'right',
    route: '/',
  },
  {
    id: 'perfil',
    titulo: 'Seu Perfil e Conquistas',
    texto: 'Conforme você vai cadastrando e assistindo filmes, você desbloqueia conquistas. Tem conquista pra quem assiste filmes clássicos, pra quem tem diretor favorito, pra quem assiste vários dias seguidos — e muito mais.',
    selector: '[href="/perfil"], a[to="/perfil"]',
    position: 'right',
    route: '/',
  },
  {
    id: 'fim',
    titulo: 'Pronto, é isso!',
    texto: 'Agora é com você. Começa cadastrando um filme que você já assistiu — o projeto faz o resto.',
    selector: null,
    position: 'center',
  },
]

const TOUR_KEY = 'mf-tour-visto'

// ── Hook de posição do highlight ─────────────────────────────
function useElementRect(selector, etapaAtual) {
  const [rect, setRect] = useState(null)

  useEffect(() => {
    if (!selector) { setRect(null); return }

    const encontrar = () => {
      // Tenta múltiplos seletores
      const seletores = [
        selector,
        selector.replace('[href=', '[to='),
        selector.replace('[to=', '[href='),
        // Sidebar links
        `nav a[href="${selector.match(/["']([^"']+)["']/)?.[1]}"]`,
        // Bottom nav
        `a[href="${selector.match(/["']([^"']+)["']/)?.[1]}"]`,
      ]

      for (const s of seletores) {
        try {
          const el = document.querySelector(s)
          if (el) {
            const r = el.getBoundingClientRect()
            if (r.width > 0 && r.height > 0) {
              setRect(r)
              return
            }
          }
        } catch {}
      }
      setRect(null)
    }

    encontrar()
    const timer = setTimeout(encontrar, 300)
    window.addEventListener('resize', encontrar)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', encontrar)
    }
  }, [selector, etapaAtual])

  return rect
}

// ── Calcula posição do balão ──────────────────────────────────
function calcBalaoPosicao(rect, position, balaoDims) {
  const GAP = 16
  const vw = window.innerWidth
  const vh = window.innerHeight
  const bw = balaoDims.w
  const bh = balaoDims.h

  if (!rect || position === 'center') {
    return {
      left: Math.max(16, (vw - bw) / 2),
      top: Math.max(16, (vh - bh) / 2),
    }
  }

  let left, top

  if (position === 'right') {
    left = rect.right + GAP
    top = rect.top + rect.height / 2 - bh / 2
  } else if (position === 'left') {
    left = rect.left - bw - GAP
    top = rect.top + rect.height / 2 - bh / 2
  } else if (position === 'bottom') {
    left = rect.left + rect.width / 2 - bw / 2
    top = rect.bottom + GAP
  } else {
    left = rect.left + rect.width / 2 - bw / 2
    top = rect.top - bh - GAP
  }

  // Clamp para não sair da viewport
  left = Math.max(16, Math.min(left, vw - bw - 16))
  top  = Math.max(16, Math.min(top, vh - bh - 16))

  return { left, top }
}

// ── Componente Tour ───────────────────────────────────────────
export function Tour({ onConcluir }) {
  const [etapa, setEtapa]     = useState(0)
  const [visivel, setVisivel] = useState(true)
  const balaoRef              = useRef(null)
  const [balaoDims, setBalaoDims] = useState({ w: 320, h: 180 })

  const etapaAtual = ETAPAS[etapa]
  const rect       = useElementRect(etapaAtual.selector, etapa)
  const pos        = calcBalaoPosicao(rect, etapaAtual.position, balaoDims)
  const isUltima   = etapa === ETAPAS.length - 1
  const isPrimeira = etapa === 0

  useEffect(() => {
    if (balaoRef.current) {
      const r = balaoRef.current.getBoundingClientRect()
      setBalaoDims({ w: r.width || 320, h: r.height || 180 })
    }
  }, [etapa])

  const avancar = () => {
    if (isUltima) {
      concluir()
    } else {
      setVisivel(false)
      setTimeout(() => { setEtapa(e => e + 1); setVisivel(true) }, 160)
    }
  }

  const voltar = () => {
    setVisivel(false)
    setTimeout(() => { setEtapa(e => e - 1); setVisivel(true) }, 160)
  }

  const concluir = () => {
    try { localStorage.setItem(TOUR_KEY, '1') } catch {}
    onConcluir?.()
  }

  return (
    <>
      {/* Overlay escurecido */}
      <div
        onClick={concluir}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      {/* Spotlight no elemento */}
      {rect && (
        <div
          style={{
            position: 'fixed',
            zIndex: 9001,
            top:    rect.top    - 6,
            left:   rect.left   - 6,
            width:  rect.width  + 12,
            height: rect.height + 12,
            borderRadius: 'var(--radius-lg)',
            boxShadow: `
              0 0 0 4000px rgba(0,0,0,0.72),
              0 0 0 2px var(--accent),
              0 0 24px rgba(124,106,247,0.5)
            `,
            pointerEvents: 'none',
            transition: 'all 0.28s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
      )}

      {/* Balão de texto */}
      <div
        ref={balaoRef}
        style={{
          position: 'fixed',
          zIndex: 9002,
          left: pos.left,
          top: pos.top,
          width: Math.min(320, window.innerWidth - 32),
          background: 'var(--surface)',
          backgroundImage: 'var(--surface-gradient)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,106,247,0.15)',
          padding: '20px 20px 16px',
          opacity: visivel ? 1 : 0,
          transform: visivel ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(4px)',
          transition: 'opacity 0.16s, transform 0.16s cubic-bezier(0.16,1,0.3,1)',
          pointerEvents: 'all',
        }}
      >
        {/* Progresso */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 14,
        }}>
          {ETAPAS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 3,
                flex: i === etapa ? 2 : 1,
                borderRadius: 2,
                background: i <= etapa
                  ? 'linear-gradient(90deg, var(--accent-hover), var(--accent))'
                  : 'var(--surface3)',
                transition: 'flex 0.3s cubic-bezier(0.16,1,0.3,1), background 0.2s',
              }}
            />
          ))}
        </div>

        {/* Conteúdo */}
        <h3 style={{
          fontSize: 15,
          fontWeight: 700,
          color: 'var(--text-1)',
          letterSpacing: '-0.02em',
          marginBottom: 8,
          lineHeight: 1.2,
        }}>
          {etapaAtual.titulo}
        </h3>

        <p style={{
          fontSize: 13,
          color: 'var(--text-2)',
          lineHeight: 1.55,
          marginBottom: 18,
        }}>
          {etapaAtual.texto}
        </p>

        {/* Ações */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          {/* Pular */}
          {!isUltima && (
            <button
              onClick={concluir}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-4)',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
                padding: '4px 0',
                transition: 'color 0.14s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
            >
              Pular
            </button>
          )}

          <div style={{ flex: 1 }} />

          {/* Voltar */}
          {!isPrimeira && (
            <button
              onClick={voltar}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '7px 14px',
                background: 'var(--surface2)',
                border: '1px solid var(--border2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-2)',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.14s, color 0.14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface3)'; e.currentTarget.style.color = 'var(--text-1)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text-2)' }}
            >
              ← Voltar
            </button>
          )}

          {/* Próximo / Concluir */}
          <button
            onClick={avancar}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              background: 'linear-gradient(180deg, var(--accent-hover) 0%, var(--accent) 100%)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--btn-text)',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 1px 0 rgba(255,255,255,0.18) inset, 0 2px 12px rgba(124,106,247,0.3)',
              transition: 'filter 0.14s, transform 0.14s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {isUltima ? 'Começar →' : 'Próximo →'}
          </button>
        </div>

        {/* Contador */}
        <div style={{
          textAlign: 'center',
          marginTop: 10,
          fontSize: 10,
          color: 'var(--text-4)',
          letterSpacing: '0.04em',
        }}>
          {etapa + 1} de {ETAPAS.length}
        </div>
      </div>
    </>
  )
}

// ── Botão Flutuante ───────────────────────────────────────────
export function BotaoTour({ onClick }) {
  const [hov, setHov] = useState(false)
  const [pulsando, setPulsando] = useState(true)

  // Para de pulsar depois de 5s para não irritar
  useEffect(() => {
    const t = setTimeout(() => setPulsando(false), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{`
        @keyframes tour-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(124,106,247,0.6), 0 4px 20px rgba(124,106,247,0.35); }
          70%  { box-shadow: 0 0 0 10px rgba(124,106,247,0), 0 4px 20px rgba(124,106,247,0.35); }
          100% { box-shadow: 0 0 0 0 rgba(124,106,247,0), 0 4px 20px rgba(124,106,247,0.35); }
        }
        @keyframes tour-entrada {
          from { opacity: 0; transform: scale(0.6) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <button
        onClick={onClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="tour-btn-flutuante"
        title="Tour pelo app"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 8000,
          width: 46,
          height: 46,
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, var(--accent-hover) 0%, var(--accent) 100%)',
          color: '#fff',
          fontSize: 18,
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: pulsando
            ? 'tour-pulse 2s infinite, tour-entrada 0.4s cubic-bezier(0.34,1.56,0.64,1) both'
            : 'tour-entrada 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
          animationDelay: '1.5s',
          boxShadow: hov
            ? '0 6px 28px rgba(124,106,247,0.55)'
            : '0 4px 20px rgba(124,106,247,0.35)',
          transform: hov ? 'scale(1.1) translateY(-2px)' : 'scale(1)',
          transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s',
        }}
      >
        ?
      </button>

      {/* Tooltip no hover */}
      {hov && (
        <div style={{
          position: 'fixed',
          bottom: 78,
          right: 24,
          zIndex: 8001,
          background: 'var(--surface)',
          backgroundImage: 'var(--surface-gradient)',
          border: '1px solid var(--border2)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--text-2)',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--shadow-sm)',
          animation: 'fadeSlideDown 0.14s cubic-bezier(0.16,1,0.3,1) both',
          pointerEvents: 'none',
        }}>
          Tour pelo app
        </div>
      )}
    </>
  )
}

// ── Controlador principal ─────────────────────────────────────
export default function TourManager() {
  const [tourAtivo, setTourAtivo] = useState(false)
  const [botaoVisivel, setBotaoVisivel] = useState(false)

  useEffect(() => {
    // Mostra o botão após 2s para não aparecer imediatamente
    const t = setTimeout(() => setBotaoVisivel(true), 2000)
    return () => clearTimeout(t)
  }, [])

  // Verifica se é primeira visita — auto-abre o tour
  useEffect(() => {
    try {
      const visto = localStorage.getItem(TOUR_KEY)
      if (!visto) {
        const t = setTimeout(() => setTourAtivo(true), 2500)
        return () => clearTimeout(t)
      }
    } catch {}
  }, [])

  const fecharTour = () => setTourAtivo(false)
  const abrirTour  = () => setTourAtivo(true)

  return (
    <>
      {/* Botão flutuante — sempre visível */}
      {botaoVisivel && !tourAtivo && (
        <BotaoTour onClick={abrirTour} />
      )}

      {/* Tour em si */}
      {tourAtivo && (
        <Tour onConcluir={fecharTour} />
      )}
    </>
  )
}
