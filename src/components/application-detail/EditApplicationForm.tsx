import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, X } from "lucide-react";
import { useApplications, type ApplicationWithProfile } from "@/hooks/useApplications";

const APPLICATION_PLATFORMS = [
  { value: "common-app",   label: "Common App" },
  { value: "coalition",    label: "Coalition Application" },
  { value: "uc-app",       label: "UC Application" },
  { value: "apply-texas",  label: "ApplyTexas" },
  { value: "direct",       label: "Direct Application" },
  { value: "ucas",         label: "UCAS" },
  { value: "other",        label: "Other" },
];

const APPLICATION_TYPES = [
  { value: "early-decision",           label: "Early Decision (ED)" },
  { value: "early-action",             label: "Early Action (EA)" },
  { value: "restrictive-early-action", label: "Restrictive Early Action (REA)" },
  { value: "regular-decision",         label: "Regular Decision (RD)" },
  { value: "rolling",                  label: "Rolling Admission" },
];

interface EditApplicationFormProps {
  application: ApplicationWithProfile;
  onDone: () => void;
}

export const EditApplicationForm = ({ application, onDone }: EditApplicationFormProps) => {
  const { updateApplication } = useApplications();

  const [program, setProgram]                       = useState(application.program ?? "");
  const [platform, setPlatform]                     = useState(application.application_platform ?? "common-app");
  const [type, setType]                             = useState(application.application_type ?? "");
  const [deadline, setDeadline]                     = useState(application.deadline_date?.slice(0, 10) ?? "");
  const [requiredEssays, setRequiredEssays]         = useState(application.required_essays ?? 0);
  const [recsRequested, setRecsRequested]           = useState(application.recommendations_requested ?? 0);
  const [notes, setNotes]                           = useState(application.notes ?? "");

  const handleSave = () => {
    updateApplication.mutate(
      {
        id: application.id,
        program: program.trim() || null,
        application_platform: platform,
        application_type: type,
        deadline_date: deadline,
        required_essays: requiredEssays,
        recommendations_requested: recsRequested,
        notes: notes.trim() || null,
      } as any,
      { onSuccess: onDone }
    );
  };

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Edit Application Requirements</p>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDone}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Program / Major</Label>
          <Input value={program} onChange={(e) => setProgram(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Deadline</Label>
          <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-8 text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {APPLICATION_PLATFORMS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {APPLICATION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Essays required</Label>
          <Input
            type="number" min={0} max={20}
            value={requiredEssays}
            onChange={(e) => setRequiredEssays(parseInt(e.target.value) || 0)}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Recommendations required</Label>
          <Input
            type="number" min={0} max={10}
            value={recsRequested}
            onChange={(e) => setRecsRequested(parseInt(e.target.value) || 0)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Notes</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="text-sm resize-none"
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={updateApplication.isPending || !deadline || !type}>
          {updateApplication.isPending
            ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
            : <Save className="h-3.5 w-3.5 mr-1" />}
          Save Changes
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
};
