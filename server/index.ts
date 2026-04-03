import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is not set. Add it to your .env file.");
  process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

const systemPrompt = `You are an expert medical prescription analyzer. Your task is to analyze handwritten prescriptions and extract medication information.

For each prescription image, extract:
1. All medications mentioned (correct drug names with 100% accuracy)
2. Dosage for each medication
3. Frequency (e.g., TDS = three times daily, BD = twice daily, OD = once daily, SOS = as needed)
4. Duration of treatment
5. Special instructions

Common medical abbreviations:
- TDS/TID: Three times daily
- BD/BID: Twice daily  
- OD: Once daily
- SOS/PRN: As needed
- AC: Before meals
- PC: After meals
- HS: At bedtime
- Tab: Tablet
- Cap: Capsule
- Syr: Syrup
- Inj: Injection

Return your response as a JSON object with this exact structure:
{
  "rawText": "The raw text you can read from the prescription",
  "medications": [
    {
      "name": "Medication name with strength",
      "dosage": "Amount per dose",
      "frequency": "How often (expanded from abbreviation)",
      "duration": "How long to take (if specified)",
      "instructions": "Special instructions"
    }
  ],
  "additionalNotes": "Any other important notes or warnings from the prescription"
}

Be thorough but only include information you can clearly identify. If something is unclear, mention it in the instructions field.`;

// Analyze prescription via base64 image
app.post("/api/analyze", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "No image provided" });
    }

    // Extract mime type and base64 data
    const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt + "\n\nPlease analyze this handwritten prescription image and extract all medication information." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      parsed = JSON.parse(jsonMatch[1] || content);
    } catch {
      parsed = {
        rawText: content,
        medications: [],
        additionalNotes: "Unable to parse prescription. The handwriting may be unclear.",
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze prescription" });
  }
});

// Analyze via file upload
app.post("/api/analyze-upload", upload.single("image"), async (req: express.Request, res: express.Response) => {
  try {
    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const mimeType = file.mimetype;
    const base64Data = file.buffer.toString("base64");

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt + "\n\nPlease analyze this handwritten prescription image and extract all medication information." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.1,
    });

    const content = completion.choices[0]?.message?.content;
    let parsed;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      parsed = JSON.parse(jsonMatch[1] || content);
    } catch {
      parsed = {
        rawText: content,
        medications: [],
        additionalNotes: "Unable to parse prescription.",
      };
    }

    res.json(parsed);
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze prescription" });
  }
});

// Serve static files in production (only if not running on Vercel)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(import.meta.dirname, "../dist")));
  app.get("*", (_, res) => {
    res.sendFile(path.join(import.meta.dirname, "../dist/index.html"));
  });
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🏥 Prescription Recognition API running on http://localhost:${PORT}`);
  });
}

export default app;
