/**
 * Decodes base64 encoded audio data
 */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * Decodes audio data into an AudioBuffer
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const buffer = ctx.createBuffer(numChannels, data.length / 2 / numChannels, sampleRate)

  const dataInt16 = new Int16Array(data.buffer)
  const l = dataInt16.length
  const dataFloat32 = new Float32Array(l)

  for (let i = 0; i < l; i++) {
    dataFloat32[i] = dataInt16[i] / 32768.0
  }

  // Extract interleaved channels (LitElement reference logic)
  if (numChannels === 1) {
    buffer.copyToChannel(dataFloat32, 0)
  } else {
    for (let i = 0; i < numChannels; i++) {
      const channel = dataFloat32.filter((_, index) => index % numChannels === i)
      buffer.copyToChannel(channel, i)
    }
  }

  return buffer
}

/**
 * Throttles a function to be called at most once per delay period
 */
export function throttle<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    const timeSinceLastCall = now - lastCall

    if (timeSinceLastCall >= delay) {
      func(...args)
      lastCall = now
    }
  }
}
