import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { finalScript } from '../app';
import { promises as fs } from 'fs';

export async function generateVideo(): Promise<{ videoPath: string }> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'hedra-api-starter/main.py');
    const outputDir = path.join(process.cwd(), 'output', 'video');
    
    const pythonProcess: ChildProcess = spawn('python3', [
      pythonScript,
      '--api-key', process.env.HEDRA_API_KEY || '',
      '--audio-text', finalScript,
      '--ar', '16:9',
      '--voice-id', 'nPczCjzI2devNBz1zQrb',
      '--img', 'assets/bob.png'
    ]);

    let jobId = '';

    pythonProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      console.log(`Python output: ${output}`);
      
      // Capture the job ID from Python's output
      if (output.includes('.mp4')) {
        jobId = output.trim().split('.mp4')[0];
      }
    });

    pythonProcess.stderr?.on('data', (data: Buffer) => {
      console.error(`Python error: ${data}`);
    });

    pythonProcess.on('close', async (code: number) => {
      if (code === 0) {
        try {
          // Move the generated video to output directory
          const sourceVideo = path.join(process.cwd(), `${jobId}.mp4`);
          const targetVideo = path.join(outputDir, `${jobId}.mp4`);
          await fs.rename(sourceVideo, targetVideo);
          resolve({ videoPath: targetVideo });
        } catch (error) {
          reject(new Error(`Failed to move video file: ${error}`));
        }
      } else {
        reject(new Error(`Python process exited with code ${code}`));
      }
    });
  });
}