import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useArchivedApplications } from "@/hooks/useArchivedApplications";
import { useApplications, type ApplicationWithProfile } from "@/hooks/useApplications";
import { Archive, ArrowLeft, Calendar, GraduationCap, Loader2, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const ArchivedApplications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { applications, isLoading } = useArchivedApplications();
  const { updateApplication } = useApplications();
  const [confirmRestore, setConfirmRestore] = useState<ApplicationWithProfile | null>(null);

  const handleRestore = () => {
    if (!confirmRestore) return;
    updateApplication.mutate(
      { id: confirmRestore.id, archived: false } as any,
      {
        onSuccess: () => {
          setConfirmRestore(null);
          queryClient.invalidateQueries({ queryKey: ["applications", "archived"] });
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/student-personal-area?tab=applications")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Work
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Archive className="h-7 w-7 text-primary" />
          Archived Applications
        </h1>
        <p className="text-muted-foreground mt-1">
          Applications you've archived. Restore any of them to bring them back to your active list.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No archived applications.</p>
            <p className="text-xs mt-2">When you archive an application from My Work, it will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <Card key={app.id} className="border-l-4 border-l-muted">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-muted/60 shrink-0">
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg truncate">{app.school_name}</h3>
                      {app.program && (
                        <p className="text-sm text-muted-foreground truncate">{app.program}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Deadline: {new Date(app.deadline_date).toLocaleDateString()}
                        </span>
                        <span>Essays required: {app.required_essays ?? 0}</span>
                        <span>Recs required: {app.recommendations_requested ?? 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="outline" className="text-muted-foreground">
                      <Archive className="h-3 w-3 mr-1" />
                      Archived
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmRestore(app)}
                      disabled={updateApplication.isPending}
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                      Restore
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmRestore} onOpenChange={(open) => !open && setConfirmRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmRestore?.school_name} will move back to your active applications list in My Work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ArchivedApplications;
