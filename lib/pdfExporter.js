import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'

export async function exportPageAsPDF(el, filename = 'seite.pdf', entry = null, entryType = 'chronik') {
  if (!el) return

  // 🧼 1. Versteckte DOM-Bereiche sichtbar machen
  el.querySelectorAll('[data-flow-hidden]').forEach(e => {
    e.style.display = 'block'
    e.style.maxHeight = 'none'
    e.style.overflow = 'visible'
  })

  // 🖼 2. DOM-Screenshot mit voller Höhe
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight
  })

  const imgData = canvas.toDataURL('image/jpeg', 1.0)
  const imgProps = { width: canvas.width, height: canvas.height }
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const pxPerMm = imgProps.width / pageWidth
  const imgHeightMm = imgProps.height / pxPerMm

  if (imgHeightMm <= pageHeight) {
    pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeightMm)
  } else {
    let position = 0
    while (position < imgHeightMm) {
      pdf.addImage(imgData, 'JPEG', 0, -position, pageWidth, imgHeightMm)
      position += pageHeight
      if (position < imgHeightMm) pdf.addPage()
    }
  }

  // 📜 3. Nur Bildexport? → direkt speichern
  if (!entry) {
    pdf.save(filename)
    return
  }

  // 📄 4. Klartext-Teil
  const textPDF = new jsPDF()
  const margin = 20
  const lineHeight = 8
  const usableHeight = textPDF.internal.pageSize.height - margin * 2
  let y = margin

  textPDF.setFont('helvetica', 'normal')
  textPDF.setFontSize(16)
  textPDF.setTextColor(90, 60, 10)
  textPDF.text('Kopierbarer Eintrag', margin, y)
  y += lineHeight + 4

  textPDF.setFontSize(12)
  textPDF.setTextColor(40, 40, 40)

  switch (entryType) {
    case 'chronik':
      textPDF.text(`Kapitel: ${entry.kapitel || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Ort: ${entry.ort || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Datum: ${entry.date || '-'}`, margin, y); y += lineHeight
      y += 2
      textPDF.line(margin, y, 190, y); y += lineHeight

      if (entry.note) {
        textPDF.setFont('helvetica', 'italic')
        textPDF.setTextColor(0, 0, 0)
        const noteLines = textPDF.splitTextToSize(`„${entry.note}“`, 170)
        for (const line of noteLines) {
          if (y + lineHeight > usableHeight) { textPDF.addPage(); y = margin }
          textPDF.text(line, margin, y); y += lineHeight
        }
      }

      if (entry.flow) {
        y += lineHeight
        textPDF.setFont('helvetica', 'normal')
        textPDF.setTextColor(80, 80, 80)
        textPDF.text('Klartext:', margin, y); y += lineHeight
        const flowLines = textPDF.splitTextToSize(entry.flow.replace(/<[^>]+>/g, ''), 170)
        for (const line of flowLines) {
          if (y + lineHeight > usableHeight) { textPDF.addPage(); y = margin }
          textPDF.text(line, margin, y); y += lineHeight
        }
      }
      break

    case 'nsc':
      textPDF.text(`Name: ${entry.name || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Rolle: ${entry.rolle || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Info: ${entry.info || '-'}`, margin, y); y += lineHeight
      break

    case 'map':
      textPDF.text(`Titel: ${entry.titel || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Region: ${entry.region || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Beschreibung: ${entry.beschreibung || '-'}`, margin, y); y += lineHeight
      break

    case 'monster':
      textPDF.text(`Name: ${entry.name || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Gefährlichkeit: ${entry.gefährlichkeit || '-'}`, margin, y); y += lineHeight
      textPDF.text(`Beschreibung: ${entry.beschreibung || '-'}`, margin, y); y += lineHeight
      break

    default:
      textPDF.text('[Unbekannter Typ]', margin, y)
  }

  // 🔗 5. Zusammenführen von Bild- und Textteil
  const [pdf1Bytes, pdf2Bytes] = await Promise.all([
    pdf.output('arraybuffer'),
    textPDF.output('arraybuffer'),
  ])

  const mergedPDF = await PDFDocument.create()
  const [part1, part2] = await Promise.all([
    PDFDocument.load(pdf1Bytes),
    PDFDocument.load(pdf2Bytes),
  ])

  const pages1 = await mergedPDF.copyPages(part1, part1.getPageIndices())
  pages1.forEach(p => mergedPDF.addPage(p))
  const pages2 = await mergedPDF.copyPages(part2, part2.getPageIndices())
  pages2.forEach(p => mergedPDF.addPage(p))

  const finalBytes = await mergedPDF.save()
  const blob = new Blob([finalBytes], { type: 'application/pdf' })

  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}
