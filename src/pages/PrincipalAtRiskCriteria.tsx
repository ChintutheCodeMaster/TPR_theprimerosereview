import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";
import { useAtRiskCriteria, DEFAULT_CRITERIA, AtRiskCriteria } from "@/hooks/useAtRiskCriteria";

const PrincipalAtRiskCriteria = () => {
  const { criteria, setCriteria } = useAtRiskCriteria();
  const [draft, setDraft] = useState<AtRiskCriteria>({ ...criteria });

  const update = <K extends keyof AtRiskCriteria>(key: K, value: AtRiskCriteria[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const handleEssayWeight = (val: number) => {
    const clamped = Math.min(Math.max(val, 0), 100);
    setDraft(prev => ({ ...prev, essayWeight: clamped, recWeight: 100 - clamped }));
  };

  const handleSave = () => {
    if (draft.atRiskThreshold >= draft.needsAttentionThreshold) {
      toast.error("At-risk threshold must be lower than needs-attention threshold.");
      return;
    }
    setCriteria(draft);
    toast.success("At-risk criteria saved successfully.");
  };

  const handleReset = () => {
    setDraft({ ...DEFAULT_CRITERIA });
    toast.info("Reset to default criteria. Click Save to apply.");
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(criteria);
  const hasError = draft.atRiskThreshold >= draft.needsAttentionThreshold;

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">At-Risk Student Criteria</h1>
        <p className="text-muted-foreground mt-1">
          Define the thresholds and triggers used to classify students as at-risk or needing attention.
        </p>
      </div>

      {/* Status Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Status Thresholds
          </CardTitle>
          <CardDescription>
            Completion percentages that separate each status tier.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="at-risk-threshold">
              At-Risk threshold <span className="text-destructive font-semibold">(below this % = at-risk)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="at-risk-threshold"
                type="number"
                min={1}
                max={99}
                value={draft.atRiskThreshold}
                onChange={e => update("atRiskThreshold", Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Students whose completion score falls below this are marked <strong>at-risk</strong>. Default: 40%.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="needs-attention-threshold">
              Needs-Attention threshold <span className="text-amber-500 font-semibold">(below this % = needs attention)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="needs-attention-threshold"
                type="number"
                min={1}
                max={100}
                value={draft.needsAttentionThreshold}
                onChange={e => update("needsAttentionThreshold", Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Students between the two thresholds are marked <strong>needs attention</strong>. Default: 70%.
            </p>
          </div>

          {hasError && (
            <p className="text-sm text-destructive font-medium">
              At-risk threshold must be strictly lower than the needs-attention threshold.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Completion Formula Weights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Completion Score Weights</CardTitle>
          <CardDescription>
            How much essays and recommendation letters each contribute to the overall completion score. Must sum to 100%.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="essay-weight">Essay submission weight</Label>
            <div className="flex items-center gap-2">
              <Input
                id="essay-weight"
                type="number"
                min={0}
                max={100}
                step={5}
                value={draft.essayWeight}
                onChange={e => handleEssayWeight(parseInt(e.target.value) || 0)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rec-weight">Recommendation letter weight</Label>
            <div className="flex items-center gap-2">
              <Input
                id="rec-weight"
                type="number"
                min={0}
                max={100}
                step={5}
                value={draft.recWeight}
                onChange={e => handleEssayWeight(100 - (parseInt(e.target.value) || 0))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {draft.essayWeight + draft.recWeight !== 100 && (
            <p className="text-sm text-destructive font-medium">
              Weights must sum to 100% (currently {draft.essayWeight + draft.recWeight}%).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Risk Trigger Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk Trigger Conditions</CardTitle>
          <CardDescription>
            Choose which conditions surface as reasons on an at-risk student's warning.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label>No essays submitted</Label>
              <p className="text-xs text-muted-foreground">Student has 0 essays submitted out of their total.</p>
            </div>
            <Switch
              checked={draft.triggerNoEssays}
              onCheckedChange={v => update("triggerNoEssays", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Completion critically low</Label>
              <p className="text-xs text-muted-foreground">Completion score is below the at-risk threshold.</p>
            </div>
            <Switch
              checked={draft.triggerLowCompletion}
              onCheckedChange={v => update("triggerLowCompletion", v)}
            />
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Label>Many upcoming deadlines</Label>
              <p className="text-xs text-muted-foreground">Triggers when the student has this many or more upcoming deadlines.</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={draft.deadlineCountThreshold}
                  onChange={e => update("deadlineCountThreshold", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-8 text-sm"
                  disabled={!draft.triggerManyDeadlines}
                />
                <span className="text-xs text-muted-foreground">deadlines</span>
              </div>
            </div>
            <Switch
              checked={draft.triggerManyDeadlines}
              onCheckedChange={v => update("triggerManyDeadlines", v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>No recommendation letters received</Label>
              <p className="text-xs text-muted-foreground">Student requested recs but none have been submitted yet.</p>
            </div>
            <Switch
              checked={draft.triggerNoRecs}
              onCheckedChange={v => update("triggerNoRecs", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!isDirty || hasError}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Criteria
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        {isDirty && !hasError && (
          <span className="text-xs text-muted-foreground">You have unsaved changes.</span>
        )}
      </div>
    </div>
  );
};

export default PrincipalAtRiskCriteria;
