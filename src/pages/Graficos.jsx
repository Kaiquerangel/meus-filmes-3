import { useMemo } from 'react'
import { useMovies } from '../services/useMovies'
import { useAppStore } from '../store/useAppStore'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
  Legend, AreaChart, Area, ReferenceLine
} from 'recharts'

const C = {
  accent: 'var(--accent)', rating: 'var(--accent-rating)', green: '#32d74b', blue: '#4488cc',
  purple: '#a855f7', pink: '#ec4899', orange: '#f97316',
  yellow: '#ffd60a', red: '#ff453a', teal: '#2dd4bf', indigo: '#818cf8',
}
const PIE_COLORS  = [C.accent, C.blue, C.pink, C.orange, C.teal]
const ORIG_COLORS = [C.blue, C.green]
const QUAL_KEYS   = ['Ótimo (≥8)', 'Bom (7–7.9)', 'Ok (5–6.9)', 'Ruim (<5)']
const QUAL_COLORS = [C.green, C.blue, C.yellow, C.red]

function useTS() {
  return { backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-1)', fontSize: 12 }
}

function ChartCard({ titulo, sub, children, span }) {
  return (
    <div className="card" style={{
      padding: '22px 22px',
      gridColumn: span ? `span ${span}` : undefined,
      borderRadius: 20,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
    }}>
      <h3 style={{
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--text-1)',
        marginBottom: sub ? 4 : 18,
        letterSpacing: '-0.03em',
      }}>{titulo}</h3>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-4)', marginBottom: 18, lineHeight: 1.5 }}>{sub}</p>}
      {children}
    </div>
  )
}

function TooltipDecada({ active, payload }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-1)', fontWeight: 600 }}>Média: {payload[0]?.value?.toFixed(1)}</p>
      <p style={{ color: 'var(--text-4)' }}>{payload[0]?.payload?.filmes} filmes</p>
    </div>
  )
}

function LabelBar({ x, y, width, value }) {
  if (!value) return null
  return <text x={x + width + 6} y={y + 11} fill="var(--text-3)" fontSize={10}>{value}</text>
}

