import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Clock,
  Trophy,
  Target,
  AlertCircle,
  Shield,
  Settings,
  BarChart3,
  Crown,
  Baby,
  Plus,
  Edit,
  Eye,
  Star,
  CheckCircle,
  Play,
  Brain,
  Video,
  Lock,
  Unlock,
  TrendingUp,
  Calendar,
  BookOpen,
  Award,
  Zap,
  Sparkles,
  ArrowRight,
  UserPlus,
  Trash2,
  Search,
  LogOut,
} from "lucide-react";

interface Child {
  id: string;
  full_name: string;
  email: string;
  class_level: number;
  created_at: string;
  daily_time_limit: number;
  weekly_time_limit: number;
  avatar_url?: string;
  active?: boolean;
}

interface ChildProgress {
  child: Child;
  stats: {
    worldsCompleted: number;
    realmsCompleted: number;
    totalPoints: number;
    averageScore: number;
    timeSpent: number;
    todayTimeSpent: number;
    weeklyTimeSpent: number;
    quizzesTaken: number;
    videosWatched: number;
    lastActive: string;
  };
  recentActivity: Array<{
    type: "quiz" | "video" | "realm_completed" | "world_completed";
    title: string;
    timestamp: string;
    points?: number;
    score?: number;
  }>;
}

interface AddChildForm {
  full_name: string;
  email: string;
  class_level: number;
}

