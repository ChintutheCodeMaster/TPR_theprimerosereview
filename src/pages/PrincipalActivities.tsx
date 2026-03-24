import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePrincipalSchool } from "@/hooks/usePrincipalSchool";
import {
  useSchoolActivities,
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  type SchoolActivity,
  type ActivityFormData,
} from "@/hooks/useSchoolActivities";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, PartyPopper, MapPin, Clock, Calendar } from "lucide-react";

const CATEGORIES = ["Academic", "Social", "Performance", "Sports", "Ceremony", "Community", "General"];

const EMPTY_FORM: ActivityFormData = {
  title: "",
  date: "",
  time: "",
  location: "",
  category: "General",
  status: "Upcoming",
  description: "",
};

const ActivityCard = ({
  activity,
  onEdit,
  onDelete,
}: {
  activity: SchoolActivity;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <Card className="overflow-hidden">
    <CardContent className="p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{activity.title}</p>
          <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {activity.date}
            </span>
            {activity.time && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activity.time}
              </span>
            )}
            {activity.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {activity.location}
              </span>
            )}
          </div>
          {activity.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{activity.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">{activity.category}</Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityForm = ({
  defaultValues,
  onSubmit,
  isPending,
  onCancel,
}: {
  defaultValues: ActivityFormData;
  onSubmit: (data: ActivityFormData) => void;
  isPending: boolean;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<ActivityFormData>(defaultValues);
  const set = (k: keyof ActivityFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Title *</Label>
          <Input value={form.title} onChange={set("title")} placeholder="e.g. Spring Concert" required />
        </div>
        <div className="space-y-1.5">
          <Label>Date *</Label>
          <Input type="date" value={form.date} onChange={set("date")} required />
        </div>
        <div className="space-y-1.5">
          <Label>Time</Label>
          <Input value={form.time} onChange={set("time")} placeholder="e.g. 6:00 PM – 8:00 PM" />
        </div>
        <div className="space-y-1.5">
          <Label>Location</Label>
          <Input value={form.location} onChange={set("location")} placeholder="e.g. Main Auditorium" />
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Past">Past</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Description</Label>
          <Textarea value={form.description} onChange={set("description")} rows={3} className="resize-none" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button
          className="flex-1"
          disabled={isPending || !form.title || !form.date}
          onClick={() => onSubmit(form)}
        >
          {isPending ? "Saving…" : "Save Activity"}
        </Button>
      </div>
    </div>
  );
};

const PrincipalActivities = () => {
  const { data: school } = usePrincipalSchool();
  const { data: activities = [], isLoading } = useSchoolActivities(school?.schoolId);
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<SchoolActivity | null>(null);

  const upcoming = activities.filter(a => a.status === "Upcoming");
  const past      = activities.filter(a => a.status === "Past" || a.status === "Cancelled");

  const handleCreate = async (form: ActivityFormData) => {
    if (!school?.schoolId) return;
    try {
      await createActivity.mutateAsync({ schoolId: school.schoolId, form });
      toast.success("Activity added");
      setDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to add activity");
    }
  };

  const handleUpdate = async (form: ActivityFormData) => {
    if (!editActivity) return;
    try {
      await updateActivity.mutateAsync({ id: editActivity.id, form });
      toast.success("Activity updated");
      setEditActivity(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update activity");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity.mutateAsync(id);
      toast.success("Activity removed");
    } catch (e: any) {
      toast.error(e.message || "Failed to remove activity");
    }
  };

  const renderList = (items: SchoolActivity[]) => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      );
    }
    if (items.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <PartyPopper className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No activities here yet.</p>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {items.map(a => (
          <ActivityCard
            key={a.id}
            activity={a}
            onEdit={() => setEditActivity(a)}
            onDelete={() => handleDelete(a.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">School Activities</h1>
          <p className="text-muted-foreground mt-1">Manage activities visible to parents and students</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="all">All ({activities.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">{renderList(upcoming)}</TabsContent>
        <TabsContent value="past" className="mt-4">{renderList(past)}</TabsContent>
        <TabsContent value="all" className="mt-4">{renderList(activities)}</TabsContent>
      </Tabs>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add School Activity</DialogTitle>
          </DialogHeader>
          <ActivityForm
            defaultValues={EMPTY_FORM}
            onSubmit={handleCreate}
            isPending={createActivity.isPending}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editActivity} onOpenChange={open => { if (!open) setEditActivity(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          {editActivity && (
            <ActivityForm
              defaultValues={{
                title:       editActivity.title,
                date:        editActivity.date,
                time:        editActivity.time ?? "",
                location:    editActivity.location ?? "",
                category:    editActivity.category,
                status:      editActivity.status,
                description: editActivity.description ?? "",
              }}
              onSubmit={handleUpdate}
              isPending={updateActivity.isPending}
              onCancel={() => setEditActivity(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrincipalActivities;