function GeneroNotaTabela({ data, mediaGeral }) {
  const max = Math.max(...data.map(d => d.qtd), 1)
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 55px 55px 65px', gap: 8, padding: '4px 0 8px', borderBottom: '1px solid var(--border)' }}>
        {['GÊNERO', 'QTD. ASSISTIDOS', 'FILMES', 'MÉDIA', 'VS GERAL'].map(h => (
          <span key={h} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</span>
        ))}
      </div>
      {data.map(d => {
        const pct  = (d.qtd / max) * 100
        const diff = parseFloat((d.media - mediaGeral).toFixed(1))
        const diffColor = diff > 0 ? C.green : diff < 0 ? C.red : 'var(--text-4)'
        const diffLabel = diff > 0 ? `+${diff}` : diff === 0 ? '=0' : `${diff}`
        return (
          <div key={d.genero} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 55px 55px 65px', gap: 8, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500 }}>{d.genero}</span>
            <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: C.yellow, borderRadius: 'var(--radius-sm)' }} />
            </div>
            <span style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>{d.qtd}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', textAlign: 'right' }}>{d.media}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: diffColor, textAlign: 'right' }}>{diffLabel}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Graficos() {
  useMovies()
  const filmes = useAppStore(s => s.filmes)
  const ts = useTS()

  const d = useMemo(() => {
    const ass     = filmes.filter(f => f.assistido)
    const comNota = ass.filter(f => f.nota)

    const mediaGeral = comNota.length
      ? parseFloat((comNota.reduce((a, f) => a + f.nota, 0) / comNota.length).toFixed(1))
      : 0

    // Top 5 Gêneros
    const genMap = {}
    ass.flatMap(f => f.genero || []).forEach(g => { genMap[g] = (genMap[g] || 0) + 1 })
    const top5Generos = Object.entries(genMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }))

    // Top 5 Direção
    const dirMap = {}
    ass.flatMap(f => f.direcao || []).forEach(d => { if (d?.trim()) dirMap[d.trim()] = (dirMap[d.trim()] || 0) + 1 })
    const top5Direcao = Object.entries(dirMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }))

    // Origem
    const nac = ass.filter(f => f.origem === 'Nacional').length
    const origemData = [
      { name: 'Internacional', value: ass.length - nac },
      { name: 'Nacional', value: nac },
    ]

    // Ano de Lançamento — top 10 barras horizontais, altura dinâmica
    const anoMap = {}
    ass.forEach(f => { if (f.ano) anoMap[f.ano] = (anoMap[f.ano] || 0) + 1 })
    const anoLancData = Object.entries(anoMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }))

    // Distribuição de notas exatas
    const notaExata = Array.from({ length: 11 }, (_, i) => ({
      name: `${i}`,
      value: comNota.filter(f => Math.round(f.nota) === i).length,
      cor: i <= 4 ? C.red : i <= 6 ? C.yellow : i <= 7 ? C.blue : C.green,
    }))

    // Nota média por Década — com label na barra
    const decMap = {}
    comNota.forEach(f => {
      if (!f.ano) return
      const dec = `${Math.floor(f.ano / 10) * 10}s`
      if (!decMap[dec]) decMap[dec] = { soma: 0, qtd: 0 }
      decMap[dec].soma += f.nota; decMap[dec].qtd++
    })
    const notaDecada = Object.entries(decMap).sort((a, b) => a[0].localeCompare(b[0])).map(([dec, v]) => {
      const media = parseFloat((v.soma / v.qtd).toFixed(1))
      return { name: dec, media, filmes: v.qtd, cor: media > mediaGeral ? C.green : media >= mediaGeral - 0.5 ? C.blue : C.orange }
    })

    // Últimos 12 meses
    const ult12 = []
    const hoje = new Date()
    for (let i = 11; i >= 0; i--) {
      const dt  = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
      const lbl = dt.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      ult12.push({ name: lbl, value: ass.filter(f => f.dataAssistido?.startsWith(key)).length })
    }

    // Qualidade por Era — empilhado 100%
    const eraMap = {}
    comNota.forEach(f => {
      if (!f.ano) return
      const dec = `${Math.floor(f.ano / 10) * 10}s`
      if (!eraMap[dec]) eraMap[dec] = { otimo: 0, bom: 0, ok: 0, ruim: 0, total: 0 }
      eraMap[dec].total++
      if (f.nota >= 8) eraMap[dec].otimo++
      else if (f.nota >= 7) eraMap[dec].bom++
      else if (f.nota >= 5) eraMap[dec].ok++
      else eraMap[dec].ruim++
    })
    const qualEra = Object.entries(eraMap).sort((a, b) => a[0].localeCompare(b[0])).map(([dec, v]) => ({
      name: dec,
      'Ótimo (≥8)':  parseFloat(((v.otimo / v.total) * 100).toFixed(1)),
      'Bom (7–7.9)': parseFloat(((v.bom   / v.total) * 100).toFixed(1)),
      'Ok (5–6.9)':  parseFloat(((v.ok    / v.total) * 100).toFixed(1)),
      'Ruim (<5)':   parseFloat(((v.ruim  / v.total) * 100).toFixed(1)),
    }))

    // Progresso acumulado — 1 ponto por mês
    const progMes = {}
    ass.filter(f => f.dataAssistido).forEach(f => {
      const m = f.dataAssistido.slice(0, 7)
      progMes[m] = (progMes[m] || 0) + 1
    })
    let acum = 0
    const seenLabels = new Set()
    const progressoData = Object.entries(progMes).sort((a, b) => a[0].localeCompare(b[0])).map(([mes, qtd]) => {
      acum += qtd
      const lbl = new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      const uniqueLbl = seenLabels.has(lbl) ? mes : lbl
      seenLabels.add(lbl)
      return { name: uniqueLbl, total: acum }
    })

    // Gênero x Nota Média
    const gnMap = {}
    comNota.forEach(f => {
      (f.genero || []).forEach(g => {
        if (!gnMap[g]) gnMap[g] = { soma: 0, qtd: 0 }
        gnMap[g].soma += f.nota; gnMap[g].qtd++
      })
    })
    const generoNota = Object.entries(gnMap)
      .filter(([, v]) => v.qtd >= 2)
      .sort((a, b) => b[1].qtd - a[1].qtd)
      .map(([genero, v]) => ({ genero, qtd: v.qtd, media: parseFloat((v.soma / v.qtd).toFixed(1)) }))

    // Relógio cinematográfico
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const diaMap = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
    ass.filter(f => f.dataAssistido).forEach(f => { diaMap[new Date(f.dataAssistido + 'T12:00:00').getDay()]++ })
    const relogioData = diasNomes.map((name, i) => ({ name, value: diaMap[i] }))

    // Nota média por Diretor top 10
    const dnMap = {}
    comNota.forEach(f => {
      (f.direcao || []).forEach(d => {
        if (!d?.trim()) return
        if (!dnMap[d]) dnMap[d] = { soma: 0, qtd: 0 }
        dnMap[d].soma += f.nota; dnMap[d].qtd++
      })
    })
    const dirNota = Object.entries(dnMap)
      .filter(([, v]) => v.qtd >= 2)
      .sort((a, b) => (b[1].soma / b[1].qtd) - (a[1].soma / a[1].qtd))
      .slice(0, 10)
      .map(([name, v]) => ({ name, media: parseFloat((v.soma / v.qtd).toFixed(1)), filmes: v.qtd }))

    // Evolução nota média — agrupada por trimestre para não ficar nervoso
    const trimMap = {}
    comNota.filter(f => f.dataAssistido).forEach(f => {
      const [ano, mes] = f.dataAssistido.slice(0, 7).split('-')
      const trim = `${ano}-T${Math.ceil(parseInt(mes) / 3)}`
      if (!trimMap[trim]) trimMap[trim] = { soma: 0, qtd: 0 }
      trimMap[trim].soma += f.nota; trimMap[trim].qtd++
    })
    const notaTempo = Object.entries(trimMap).sort((a, b) => a[0].localeCompare(b[0])).map(([trim, v]) => ({
      name: trim.replace('-T', ' T'),
      media: parseFloat((v.soma / v.qtd).toFixed(1)),
    }))

    // Nacional vs Internacional por nota média
    const nacNota = comNota.filter(f => f.origem === 'Nacional')
    const intNota = comNota.filter(f => f.origem !== 'Nacional')
    const origemNota = [
      { name: 'Nacional',      media: nacNota.length ? parseFloat((nacNota.reduce((a, f) => a + f.nota, 0) / nacNota.length).toFixed(1)) : 0, filmes: nacNota.length },
      { name: 'Internacional', media: intNota.length ? parseFloat((intNota.reduce((a, f) => a + f.nota, 0) / intNota.length).toFixed(1)) : 0, filmes: intNota.length },
    ]

    return {
      mediaGeral, top5Generos, top5Direcao, origemData, anoLancData,
      notaExata, notaDecada, ult12, qualEra, progressoData,
      generoNota, relogioData, dirNota, notaTempo, origemNota,
    }
  }, [filmes])

  return (
    <div className="graficos-container" style={{ padding: '28px 32px', background: 'var(--bg)', minHeight: '100vh', flex: 1 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 8 }}>Análise visual</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-.04em', lineHeight: 1.1 }}>
          Gráficos <span style={{ color: 'var(--accent)' }}>&amp; Análises</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>Visualize sua coleção em dados</p>
      </div>

      <div className="graficos-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* 1. Top 5 Gêneros — donut sem legenda duplicada */}
        <ChartCard titulo="Top 5 Gêneros" sub="Os 5 gêneros mais assistidos.">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={d.top5Generos} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {d.top5Generos.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={ts} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Top 5 Direção */}
        <ChartCard titulo="Top 5 Direção" sub="Diretores com mais filmes assistidos.">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.top5Direcao} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={ts} />
              <Bar dataKey="value" fill={C.pink} radius={[0, 4, 4, 0]} name="Filmes" label={<LabelBar />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Origem dos Filmes */}
        <ChartCard titulo="Origem dos Filmes" sub="Nacional vs Internacional.">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={d.origemData} cx="50%" cy="45%" outerRadius={85} paddingAngle={3} dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {d.origemData.map((_, i) => <Cell key={i} fill={ORIG_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={ts} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Filmes por Ano de Lançamento — altura dinâmica */}
        <ChartCard titulo="Filmes por Ano de Lançamento" sub="Top 10 anos com mais títulos assistidos." span={2}>
          <ResponsiveContainer width="100%" height={d.anoLancData.length * 32 + 20}>
            <BarChart data={d.anoLancData} layout="vertical" margin={{ top: 0, right: 50, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip contentStyle={ts} />
              <Bar dataKey="value" fill={C.blue} radius={[0, 4, 4, 0]} name="Filmes" label={<LabelBar />} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Distribuição de Notas exatas */}
        <ChartCard titulo="Distribuição de Notas" sub="Quantidade de filmes por nota (0 a 10).">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.notaExata} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ts} formatter={v => [v, 'Filmes']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Filmes" label={{ position: 'top', fontSize: 9, fill: 'var(--text-3)' }}>
                {d.notaExata.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
            {[{ cor: C.green, l: 'Ótimo (8–10)' }, { cor: C.blue, l: 'Bom (7)' }, { cor: C.yellow, l: 'Ok (5–6)' }, { cor: C.red, l: 'Ruim (0–4)' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-4)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-sm)', background: x.cor }} />{x.l}
              </div>
            ))}
          </div>
        </ChartCard>

        {/* 6. Nota Média por Década */}
        <ChartCard titulo="Nota Média por Década" sub="Média das notas por década de lançamento." span={2}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={d.notaDecada} margin={{ top: 16, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[5, 10]} tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <ReferenceLine y={d.mediaGeral} stroke="var(--text-4)" strokeDasharray="4 4" label={{ value: `Média geral (${d.mediaGeral})`, position: 'insideTopRight', fontSize: 10, fill: 'var(--text-4)' }} />
              <Tooltip content={<TooltipDecada />} />
              <Bar dataKey="media" radius={[4, 4, 0, 0]} maxBarSize={60} label={{ position: 'top', fontSize: 10, fill: 'var(--text-3)', formatter: v => v.toFixed(1) }}>
                {d.notaDecada.map((e, i) => <Cell key={i} fill={e.cor} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            {[{ cor: C.green, l: 'Acima da média' }, { cor: C.blue, l: 'Na média' }, { cor: C.orange, l: 'Abaixo da média' }].map(x => (
              <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-4)' }}>
                <div style={{ width: 8, height: 8, borderRadius: 'var(--radius-sm)', background: x.cor }} />{x.l}
              </div>
            ))}
          </div>
        </ChartCard>

        {/* 7. Assistidos nos Últimos 12 Meses */}
        <ChartCard titulo="Assistidos nos Últimos 12 Meses" sub="Filmes marcados como assistido por mês.">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={d.ult12} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <Tooltip contentStyle={ts} formatter={v => [v, 'Assistidos']} />
              <Bar dataKey="value" fill={C.purple} radius={[4, 4, 0, 0]} name="Assistidos" label={{ position: 'top', fontSize: 9, fill: 'var(--text-4)' }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 8. Qualidade por Era — empilhado 100% */}
        <ChartCard titulo="Qualidade por Era do Cinema" sub="Proporção de qualidade das notas por década." span={2}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={d.qualEra} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip contentStyle={ts} formatter={(v, n) => [`${v}%`, n]} />
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 10 }} />
              {QUAL_KEYS.map((key, i) => (
                <Bar key={key} dataKey={key} stackId="a" fill={QUAL_COLORS[i]} maxBarSize={60}
                  radius={i === 0 ? [4, 4, 0, 0] : i === QUAL_KEYS.length - 1 ? [0, 0, 4, 4] : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 9. Progresso Acumulado */}
        <ChartCard titulo="Progresso Acumulado" sub="Total acumulado de filmes assistidos desde o início." span={3}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={d.progressoData} margin={{ top: 4, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAcum" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.green} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.floor(d.progressoData.length / 12)} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ts} formatter={v => [v, 'Total assistidos']} />
              <Area type="monotone" dataKey="total" stroke={C.green} strokeWidth={2} fill="url(#gradAcum)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 10. Gênero x Nota Média */}
        <ChartCard titulo="Gênero × Nota Média" sub={`Média geral: ${d.mediaGeral} — coluna "VS Geral" mostra se você gosta mais ou menos do gênero em relação à sua média.`} span={3}>
          <GeneroNotaTabela data={d.generoNota} mediaGeral={d.mediaGeral} />
        </ChartCard>

        {/* 11. Relógio Cinematográfico */}
        <ChartCard titulo="🎬 Relógio Cinematográfico" sub="Filmes assistidos por dia da semana.">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={d.relogioData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ts} formatter={v => [v, 'Filmes']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Filmes" label={{ position: 'top', fontSize: 9, fill: 'var(--text-4)' }}>
                {d.relogioData.map((e, i) => (
                  <Cell key={i} fill={e.value === Math.max(...d.relogioData.map(x => x.value)) ? C.rating : C.indigo} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 12. Nota Média por Diretor */}
        <ChartCard titulo="Nota Média por Diretor" sub="Top 10 com melhor média (mín. 2 filmes)." span={2}>
          <ResponsiveContainer width="100%" height={d.dirNota.length * 30 + 20}>
            <BarChart data={d.dirNota} layout="vertical" margin={{ top: 0, right: 60, left: 10, bottom: 0 }}>
              <XAxis type="number" domain={[6, 10]} tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-2)', fontSize: 11 }} axisLine={false} tickLine={false} width={130} />
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={true} horizontal={false} />
              <Tooltip contentStyle={ts} formatter={(v, n, p) => [`${v} (${p.payload.filmes} filmes)`, 'Média']} />
              <Bar dataKey="media" fill={C.teal} radius={[0, 4, 4, 0]} name="Média"
                label={{ position: 'right', fontSize: 10, fill: 'var(--text-2)', formatter: v => v.toFixed(1) }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 13. Evolução da Nota Média — trimestral */}
        <ChartCard titulo="Evolução da Nota Média" sub="Média das notas por trimestre ao longo do tempo." span={2}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={d.notaTempo} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 9 }} axisLine={false} tickLine={false} interval={Math.floor(d.notaTempo.length / 8)} />
              <YAxis domain={[4, 10]} tick={{ fill: 'var(--text-3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <ReferenceLine y={d.mediaGeral} stroke="var(--text-4)" strokeDasharray="4 4" />
              <Tooltip contentStyle={ts} formatter={v => [v, 'Nota média']} />
              <Line type="monotone" dataKey="media" stroke={C.rating} strokeWidth={2} dot={{ r: 3, fill: C.rating }} activeDot={{ r: 5 }} name="Nota média" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 14. Nacional vs Internacional — cards informativos */}
        <ChartCard titulo="Nacional vs Internacional" sub="Comparação de nota média por origem.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {d.origemNota.map((o, i) => (
              <div key={o.name} style={{ background: 'var(--surface2)', borderRadius: 'var(--radius-lg)', padding: '14px 16px', border: `1px solid ${ORIG_COLORS[i]}30` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>{o.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-4)' }}>{o.filmes} filmes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: ORIG_COLORS[i], letterSpacing: '-.5px' }}>{o.media}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-4)' }}>nota média</span>
                </div>
                <div style={{ marginTop: 8, height: 4, background: 'var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(o.media / 10) * 100}%`, background: ORIG_COLORS[i], borderRadius: 'var(--radius-sm)' }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

      </div>
      </div>
    </div>
  )
}