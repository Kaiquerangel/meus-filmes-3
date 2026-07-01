import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      textAlign: 'center',
      padding: '0 24px',
      background: 'var(--bg)',
      gap: 0,
    }}>
      {/* Número 404 grande como elemento visual */}
      <div style={{
        fontSize: 120,
        fontWeight: 800,
        color: 'var(--border)',
        letterSpacing: '-0.06em',
        lineHeight: 1,
        marginBottom: 24,
        userSelect: 'none',
      }}>
        404
      </div>

      <i
        className="ti ti-movie-off"
        style={{
          fontSize: 36,
          color: 'var(--text-4)',
          display: 'block',
          marginBottom: 16,
        }}
      />

      <h1 style={{
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-1)',
        letterSpacing: '-0.03em',
        marginBottom: 8,
      }}>
        Página não encontrada
      </h1>

      <p style={{
        fontSize: 14,
        color: 'var(--text-3)',
        marginBottom: 28,
        lineHeight: 1.5,
      }}>
        Essa cena foi cortada do roteiro.
      </p>

      <Link
        to="/"
        className="btn-primary"
        style={{ textDecoration: 'none' }}
      >
        <i className="ti ti-home" />
        Voltar para o início
      </Link>
    </div>
  )
}
