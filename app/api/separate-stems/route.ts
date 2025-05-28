import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

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
  return new Promise<{ file: formidable.File }>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ file: files.file as formidable.File })
    })
  })
}

export async function POST(req: Request) {
  try {
    // Parse the uploaded file
    const { file } = await parseFormData(req)
    const inputPath = file.filepath
    const outputDir = path.join(os.tmpdir(), `spleeter_output_${Date.now()}`)
    await fs.mkdir(outputDir, { recursive: true })

    // Run Spleeter (2 stems: vocals + accompaniment)
    await new Promise((resolve, reject) => {
      const spleeter = spawn('spleeter', [
        'separate',
        '-p', 'spleeter:2stems',
        '-o', outputDir,
        inputPath,
      ])
      spleeter.on('close', (code) => {
        if (code === 0) resolve(true)
        else reject(new Error('Spleeter failed'))
      })
      spleeter.on('error', reject)
    })

    // Find the output files (vocals.wav, accompaniment.wav)
    const baseName = path.basename(inputPath, path.extname(inputPath))
    const vocalsPath = path.join(outputDir, baseName, 'vocals.wav')
    const accompPath = path.join(outputDir, baseName, 'accompaniment.wav')
    const vocals = await fs.readFile(vocalsPath)
    const accompaniment = await fs.readFile(accompPath)

    // Clean up temp files (optional)
    await fs.unlink(inputPath).catch(() => {})
    await fs.rm(outputDir, { recursive: true, force: true }).catch(() => {})

    // Return as base64 blobs
    return NextResponse.json({
      vocals: Buffer.from(vocals).toString('base64'),
      accompaniment: Buffer.from(accompaniment).toString('base64'),
      vocalsFilename: 'vocals.wav',
      accompanimentFilename: 'accompaniment.wav',
    })
  } catch (error) {
    console.error('Stem separation error:', error)
    return NextResponse.json({ error: 'Failed to separate stems' }, { status: 500 })
  }
} 