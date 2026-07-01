import Cadastro from '../pages/Cadastro'

export default function ModalEdicao({ filme, onFechar }) {
  if (!filme) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(10,10,11,0.92)' }}
      onClick={onFechar}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg z-10 transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          <i className="ti ti-x text-sm" />
        </button>
        <Cadastro filmeParaEditar={filme} onConcluir={onFechar} inModal />
      </div>
    </div>
  )
}