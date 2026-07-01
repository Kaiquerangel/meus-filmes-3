import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import { sincronizarPosters } from '../services/syncPosters'

export default function ModalSyncPosters({ onFechar }) {
  const user = useAppStore(s => s.user)
  const filmes = useAppStore(s => s.filmes)
  const [status, setStatus] = useState('idle') // idle | running | done
  const [progresso, setProgresso] = useState({ atual: 0, total: 0, titulo: '' })
  const [resultado, setResultado] = useState(null)

  const semPoster = filmes.filter(f => !f.poster || f.poster === 'N/A' || f.poster === '').length

  const handleSincronizar = async () => {
    setStatus('running')
    const res = await sincronizarPosters(user.uid, filmes, (p) => {
      setProgresso(p)
    })
    setResultado(res)
    setStatus('done')
  }

  const pct = progresso.total > 0 ? Math.round((progresso.atual / progresso.total) * 100) : 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,10,11,0.92)' }}
      onClick={status === 'running' ? undefined : onFechar}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxWidth: 420, background: 'var(--bg)', border: '0.5px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 6, letterSpacing: '-.3px' }}>
            Sincronizar Pôsteres
          </h2>
        </div>

        <div style={{ padding: '16px 20px 20px' }}>

          {/* IDLE */}
          {status === 'idle' && (
            <>
              <div
                style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: 16, textAlign: 'center' }}
              >
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-.5px' }}>
                  {semPoster}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                  filmes sem pôster de {filmes.length} no total
                </div>
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20, textAlign: 'center' }}>
                Vamos buscar automaticamente os pôsteres no <strong style={{ color: 'var(--text-1)' }}>TMDB</strong> e <strong style={{ color: 'var(--text-1)' }}>OMDB</strong>. Isso pode levar alguns minutos dependendo da quantidade.
              </p>

              {semPoster === 0
                ? <p style={{ fontSize: 13, color: 'var(--green)', textAlign: 'center', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                    <i className="ti ti-circle-check" /> Todos os filmes já têm pôster!
                  </p>
                : <button
                    onClick={handleSincronizar}
                    style={{ width: '100%', padding: '11px 0', borderRadius: 'var(--radius-lg)', fontSize: 14, fontWeight: 600, background: 'var(--accent)', border: 'none', color: 'var(--btn-text)', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 8 }}
                  >
                    <i className="ti ti-photo-search" /> Buscar pôsteres
                  </button>
              }

              <button
                onClick={onFechar}
                style={{ width: '100%', padding: '10px 0', borderRadius: 'var(--radius-lg)', fontSize: 13, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancelar
              </button>
            </>
          )}

          {/* RUNNING */}
          {status === 'running' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{ height: 6, background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 8 }}
                >
                  <div
                    style={{ height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-lg)', transition: 'width .3s ease', width: `${pct}%` }}
                  />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                  {progresso.atual} de {progresso.total} · {pct}%
                </div>
              </div>

              <div
                style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 16px', marginBottom: 16 }}
              >
                <div style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 4 }}>Buscando pôster de:</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {progresso.titulo}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-3)', fontSize: 13 }}>
                <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 16, color: 'var(--accent)' }} />
                Não feche esta janela...
              </div>
            </div>
          )}

          {/* DONE */}
          {status === 'done' && resultado && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>
                {resultado.atualizados > 0 ? '🎉' : '😅'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Buscados',      valor: resultado.semPoster, cor: 'var(--text-1)' },
                  { label: 'Atualizados',   valor: resultado.atualizados, cor: 'var(--green)' },
                  { label: 'Não encontrado', valor: resultado.erros + (resultado.semPoster - resultado.atualizados - resultado.erros), cor: 'var(--text-3)' },
                ].map(s => (
                  <div
                    key={s.label}
                    style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '12px 8px', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.cor, letterSpacing: '-.4px' }}>{s.valor}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                {resultado.atualizados > 0
                  ? 'Os pôsteres já estão aparecendo nos cards!'
                  : 'Nenhum pôster foi encontrado. Verifique os títulos dos filmes.'
                }
              </p>

              <button
                onClick={onFechar}
                style={{ width: '100%', padding: '11px 0', borderRadius: 'var(--radius-lg)', fontSize: 14, fontWeight: 600, background: 'var(--accent)', border: 'none', color: 'var(--btn-text)', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}