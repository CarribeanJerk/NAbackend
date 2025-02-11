import express, { Application, Request, Response } from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { config } from 'dotenv';
import { generateText } from './api/textGeneration';
import { generateVideo } from './api/videoGeneration';

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

// Util function for dirs
async function ensureDirectories() {
  const dirs = ['output', 'output/video', 'output/final'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(process.cwd(), dir), { recursive: true });
  }
}
ensureDirectories()

// here's where we fill input in and sheit
const Input: InputData = {
  prompt: "noah solomon goes on killing rampage against innocents at water park",
  prefixPrompt: `Please give me a nightly news report monologue between 150-165 words, 
  make it totally serious with no jokes, but use a lot of swearing and random words like "fuckers",
  "simp" (make sure to use these slang words properly if at all), "gay", "cringe", "mega cringe", etc.
  However, don't overuse these terms, use at most 1 per sentence, and please stay mostly descriptive and news-like
  in tone; the humorous contrast will come by way of the script being generally unemotional and stately, save the
  random use of language and slang terms. Please use your knowledge of internet terms to get creative and use terms
  properly in context, in ways that make sense based on their definitions and the situation that the script calls for.
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
    
    // Slicin and dicin
    [finalScript, Headline_0, Headline_1, Headline_2] = textResult.split('&').map(segment => segment.trim());

    if (!finalScript || !Headline_0 || !Headline_1 || !Headline_2) {
      throw new Error('Text generation result missing required segments');
    }
    
    const videoResult = await generateVideo();

    const finalVideo = await renderFinalVideo({
      baseVideoPath: videoResult.videoPath,
      audioPath: audioResult.audioPath,
      configuration: videoConfig,
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