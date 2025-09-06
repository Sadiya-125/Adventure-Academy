import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Shield, Users, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export const AuthForm = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const { toast } = useToast();

  const handleSignUp = async (formData: FormData) => {
    setLoading(true);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const role = formData.get("role") as string;
    const classLevel = formData.get("classLevel") as string;

    if (
      role === "student" &&
      (!classLevel || parseInt(classLevel) < 2 || parseInt(classLevel) > 8)
    ) {
      toast({
        title: "🚫 Invalid Class Level",
        description: "Please Select a Class Level Between 2 and 8.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          role: role,
          class_level: role === "student" ? parseInt(classLevel) : null,
        },
      },
    });

    if (error) {
      toast({
        title: "🚫 Oops! Something Went Wrong",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "🎉 Welcome to Adventure Academy!",
        description:
          "Check your Email to Verify your Account and Start your Journey!",
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (formData: FormData) => {
    setLoading(true);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "🚫 Login Failed",
        description: "Invalid Login Credentials. Please Try Again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("active, role, full_name")
      .eq("user_id", authData.user.id)
      .single();

    if (profileError) {
      console.error(profileError);
      toast({
        title: "⚠️ Error",
        description: "Could Not Check Account Status. Please Try Again.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Check if account is active
    if (!profile.active) {
      await supabase.auth.signOut();
      toast({
        title: "🔒 Access Locked",
        description: "Your Parent / Admin has Temporarily Locked your Account.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Show role-based toast
    switch (profile.role) {
      case "admin":
        toast({
          title: `👑 Welcome Back, Admin!`,
          description: "Manage the Adventure Academy with your Powers!",
        });
        break;
      case "parent":
        toast({
          title: `👨‍👩‍👧 Welcome Back, ${profile.full_name}!`,
          description: "Track your Child's Progress and Guide their Journey.",
        });
        break;
      case "student":
        toast({
          title: `🌟 Welcome Back, ${profile.full_name}!`,
          description: "Ready to Continue your Epic Adventure?",
        });
        break;
      default:
        toast({
          title: "🌟 Welcome Back!",
          description: "Ready to Continue your Adventure?",
        });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link to="/">
            <Button
              variant="outline"
              className="flex items-center space-x-2 bg-white/90 hover:bg-primary hover:text-white border-2 border-primary px-3 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold">🏠 Back to Home</span>
            </Button>
          </Link>
        </div>

        <Card variant="magical" className="overflow-hidden border-none">
          <CardHeader className="text-center bg-gradient-hero text-white relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiPgogICAgICA8Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4=')] opacity-20"></div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <CardTitle className="text-3xl font-bold">
                🏰 Adventure Academy
              </CardTitle>
              <CardDescription className="text-white/90 text-md mt-2">
                Begin your Magical Learning Journey!
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-md"
                >
                  🌟 Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white text-md"
                >
                  ✨ Join Quest
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSignIn(formData);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-md">
                      📧 Email
                    </Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-md">
                      🔐 Password
                    </Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="h-12"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="magical"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "🌟 Entering..." : "🚀 Start Adventure"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSignUp(formData);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-md">
                      👑 Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      name="fullName"
                      type="text"
                      placeholder="Your Adventurer Name"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-md">
                      📧 Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-md">
                      🔐 Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="Create a Strong Password"
                      required
                      className="h-12"
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-md">
                      🎭 Your Role
                    </Label>
                    <Select
                      name="role"
                      required
                      onValueChange={(value) => setSelectedRole(value)}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose your Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">
                          👦 Student Adventurer
                        </SelectItem>
                        <SelectItem value="parent">
                          👪 Parent Guardian
                        </SelectItem>
                        <SelectItem value="admin">🛡️ Academy Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Class Level Selection - Only for Students */}
                  {selectedRole === "student" && (
                    <div className="space-y-2">
                      <Label htmlFor="classLevel" className="text-md">
                        📚 Class Level
                      </Label>
                      <Select name="classLevel" required>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select Your Class (2-8)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">🏫 Class 2</SelectItem>
                          <SelectItem value="3">🏫 Class 3</SelectItem>
                          <SelectItem value="4">🏫 Class 4</SelectItem>
                          <SelectItem value="5">🏫 Class 5</SelectItem>
                          <SelectItem value="6">🏫 Class 6</SelectItem>
                          <SelectItem value="7">🏫 Class 7</SelectItem>
                          <SelectItem value="8">🏫 Class 8</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button
                    type="submit"
                    variant="treasure"
                    size="lg"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "✨ Creating..." : "🎉 Join the Adventure"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 mb-2 flex items-center justify-center space-x-6 text-md text-white/80">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Students</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Parents</span>
          </div>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Admins</span>
          </div>
        </div>
      </div>
    </div>
  );
};
