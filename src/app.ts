import express, { Application, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fetch } from 'bun';
import { config } from 'dotenv';
import { generateText } from './api/textGeneration';

config();

interface InputData {
  prompt: string;
  prefixPrompt: string;
}

interface GenerationResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

const app: Application = express();
app.use(express.json());

// Utility function to ensure output directories exist
async function ensureDirectories() {
  const dirs = ['output', 'output/audio', 'output/video', 'output/final'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
  }
}
ensureDirectories()

// Main processing function
async function processGeneration(inputData: InputData): Promise<GenerationResult> {
  try {
    // Combine the prompts
    const finalPrompt = `${inputData.prefixPrompt}: ${inputData.prompt}`;
    
    // Generate text using combined prompt
    const textResult = await generateText(finalPrompt);
    // TODO: Implement text parsing logic to separate audio script from video configuration
    const { audioScript, videoConfig } = parseTextResult(textResult);

    // 2. Generate audio from parsed text
    const audioResult = await generateAudio(audioScript);
    // TODO: Add error handling for audio generation

    // 3. Generate base video using Hedra
    const videoResult = await generateVideo({
      audioPath: audioResult.audioPath,
      // Add other necessary parameters
    });
    // TODO: Add error handling for video generation

    // 4. Compile final video with Remotion
    const finalVideo = await renderFinalVideo({
      baseVideoPath: videoResult.videoPath,
      audioPath: audioResult.audioPath,
      configuration: videoConfig,
      // Add other necessary parameters
    });

    return {
      success: true,
      outputPath: finalVideo.outputPath
    };
  } catch (error) {
    console.error('Generation process failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// here's where we fill input in and sheit
const exampleInput: InputData = {
  prompt: "Or Bosnia",
  prefixPrompt: "Croatia"
};

processGeneration(exampleInput).then(result => console.log(result));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});