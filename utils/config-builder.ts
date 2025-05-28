/**
 * Builder pattern for music generation configuration
 * Provides a fluent interface for creating and modifying configuration objects
 */
export class MusicConfigBuilder {
  private config: Record<string, any> = {}

  /**
   * Creates a default configuration
   */
  static defaultConfig() {
    return {
      temperature: 1.1,
      topK: 40,
      guidance: 4.0,
    }
  }

  /**
   * Creates a builder from an existing config
   */
  static fromConfig(config: Record<string, any>) {
    const builder = new MusicConfigBuilder()
    builder.config = { ...config }
    return builder
  }

  /**
   * Sets the temperature parameter
   * Controls randomness (0.0 to 3.0)
   */
  withTemperature(temperature: number) {
    this.config.temperature = temperature
    return this
  }

  /**
   * Sets the topK parameter
   * Controls diversity (1 to 100)
   */
  withTopK(topK: number) {
    this.config.topK = topK
    return this
  }

  /**
   * Sets the guidance parameter
   * Controls how strictly the model follows prompts (0.0 to 6.0)
   */
  withGuidance(guidance: number) {
    this.config.guidance = guidance
    return this
  }

  /**
   * Sets the BPM (beats per minute)
   * Range: 60 to 200
   */
  withBpm(bpm?: number) {
    this.config.bpm = bpm
    return this
  }

  /**
   * Sets the density parameter
   * Controls note density (0.0 to 1.0)
   */
  withDensity(density?: number) {
    this.config.density = density
    return this
  }

  /**
   * Sets the brightness parameter
   * Controls tonal quality (0.0 to 1.0)
   */
  withBrightness(brightness?: number) {
    this.config.brightness = brightness
    return this
  }

  /**
   * Sets the musical scale
   * Uses enum values like "C_MAJOR_A_MINOR"
   */
  withScale(scale?: string) {
    this.config.scale = scale
    return this
  }

  /**
   * Sets the random seed
   * For reproducible generation
   */
  withSeed(seed?: number) {
    this.config.seed = seed
    return this
  }

  /**
   * Sets whether to mute bass
   */
  withMuteBass(muteBass?: boolean) {
    this.config.muteBass = muteBass
    return this
  }

  /**
   * Sets whether to mute drums
   */
  withMuteDrums(muteDrums?: boolean) {
    this.config.muteDrums = muteDrums
    return this
  }

  /**
   * Sets whether to only include bass and drums
   */
  withOnlyBassAndDrums(onlyBassAndDrums?: boolean) {
    this.config.onlyBassAndDrums = onlyBassAndDrums
    return this
  }

  /**
   * Sets the music generation mode
   * "QUALITY" or "DIVERSITY"
   */
  withMusicGenerationMode(mode?: "QUALITY" | "DIVERSITY") {
    this.config.musicGenerationMode = mode
    return this
  }

  /**
   * Applies multiple updates at once from a partial config object
   */
  applyUpdates(updates: Record<string, any>) {
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        return
      }

      this.config[key] = value
    })

    return this
  }

  /**
   * Builds the final configuration object
   */
  build() {
    return { ...this.config }
  }
}
