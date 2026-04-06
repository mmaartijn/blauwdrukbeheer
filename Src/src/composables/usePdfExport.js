import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const BLOOM_LABELS = {
  1: 'Kennen', 2: 'Begrijpen', 3: 'Toepassen',
  4: 'Analyseren', 5: 'Evalueren', 6: 'Creëren',
}

/**
 * Bouwt een volledig gestijld HTML-element voor een module (print-layout).
 * Gebruikt inline stijlen zodat html2canvas geen externe stylesheets nodig heeft.
 */
function buildModuleHtml(module, keywords, portefeuilles) {
  const periodeLabel = module.periodeLabel ?? module.periode

  // ── Helper: escape HTML ──────────────────────────────────────────────────
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // ── Keywords per portefeuille ────────────────────────────────────────────
  const kwPerPf = {}
  for (const kw of keywords) {
    if (kw.periode === module.periode) {
      if (!kwPerPf[kw.portefeuille]) kwPerPf[kw.portefeuille] = []
      kwPerPf[kw.portefeuille].push(kw)
    }
  }

  const pfs = portefeuilles.filter(pf => kwPerPf[pf.id]?.length)

  // ── Stijlen ──────────────────────────────────────────────────────────────
  const s = {
    page:    'font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;line-height:1.5;padding:40px;width:740px;background:#fff;',
    header:  'border-bottom:2px solid #1e3a8a;padding-bottom:16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:flex-start;',
    subhead: 'font-size:9px;font-weight:700;color:#1d4ed8;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;',
    h1:      'font-size:20px;font-weight:700;color:#111;margin:0;',
    ec:      'font-size:26px;font-weight:700;color:#1e3a8a;text-align:right;',
    ecLabel: 'font-size:10px;color:#6b7280;display:block;',
    section: 'margin-bottom:20px;',
    h2:      'font-size:9px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 10px 0;',
    lu:      'margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #f3f4f6;',
    luHead:  'display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;',
    luNaam:  'font-size:13px;font-weight:700;color:#111;',
    luEc:    'font-size:11px;color:#6b7280;',
    omschr:  'font-size:10px;color:#374151;margin:0 0 6px 0;',
    fieldLbl:'font-size:9px;font-weight:700;color:#6b7280;text-transform:uppercase;margin:4px 0 2px 0;',
    bullets: 'margin:0;padding-left:16px;',
    li:      'font-size:10px;color:#374151;',
    table:   'width:100%;border-collapse:collapse;margin-top:6px;font-size:10px;',
    thL:     'text-align:left;padding:4px 6px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;color:#4b5563;',
    thR:     'text-align:right;padding:4px 6px;background:#f9fafb;border:1px solid #e5e7eb;font-weight:600;color:#4b5563;white-space:nowrap;',
    secRow:  'background:#eff6ff;',
    secTd:   'padding:4px 6px;font-weight:700;color:#1d4ed8;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;border:1px solid #e5e7eb;',
    td:      'padding:4px 6px;border:1px solid #e5e7eb;color:#111;vertical-align:top;',
    tdR:     'padding:4px 6px;border:1px solid #e5e7eb;color:#111;text-align:right;font-weight:600;vertical-align:top;',
    totRow:  'background:#f3f4f6;',
    totTd:   'padding:4px 6px;border:1px solid #e5e7eb;font-weight:700;color:#374151;',
    totTdR:  'padding:4px 6px;border:1px solid #e5e7eb;font-weight:700;text-align:right;color:#111;',
    crRow:   'background:#f9fafb;',
    crTd:    'padding:2px 6px 4px 6px;border:1px solid #e5e7eb;',
    crUl:    'margin:0;padding-left:14px;',
    crLi:    'font-size:9px;color:#4b5563;',
    pfSect:  'margin-bottom:12px;',
    pfHead:  'font-size:10px;font-weight:700;color:#374151;margin:0 0 4px 0;',
    kwList:  'display:flex;flex-wrap:wrap;gap:4px;',
    kwBadge: 'font-size:9px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:4px;padding:2px 6px;',
    bloom:   'font-size:8px;color:#6b7280;margin-left:3px;',
  }

  // ── EC berekening ────────────────────────────────────────────────────────
  const somEc = module.leeruitkomsten.reduce((acc, lu) => acc + (lu.ec ?? 0), 0)
  const ec = somEc > 0 ? somEc : (module.naam.match(/\((\d+)\s*EC\)/i)?.[1] ?? null)

  // ── Leeruitkomsten HTML ──────────────────────────────────────────────────
  function renderLijst(items, label) {
    if (!items?.length) return ''
    return `<p style="${s.fieldLbl}">${esc(label)}</p>
      <ul style="${s.bullets}">
        ${items.map(v => `<li style="${s.li}">${esc(v)}</li>`).join('')}
      </ul>`
  }

  function renderToetsmatrijs(tm) {
    if (!tm?.length) return ''
    const totaal = tm.flatMap(o => o.categorieen ?? []).reduce((sum, c) => sum + (c.punten ?? 0), 0)
    const rijen = tm.flatMap(onderdeel => {
      const rows = [`<tr style="${s.secRow}"><td colspan="2" style="${s.secTd}">${esc(onderdeel.onderdeel)}</td></tr>`]
      for (const cat of (onderdeel.categorieen ?? [])) {
        rows.push(`<tr><td style="${s.td}">${esc(cat.omschrijving)}</td><td style="${s.tdR}">${cat.punten ?? 0}</td></tr>`)
        if (cat.criteria?.length) {
          rows.push(`<tr style="${s.crRow}"><td colspan="2" style="${s.crTd}">
            <ul style="${s.crUl}">
              ${cat.criteria.map(c => `<li style="${s.crLi}">${esc(c)}</li>`).join('')}
            </ul></td></tr>`)
        }
      }
      return rows
    }).join('')

    return `<p style="${s.fieldLbl}">Toetsmatrijs</p>
      <table style="${s.table}">
        <thead><tr>
          <th style="${s.thL}">Toetsonderdeel / omschrijving</th>
          <th style="${s.thR}">Max. punten</th>
        </tr></thead>
        <tbody>
          ${rijen}
          <tr style="${s.totRow}">
            <td style="${s.totTd}">Totaal</td>
            <td style="${s.totTdR}">${totaal}</td>
          </tr>
        </tbody>
      </table>`
  }

  const luHtml = module.leeruitkomsten.map(lu => `
    <div style="${s.lu}">
      <div style="${s.luHead}">
        <span style="${s.luNaam}">${esc(lu.naam)}</span>
        ${lu.ec ? `<span style="${s.luEc}">${lu.ec} EC</span>` : ''}
      </div>
      ${lu.omschrijving ? `<p style="${s.omschr}">${esc(lu.omschrijving)}</p>` : ''}
      ${renderLijst(lu.eindkwalificaties, 'Eindkwalificaties')}
      ${renderLijst(lu.deelstappen, 'Deelstappen')}
      ${renderLijst(lu.kennis_vaardigheden, 'Kennis & vaardigheden')}
      ${renderLijst(lu.modellen_theorieen, 'Modellen & theorieën')}
      ${lu.beroepscontext ? `<p style="${s.fieldLbl}">Beroepscontext</p><p style="${s.omschr}">${esc(lu.beroepscontext)}</p>` : ''}
      ${renderToetsmatrijs(lu.toetsmatrijs)}
    </div>`).join('')

  // ── Keywords HTML ────────────────────────────────────────────────────────
  const kwHtml = pfs.map(pf => `
    <div style="${s.pfSect}">
      <p style="${s.pfHead}">${esc(pf.label)}</p>
      <div style="${s.kwList}">
        ${(kwPerPf[pf.id] ?? []).map(kw => `
          <span style="${s.kwBadge}">
            ${esc(kw.naam)}${kw.bloom ? `<span style="${s.bloom}">${BLOOM_LABELS[kw.bloom] ?? `Niveau ${kw.bloom}`}</span>` : ''}
          </span>`).join('')}
      </div>
    </div>`).join('')

  return `
    <div style="${s.page}">
      <div style="${s.header}">
        <div>
          <p style="${s.subhead}">Modulebeschrijving · ${esc(periodeLabel)}</p>
          <h1 style="${s.h1}">${esc(module.naam)}</h1>
        </div>
        ${ec ? `<div><span style="${s.ec}">${ec}</span><span style="${s.ecLabel}">EC</span></div>` : ''}
      </div>

      <div style="${s.section}">
        <h2 style="${s.h2}">Leeruitkomsten</h2>
        ${luHtml}
      </div>

      ${pfs.length ? `
        <div style="${s.section}">
          <h2 style="${s.h2}">Onderwerpen per portefeuille</h2>
          ${kwHtml}
        </div>` : ''}
    </div>`
}

