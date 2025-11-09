import { AIChatInterface } from "@/components/AIChatInterface";

export default function AIPlannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">AI Travel Planner</h1>
        <p className="text-muted-foreground mt-1">Generate personalized itineraries with AI-powered recommendations.</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <AIChatInterface />
      </div>
    </div>
  );
}
