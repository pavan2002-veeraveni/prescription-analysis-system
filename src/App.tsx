import { useState, useCallback } from "react";
import { HeroSection } from "./components/HeroSection";
import { UploadZone } from "./components/UploadZone";
import { ProcessingState } from "./components/ProcessingState";
import { ResultsDisplay } from "./components/ResultsDisplay";

type AppState = "idle" | "processing" | "results";

interface MedicationItem {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface AnalysisResult {
  rawText: string;
  medications: MedicationItem[];
  additionalNotes?: string;
}

export default function App() {
  const [state, setState] = useState<AppState>("idle");
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const analyzePrescription = useCallback(async (file: File) => {
    setState("processing");
    setProcessingStep(0);
    setError(null);

    try {
      setProcessingStep(0);
      const imageBase64 = await fileToBase64(file);

      setProcessingStep(1);
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to analyze prescription");
      }

      const data = await response.json();
      setProcessingStep(2);

      setResult({
        rawText: data.rawText || "Unable to extract raw text",
        medications: data.medications || [],
        additionalNotes: data.additionalNotes,
      });
      setState("results");
    } catch (err) {
      console.error("Analysis error:", err);
      setState("idle");
      setError(err instanceof Error ? err.message : "Unable to process the prescription.");
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setProcessingStep(0);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-glow opacity-30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-glow opacity-20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {state === "idle" && (
          <div className="animate-fade-in">
            <HeroSection />
            <UploadZone onFileSelect={analyzePrescription} />
          </div>
        )}

        {state === "processing" && (
          <ProcessingState currentStep={processingStep} />
        )}

        {state === "results" && result && (
          <div className="space-y-8">
            <ResultsDisplay
              rawText={result.rawText}
              medications={result.medications}
              additionalNotes={result.additionalNotes}
            />
            <div className="flex justify-center">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-hero text-white font-medium shadow-soft hover:shadow-elevated transition-all"
              >
                ↻ Analyze Another Prescription
              </button>
            </div>
          </div>
        )}

        <footer className="mt-20 text-center">
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This tool is for assistance only. Always verify with a healthcare professional.
          </p>
        </footer>
      </div>
    </main>
  );
}
