import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

async function listModels() {
  try {
    const models = await groq.models.list();
    console.log(JSON.stringify(models, null, 2));
  } catch (error) {
    console.error(error);
  }
}

listModels();
