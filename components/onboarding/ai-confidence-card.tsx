import { aiConfidence } from "@/lib/domain/mock-data";

export function AIConfidenceCard() {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">AI Confidence Layer</p>
        <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
          {aiConfidence.confidenceScore}%
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {aiConfidence.reasoningSummary}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {aiConfidence.matchedSignals.map((signal) => (
          <span key={signal} className="rounded-md bg-secondary px-2 py-1 text-xs">
            {signal}
          </span>
        ))}
      </div>
    </div>
  );
}
