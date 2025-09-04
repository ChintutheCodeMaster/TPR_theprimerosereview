import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Copy, 
  Send, 
  UserPlus, 
  Link2,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  GraduationCap,
  TrendingUp
} from "lucide-react";

const AddStudent = () => {
  const [activeTab, setActiveTab] = useState("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const { toast } = useToast();

  // Manual add form state
  const [manualForm, setManualForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gpa: "",
    satScore: "",
    actScore: "",
    highSchool: "",
    graduationYear: "",
    profilePhoto: null as File | null
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Student Added Successfully",
      description: `${manualForm.firstName} ${manualForm.lastName} has been added to your roster.`,
    });
    
    // Reset form
    setManualForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gpa: "",
      satScore: "",
      actScore: "",
      highSchool: "",
      graduationYear: "",
      profilePhoto: null
    });
    
    setIsSubmitting(false);
  };

  const generateInviteLink = () => {
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const link = `https://primrosereview.com/register/${uniqueId}`;
    setInviteLink(link);
    
    toast({
      title: "Invite Link Generated",
      description: "Student registration link has been created. Share it with your student.",
    });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Link Copied",
      description: "Invite link has been copied to clipboard.",
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setManualForm({ ...manualForm, profilePhoto: file });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add Student</h1>
        <p className="text-muted-foreground">Add a new student to your counseling roster</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Manual Add
          </TabsTrigger>
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Invite Link
          </TabsTrigger>
        </TabsList>

        {/* Manual Add Tab */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Add Student Manually
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter student information to add them directly to your roster
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage 
                      src={manualForm.profilePhoto ? URL.createObjectURL(manualForm.profilePhoto) : undefined} 
                    />
                    <AvatarFallback className="text-lg">
                      {manualForm.firstName.charAt(0)}{manualForm.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="photo-upload" className="block text-sm font-medium mb-2">
                      Profile Photo (Optional)
                    </Label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={manualForm.firstName}
                      onChange={(e) => setManualForm({ ...manualForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={manualForm.lastName}
                      onChange={(e) => setManualForm({ ...manualForm, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={manualForm.email}
                      onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={manualForm.phone}
                      onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={manualForm.gpa}
                      onChange={(e) => setManualForm({ ...manualForm, gpa: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="satScore">SAT Score</Label>
                    <Input
                      id="satScore"
                      type="number"
                      min="400"
                      max="1600"
                      value={manualForm.satScore}
                      onChange={(e) => setManualForm({ ...manualForm, satScore: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="actScore">ACT Score</Label>
                    <Input
                      id="actScore"
                      type="number"
                      min="1"
                      max="36"
                      value={manualForm.actScore}
                      onChange={(e) => setManualForm({ ...manualForm, actScore: e.target.value })}
                    />
                  </div>
                </div>

                {/* School Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="highSchool">High School *</Label>
                    <Input
                      id="highSchool"
                      value={manualForm.highSchool}
                      onChange={(e) => setManualForm({ ...manualForm, highSchool: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      min="2024"
                      max="2030"
                      value={manualForm.graduationYear}
                      onChange={(e) => setManualForm({ ...manualForm, graduationYear: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Adding Student...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Link Tab */}
        <TabsContent value="invite">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-primary" />
                  Generate Student Invite Link
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a registration link for students to complete their own onboarding
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Send Student Registration Link</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate a unique link that students can use to register themselves with their own information
                  </p>
                  <Button onClick={generateInviteLink} size="lg">
                    <Link2 className="h-4 w-4 mr-2" />
                    Generate Invite Link
                  </Button>
                </div>

                {inviteLink && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg border">
                      <Label className="text-sm font-medium">Registration Link</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input value={inviteLink} readOnly className="flex-1" />
                        <Button variant="outline" size="sm" onClick={copyInviteLink}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-12">
                        <Mail className="h-4 w-4 mr-2" />
                        Send via Email
                      </Button>
                      <Button variant="outline" className="h-12">
                        <Phone className="h-4 w-4 mr-2" />
                        Send via SMS
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Student Self-Registration Process */}
            <Card>
              <CardHeader>
                <CardTitle>How Student Self-Registration Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Student Receives Link</h4>
                      <p className="text-sm text-muted-foreground">
                        Student clicks the registration link you provide
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">Complete Onboarding Form</h4>
                      <p className="text-sm text-muted-foreground">
                        Student fills out personal details, academic info, and target schools
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Added to Your Roster</h4>
                      <p className="text-sm text-muted-foreground">
                        Student appears in your dashboard with "Pending Setup" status
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Registrations */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Student Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>MJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Michael Johnson</p>
                        <p className="text-sm text-muted-foreground">michael.j@email.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Setup
                      </Badge>
                      <Button variant="outline" size="sm">Resend Link</Button>
                    </div>
                  </div>
                  
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="text-sm">No other pending registrations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AddStudent;