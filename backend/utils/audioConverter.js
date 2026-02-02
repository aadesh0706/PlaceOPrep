const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

async function convertAudioToWav(audioBuffer) {
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.webm`);
  const outputPath = path.join(tempDir, `output_${Date.now()}.wav`);

  try {
    // Write input file
    await fs.writeFile(inputPath, audioBuffer);

    // Try ffmpeg first (most reliable)
    try {
      await execAsync(`ffmpeg -i "${inputPath}" -ar 16000 -ac 1 -f wav "${outputPath}"`);
    } catch(ffmpegErr) {
      // Fallback: try simple file copy if already in compatible format
      console.warn('[AudioConverter] ffmpeg failed, using raw buffer');
      await fs.unlink(inputPath).catch(() => {});
      return audioBuffer;
    }

    // Read converted file
    const wavBuffer = await fs.readFile(outputPath);

    // Cleanup
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    return wavBuffer;
  } catch(err) {
    console.error('[AudioConverter] Error:', err.message);
    // Cleanup on error
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
    // Return original buffer as fallback
    return audioBuffer;
  }
}

module.exports = { convertAudioToWav };
