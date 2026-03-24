import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, School, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePrincipalSchool, useUpdateSchool } from "@/hooks/usePrincipalSchool";
import { toast } from "sonner";

const PrincipalSettings = () => {
  const { data: school, isLoading } = usePrincipalSchool();
  const updateSchool = useUpdateSchool();

  const [name, setName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Initialise name field once school data loads
  const displayName = name || school?.schoolName || "";

  const handleSaveName = async () => {
    if (!school?.schoolId || !name.trim()) return;
    try {
      await updateSchool.mutateAsync({ schoolId: school.schoolId, name: name.trim() });
      toast.success("School name updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update name");
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile || !school?.schoolId) return;
    setUploadingLogo(true);
    try {
      const ext = logoFile.name.split(".").pop();
      const path = `${school.schoolId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("school-logos")
        .upload(path, logoFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("school-logos").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      await updateSchool.mutateAsync({ schoolId: school.schoolId, logoUrl: publicUrl });
      toast.success("Logo uploaded successfully");
      setLogoFile(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">School Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your school's name and branding</p>
      </div>

      {/* School Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <School className="h-4 w-4 text-primary" />
            School Name
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="school-name">Name</Label>
            <Input
              id="school-name"
              value={displayName}
              onChange={e => setName(e.target.value)}
              placeholder={school?.schoolName ?? "Enter school name"}
            />
          </div>
          <Button
            onClick={handleSaveName}
            disabled={updateSchool.isPending || !name.trim() || name.trim() === school?.schoolName}
          >
            {updateSchool.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save Name
          </Button>
        </CardContent>
      </Card>

      {/* School Logo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-4 w-4 text-primary" />
            School Logo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {school?.logoUrl && (
            <div className="border border-border rounded-lg p-4 inline-block">
              <img src={school.logoUrl} alt="School logo" className="h-20 w-auto object-contain" />
              <p className="text-xs text-muted-foreground mt-2">Current logo</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="logo-upload">Upload New Logo</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={e => setLogoFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">PNG, JPG, or SVG. Recommended: 200×200px or higher.</p>
          </div>
          <Button onClick={handleUploadLogo} disabled={!logoFile || uploadingLogo}>
            {uploadingLogo ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {uploadingLogo ? "Uploading…" : "Upload Logo"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrincipalSettings;
