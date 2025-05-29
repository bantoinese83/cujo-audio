import { NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import os from 'os'
import fetch from 'node-fetch'
import FormData from 'form-data'
import AdmZip from 'adm-zip'

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper to parse multipart/form-data (file upload)
async function parseFormData(req: Request) {
  const formidable = (await import('formidable')).default
  const form = formidable({ multiples: false, uploadDir: os.tmpdir(), keepExtensions: true })
  return new Promise<{ file: any; fields: any }>((resolve, reject) => {
    form.parse(req as any, (err: any, fields: any, files: any) => {
      if (err) {
        return reject(err)
      }
      resolve({ file: files.file, fields })
    })
  })
}

const STEM_MODELS: Record<number, string> = {
  2: 'spleeter:2stems',
  4: 'spleeter:4stems',
  5: 'spleeter:5stems',
}

// TODO: Set the correct Spleeter API URL after deployment, e.g. 'https://your-spleeter-api.onrender.com'
const SPLEETER_API_URL = process.env.SPLEETER_API_URL || 'https://spleeter-api-server-latest.onrender.com'

export async function POST(req: Request) {
  try {
    // Parse the uploaded file and fields
    const formData = new FormData()
    const { file, fields } = await parseFormData(req)
    formData.append('file', file.filepath ? createReadStream(file.filepath) : file, file.originalFilename || 'audio.wav')
    formData.append('stems', fields.stems || '2')

    // 1. Upload to Spleeter API
    const uploadRes = await fetch(`${SPLEETER_API_URL}/seperate`, {
      method: 'POST',
      body: formData as any,
    })
    if (!uploadRes.ok) {
      throw new Error('Failed to upload to Spleeter API')
    }
    const { id } = await uploadRes.json() as { id: string }

    // 2. Poll status
    let status = 1, url = ''
    for (let i = 0; i < 60; i++) {
      const statusRes = await fetch(`${SPLEETER_API_URL}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const statusJson = await statusRes.json() as { status: number, url: string }
      status = statusJson.status
      url = statusJson.url
      if (status === 0 && url) {
        break
      }
      await new Promise(r => setTimeout(r, 2000))
    }
    if (status !== 0 || !url) {
      throw new Error('Spleeter API did not finish in time')
    }

    // 3. Download zip
    const zipRes = await fetch(`${SPLEETER_API_URL}${url}`)
    if (!zipRes.ok) {
      throw new Error('Failed to download stems zip')
    }
    const zipBuffer = await zipRes.buffer()
    const zip = new AdmZip(zipBuffer)
    const stemsData: Record<string, { data: string; filename: string }> = {}
    zip.getEntries().forEach(entry => {
      if (entry.entryName.endsWith('.wav')) {
        stemsData[entry.entryName.replace('.wav', '')] = {
          data: entry.getData().toString('base64'),
          filename: entry.entryName,
        }
      }
    })
    return NextResponse.json({ stems: stemsData })
  } catch (error) {
    console.error('Stem separation error:', error)
    return NextResponse.json({ error: 'Failed to separate stems' }, { status: 500 })
  }
} 