import { Scan, Brain, FileSearch } from "lucide-react";

const steps = [
  { icon: Scan, label: "Scanning image", description: "Detecting text regions" },
  { icon: Brain, label: "AI Processing", description: "Recognizing handwriting" },
  { icon: FileSearch, label: "Extracting data", description: "Identifying medications" },
];

export function ProcessingState({ currentStep = 1 }: { currentStep?: number }) {
  return (
    <div className="w-full max-w-md mx-auto py-12">
      <div className="text-center mb-8">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-hero opacity-20 animate-ping" />
          <div className="absolute inset-2 rounded-full bg-gradient-hero opacity-30 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-hero flex items-center justify-center">
            <Brain className="w-8 h-8 text-primary-foreground animate-pulse-soft" />
          </div>
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Analyzing Prescription</h2>
        <p className="text-muted-foreground">Our AI is reading the handwritten text...</p>
      </div>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          return (
            <div key={index} className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${isActive ? "bg-accent border border-primary shadow-soft" : isComplete ? "bg-card border border-border" : "bg-muted/30 border border-transparent"}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isActive ? "bg-gradient-hero" : isComplete ? "bg-secondary" : "bg-muted"}`}>
                <Icon className={`w-5 h-5 ${isActive || isComplete ? "text-primary-foreground" : "text-muted-foreground"} ${isActive ? "animate-pulse-soft" : ""}`} />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${isActive || isComplete ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {isComplete && (
                <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <svg className="w-4 h-4 text-secondary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
