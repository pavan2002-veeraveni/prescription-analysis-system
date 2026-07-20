import os
import re
import json
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

load_dotenv()

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("[ERROR] GEMINI_API_KEY is not set. Add it to your .env file.")
    exit(1)

PORT = int(os.getenv("PORT", 3001))

client = genai.Client(api_key=GEMINI_API_KEY)
MODEL = "gemini-2.5-flash"

SYSTEM_PROMPT = """You are an expert medical prescription analyzer. Your task is to analyze handwritten prescriptions and extract medication information.

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

Be thorough but only include information you can clearly identify. If something is unclear, mention it in the instructions field.
IMPORTANT: Return ONLY the JSON object. No markdown fences, no explanations, no extra text."""


def parse_response(content: str) -> dict | None:
    """Parse JSON from Gemini response."""
    # Try markdown code blocks first
    json_match = re.search(r"```json\s*([\s\S]*?)\s*```", content)
    if not json_match:
        json_match = re.search(r"```\s*([\s\S]*?)\s*```", content)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    # Try direct JSON parse
    try:
        return json.loads(content.strip())
    except json.JSONDecodeError:
        pass

    # Find first { to last }
    first = content.find("{")
    last = content.rfind("}")
    if first != -1 and last > first:
        try:
            return json.loads(content[first:last + 1])
        except json.JSONDecodeError:
            pass

    return None


def analyze_image(mime_type: str, base64_data: str) -> dict:
    """Send image to Gemini and return parsed results."""
    response = client.models.generate_content(
        model=MODEL,
        contents=[
            SYSTEM_PROMPT + "\n\nPlease analyze this handwritten prescription image and extract all medication information.",
            {
                "inline_data": {
                    "mime_type": mime_type,
                    "data": base64_data,
                }
            },
        ],
    )

    content = response.text
    if not content:
        raise ValueError("No response from AI")

    parsed = parse_response(content)
    if parsed:
        return parsed

    return {
        "rawText": content,
        "medications": [],
        "additionalNotes": "Unable to parse prescription. The handwriting may be unclear.",
    }


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """Analyze prescription via base64 image in JSON body."""
    try:
        data = request.get_json()
        if not data or "imageBase64" not in data:
            return jsonify({"error": "No image provided"}), 400

        image_base64 = data["imageBase64"]

        match = re.match(r"^data:(image/\w+);base64,(.+)$", image_base64, re.DOTALL)
        if not match:
            return jsonify({"error": "Invalid image format"}), 400

        mime_type = match.group(1)
        base64_data = match.group(2)

        result = analyze_image(mime_type, base64_data)
        return jsonify(result)

    except Exception as e:
        print(f"[ERROR] Analysis failed: {e}")
        return jsonify({"error": str(e) or "Failed to analyze prescription"}), 500


@app.route("/api/analyze-upload", methods=["POST"])
def analyze_upload():
    """Analyze prescription via file upload."""
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file uploaded"}), 400

        file = request.files["image"]
        mime_type = file.mimetype
        base64_data = base64.b64encode(file.read()).decode("utf-8")

        result = analyze_image(mime_type, base64_data)
        return jsonify(result)

    except Exception as e:
        print(f"[ERROR] Analysis failed: {e}")
        return jsonify({"error": str(e) or "Failed to analyze prescription"}), 500


if __name__ == "__main__":
    print(f"Prescription Recognition API running on http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=True)
