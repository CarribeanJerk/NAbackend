import 'dotenv/config';
import fs, { appendFile } from 'fs';
import path from 'path';
import { Script } from 'app.ts';

const BASE_URL = "https://mercury.dev.dream-ai.com/api";
const HEDRA_API_KEY = process.env.HEDRA_API_KEY;

async function uploadImage(imageFileName: string): Promise<string> {
  const imagePath = path.join(process.cwd(), "public", imageFileName);
  if (!fs.existsSync(imagePath)) throw new Error(`Image not found: ${imagePath}`);

  const formData = new FormData();
  formData.append("file", new Blob([fs.readFileSync(imagePath)]));

  const response = await fetch(`${BASE_URL}/v1/portrait`, {
    method: "POST",
    headers: { "X-API-KEY": HEDRA_API_KEY! },
    body: formData,
  });

  if (!response.ok) throw new Error(`Image Upload Failed: ${response.statusText}`);
  const data = await response.json();
  return data.url; // Uploaded image URL
}

async function generateSpeech(script: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/v1/audio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": HEDRA_API_KEY!,
    },
    body: JSON.stringify({ text: script, voiceId: "XB0fDUnXU5powFXDhCwa" }), // Use available voice options
  });

  if (!response.ok) throw new Error(`Speech Generation Failed: ${response.statusText}`);
  const data = await response.json();
  return data.url; // URL of the generated speech audio
}

async function generateCharacterVideo(imageUrl: string, audioUrl: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/v1/characters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": HEDRA_API_KEY!,
    },
    body: JSON.stringify({
      avatarImage: imageUrl,
      audioSource: "audio", // "tts" for text-to-speech or "audio" for uploaded MP3
      voiceUrl: audioUrl,
      aspectRatio: "16:9", // Adjust if needed
    }),
  });

  if (!response.ok) throw new Error(`Video Generation Failed: ${response.statusText}`);
  const data = await response.json();
  return data.jobId; // Job ID for tracking
}

async function pollProjectStatus(projectId: string): Promise<string> {
  while (true) {
    console.log(`Checking status of project ${projectId}...`);
    
    const response = await fetch(`${BASE_URL}/v1/projects/${projectId}`, {
      method: "GET",
      headers: { "X-API-KEY": HEDRA_API_KEY! },
    });

    if (!response.ok) throw new Error(`Project Status Failed: ${response.statusText}`);
    const data = await response.json();

    if (data.status === "Completed") return data.videoUrl; // Final video URL
    if (data.status === "Failed") throw new Error("Video generation failed.");

    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before polling again
  }
}

async function main() {
  try {
    console.log("Uploading image...");
    const imageUrl = await uploadImage("starting_image.png");

    console.log("Generating speech from text...");
    const audioUrl = await generateSpeech("Hello, welcome to the AI news!");

    console.log("Generating character video...");
    const projectId = await generateCharacterVideo(imageUrl, audioUrl);

    console.log("Waiting for the video to be processed...");
    const videoUrl = await pollProjectStatus(projectId);

    console.log(`✅ Video Ready: ${videoUrl}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
