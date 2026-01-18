import Handlebars from 'handlebars'
import fs from 'fs/promises'
import path from 'path'
import pdf from 'html-pdf-node'

export async function renderPdf(
  templateName: string,
) {
    console.log('render pdf')
    const data = {
    studentName: 'Jan Novák',
    className: '3.A',
    issuedAt: '18.1.2026',
    subjects: [
        { name: 'Matematika', grade: '1' },
        { name: 'Český jazyk', grade: '2' }
    ]
    }



  const templatePath = path.join(
    __dirname,
    'templates',
    `${templateName}.html`
  )

  const cssPath = path.join(__dirname, 'styles', 'print.css')

  const [html, css] = await Promise.all([
    fs.readFile(templatePath, 'utf8'),
    fs.readFile(cssPath, 'utf8')
  ])
    const compiled = Handlebars.compile(html)
    const content = compiled(data)
    console.log('after compiled')

    const file = { content }
    const pdfBuffer = await pdf.generatePdf(file, { format: 'A4' })

  return pdfBuffer
}