export const ParentDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [childrenProgress, setChildrenProgress] = useState<ChildProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChild, setShowAddChild] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [showChildDetails, setShowChildDetails] = useState(false);
  const [showEditChild, setShowEditChild] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [editForm, setEditForm] = useState<{
    full_name: string;
    class_level: number;
  }>({
    full_name: "",
    class_level: 2,
  });
  const [addChildForm, setAddChildForm] = useState<AddChildForm>({
    full_name: "",
    email: "",
    class_level: 2,
  });
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isEditingChild, setIsEditingChild] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch parent profile
      const { data: parentProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!parentProfile) return;

      // Fetch children
      const { data: childrenData } = await supabase
        .from("profiles")
        .select("*")
        .eq("parent_id", parentProfile.id)
        .eq("role", "student")
        .order("created_at", { ascending: false });

      if (childrenData) {
        setChildren(childrenData);
        await fetchChildrenProgress(childrenData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildrenProgress = async (childrenData: Child[]) => {
    const progressPromises = childrenData.map(async (child) => {
      const [progressData, timeData] = await Promise.all([
        supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", child.id),
        supabase
          .from("student_progress")
          .select("created_at")
          .eq("student_id", child.id)
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      const totalProgress = progressData.data || [];
      const lastActivityRaw =
        timeData.data?.[0]?.created_at || child.created_at;
      const lastActivity = new Date(lastActivityRaw).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Calculate completed worlds (all realms in a world must be completed)
      const worlds = await supabase.from("worlds").select("id");
      const realms = await supabase.from("realms").select("id, world_id");

      const worldsData = worlds.data || [];
      const realmsData = realms.data || [];

      const completedWorlds = worldsData.filter((world) => {
        const worldRealms = realmsData.filter((r) => r.world_id === world.id);
        const completedWorldRealms = worldRealms.filter((realm) =>
          totalProgress.some((p) => p.realm_id === realm.id && p.is_completed)
        );
        return (
          completedWorldRealms.length === worldRealms.length &&
          worldRealms.length > 0
        );
      });

      const completedRealms = totalProgress.filter((p) => p.is_completed);
      const totalPoints = totalProgress.reduce(
        (sum, p) => sum + (p.points_earned || 0),
        0
      );
      const quizzes = totalProgress.filter(
        (p) => p.quiz_completed && p.quiz_score
      );
      const averageScore =
        quizzes.length > 0
          ? Math.round(
              quizzes.reduce((sum, p) => sum + (p.quiz_score || 0), 0) /
                quizzes.length
            )
          : 0;

      // Calculate time spent based on completed_at dates
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Today's progress (last 24 hours)
      const todayProgress = totalProgress.filter(
        (p) => p.completed_at && new Date(p.completed_at) >= today
      );

      // Weekly progress (last 7 days)
      const weeklyProgress = totalProgress.filter(
        (p) => p.completed_at && new Date(p.completed_at) >= weekAgo
      );

      const timeSpent = totalProgress.length * 15; // Total time estimate
      const todayTimeSpent = todayProgress.length * 15;
      const weeklyTimeSpent = weeklyProgress.length * 15;

      const recentActivity = totalProgress.slice(0, 5).map((progress) => ({
        type: progress.is_completed
          ? ("realm_completed" as const)
          : ("video" as const),
        title: `Realm ${progress.realm_id.slice(0, 8)}`,
        timestamp: progress.created_at,
        points: progress.points_earned,
        score: progress.quiz_score,
      }));

      return {
        child,
        stats: {
          worldsCompleted: completedWorlds.length,
          realmsCompleted: completedRealms.length,
          totalPoints,
          averageScore,
          timeSpent,
          todayTimeSpent,
          weeklyTimeSpent,
          quizzesTaken: quizzes.length,
          videosWatched: totalProgress.filter((p) => p.video_watched).length,
          lastActive: lastActivity,
        },
        recentActivity,
      };
    });

    const progressResults = await Promise.all(progressPromises);
    setChildrenProgress(progressResults);
  };

  const searchProfilesByEmail = async () => {
    if (!searchEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please Enter an Email Address to Search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", searchEmail.trim().toLowerCase())
        .eq("role", "student")
        .is("parent_id", null);

      if (error) throw error;

      if (data && data.length > 0) {
        setSearchResults(data);
        setAddChildForm((prev) => ({
          ...prev,
          full_name: data[0].full_name || "",
          class_level: data[0].class_level || 2,
        }));
      } else {
        setSearchResults([]);
        toast({
          title: "No Profile Found",
          description: "No Student Profile Found with this Email Address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error Searching Profiles:", error);
      toast({
        title: "Search Error",
        description: "An Error Occurred while Searching for Profiles.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addExistingChild = async (profile: any) => {
    if (!user) return;

    try {
      const { data: parentProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!parentProfile) {
        throw new Error("Parent Profile Not Found");
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          parent_id: parentProfile.id,
          full_name: addChildForm.full_name,
          class_level: addChildForm.class_level,
          active: true,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Child Added Successfully!",
        description: `${addChildForm.full_name} has been Added to your Family.`,
      });

      setAddChildForm({
        full_name: "",
        email: "",
        class_level: 2,
      });
      setShowAddChild(false);
      setSearchResults([]);
      setSearchEmail("");

      await fetchData();
    } catch (error) {
      console.error("Error Adding Child:", error);
      toast({
        title: "Error Adding Child",
        description:
          error instanceof Error ? error.message : "An Error Occurred",
        variant: "destructive",
      });
    }
  };

  const editChild = async () => {
    if (!editingChild || !editForm.full_name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please Fill in all Required Fields.",
        variant: "destructive",
      });
      return;
    }

    setIsEditingChild(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          class_level: editForm.class_level,
        })
        .eq("id", editingChild.id);

      if (error) throw error;

      toast({
        title: "Child Updated Successfully!",
        description: `${editForm.full_name}'s Information has been Updated.`,
      });

      setEditForm({ full_name: "", class_level: 2 });
      setShowEditChild(false);
      setEditingChild(null);

      await fetchData();
    } catch (error) {
      console.error("Error Updating Child:", error);
      toast({
        title: "Update Failed",
        description: "Failed to Update Child Information. Please Try Again.",
        variant: "destructive",
      });
    } finally {
      setIsEditingChild(false);
    }
  };

  const removeChild = async (childId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ parent_id: null })
        .eq("id", childId);

      if (error) throw error;

      toast({
        title: "Child Removed",
        description: "Child has been Removed from your Family.",
      });

      await fetchData();
    } catch (error) {
      console.error("Error Removing Child:", error);
      toast({
        title: "Error Removing Child",
        description: "Failed to Remove Child. Please Try Again.",
        variant: "destructive",
      });
    }
  };

  const updateTimeLimit = async (
    childId: string,
    limitType: "daily" | "weekly",
    newLimit: number
  ) => {
    const column =
      limitType === "daily" ? "daily_time_limit" : "weekly_time_limit";

    const { error } = await supabase
      .from("profiles")
      .update({ [column]: newLimit })
      .eq("id", childId);

    if (!error) {
      setChildren((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, [column]: newLimit } : child
        )
      );

      toast({
        title: "Time Limit Updated",
        description: `${
          limitType.charAt(0).toUpperCase() + limitType.slice(1)
        } Time Limit has been Updated Successfully.`,
      });
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to Update Time Limit. Please Try Again.",
        variant: "destructive",
      });
    }
  };

  const toggleChildAccess = async (childId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ active: isActive })
        .eq("id", childId);

      if (error) throw error;

      // Update local state
      setChildren((prev) =>
        prev.map((child) =>
          child.id === childId ? { ...child, active: isActive } : child
        )
      );

      toast({
        title: isActive ? "Access Unlocked" : "Access Locked",
        description: `Child's Access has been ${
          isActive ? "Unlocked" : "Locked"
        }.`,
      });
    } catch (error) {
      console.error("Error Toggling Child Access:", error);
      toast({
        title: "Update Failed",
        description: "Failed to Update Child Access. Please Try Again.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getChildProgress = (childId: string) => {
    return childrenProgress.find((cp) => cp.child.id === childId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-quest-blue/10">
        <Card variant="magical" className="p-8">
          <div className="text-center">
            <div className="animate-sparkle mb-4">
              <Shield className="w-12 h-12 mx-auto text-primary" />
            </div>
            <p className="text-lg font-bold">🛡️ Loading Parent Dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-quest-blue/10">
      {/* Header */}
      <header className="bg-gradient-hero text-white shadow-magical">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between sm:justify-start gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 animate-sparkle" />
              <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">
                Parent Guardian Portal
              </h1>
              <h1 className="text-xl font-bold sm:hidden">Parent Portal</h1>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              <Button
                variant="outline"
                onClick={signOut}
                className="bg-purple-500 border-purple-700 text-white hover:bg-white hover:text-primary transition-colors duration-300 ease-in-out flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 text-left sm:flex sm:items-center sm:gap-4">
            <h2 className="font-bold ml-1">👨‍👩‍👧 Guardian</h2>
          </div>
          <div className="hidden sm:flex items-center gap-3 flex-wrap sm:justify-end">
            <Button
              variant="outline"
              onClick={signOut}
              className="bg-purple-500 border-purple-700 text-white hover:bg-white hover:text-primary transition-colors duration-300 ease-in-out flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card variant="magical" className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              👪 Welcome, Guardian! Monitor your Children's Learning Journey
            </CardTitle>
            <CardDescription className="text-center">
              Track progress, manage screen time, and support their adventures!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="quest" className="text-center">
            <CardContent className="p-6">
              <Baby className="w-8 h-8 mx-auto mb-2 text-quest-blue" />
              <p className="text-2xl font-bold">{children.length}</p>
              <p className="text-sm text-muted-foreground">👦 Children</p>
            </CardContent>
          </Card>

          <Card variant="quest" className="text-center">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-treasure-gold" />
              <p className="text-2xl font-bold">
                {childrenProgress.reduce(
                  (sum, cp) => sum + cp.stats.totalPoints,
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">🌟 Total Points</p>
            </CardContent>
          </Card>

          <Card variant="completed" className="text-center">
            <CardContent className="p-6">
              <Target className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">
                {childrenProgress.reduce(
                  (sum, cp) => sum + cp.stats.realmsCompleted,
                  0
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                🏰 Realms Completed
              </p>
            </CardContent>
          </Card>

          <Card variant="floating" className="text-center">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">
                {formatTime(
                  childrenProgress.reduce(
                    (sum, cp) => sum + cp.stats.timeSpent,
                    0
                  )
                )}
              </p>
              <p className="text-sm text-muted-foreground">⏰ Total Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="children" className="w-full">
          <div className="overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 pt-2 sm:pt-3">
            <TabsList className="w-max sm:w-full mb-4 xs:mb-6 sm:mb-8 flex gap-2 xs:gap-3 sm:gap-4 p-1 xs:p-1.5 sm:p-2 rounded-lg mx-auto sm:mx-0">
              <TabsTrigger
                value="children"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 h-auto rounded-md whitespace-nowrap"
              >
                <span className="inline-block text-xl">👦</span>{" "}
                <span className="ml-1 xs:ml-2">Children Progress</span>
              </TabsTrigger>
              <TabsTrigger
                value="controls"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 h-auto rounded-md whitespace-nowrap"
              >
                ⏳ Screen Time Controls
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 h-auto rounded-md whitespace-nowrap"
              >
                <span className="inline-block text-xl">📊</span>{" "}
                <span className="ml-1 xs:ml-2">Insights</span>
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 h-auto rounded-md whitespace-nowrap"
              >
                <span className="inline-block text-xl">⚙️</span>{" "}
                <span className="ml-1 xs:ml-2">Manage Children</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="children">
            <div className="grid gap-6">
              {childrenProgress.map(({ child, stats }) => (
                <Card
                  key={child.id}
                  variant="floating"
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/80 rounded-full flex items-center justify-center">
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-treasure-gold" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2 text-base sm:text-lg truncate">
                            {child.full_name}
                            <Badge
                              variant="secondary"
                              className="bg-success-bg text-success text-[14px]"
                            >
                              Class {child.class_level}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1.5">
                            Member Since{" "}
                            {new Date(child.created_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedChild(child);
                            setShowChildDetails(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {stats.worldsCompleted}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          🌍 Worlds
                        </p>
                      </div>
                      <div className="text-center p-3 bg-treasure-gold/5 rounded-lg">
                        <p className="text-2xl font-bold text-treasure-gold">
                          {stats.totalPoints}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          🌟 Points
                        </p>
                      </div>
                      <div className="text-center p-3 bg-success/5 rounded-lg">
                        <p className="text-2xl font-bold text-success">
                          {stats.averageScore}%
                        </p>
                        <p className="text-sm text-muted-foreground">
                          📊 Avg Score
                        </p>
                      </div>

                      <div className="text-center p-3 bg-world-time/5 rounded-lg">
                        <p className="text-2xl font-bold text-world-time">
                          {formatTime(stats.timeSpent)}
                        </p>
                        <p className="text-sm text-muted-foreground">⏰ Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {children.length === 0 && (
                <Card variant="magical">
                  <CardContent className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-bold mb-2">
                      No Children Registered Yet
                    </p>
                    <p className="text-muted-foreground mb-4">
                      Add your Children to Start Monitoring their Learning
                      Journey
                    </p>
                    <Button
                      variant="treasure"
                      onClick={() => setShowAddChild(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add Child
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="controls">
            <div className="grid gap-6">
              {children.map((child) => {
                const progress = getChildProgress(child.id);
                return (
                  <Card key={child.id} variant="world">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 shrink-0" />
                        {child.full_name} - Screen Time Controls
                        <div className="text-center text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              child.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {child.active ? "🟢  Active" : "🔴  Locked"}
                          </span>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Manage Daily and Weekly Screen Time Limits for{" "}
                        {child.full_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Daily Limit
                              </Label>
                              <div className="flex items-center space-x-2 mt-2">
                                <Input
                                  type="number"
                                  min="15"
                                  max="240"
                                  step="15"
                                  value={child.daily_time_limit}
                                  onChange={(e) =>
                                    updateTimeLimit(
                                      child.id,
                                      "daily",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-24 ml-[-5]"
                                />
                                <span className="text-sm text-muted-foreground">
                                  Minutes
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Recommended: 30-60 minutes for Optimal Learning
                              </p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Weekly Limit
                              </Label>
                              <div className="flex items-center space-x-2 mt-2">
                                <Input
                                  type="number"
                                  min="60"
                                  max="1680"
                                  step="60"
                                  value={child.weekly_time_limit}
                                  onChange={(e) =>
                                    updateTimeLimit(
                                      child.id,
                                      "weekly",
                                      parseInt(e.target.value)
                                    )
                                  }
                                  className="w-24"
                                />
                                <span className="text-sm text-muted-foreground">
                                  Minutes
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Recommended: 5-10 hours Per Week
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                              <p className="text-md font-medium text-amber-800">
                                Time Management Tips
                              </p>
                              <ul className="text-sm text-amber-700 mt-1 space-y-1">
                                <li>
                                  • Break sessions into 15-30 minute chunks
                                </li>
                                <li>
                                  • Encourage breaks between learning sessions
                                </li>
                                <li>• Monitor for signs of screen fatigue</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              Current Usage
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Today's Progress:</span>
                                <span className="font-medium">
                                  {progress
                                    ? formatTime(progress.stats.todayTimeSpent)
                                    : "0m"}
                                </span>
                              </div>
                              <Progress
                                value={
                                  progress
                                    ? (progress.stats.todayTimeSpent /
                                        child.daily_time_limit) *
                                      100
                                    : 0
                                }
                                className="h-2"
                              />
                              <div className="flex justify-between text-sm">
                                <span>Weekly Progress:</span>
                                <span className="font-medium">
                                  {progress
                                    ? formatTime(progress.stats.weeklyTimeSpent)
                                    : "0m"}
                                </span>
                              </div>
                              <Progress
                                value={
                                  progress
                                    ? (progress.stats.weeklyTimeSpent /
                                        child.weekly_time_limit) *
                                      100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              variant="quest"
                              size="sm"
                              className="w-full"
                              onClick={() => toggleChildAccess(child.id, false)}
                              disabled={!child.active}
                            >
                              <Lock className="w-4 h-4 mr-2" />
                              Temporarily Lock Access
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => toggleChildAccess(child.id, true)}
                              disabled={child.active}
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              Unlock Access
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid gap-6">
              {childrenProgress.map(({ child, stats, recentActivity }) => (
                <Card key={child.id} variant="magical">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      <BarChart3 className="w-6 h-6" />
                      {child.full_name}'s Learning Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Performance Overview
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-primary/10 rounded-lg">
                            <p className="text-2xl font-bold text-primary">
                              {stats.totalPoints}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total Points
                            </p>
                          </div>
                          <div className="text-center p-3 bg-success/10 rounded-lg">
                            <p className="text-2xl font-bold text-success">
                              {stats.weeklyTimeSpent}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Weekly Time Spent
                            </p>
                          </div>
                          <div className="text-center p-3 bg-treasure-gold/10 rounded-lg">
                            <p className="text-2xl font-bold text-treasure-gold">
                              {stats.quizzesTaken}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Quizzes Taken
                            </p>
                          </div>
                          <div className="text-center p-3 bg-quest-blue/10 rounded-lg">
                            <p className="text-2xl font-bold text-quest-blue">
                              {stats.videosWatched}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Videos Watched
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">
                              Learning Efficiency
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-success-bg text-success text-sm"
                            >
                              {stats.averageScore >= 80
                                ? "Excellent"
                                : stats.averageScore >= 70
                                ? "Good"
                                : "Needs Improvement"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">
                              Progress Rate
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-primary-bg text-primary text-sm"
                            >
                              {stats.realmsCompleted > 5
                                ? "Fast"
                                : stats.realmsCompleted > 2
                                ? "Steady"
                                : "Getting Started"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Recent Activity
                        </h4>
                        <div className="space-y-3">
                          {recentActivity.map((activity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-colors duration-200 rounded-lg shadow-sm border border-gray-100"
                            >
                              <div className="w-10 h-10 bg-secondary/80 rounded-full flex items-center justify-center shadow-inner">
                                {activity.type === "quiz" && (
                                  <Brain className="w-5 h-5 text-primary" />
                                )}
                                {activity.type === "video" && (
                                  <Video className="w-5 h-5 text-primary" />
                                )}
                                {activity.type === "realm_completed" && (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                )}
                                {activity.type === "world_completed" && (
                                  <Trophy className="w-5 h-5 text-treasure-gold" />
                                )}
                              </div>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-md font-medium truncate">
                                  {activity.title}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    activity.timestamp
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              {activity.points && (
                                <Badge
                                  variant="secondary"
                                  className="bg-treasure-gold/5 text-treasure-gold font-bold text-sm px-2 py-1 ml-1 flex items-center gap-1"
                                >
                                  <Star className="w-3 h-3" /> {activity.points}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="manage">
            <Card variant="magical">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2">
                  <Settings className="w-6 h-6" />
                  Manage Children
                </CardTitle>
                <CardDescription className="text-center">
                  Add Existing Children by Email, Update Profiles, and Manage
                  Family Settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <Button
                      variant="treasure"
                      size="lg"
                      onClick={() => setShowAddChild(true)}
                      className="mb-4"
                    >
                      <UserPlus className="w-10 h-10 mr-2" />
                      Add Existing Child
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Add Children who Already have Accounts by Searching their
                      Email
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {children.map((child) => (
                      <Card key={child.id} variant="default">
                        <CardContent className="p-4 mr-[-12px]">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                <Baby className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {child.full_name}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Class {child.class_level} • {child.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-initial justify-center"
                                onClick={() => {
                                  setEditingChild(child);
                                  setEditForm({
                                    full_name: child.full_name,
                                    class_level: child.class_level,
                                  });
                                  setShowEditChild(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 sm:flex-initial justify-center text-red-600 hover:text-white mr-[8px]"
                                onClick={() => removeChild(child.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showEditChild} onOpenChange={setShowEditChild}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Edit Child Information
            </DialogTitle>
            <DialogDescription>
              Update your Child's Name and Class Level
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Full Name Input */}
            <div>
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    full_name: e.target.value,
                  }))
                }
                className="mt-1"
                placeholder="Enter Child's Full Name"
              />
            </div>

            {/* Class Level Selector */}
            <div>
              <Label htmlFor="edit_class_level">Class Level</Label>
              <div className="mb-1"></div>
              <Select
                value={editForm.class_level.toString()}
                onValueChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    class_level: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Class Level" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 6, 7, 8].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Class {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditChild(false)}>
                Cancel
              </Button>
              <Button onClick={editChild} disabled={isEditingChild}>
                {isEditingChild ? "Updating..." : "Update Child"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Child Dialog */}
      <Dialog open={showAddChild} onOpenChange={setShowAddChild}>
        <DialogContent className="w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl px-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <UserPlus className="w-5 h-5" />
              Add Existing Child
            </DialogTitle>
            <DialogDescription>
              Search for Your Child's Existing Account by Email and Add them to
              your Family
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="search_email">Search by Email</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="search_email"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Enter child's email address"
                  className="flex-1"
                />
                <Button
                  onClick={searchProfilesByEmail}
                  disabled={isSearching}
                  size="sm"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <Label>Found Profile:</Label>
                {searchResults.map((profile) => (
                  <Card key={profile.id} variant="default">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="mr-2">
                          <p className="font-medium">{profile.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.email} • Class {profile.class_level}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addExistingChild(profile)}
                        >
                          Add to Family
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-2 block">
                Update Child Information (Optional)
              </Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={addChildForm.full_name}
                    onChange={(e) =>
                      setAddChildForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    placeholder="Enter child's full name"
                  />
                </div>
                <div>
                  <Label htmlFor="class_level">Class Level</Label>
                  <Select
                    value={addChildForm.class_level.toString()}
                    onValueChange={(value) =>
                      setAddChildForm((prev) => ({
                        ...prev,
                        class_level: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 7, 8].map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Class {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddChild(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Child Details Dialog */}
      <Dialog open={showChildDetails} onOpenChange={setShowChildDetails}>
        <DialogContent className="sm:max-w-2xl [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-bold gap-0.5">
              <Eye className="w-5 h-5 shrink-0" />
              {selectedChild?.full_name}'s Detailed Progress
            </DialogTitle>
          </DialogHeader>
          {selectedChild && (
            <div className="space-y-4">
              {/* 3x3 Grid */}
              <div className="grid grid-cols-3 gap-4">
                {getChildProgress(selectedChild.id)?.stats &&
                  Object.entries(getChildProgress(selectedChild.id)!.stats).map(
                    ([key, value], index, arr) => {
                      const isLast = key.toLowerCase().includes("last");
                      return (
                        <div
                          key={key}
                          className={`text-center p-3 bg-gray-50 rounded-lg ${
                            isLast ? "col-span-3" : ""
                          }`}
                        >
                          <p className="text-xl font-bold text-primary">
                            {typeof value === "number" ? value : value}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                          </p>
                        </div>
                      );
                    }
                  )}
              </div>

              {/* Close Button */}
              <div className="text-center mt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowChildDetails(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
