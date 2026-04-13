import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link2, Copy, Check, Wand2, ArrowLeft, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import primroseLogo from "@/assets/primrose-logo.png";

const DemoMaker = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateLink = () => {
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter a name to generate a link", variant: "destructive" });
      return;
    }

    const params = new URLSearchParams();
    params.set("name", name.trim());
    if (role.trim()) params.set("role", role.trim());
    if (message.trim()) params.set("msg", message.trim());

    const baseUrl = window.location.origin;
    const link = `${baseUrl}/product-demo?${params.toString()}`;
    setGeneratedLink(link);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast({ title: "Link copied!", description: "The link has been copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Error", description: "Could not copy the link", variant: "destructive" });
    }
  };

  const previewLink = () => {
    if (generatedLink) {
      const url = new URL(generatedLink);
      navigate(`${url.pathname}${url.search}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={primroseLogo} alt="The Primrose Review" className="h-10 w-auto" />
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Wand2 className="h-4 w-4" />
            Demo Maker
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create a Personalized Demo Link</h1>
          <p className="text-muted-foreground">Fill in the details to generate a custom demo link for your prospect</p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prospect Details</CardTitle>
            <CardDescription>These details will be displayed at the top of the demo page</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder='e.g. Danny'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder='e.g. Head of Counseling'
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Custom Message</Label>
              <Textarea
                id="message"
                placeholder='e.g. explore our tools and see how they can support your work'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={generateLink} className="w-full gap-2">
              <Link2 className="h-4 w-4" />
              Generate Link
            </Button>
          </CardContent>
        </Card>

        {/* Generated Link */}
        {generatedLink && (
          <Card className="border-primary/30 bg-primary/5 animate-fade-in">
            <CardContent className="p-5 space-y-4">
              <p className="text-sm font-medium text-foreground">Your link is ready:</p>
              <div className="bg-background rounded-lg p-3 border text-sm break-all font-mono text-muted-foreground" dir="ltr">
                {generatedLink}
              </div>
              <div className="flex gap-2">
                <Button onClick={copyLink} variant="outline" className="flex-1 gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
                <Button onClick={previewLink} variant="secondary" className="flex-1 gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DemoMaker;
