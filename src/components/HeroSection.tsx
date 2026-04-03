import { Stethoscope, Shield, Zap, FileText } from "lucide-react";

const features = [
  { icon: Zap, title: "Instant Recognition", description: "AI-powered analysis in seconds" },
  { icon: Shield, title: "Secure & Private", description: "Your data stays protected" },
  { icon: FileText, title: "Structured Output", description: "Clean, organized results" },
];

export function HeroSection() {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-hero shadow-elevated mb-6 animate-float">
        <Stethoscope className="w-10 h-10 text-primary-foreground" />
      </div>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
        Prescription <span className="text-gradient">Recognition</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
        Transform handwritten medical prescriptions into clear, digital text using advanced AI recognition technology.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="flex items-center gap-3 px-5 py-3 rounded-full bg-card border border-border shadow-soft hover:shadow-card transition-all duration-300">
              <Icon className="w-5 h-5 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
