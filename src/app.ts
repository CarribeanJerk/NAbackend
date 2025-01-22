import express, { Application, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

// Import your API handlers (to be created)
import { generateText } from './api/textGeneration';
import { generateAudio } from './api/audioGeneration';
import { generateVideo } from './api/videoGeneration';
import { renderFinalVideo } from './api/remotionRender';

// Types for your data flow (adjust based on your needs)
interface InputData {
  // Define your input data structure
  prompt: string;
  // Add other configuration parameters
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

// Main processing function
async function processGeneration(inputData: InputData): Promise<GenerationResult> {
  try {
    // 1. Generate text from input
    const textResult = await generateText(inputData.prompt);
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

// Helper function to parse text generation result
function parseTextResult(textResult: string) {
  // TODO: Implement parsing logic to separate audio script from video configuration
  return {
    audioScript: '',
    videoConfig: {}
  };
}

// Main endpoint to handle generation requests
app.post('/generate', async (req: Request, res: Response) => {
  try {
    await ensureDirectories();
    
    const inputData: InputData = req.body;
    // TODO: Add input validation

    const result = await processGeneration(inputData);

    if (result.success) {
      res.json({ 
        success: true, 
        outputPath: result.outputPath 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});