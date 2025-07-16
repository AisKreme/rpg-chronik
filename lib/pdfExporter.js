import html2pdf from 'html2pdf.js'
import { jsPDF } from 'jspdf'
import { PDFDocument } from 'pdf-lib'

export async function exportPageAsPDF(el, filename = 'seite.pdf', entry = null) {
  if (!el) return

  // 🧱 1. DOM klonen
  const clone = el.cloneNode(true)
  clone.querySelectorAll('[data-flow-hidden]').forEach(el => {
    el.style.display = 'block'
    el.style.maxHeight = 'none'
    el.style.overflow = 'visible'
  })
  clone.querySelectorAll('*').forEach(el => {
    el.style.overflow = 'visible'
    el.style.maxHeight = 'none'
    el.style.height = 'auto'
  })

  // 🧱 2. Unsichtbar ins DOM
  const wrapper = document.createElement('div')
  wrapper.style.position = 'fixed'
  wrapper.style.left = '-9999px'
  wrapper.style.top = '0'
  wrapper.style.zIndex = '-1'
  wrapper.style.width = '794px' // A4-Breite bei 96 DPI
  wrapper.style.height = 'fit-content' // <- damit es die volle Höhe erhält
  wrapper.style.maxHeight = 'none'     // <- Sicherheitsnetz
  wrapper.style.overflow = 'visible'   // <- alles sichtbar
  wrapper.style.border = '2px dashed red'
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  // 🧾 3. HTML-Seite zu Blob-PDF rendern
  const blob = await html2pdf()
    .set({
       margin: 0.2,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
      scale: 2,      // bessere Qualität
      useCORS: true, // falls Bilder von extern kommen
      scrollX: 0,
      scrollY: 0,
      windowWidth: 794, // A4 Breite
    },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    })
    .from(clone)
    .outputPdf('blob')

  document.body.removeChild(wrapper)

  // 📜 4. Falls kein zusätzlicher Text: direkt speichern
  if (!entry) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    return
  }

  // 📝 5. Zweites PDF mit echtem Text erzeugen
  const textPDF = new jsPDF()
  const lineHeight = 8
  let y = 20

  textPDF.setFont('Times', 'normal')
  textPDF.setFontSize(12)

  textPDF.setTextColor(90, 60, 10)
  textPDF.setFontSize(16)
  textPDF.text('Kopierbarer Eintrag', 20, y)
  y += lineHeight + 4

  textPDF.setFontSize(12)
  textPDF.setTextColor(40, 40, 40)
  textPDF.text(`Kapitel: ${entry.kapitel || '-'}`, 20, y); y += lineHeight
  textPDF.text(`Ort: ${entry.ort || '-'}`, 20, y); y += lineHeight
  textPDF.text(`Datum: ${entry.date || '-'}`, 20, y); y += lineHeight

  y += 2
  textPDF.line(20, y, 190, y); y += lineHeight

  if (entry.note) {
    textPDF.setFont('Times', 'italic')
    textPDF.setTextColor(0, 0, 0)
    const lines = textPDF.splitTextToSize(`„${entry.note}“`, 170)
    textPDF.text(lines, 20, y)
    y += lines.length * lineHeight
  }

  if (entry.flow) {
    y += lineHeight
    textPDF.setFont('Times', 'normal')
    textPDF.setTextColor(80, 80, 80)
    textPDF.text('📄 Klartext:', 20, y); y += lineHeight
    const lines = textPDF.splitTextToSize(entry.flow, 170)
    textPDF.text(lines, 20, y)
  }

  const textBlob = textPDF.output('blob')

  // 🔗 6. Beide PDFs kombinieren mit pdf-lib
  const [pdf1Bytes, pdf2Bytes] = await Promise.all([
    blob.arrayBuffer(),
    textBlob.arrayBuffer(),
  ])

  const pdfDoc = await PDFDocument.create()
  const [pdf1, pdf2] = await Promise.all([
    PDFDocument.load(pdf1Bytes),
    PDFDocument.load(pdf2Bytes),
  ])

  const pages1 = await pdfDoc.copyPages(pdf1, pdf1.getPageIndices())
  pages1.forEach(p => pdfDoc.addPage(p))

  const pages2 = await pdfDoc.copyPages(pdf2, pdf2.getPageIndices())
  pages2.forEach(p => pdfDoc.addPage(p))

  const mergedPdf = await pdfDoc.save()

  // 💾 7. Herunterladen
  const blobFinal = new Blob([mergedPdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blobFinal)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}