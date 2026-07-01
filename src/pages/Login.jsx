import { useState } from 'react'
import { useAuth } from '../services/useAuth'
import Footer from '../components/Footer'

// ─── helpers ────────────────────────────────────────────────────
function senhaForte(s) {
  if (s.length < 6)  return { nivel: 0, label: 'Muito curta', cor: 'var(--red)' }
  if (s.length < 8)  return { nivel: 1, label: 'Fraca',       cor: 'var(--red)' }
  const temNum  = /\d/.test(s)
  const temEsp  = /[^a-zA-Z0-9]/.test(s)
  const temMai  = /[A-Z]/.test(s)
  const score   = [temNum, temEsp, temMai].filter(Boolean).length
  if (score === 0) return { nivel: 1, label: 'Fraca',       cor: 'var(--red)'    }
  if (score === 1) return { nivel: 2, label: 'Média',       cor: 'var(--yellow)' }
  if (score === 2) return { nivel: 3, label: 'Boa',         cor: 'var(--green)'  }
  return             { nivel: 4, label: 'Forte',        cor: 'var(--green)'  }
}

// ─── sub-componentes internos ────────────────────────────────────

function InputSenha({ value, onChange, placeholder, autoComplete, inputStyle }) {
  const [mostrar, setMostrar] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        style={{ ...inputStyle, paddingRight: 42 }}
        type={mostrar ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        onFocus={e => {
          e.target.style.borderColor = 'var(--border-focus)'
          e.target.style.boxShadow   = '0 0 0 3px var(--accent-dim)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border2)'
          e.target.style.boxShadow   = 'none'
        }}
      />
      <button
        type="button"
        onClick={() => setMostrar(v => !v)}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 4,
          color: 'var(--text-4)',
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.14s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-4)'}
        tabIndex={-1}
        aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
      >
        <i className={`ti ${mostrar ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 16 }} />
      </button>
    </div>
  )
}

function MensagemErro({ texto }) {
  if (!texto) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: 'var(--red)',
      padding: '8px 10px',
      background: 'var(--red-dim)',
      borderRadius: 'var(--radius-md)',
    }}>
      <i className="ti ti-alert-circle" style={{ fontSize: 13, flexShrink: 0 }} />
      {texto}
    </div>
  )
}

function MensagemSucesso({ texto }) {
  if (!texto) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 12, color: 'var(--green)',
      padding: '8px 10px',
      background: 'var(--green-dim)',
      borderRadius: 'var(--radius-md)',
    }}>
      <i className="ti ti-circle-check" style={{ fontSize: 13, flexShrink: 0 }} />
      {texto}
    </div>
  )
}

function DivisorOu() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      margin: '4px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 500, letterSpacing: '0.05em' }}>
        ou
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  )
}

function BotaoGoogle({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{
        width: '100%',
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: 'var(--surface2)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-md)',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-1)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        opacity: loading ? 0.5 : 1,
        transition: 'background 0.14s, border-color 0.14s, transform 0.14s',
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.background    = 'var(--surface3)'
          e.currentTarget.style.borderColor   = 'var(--border2)'
          e.currentTarget.style.transform     = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background  = 'var(--surface2)'
        e.currentTarget.style.borderColor = 'var(--border2)'
        e.currentTarget.style.transform   = 'translateY(0)'
      }}
    >
      {/* Ícone SVG do Google — sem dependência externa */}
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        <path fill="none" d="M0 0h48v48H0z"/>
      </svg>
      {loading ? 'Aguarde...' : 'Continuar com Google'}
    </button>
  )
}

// ─── componente principal ────────────────────────────────────────

export default function Login() {
  const { login, loginComGoogle, register, recoverPassword } = useAuth()

  const [modo, setModo]       = useState('login')
  const [form, setForm]       = useState({
    identifier: '', nome: '', nickname: '', email: '', password: '',
  })
  const [erro, setErro]       = useState('')
  const [sucesso, setSucesso] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = (novoModo) => {
    setModo(novoModo)
    setErro('')
    setSucesso('')
    // Limpa só o campo de senha ao trocar de modo — mantém email para conveniência
    setForm(f => ({ ...f, password: '', nome: '', nickname: '' }))
  }

  const forcaSenha = form.password ? senhaForte(form.password) : null

  // ── handlers ──
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!form.identifier.trim()) return setErro('Informe o e-mail ou nickname.')
    if (!form.password)          return setErro('Informe a senha.')
    setErro(''); setLoading(true)
    try {
      await login(form.identifier, form.password)
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential')) {
        setErro('E-mail/nickname ou senha incorretos.')
      } else if (code.includes('too-many-requests')) {
        setErro('Muitas tentativas. Tente novamente mais tarde.')
      } else {
        setErro(err.message || 'Erro ao entrar.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setErro(''); setLoadingGoogle(true)
    try {
      await loginComGoogle()
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // Usuário fechou — não é erro, silencia
      } else {
        setErro('Não foi possível entrar com o Google.')
      }
    } finally {
      setLoadingGoogle(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!form.nome.trim())     return setErro('Informe seu nome.')
    if (!form.nickname.trim()) return setErro('Escolha um nickname.')
    if (!/^[a-zA-Z0-9_]+$/.test(form.nickname)) return setErro('Nickname: só letras, números e _.')
    if (form.nickname.length < 3) return setErro('Nickname precisa ter ao menos 3 caracteres.')
    if (form.password.length < 6) return setErro('Senha precisa ter ao menos 6 caracteres.')
    setErro(''); setLoading(true)
    try {
      await register(form.nome, form.nickname, form.email, form.password)
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('email-already-in-use')) {
        setErro('Este e-mail já está cadastrado.')
      } else if (code.includes('weak-password')) {
        setErro('Senha muito fraca. Use ao menos 6 caracteres.')
      } else {
        setErro(err.message || 'Erro ao criar conta.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRecover = async (e) => {
    e.preventDefault()
    if (!form.email.trim()) return setErro('Informe seu e-mail.')
    setErro(''); setLoading(true)
    try {
      await recoverPassword(form.email)
      setSucesso('E-mail de recuperação enviado! Verifique sua caixa de entrada.')
    } catch (err) {
      const code = err?.code || ''
      if (code.includes('user-not-found')) {
        setErro('Nenhuma conta encontrada com este e-mail.')
      } else {
        setErro('Erro ao enviar e-mail. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── estilos compartilhados ──
  const inputBase = {
    width: '100%',
    background: 'var(--inset-bg)',
    border: '1px solid var(--border2)',
    borderRadius: 'var(--radius-md)',
    padding: '0 12px',
    height: 42,
    fontSize: 14,
    color: 'var(--text-1)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.14s, box-shadow 0.14s',
  }

  const inputFocus = (e) => {
    e.target.style.borderColor = 'var(--border-focus)'
    e.target.style.boxShadow   = '0 0 0 3px var(--accent-dim)'
  }
  const inputBlur = (e) => {
    e.target.style.borderColor = 'var(--border2)'
    e.target.style.boxShadow   = 'none'
  }

  // ── render ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div
        className="login-wrapper"
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      >
        <div style={{ width: '100%', maxWidth: 368 }}>

          {/* ── Logo ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
            <div style={{
              width: 52,
              height: 52,
              background: 'var(--accent)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              boxShadow: '0 4px 24px rgba(124,106,247,0.4)',
            }}>
              <i className="ti ti-movie" style={{ fontSize: 26, color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>
              Meus Filmes
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-4)', marginTop: 4 }}>
              Sua coleção pessoal de filmes
            </p>
          </div>

          {/* ── Card ── */}
          <div className="login-card" style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}>

            {/* Tabs login/registro */}
            {modo !== 'recuperar' && (
              <div style={{
                display: 'flex',
                gap: 3,
                background: 'var(--inset-bg)',
                borderBottom: '1px solid var(--border)',
                padding: 4,
              }}>
                {[
                  { id: 'login',    label: 'Entrar'      },
                  { id: 'registro', label: 'Criar conta' },
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => reset(m.id)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 13,
                      fontWeight: modo === m.id ? 600 : 400,
                      background: modo === m.id ? 'var(--surface)' : 'transparent',
                      color: modo === m.id ? 'var(--text-1)' : 'var(--text-3)',
                      border: modo === m.id ? '1px solid var(--border)' : '1px solid transparent',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.14s',
                      boxShadow: modo === m.id ? 'var(--shadow-xs)' : 'none',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            <div style={{ padding: '20px 20px 24px' }}>

              {/* ═══════════════════════════════
                  LOGIN
              ═══════════════════════════════ */}
              {modo === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Google */}
                  <BotaoGoogle onClick={handleGoogle} loading={loadingGoogle} />
                  <DivisorOu />

                  {/* E-mail ou nickname */}
                  <input
                    style={inputBase}
                    placeholder="E-mail ou @nickname"
                    value={form.identifier}
                    onChange={e => set('identifier', e.target.value)}
                    autoComplete="username"
                    required
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />

                  {/* Senha + olhinho */}
                  <InputSenha
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Senha"
                    autoComplete="current-password"
                    inputStyle={inputBase}
                  />

                  {/* Link esqueci */}
                  <div style={{ textAlign: 'right', marginTop: -4 }}>
                    <button
                      type="button"
                      onClick={() => reset('recuperar')}
                      style={{
                        fontSize: 12,
                        color: 'var(--accent)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        padding: '2px 0',
                        transition: 'opacity 0.14s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      Esqueci minha senha
                    </button>
                  </div>

                  <MensagemErro texto={erro} />

                  <button type="submit" disabled={loading} className="btn-gold" style={{ marginTop: 2 }}>
                    {loading
                      ? <><i className="ti ti-loader-2 animate-spin" /> Entrando...</>
                      : 'Entrar'
                    }
                  </button>
                </form>
              )}

              {/* ═══════════════════════════════
                  REGISTRO
              ═══════════════════════════════ */}
              {modo === 'registro' && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Google */}
                  <BotaoGoogle onClick={handleGoogle} loading={loadingGoogle} />
                  <DivisorOu />

                  {/* Nome */}
                  <input
                    style={inputBase}
                    type="text"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={e => set('nome', e.target.value)}
                    autoComplete="name"
                    required
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />

                  {/* Nickname */}
                  <div>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: 12, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 14, color: 'var(--text-3)',
                        pointerEvents: 'none',
                      }}>
                        @
                      </span>
                      <input
                        style={{ ...inputBase, paddingLeft: 24 }}
                        type="text"
                        placeholder="nickname"
                        value={form.nickname}
                        onChange={e => set('nickname', e.target.value.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase())}
                        autoComplete="username"
                        maxLength={20}
                        required
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                      />
                    </div>
                    <p style={{ fontSize: 10, color: 'var(--text-4)', marginTop: 4, paddingLeft: 2 }}>
                      Letras, números e _ · mín. 3 caracteres
                    </p>
                  </div>

                  {/* E-mail */}
                  <input
                    style={inputBase}
                    type="email"
                    placeholder="E-mail"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    autoComplete="email"
                    required
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />

                  {/* Senha + olhinho + força */}
                  <div>
                    <InputSenha
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      placeholder="Senha (mín. 6 caracteres)"
                      autoComplete="new-password"
                      inputStyle={inputBase}
                    />

                    {/* Barra de força */}
                    {form.password.length > 0 && forcaSenha && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          {[1, 2, 3, 4].map(n => (
                            <div
                              key={n}
                              style={{
                                flex: 1,
                                height: 3,
                                borderRadius: 100,
                                background: n <= forcaSenha.nivel ? forcaSenha.cor : 'var(--border2)',
                                transition: 'background 0.2s',
                              }}
                            />
                          ))}
                        </div>
                        <p style={{ fontSize: 10, color: forcaSenha.cor, marginTop: 4, paddingLeft: 1 }}>
                          {forcaSenha.label}
                        </p>
                      </div>
                    )}
                  </div>

                  <MensagemErro texto={erro} />

                  <button type="submit" disabled={loading} className="btn-gold" style={{ marginTop: 2 }}>
                    {loading
                      ? <><i className="ti ti-loader-2 animate-spin" /> Criando conta...</>
                      : 'Criar conta'
                    }
                  </button>

                  <p style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center', lineHeight: 1.5 }}>
                    Ao criar uma conta você concorda com os termos de uso do serviço.
                  </p>
                </form>
              )}

              {/* ═══════════════════════════════
                  RECUPERAR SENHA
              ═══════════════════════════════ */}
              {modo === 'recuperar' && (
                <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  <div style={{ marginBottom: 2 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                      Recuperar senha
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                      Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.
                    </p>
                  </div>

                  <input
                    style={inputBase}
                    type="email"
                    placeholder="Seu e-mail"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    autoComplete="email"
                    required
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                  />

                  <MensagemErro   texto={erro}    />
                  <MensagemSucesso texto={sucesso} />

                  {!sucesso && (
                    <button type="submit" disabled={loading} className="btn-gold" style={{ marginTop: 2 }}>
                      {loading
                        ? <><i className="ti ti-loader-2 animate-spin" /> Enviando...</>
                        : 'Enviar link de recuperação'
                      }
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => reset('login')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      fontSize: 12,
                      color: 'var(--text-3)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      padding: '4px 0',
                      transition: 'color 0.14s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                  >
                    <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
                    Voltar ao login
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Nota de rodapé */}
          <p style={{ fontSize: 11, color: 'var(--text-4)', textAlign: 'center', marginTop: 20, lineHeight: 1.6 }}>
            Dados de filmes fornecidos por TMDB e OMDb
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
