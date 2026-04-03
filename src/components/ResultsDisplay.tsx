import { FileText, Pill, Clock, AlertCircle, Copy, Check } from "lucide-react";
import { useState } from "react";

interface MedicationItem {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface ResultsDisplayProps {
  rawText: string;
  medications: MedicationItem[];
  additionalNotes?: string;
}

export function ResultsDisplay({ rawText, medications, additionalNotes }: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = [
      "=== Extracted Prescription ===", "",
      "Medications:",
      ...medications.map((m, i) => `${i + 1}. ${m.name}${m.dosage ? ` - ${m.dosage}` : ""}${m.frequency ? ` - ${m.frequency}` : ""}${m.duration ? ` for ${m.duration}` : ""}`),
      "", additionalNotes ? `Notes: ${additionalNotes}` : "", "", "Raw Text:", rawText,
    ].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Prescription Analysis</h2>
            <p className="text-sm text-muted-foreground">{medications.length} medication{medications.length !== 1 ? "s" : ""} detected</p>
          </div>
        </div>
        <button onClick={handleCopy} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-hero text-white text-sm font-medium shadow-soft hover:shadow-elevated transition-all">
          {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy All</>}
        </button>
      </div>

      <div className="space-y-4">
        {medications.map((med, index) => (
          <div key={index} className="p-5 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{med.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {med.dosage && <div className="text-muted-foreground"><span className="font-medium text-foreground">Dosage:</span> {med.dosage}</div>}
                  {med.frequency && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4 text-primary" />{med.frequency}</div>}
                  {med.duration && <div className="text-muted-foreground"><span className="font-medium text-foreground">Duration:</span> {med.duration}</div>}
                </div>
                {med.instructions && <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{med.instructions}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {additionalNotes && (
        <div className="p-5 rounded-xl bg-accent/50 border border-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Additional Notes</h4>
              <p className="text-sm text-muted-foreground">{additionalNotes}</p>
            </div>
          </div>
        </div>
      )}

      <details className="group">
        <summary className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          View raw extracted text <span className="text-xs">(click to expand)</span>
        </summary>
        <div className="mt-3 p-4 rounded-xl bg-muted/50 border border-border">
          <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">{rawText}</pre>
        </div>
      </details>
    </div>
  );
}
