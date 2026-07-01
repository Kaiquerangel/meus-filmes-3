import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisivel(window.scrollY > 320)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const voltar = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <style>{`
        .kra-scroll-top {
          position: fixed;
          bottom: 32px;
          right: 80px;   /* tour fica em right:24, esse fica 56px à esquerda */
          z-index: 49;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--surface2);
          color: var(--text-2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: var(--shadow);
          transition:
            opacity 0.22s var(--ease-out),
            transform 0.22s var(--ease-out),
            background 0.14s,
            color 0.14s;
          pointer-events: auto;
        }
        .kra-scroll-top.oculto {
          opacity: 0;
          transform: translateY(10px) scale(0.85);
          pointer-events: none;
        }
        .kra-scroll-top:hover {
          background: var(--accent);
          color: var(--btn-text);
          transform: translateY(-2px) scale(1.05);
        }
        .kra-scroll-top:active {
          transform: scale(0.95);
        }
        /* Mobile: sobe acima do BottomNav, lado a lado com o Tour */
        @media (max-width: 768px) {
          .kra-scroll-top {
            bottom: calc(58px + 16px + env(safe-area-inset-bottom, 0px));
            right: 68px;  /* tour fica em right:16, esse fica 52px à esquerda */
            width: 38px;
            height: 38px;
            font-size: 16px;
          }
        }
      `}</style>

      <button
        className={`kra-scroll-top${visivel ? '' : ' oculto'}`}
        onClick={voltar}
        aria-label="Voltar ao topo"
        title="Voltar ao topo"
      >
        <i className="ti ti-arrow-up" />
      </button>
    </>
  )
}