/**
 * Genereert een PDF voor één module als base64-string.
 */
async function generateModulePdf(module, keywords, portefeuilles) {
  // Tijdelijk verborgen container in de DOM
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;top:0;left:-9999px;z-index:-1;'
  container.innerHTML = buildModuleHtml(module, keywords, portefeuilles)
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container.firstElementChild, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    // A4 in mm: 210 × 297. Bereken hoogte op basis van breedte.
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width

    // Meerdere pagina's als de inhoud langer is dan één A4
    let y = 0
    while (y < imgH) {
      if (y > 0) pdf.addPage()
      pdf.addImage(canvas, 'PNG', 0, -y, imgW, imgH)
      y += pageH
    }

    return pdf.output('datauristring').split(',')[1] // pure base64
  } finally {
    document.body.removeChild(container)
  }
}

/**
 * Genereert PDFs voor alle modules in de store.
 * Geeft een array van { filename, base64 } terug.
 * `onProgress(current, total, naam)` wordt aangeroepen per gegenereerde module.
 */
export async function generateAllModulePdfs(modules, keywords, portefeuilles, periodes, onProgress) {
  const results = []

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i]
    const periode = periodes.find(p => p.id === mod.periode)
    const moduleWithLabel = { ...mod, periodeLabel: periode?.label ?? mod.periode }

    if (onProgress) onProgress(i + 1, modules.length, mod.naam)

    const base64 = await generateModulePdf(moduleWithLabel, keywords, portefeuilles)
    const filename = `pdf/${mod.id}.pdf`
    results.push({ filename, base64 })
  }

  return results
}
