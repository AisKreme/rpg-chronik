import html2pdf from 'html2pdf.js'

export async function exportPageAsPDF(pageElement, filename = 'Seite.pdf') {
  if (!pageElement) return

  const opt = {
    margin:       0.5,
    filename:     filename,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  }

  await html2pdf().from(pageElement).set(opt).save()
}