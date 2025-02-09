import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { config } from 'dotenv';

config();

async function getVoices(): Promise<void> {
  const pythonScript = path.join(__dirname, 'hedra-api-starter/get_voices.py');
  const pythonProcess: ChildProcess = spawn('python3', [
    pythonScript,
    '--api-key', process.env.HEDRA_API_KEY || ''
  ]);

  pythonProcess.stdout?.on('data', (data: Buffer) => {
    console.log(data.toString());
  });

  pythonProcess.stderr?.on('data', (data: Buffer) => {
    console.error(`Error: ${data}`);
  });
}

// Run if this is the main module
if (import.meta.main) {
  getVoices().catch(console.error);
} 