import express, { Application, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
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

interface ParsedSegments {
  finalScript: string;
  Headline_0: string;
  Headline_1: string;
  Headline_2: string;
}

const app: Application = express();
app.use(express.json());

// Utility function to ensure output directories exist
async function ensureDirectories() {
  const dirs = ['output', 'output/video', 'output/final'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
  }
}
ensureDirectories()

// here's where we fill input in and sheit
const Input: InputData = {
  prompt: "noah solomon is a dastardly crypto scammer and he also fucks men",
  prefixPrompt: `Please give me a nightly news report monologue between 150-165 words, 
  make it totally serious with no jokes, but use a lot of swearing and random words like "fuckers",
  "simp" (make sure to use these slang words properly if at all), "gay", "cringe", "mega cringe", "jeets", etc.
  make it about the following user input, and generate me three short (between 3 and 7 words) headlines that
  one might flash on the screen of a news channel related to the user input, use the same language and tone
  as the main script, and please make sure the output is formatted like so; the main text- ONLY the script with 
  no labels, & sign in between the main text and the first headline, and an & sign soley seperating each headline 
  thereafter. It is very important you return the result this way. Ok, here is the user input material: `
};

processGeneration(Input).then(result => console.log(result));

// Main processing function
async function processGeneration(inputData: InputData): Promise<GenerationResult> {
  try {
    const finalPrompt = `${inputData.prefixPrompt}: ${inputData.prompt}`;
    const textResult = await generateText(finalPrompt);
    
    // Update the exported variables
    [finalScript, Headline_0, Headline_1, Headline_2] = textResult.split('&').map(segment => segment.trim());
    
    // Create the segments object
    const parsedSegments: ParsedSegments = {
      finalScript,
      Headline_0,
      Headline_1,
      Headline_2
    };

    if (!finalScript || !Headline_0 || !Headline_1 || !Headline_2) {
      throw new Error('Text generation result missing required segments');
    }

    // Debug log to verify parsing
    console.log({
      finalScript,
      Headline_0,
      Headline_1,
      Headline_2
    });
    

    // 3. Generate base video using Hedra
    const videoResult = await generateVideo({
     
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


// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export let finalScript: string = '{finalScript}';
export let Headline_0: string = '';
export let Headline_1: string = '';
export let Headline_2: string = '';