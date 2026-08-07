import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus } from "lucide-react";
import type { useApplicationEssays } from "@/hooks/useApplicationEssays";
import type { EssayLimitType } from "@/types/applicationEssays";

interface AddSlotFormProps {
  applicationId: string;
  onDone: () => void;
  createSlot: ReturnType<typeof useApplicationEssays>["createSlot"];
}

const LIMIT_TYPE_OPTIONS: { value: EssayLimitType; label: string }[] = [
  { value: "words",             label: "Words" },
  { value: "chars_with_spaces", label: "Characters (with spaces)" },
  { value: "chars_no_spaces",   label: "Characters (no spaces)" },
];

export const AddSlotForm = ({ applicationId, onDone, createSlot }: AddSlotFormProps) => {
  const [label, setLabel]         = useState("");
  const [limit, setLimit]         = useState("");
  const [limitType, setLimitType] = useState<EssayLimitType>("words");

  const numberPlaceholder =
    limitType === "words" ? "e.g. 650" : "e.g. 3500";

  return (
    <div className="border border-dashed border-border rounded-xl p-4 space-y-3 bg-muted/30">
      <p className="text-sm font-semibold">New Essay</p>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Label *</label>
        <Input
          placeholder='e.g. "Why Us?" or "Personal Statement"'
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Limit type</label>
        <div className="flex flex-wrap gap-1.5">
          {LIMIT_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLimitType(opt.value)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                limitType === opt.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Limit (optional)</label>
        <Input
          type="number"
          placeholder={numberPlaceholder}
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          className="h-8 text-sm w-32"
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!label.trim() || createSlot.isPending}
          onClick={() =>
            createSlot.mutate(
              {
                application_id: applicationId,
                essay_label: label.trim(),
                word_limit: limit ? parseInt(limit) : undefined,
                limit_type: limitType,
              },
              { onSuccess: onDone }
            )
          }
        >
          {createSlot.isPending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            : <Plus className="h-3.5 w-3.5 mr-1" />}
          Add Essay
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
};
