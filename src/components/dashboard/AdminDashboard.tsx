import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Shield,
  Users,
  BookOpen,
  Settings,
  Plus,
  Edit,
  Trash,
  Eye,
  BarChart3,
  Activity,
  Crown,
  Star,
  Play,
  Brain,
  Globe,
  Lock,
  Unlock,
  TrendingUp,
  Clock,
  Target,
  Award,
  PlusIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
} from "recharts";

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalParents: number;
  totalWorlds: number;
  totalRealms: number;
  totalQuizzes: number;
  activeUsers: number;
}

interface World {
  id: string;
  name: string;
  emoji: string;
  description: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

interface Realm {
  id: string;
  name: string;
  emoji: string;
  description: string;
  world_id: string;
  order_index: number;
  video_url?: string;
  video_title?: string;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  class_level?: number;
  parent_id?: string;
  created_at: string;
  active?: boolean;
}

interface Quiz {
  id: string;
  realm_id: string;
  title: string;
  description: string | null;
  total_questions: number;
  passing_score: number;
  points_reward: number;
  created_at: string;
  updated_at: string;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "mcq" | "true_false";
  options: any;
  correct_answer: string;
  explanation: string | null;
  order_index: number;
  points: number;
  created_at: string;
}

interface StudentProgress {
  id: string;
  student_id: string;
  realm_id: string;
  video_watched: boolean;
  video_watched_at: string | null;
  quiz_completed: boolean;
  quiz_score: number | null;
  quiz_attempts: number;
  quiz_best_score: number;
  quiz_completed_at: string | null;
  is_completed: boolean;
  completed_at: string | null;
  points_earned: number;
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  studentProgress: StudentProgress[];
  userProfiles: any[];
  totalStudents: number;
  totalParents: number;
  activeStudents: number;
  inactiveStudents: number;
  averageQuizScore: number;
  totalPointsEarned: number;
  completionRate: number;
  dailyActivity: { date: string; activeStudents: number }[];
  classLevelDistribution: { classLevel: number; count: number }[];
  quizPerformance: {
    realmName: string;
    averageScore: number;
    completionRate: number;
  }[];
  timeSpentData: { studentName: string; totalTime: number; points: number }[];
}

export const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalParents: 0,
    totalWorlds: 0,
    totalRealms: 0,
    totalQuizzes: 0,
    activeUsers: 0,
  });
  const [worlds, setWorlds] = useState<World[]>([]);
  const [realms, setRealms] = useState<Realm[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    studentProgress: [],
    userProfiles: [],
    totalStudents: 0,
    totalParents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    averageQuizScore: 0,
    totalPointsEarned: 0,
    completionRate: 0,
    dailyActivity: [],
    classLevelDistribution: [],
    quizPerformance: [],
    timeSpentData: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch all stats
      const [
        { data: profilesData },
        { data: worldsData },
        { data: realmsData },
        { data: quizzesData },
        { data: quizQuestionsData },
        { data: studentProgressData },
      ] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("worlds").select("*").order("order_index"),
        supabase.from("realms").select("*").order("order_index"),
        supabase.from("quizzes").select("*"),
        supabase.from("quiz_questions").select("*").order("order_index"),
        supabase.from("student_progress").select("*"),
      ]);

      if (profilesData) {
        setUsers(profilesData);
        setStats((prev) => ({
          ...prev,
          totalUsers: profilesData.length,
          totalStudents: profilesData.filter((u: any) => u.role === "student")
            .length,
          totalParents: profilesData.filter((u: any) => u.role === "parent")
            .length,
          activeUsers: profilesData.filter((u: any) => u.active !== false)
            .length,
        }));

        // Calculate analytics data
        const students = profilesData.filter((u: any) => u.role === "student");
        const parents = profilesData.filter((u: any) => u.role === "parent");
        const activeStudents = students.filter((u: any) => u.active !== false);
        const inactiveStudents = students.filter(
          (u: any) => u.active === false
        );

        // Class level distribution
        const classLevelCounts: { [key: number]: number } = {};
        students.forEach((student: any) => {
          if (student.class_level) {
            classLevelCounts[student.class_level] =
              (classLevelCounts[student.class_level] || 0) + 1;
          }
        });
        const classLevelDistribution = Object.entries(classLevelCounts).map(
          ([level, count]) => ({
            classLevel: parseInt(level),
            count,
          })
        );

        // Daily activity (last 7 days)
        const dailyActivity = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          const activeCount =
            studentProgressData?.filter((progress: any) => {
              if (progress.completed_at) {
                const progressDate = new Date(progress.completed_at)
                  .toISOString()
                  .split("T")[0];
                return progressDate === dateStr;
              }
              return false;
            }).length || 0;
          dailyActivity.push({ date: dateStr, activeStudents: activeCount });
        }

        setAnalyticsData((prev) => ({
          ...prev,
          studentProgress: studentProgressData || [],
          userProfiles: profilesData,
          totalStudents: students.length,
          totalParents: parents.length,
          activeStudents: activeStudents.length,
          inactiveStudents: inactiveStudents.length,
          classLevelDistribution,
          dailyActivity,
        }));
      }

      if (worldsData) {
        setWorlds(worldsData);
        setStats((prev) => ({
          ...prev,
          totalWorlds: worldsData.length,
        }));
      }

      if (realmsData) {
        setRealms(realmsData);
        setStats((prev) => ({
          ...prev,
          totalRealms: realmsData.length,
        }));
      }

      if (quizzesData) {
        setQuizzes(quizzesData);
        setStats((prev) => ({
          ...prev,
          totalQuizzes: quizzesData.length,
        }));
      }

      if (quizQuestionsData) {
        setQuizQuestions(quizQuestionsData as QuizQuestion[]);
      }

      if (studentProgressData) {
        // Calculate quiz performance and time spent data
        const quizPerformance = [];
        const timeSpentData = [];

        if (realmsData && studentProgressData) {
          realmsData.forEach((realm: any) => {
            const realmProgress = studentProgressData.filter(
              (progress: any) => progress.realm_id === realm.id
            );

            if (realmProgress.length > 0) {
              const completedProgress = realmProgress.filter(
                (p: any) => p.is_completed
              );
              const averageScore =
                completedProgress.length > 0
                  ? completedProgress.reduce(
                      (sum: number, p: any) => sum + (p.quiz_score || 0),
                      0
                    ) / completedProgress.length
                  : 0;
              const completionRate =
                (completedProgress.length / realmProgress.length) * 100;

              quizPerformance.push({
                realmName: realm.name,
                averageScore: Math.round(averageScore),
                completionRate: Math.round(completionRate),
              });
            }
          });

          // Calculate time spent and points for each student
          const studentMap = new Map();
          studentProgressData.forEach((progress: any) => {
            if (progress.is_completed && progress.completed_at) {
              const existing = studentMap.get(progress.student_id) || {
                totalTime: 0,
                points: 0,
              };
              existing.totalTime += 15; // 15 minutes per completed realm
              existing.points += progress.points_earned || 0;
              studentMap.set(progress.student_id, existing);
            }
          });

          // Get student names and create time spent data
          if (profilesData) {
            studentMap.forEach((data, studentId) => {
              const student = profilesData.find((p: any) => p.id === studentId);
              if (student) {
                timeSpentData.push({
                  studentName: student.full_name,
                  totalTime: data.totalTime,
                  points: data.points,
                });
              }
            });
          }
        }

        // Calculate overall analytics
        const totalPointsEarned = studentProgressData.reduce(
          (sum: number, progress: any) => sum + (progress.points_earned || 0),
          0
        );
        const completedProgress = studentProgressData.filter(
          (p: any) => p.is_completed
        );
        const completionRate =
          studentProgressData.length > 0
            ? (completedProgress.length / studentProgressData.length) * 100
            : 0;
        const quizScores = studentProgressData
          .filter((p: any) => p.quiz_score !== null)
          .map((p: any) => p.quiz_score);
        const averageQuizScore =
          quizScores.length > 0
            ? quizScores.reduce(
                (sum: number, score: number) => sum + score,
                0
              ) / quizScores.length
            : 0;

        setAnalyticsData((prev) => ({
          ...prev,
          studentProgress: studentProgressData,
          totalPointsEarned,
          completionRate: Math.round(completionRate),
          averageQuizScore: Math.round(averageQuizScore),
          quizPerformance,
          timeSpentData: timeSpentData
            .sort((a, b) => b.points - a.points)
            .slice(0, 10), // Top 10 students
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWorld = async (formData: {
    name: string;
    emoji: string;
    description: string;
  }) => {
    const { error } = await supabase.from("worlds").insert({
      ...formData,
      order_index: worlds.length + 1,
      is_active: true,
    });
    if (error) {
      console.error("Error Creating World:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const createRealm = async (formData: {
    name: string;
    emoji: string;
    description: string;
    world_id: string;
    video_url?: string;
    video_title?: string;
  }) => {
    const worldRealms = realms.filter((r) => r.world_id === formData.world_id);

    const { error } = await supabase.from("realms").insert({
      ...formData,
      order_index: worldRealms.length + 1,
      is_active: true,
    });

    if (!error) {
      fetchData(); // Refresh data
    }
  };

  const createQuiz = async (formData: {
    title: string;
    description: string;
    realm_id: string;
    total_questions: number;
    passing_score: number;
    points_reward: number;
  }) => {
    const totalQ = Number(formData.total_questions);
    const points = Number(formData.points_reward);

    if (totalQ <= 0) {
      toast({
        title: "⚠️ Invalid Total Questions",
        description: "Total Questions Must be Greater than 0.",
        variant: "destructive",
      });
      return false;
    }

    if (points % totalQ !== 0) {
      toast({
        title: "⚠️ Invalid Points Rewarded",
        description: "Points Rewarded Must be a Multiple of Total Questions.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase.from("quizzes").insert({
      ...formData,
      total_questions: Number(formData.total_questions),
      passing_score: Number(formData.passing_score),
      points_reward: Number(formData.points_reward),
    });

    if (error) {
      console.error("Error Creating Quiz:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const createQuizQuestions = async (
    quizId: string,
    questions: {
      question_text: string;
      question_type: "mcq" | "true_false";
      options: string[] | null;
      correct_answer: string;
      explanation: string | null;
      points: number;
    }[]
  ) => {
    const questionsWithOrder = questions.map((q, index) => ({
      ...q,
      quiz_id: quizId,
      order_index: index + 1,
    }));

    const { error } = await supabase
      .from("quiz_questions")
      .insert(questionsWithOrder);

    if (error) {
      console.error("Error Creating Quiz Questions:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const deleteWorld = async (worldId: string) => {
    // This will cascade delete realms, quizzes, and quiz questions due to foreign key constraints
    const { error } = await supabase.from("worlds").delete().eq("id", worldId);

    if (error) {
      console.error("Error deleting world:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const deleteRealm = async (realmId: string) => {
    // This will cascade delete quizzes and quiz questions due to foreign key constraints
    const { error } = await supabase.from("realms").delete().eq("id", realmId);

    if (error) {
      console.error("Error deleting realm:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const deleteQuiz = async (quizId: string) => {
    // This will cascade delete quiz questions due to foreign key constraints
    const { error } = await supabase.from("quizzes").delete().eq("id", quizId);

    if (error) {
      console.error("Error deleting quiz:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const deleteQuizQuestion = async (questionId: string) => {
    const { error } = await supabase
      .from("quiz_questions")
      .delete()
      .eq("id", questionId);

    if (error) {
      console.error("Error deleting quiz question:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const updateQuiz = async (
    quizId: string,
    formData: {
      title: string;
      description: string;
      total_questions: number;
      passing_score: number;
      points_reward: number;
    }
  ) => {
    const totalQ = Number(formData.total_questions);
    const points = Number(formData.points_reward);

    if (totalQ <= 0) {
      toast({
        title: "⚠️ Invalid Total Questions",
        description: "Total Questions Must be Greater than 0.",
        variant: "destructive",
      });
      return false;
    }

    if (points % totalQ !== 0) {
      toast({
        title: "⚠️ Invalid Points Rewarded",
        description: "Points Rewarded Must be a Multiple of Total Questions.",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase
      .from("quizzes")
      .update({
        ...formData,
        total_questions: Number(formData.total_questions),
        passing_score: Number(formData.passing_score),
        points_reward: Number(formData.points_reward),
      })
      .eq("id", quizId);

    if (error) {
      console.error("Error updating quiz:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const updateQuizQuestion = async (
    questionId: string,
    formData: {
      question_text: string;
      question_type: "mcq" | "true_false";
      options: string[] | null;
      correct_answer: string;
      explanation: string | null;
      points: number;
      order_index: number;
    }
  ) => {
    const { error } = await supabase
      .from("quiz_questions")
      .update({
        ...formData,
        points: Number(formData.points),
        order_index: Number(formData.order_index),
      })
      .eq("id", questionId);

    if (error) {
      console.error("Error updating quiz question:", error.message);
      return false;
    }

    fetchData();
    return true;
  };

  const toggleUserActive = async (profileId: string, makeActive: boolean) => {
    try {
      setUpdatingUserId(profileId);
      const { error } = await supabase
        .from("profiles")
        .update({ active: makeActive })
        .eq("id", profileId);
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error toggling user active:", error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-quest-blue/10">
        <Card variant="magical" className="p-8">
          <div className="text-center">
            <div className="animate-sparkle mb-4">
              <Shield className="w-12 h-12 mx-auto text-primary" />
            </div>
            <p className="text-lg font-bold">🛡️ Loading Admin Dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-quest-blue/10">
      {/* Header */}
      <header className="bg-gradient-hero text-white shadow-magical">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 animate-sparkle" />
              <h1 className="text-2xl font-bold">Academy Admin Portal</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold">🛡️ Administrator</span>
            <Button
              variant="outline"
              onClick={signOut}
              className="bg-purple-500 border-purple-700 text-white hover:bg-white hover:text-primary transition-colors duration-300 ease-in-out"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card variant="magical" className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              🛡️ Welcome, Administrator! Command the Adventure Academy
            </CardTitle>
            <CardDescription className="text-center">
              Manage content, monitor progress, and ensure magical learning
              experiences!
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card variant="quest" className="text-center">
            <CardContent className="p-4">
              <Users className="w-6 h-6 mx-auto mb-2 text-quest-blue" />
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
              <p className="text-sm text-muted-foreground">👥 Users</p>
            </CardContent>
          </Card>

          <Card variant="floating" className="text-center">
            <CardContent className="p-4">
              <Crown className="w-6 h-6 mx-auto mb-2 text-treasure-gold" />
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
              <p className="text-sm text-muted-foreground">👦 Students</p>
            </CardContent>
          </Card>

          <Card variant="completed" className="text-center">
            <CardContent className="p-4">
              <Shield className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{stats.totalParents}</p>
              <p className="text-sm text-muted-foreground">👨‍👩‍👧 Parents</p>
            </CardContent>
          </Card>

          <Card variant="quest" className="text-center">
            <CardContent className="p-4">
              <Globe className="w-6 h-6 mx-auto mb-2 text-world-time" />
              <p className="text-2xl font-bold">{stats.totalWorlds}</p>
              <p className="text-sm text-muted-foreground">🌍 Worlds</p>
            </CardContent>
          </Card>

          <Card variant="floating" className="text-center">
            <CardContent className="p-4">
              <Star className="w-6 h-6 mx-auto mb-2 text-world-emotions" />
              <p className="text-2xl font-bold">{stats.totalRealms}</p>
              <p className="text-sm text-muted-foreground">🏰 Realms</p>
            </CardContent>
          </Card>

          <Card variant="completed" className="text-center">
            <CardContent className="p-4">
              <Brain className="w-6 h-6 mx-auto mb-2 text-world-money" />
              <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
              <p className="text-sm text-muted-foreground">🧠 Quizzes</p>
            </CardContent>
          </Card>

          <Card variant="quest" className="text-center">
            <CardContent className="p-4">
              <Activity className="w-6 h-6 mx-auto mb-2 text-world-wellness" />
              <p className="text-2xl font-bold">{stats.activeUsers}</p>
              <p className="text-sm text-muted-foreground">🌟 Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              📊 Overview
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              🧑‍🤝‍🧑 Users
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              📚 Content
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              📈 Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <Card variant="magical">
                <CardHeader>
                  <CardTitle>🎯 Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <CreateWorldDialog
                      onWorldCreated={() => fetchData()}
                      onSubmitWorld={createWorld}
                    >
                      <Button variant="treasure" className="h-20 flex-col">
                        <Plus className="w-20 h-20" strokeWidth={4} />
                        Create World
                      </Button>
                    </CreateWorldDialog>

                    <CreateRealmDialog
                      worlds={worlds}
                      onRealmCreated={() => fetchData()}
                      onSubmitRealm={createRealm}
                    >
                      <Button variant="quest" className="h-20 flex-col">
                        <Plus className="w-20 h-20" strokeWidth={4} />
                        Create Realm
                      </Button>
                    </CreateRealmDialog>

                    <CreateQuizDialog
                      worlds={worlds}
                      realms={realms}
                      quizzes={quizzes}
                      onQuizCreated={() => fetchData()}
                      onSubmitQuiz={createQuiz}
                    >
                      <Button variant="magical" className="h-20 flex-col">
                        <Plus className="w-20 h-20" strokeWidth={4} />
                        Create Quiz
                      </Button>
                    </CreateQuizDialog>

                    <CreateQuizQuestionsDialog
                      quizzes={quizzes}
                      onQuestionsCreated={() => fetchData()}
                      onSubmitQuestions={createQuizQuestions}
                    >
                      <Button variant="quest" className="h-20 flex-col">
                        <Plus className="w-20 h-20" strokeWidth={4} />
                        Create Quiz Questions
                      </Button>
                    </CreateQuizQuestionsDialog>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card variant="floating">
                  <CardHeader>
                    <CardTitle>🌍 Recent Worlds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {worlds.map((world) => (
                        <div
                          key={world.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{world.emoji}</span>
                            <div>
                              <p className="font-medium">{world.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Created{" "}
                                {new Date(
                                  world.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant={world.is_active ? "default" : "secondary"}
                            className="text-sm"
                          >
                            {world.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card variant="quest">
                  <CardHeader>
                    <CardTitle>👥 Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-sm">
                            {user.role === "student"
                              ? "👦"
                              : user.role === "parent"
                              ? "👨‍👩‍👧"
                              : "🛡️"}{" "}
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-6">
              {/* Students Section */}
              <Card variant="magical">
                <CardHeader>
                  <CardTitle>👦 Student Management</CardTitle>
                  <CardDescription>
                    View and Manage Student Accounts, Progress, and Performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users
                      .filter((u) => u.role === "student")
                      .map((user) => {
                        const studentProgress =
                          analyticsData.studentProgress.filter(
                            (p) => p.student_id === user.id
                          );
                        const totalPoints = studentProgress.reduce(
                          (sum, p) => sum + (p.points_earned || 0),
                          0
                        );
                        const completedRealms = studentProgress.filter(
                          (p) => p.is_completed
                        ).length;
                        const totalTime = completedRealms * 15;

                        return (
                          <div
                            key={user.id}
                            className="p-4 border rounded-lg space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                                  👦
                                </div>
                                <div>
                                  <p className="font-medium text-lg">
                                    {user.full_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {user.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Class Level: {user.class_level || "Not Set"}{" "}
                                    • Joined{" "}
                                    {new Date(
                                      user.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-sm">
                                  {user.role.charAt(0).toUpperCase() +
                                    user.role.slice(1)}
                                </Badge>
                                <span
                                  className={`text-sm px-2 py-1 rounded-full ${
                                    user.active === false
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {user.active === false ? "Locked" : "Active"}
                                </span>
                              </div>
                            </div>

                            {/* Student Progress Summary */}
                            <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                  {totalPoints}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total Points
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                  {completedRealms}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Realms Completed
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                  {totalTime}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Minutes Spent
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                  {studentProgress.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total Sessions
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {user.active === false ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      toggleUserActive(user.id, true)
                                    }
                                    disabled={updatingUserId === user.id}
                                  >
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Unlock Access
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      toggleUserActive(user.id, false)
                                    }
                                    disabled={updatingUserId === user.id}
                                  >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Lock Access
                                  </Button>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={async () => {
                                  if (
                                    confirm(
                                      `Are You Sure You Want to Delete ${user.full_name}'s Account? This Action Cannot be Undone.`
                                    )
                                  ) {
                                    const { error } = await supabase
                                      .from("profiles")
                                      .delete()
                                      .eq("id", user.id);

                                    if (error) {
                                      console.error(
                                        "Error Deleting User:",
                                        error.message
                                      );
                                    } else {
                                      fetchData();
                                    }
                                  }
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Parents Section */}
              <Card variant="quest">
                <CardHeader>
                  <CardTitle>👨‍👩‍👧 Parent Management</CardTitle>
                  <CardDescription>
                    View and Manage Parent Accounts and their Children
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users
                      .filter((u) => u.role === "parent")
                      .map((user) => {
                        const children = users.filter(
                          (u) => u.parent_id === user.id
                        );

                        return (
                          <div
                            key={user.id}
                            className="p-4 border rounded-lg space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-quest-blue/10 flex items-center justify-center text-lg">
                                  👨‍👩‍👧
                                </div>
                                <div>
                                  <p className="font-medium text-lg">
                                    {user.full_name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {user.email}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {children.length} children • Joined{" "}
                                    {new Date(
                                      user.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-sm">
                                  {user.role.charAt(0).toUpperCase() +
                                    user.role.slice(1)}
                                </Badge>
                                <span
                                  className={`text-sm px-2 py-1 rounded-full ${
                                    user.active === false
                                      ? "bg-red-100 text-red-700"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {user.active === false ? "Locked" : "Active"}
                                </span>
                              </div>
                            </div>

                            {/* Children Summary */}
                            {children.length > 0 && (
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-md">
                                <p className="text-lg font-bold mb-4 text-center text-purple-700">
                                  🧒 Children Summary
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {children.map((child) => {
                                    const childProgress =
                                      analyticsData.studentProgress.filter(
                                        (p) => p.student_id === child.id
                                      );
                                    const childPoints = childProgress.reduce(
                                      (sum, p) => sum + (p.points_earned || 0),
                                      0
                                    );
                                    const childCompleted = childProgress.filter(
                                      (p) => p.is_completed
                                    ).length;

                                    return (
                                      <div
                                        key={child.id}
                                        className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 border-t-4 border-purple-400"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-lg font-semibold text-purple-700">
                                            {child.full_name}
                                          </span>
                                          <span
                                            className={`px-2 py-1 text-sm font-semibold rounded-full ${
                                              child.active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }`}
                                          >
                                            {child.active ? "Active" : "Locked"}
                                          </span>
                                        </div>
                                        <div className="flex flex-col gap-1 text-md text-gray-600">
                                          <span>
                                            Class Level:{" "}
                                            <span className="font-medium">
                                              {child.class_level || "N/A"}
                                            </span>
                                          </span>
                                          <span>
                                            Points Earned:{" "}
                                            <span className="font-medium">
                                              {childPoints}
                                            </span>
                                          </span>
                                          <span>
                                            Realms Completed:{" "}
                                            <span className="font-medium">
                                              {childCompleted}
                                            </span>
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                {user.active === false ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      toggleUserActive(user.id, true)
                                    }
                                    disabled={updatingUserId === user.id}
                                  >
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Unlock Access
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      toggleUserActive(user.id, false)
                                    }
                                    disabled={updatingUserId === user.id}
                                  >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Lock Access
                                  </Button>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are You Sure You Want to Delete ${user.full_name}'s Account? This will also Remove all Associated Children.`
                                    )
                                  ) {
                                    // TODO: Implement delete user functionality
                                    console.log("Delete user:", user.id);
                                  }
                                }}
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content">
            <div className="space-y-6">
              <Card variant="magical">
                <CardHeader>
                  <CardTitle>🌍 Worlds & Realms Management</CardTitle>
                  <CardDescription>
                    Create and Manage Learning Worlds and their Realms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {worlds.map((world) => {
                      const worldRealms = realms
                        .filter((r) => r.world_id === world.id)
                        .sort((a, b) => a.order_index - b.order_index);
                      return (
                        <div key={world.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-2xl">{world.emoji}</span>
                              <div>
                                <p className="font-medium">{world.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {world.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {worldRealms.length} Realm(s) • Order:{" "}
                                  {world.order_index}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant={
                                  world.is_active ? "default" : "secondary"
                                }
                                className="text-sm"
                              >
                                {world.is_active ? "Active" : "Inactive"}
                              </Badge>
                              <EditWorldDialog
                                world={world}
                                onWorldUpdated={() => fetchData()}
                              >
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </EditWorldDialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (
                                    confirm(
                                      "Are You Sure You Want to Delete this World? This will also Delete all Associated Realms, Quizzes, and Questions."
                                    )
                                  ) {
                                    deleteWorld(world.id);
                                  }
                                }}
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {worldRealms.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {worldRealms.map((realm) => (
                                <div
                                  key={realm.id}
                                  className="p-3 bg-muted/50 rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <span className="text-xl">
                                        {realm.emoji}
                                      </span>
                                      <div>
                                        <p className="font-medium">
                                          {realm.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                          Order: {realm.order_index}{" "}
                                          {realm.video_url ? "• Has Video" : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge
                                        variant={
                                          realm.is_active
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-sm"
                                      >
                                        {realm.is_active
                                          ? "Active"
                                          : "Inactive"}
                                      </Badge>
                                      <EditRealmDialog
                                        realm={realm}
                                        worlds={worlds}
                                        onRealmUpdated={() => fetchData()}
                                      >
                                        <Button variant="outline" size="sm">
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                      </EditRealmDialog>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (
                                            confirm(
                                              "Are You Sure You Want to Delete this Realm? This will also Delete all Associated Quizzes and Questions."
                                            )
                                          ) {
                                            deleteRealm(realm.id);
                                          }
                                        }}
                                      >
                                        <Trash className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Realm Quizzes */}
                                  <div className="mt-3 pl-10">
                                    <div className="space-y-1">
                                      {quizzes
                                        .filter((q) => q.realm_id === realm.id)
                                        .map((quiz) => (
                                          <div
                                            key={quiz.id}
                                            className="p-2 bg-white rounded-lg border pb-5 mb-2"
                                          >
                                            <div className="flex items-center justify-between p-2">
                                              <div>
                                                <div className="font-medium text-md">
                                                  {quiz.title}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                  {quiz.total_questions}{" "}
                                                  Question(s) • Pass Percentage{" "}
                                                  {quiz.passing_score}% •{" "}
                                                  {quiz.points_reward} Point(s)
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-1">
                                                <EditQuizDialog
                                                  quiz={quiz}
                                                  onQuizUpdated={() =>
                                                    fetchData()
                                                  }
                                                  onSubmitQuiz={updateQuiz}
                                                >
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                  >
                                                    Edit
                                                  </Button>
                                                </EditQuizDialog>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => {
                                                    if (
                                                      confirm(
                                                        "Are You Sure You Want to Delete this Quiz? This will also Delete all Associated Questions."
                                                      )
                                                    ) {
                                                      deleteQuiz(quiz.id);
                                                    }
                                                  }}
                                                >
                                                  <Trash className="w-3 h-3" />
                                                </Button>
                                              </div>
                                            </div>

                                            {/* Quiz Questions */}
                                            <div className="mt-2 pl-4">
                                              <div className="space-y-3">
                                                {quizQuestions
                                                  .filter(
                                                    (q) => q.quiz_id === quiz.id
                                                  )
                                                  .map((question) => (
                                                    <div
                                                      key={question.id}
                                                      className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
                                                    >
                                                      <div className="flex-1">
                                                        <div className="font-medium">
                                                          {
                                                            question.question_text
                                                          }
                                                        </div>
                                                        <div className="text-muted-foreground">
                                                          {question.question_type ===
                                                          "mcq"
                                                            ? "Multiple Choice"
                                                            : "True/False"}{" "}
                                                          • {question.points}{" "}
                                                          Point(s) • Order{" "}
                                                          {question.order_index}
                                                        </div>
                                                      </div>
                                                      <div className="flex items-center space-x-1">
                                                        <EditQuizQuestionDialog
                                                          question={question}
                                                          onQuestionUpdated={() =>
                                                            fetchData()
                                                          }
                                                          onSubmitQuestion={
                                                            updateQuizQuestion
                                                          }
                                                        >
                                                          <Button
                                                            variant="outline"
                                                            size="sm"
                                                          >
                                                            Edit
                                                          </Button>
                                                        </EditQuizQuestionDialog>
                                                        <Button
                                                          variant="outline"
                                                          size="sm"
                                                          onClick={() => {
                                                            if (
                                                              confirm(
                                                                "Are You Sure You Want to Delete this Question?"
                                                              )
                                                            ) {
                                                              deleteQuizQuestion(
                                                                question.id
                                                              );
                                                            }
                                                          }}
                                                        >
                                                          <Trash className="w-3 h-3" />
                                                        </Button>
                                                      </div>
                                                    </div>
                                                  ))}
                                                <CreateQuizQuestionsDialog
                                                  quizzes={[quiz]}
                                                  onQuestionsCreated={() =>
                                                    fetchData()
                                                  }
                                                  onSubmitQuestions={
                                                    createQuizQuestions
                                                  }
                                                >
                                                  {quizQuestions.filter(
                                                    (q) => q.quiz_id === quiz.id
                                                  ).length <
                                                    quiz.total_questions && (
                                                    <Button
                                                      variant="outline"
                                                      size="sm"
                                                    >
                                                      <PlusIcon className="w-4 h-4 mr-1" />
                                                      Add Questions
                                                    </Button>
                                                  )}
                                                </CreateQuizQuestionsDialog>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      {!quizzes.some(
                                        (q) => q.realm_id === realm.id
                                      ) && (
                                        <CreateQuizDialog
                                          worlds={worlds}
                                          realms={[realm]}
                                          quizzes={quizzes}
                                          onQuizCreated={() => fetchData()}
                                          onSubmitQuiz={createQuiz}
                                        >
                                          <Button variant="outline" size="sm">
                                            <PlusIcon className="w-4 h-4 mr-1" />
                                            Add Quiz
                                          </Button>
                                        </CreateQuizDialog>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {analyticsData.totalStudents}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Students
                  </div>
                </Card>
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {analyticsData.activeStudents}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Students
                  </div>
                </Card>
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {analyticsData.averageQuizScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg Quiz Score
                  </div>
                </Card>
                <Card className="text-center p-4">
                  <div className="text-2xl font-bold text-orange-600">
                    {analyticsData.completionRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Completion Rate
                  </div>
                </Card>
              </div>

              {/* Charts Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Daily Student Activities (Last 7 Days)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData.dailyActivity}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          }
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(value) =>
                            new Date(value).toLocaleDateString()
                          }
                          formatter={(value) => [value, "Total Activities"]}
                        />
                        <Area
                          type="monotone"
                          dataKey="activeStudents"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Class Level Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Class Level Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={analyticsData.classLevelDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius="45%"
                          outerRadius="75%"
                          paddingAngle={5}
                          dataKey="count"
                          labelLine={false}
                          label={({ classLevel, percent }) =>
                            `Class ${classLevel}: ${(percent * 100).toFixed(
                              0
                            )}%`
                          }
                          isAnimationActive={true}
                        >
                          {analyticsData.classLevelDistribution.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          formatter={(value, _, props) => [
                            `${value} Student(s)`,
                            `Class ${props.payload.classLevel}`,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quiz Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      Quiz Performance by Realm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.quizPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="realmName"
                          interval={0}
                          height={40}
                          tick={(props) => {
                            const { x, y, payload } = props;
                            return (
                              <text
                                x={x}
                                y={y + 10}
                                textAnchor="middle"
                                fontSize={12}
                              >
                                {payload.value.split(" ").map((word, index) => (
                                  <tspan
                                    key={index}
                                    x={x}
                                    dy={index === 0 ? 0 : 12}
                                  >
                                    {word}
                                  </tspan>
                                ))}
                              </text>
                            );
                          }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="averageScore"
                          fill="#8884d8"
                          name="Avg Score (%)"
                        />
                        <Bar
                          dataKey="completionRate"
                          fill="#82ca9d"
                          name="Completion Rate (%)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Students by Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Top Students by Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center">
                    {" "}
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={analyticsData.timeSpentData}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: -30, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          type="number"
                          label={{
                            value: "Points",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          type="category"
                          dataKey="studentName"
                          width={100}
                          tick={{ fontSize: 15 }}
                        />
                        <Tooltip
                          formatter={(value) => [`${value}`, "Points"]}
                        />
                        <Bar
                          dataKey="points"
                          fill="#ffc658"
                          radius={[5, 5, 5, 5]} // rounded bars
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Time Spent vs Points Scatter Plot */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Spent vs Points Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                      margin={{
                        top: 20,
                        right: 20,
                        bottom: 20,
                        left: 20,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="totalTime"
                        name="Time Spent (minutes)"
                        label={{
                          value: "Time Spent (minutes)",
                          position: "insideBottom",
                          offset: -10,
                        }}
                      />
                      <YAxis
                        type="number"
                        dataKey="points"
                        name="Points"
                        label={{
                          value: "Points Earned",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ payload }) => {
                          if (!payload || !payload.length) return null;
                          const { studentName, totalTime, points } =
                            payload[0].payload;
                          return (
                            <div className="bg-white p-2 rounded shadow">
                              <strong>{studentName}</strong>
                              <div>Time: {totalTime} min</div>
                              <div>Points: {points}</div>
                            </div>
                          );
                        }}
                      />
                      <Scatter
                        name="Students"
                        data={analyticsData.timeSpentData}
                        fill="#8884d8"
                        shape="circle"
                        r={6}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>📈 Progress Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Points Earned:</span>
                      <span className="font-semibold text-green-600">
                        {analyticsData.totalPointsEarned.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active vs Inactive Students:</span>
                      <span className="font-semibold">
                        {analyticsData.activeStudents} /{" "}
                        {analyticsData.inactiveStudents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Parents:</span>
                      <span className="font-semibold text-blue-600">
                        {analyticsData.totalParents}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>🎯 Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Quiz Score:</span>
                      <span className="font-semibold text-purple-600">
                        {analyticsData.averageQuizScore}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Overall Completion Rate:</span>
                      <span className="font-semibold text-orange-600">
                        {analyticsData.completionRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Learning Sessions:</span>
                      <span className="font-semibold text-blue-600">
                        {analyticsData.studentProgress.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Create World Dialog Component
const CreateWorldDialog = ({
  children,
  onWorldCreated,
  onSubmitWorld,
}: {
  children: React.ReactNode;
  onWorldCreated: () => void;
  onSubmitWorld: (formData: {
    name: string;
    emoji: string;
    description: string;
  }) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const worldData = {
      name: formData.get("name") as string,
      emoji: formData.get("emoji") as string,
      description: formData.get("description") as string,
    };

    const success = await onSubmitWorld(worldData);

    if (success) {
      setOpen(false);
      onWorldCreated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🌍 Create New World</DialogTitle>
          <DialogDescription>
            Add a New Learning World for Students to Explore
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">World Name</Label>
            <div className="mb-1"></div>
            <Input id="name" name="name" placeholder="World of Time" required />
          </div>
          <div>
            <Label htmlFor="emoji">Emoji</Label>
            <div className="mb-1"></div>
            <Input
              id="emoji"
              name="emoji"
              placeholder="⏰"
              required
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <div className="mb-1"></div>
            <Textarea
              id="description"
              name="description"
              placeholder="Learn About Time Management and Scheduling"
              required
            />
          </div>
          <Button
            type="submit"
            variant="magical"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "✨ Create World"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Create Realm Dialog Component
const CreateRealmDialog = ({
  children,
  worlds,
  onRealmCreated,
  onSubmitRealm,
}: {
  children: React.ReactNode;
  worlds: World[];
  onRealmCreated: () => void;
  onSubmitRealm: (formData: {
    name: string;
    emoji: string;
    description: string;
    world_id: string;
    video_url?: string;
    video_title?: string;
  }) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const realmData = {
      name: formData.get("name") as string,
      emoji: formData.get("emoji") as string,
      description: formData.get("description") as string,
      world_id: formData.get("world_id") as string,
      video_url: (formData.get("video_url") as string) || undefined,
      video_title: (formData.get("video_title") as string) || undefined,
    };

    await onSubmitRealm(realmData);

    setOpen(false);
    onRealmCreated();
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🏰 Create New Realm</DialogTitle>
          <DialogDescription>
            Add a New Learning Realm within a World
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="realm-name">Realm Name</Label>
            <div className="mb-1"></div>
            <Input
              id="realm-name"
              name="name"
              placeholder="Daily Schedules"
              required
            />
          </div>
          <div>
            <Label htmlFor="realm-emoji">Emoji</Label>
            <div className="mb-1"></div>
            <Input
              id="realm-emoji"
              name="emoji"
              placeholder="📅"
              required
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="world_id">Parent World</Label>
            <div className="mb-1"></div>
            <select
              id="world_id"
              name="world_id"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Select a World</option>
              {worlds.map((world) => (
                <option key={world.id} value={world.id}>
                  {world.emoji} {world.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="realm-description">Description</Label>
            <div className="mb-1"></div>
            <Textarea
              id="realm-description"
              name="description"
              placeholder="Learn How to Create Daily Schedules"
              required
            />
          </div>
          <div>
            <Label htmlFor="video_title">Video Title</Label>
            <div className="mb-1"></div>
            <Input
              id="video_title"
              name="video_title"
              placeholder="Creating Your Daily Schedule"
            />
          </div>
          <div>
            <Label htmlFor="video_url">Video URL</Label>
            <div className="mb-1"></div>
            <Input
              id="video_url"
              name="video_url"
              placeholder="https://youtube.com/watch?v=..."
              type="url"
            />
          </div>
          <Button
            type="submit"
            variant="quest"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "🏰 Create Realm"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Create Quiz Dialog Component
const CreateQuizDialog = ({
  children,
  worlds,
  realms,
  quizzes,
  onQuizCreated,
  onSubmitQuiz,
}: {
  children: React.ReactNode;
  worlds: World[];
  realms: Realm[];
  quizzes: Quiz[];
  onQuizCreated: () => void;
  onSubmitQuiz: (formData: {
    title: string;
    description: string;
    realm_id: string;
    total_questions: number;
    passing_score: number;
    points_reward: number;
  }) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const quizData = {
      realm_id: formData.get("realm_id") as string,
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      total_questions: Number(formData.get("total_questions") || 0),
      passing_score: Number(formData.get("passing_score") || 70),
      points_reward: Number(formData.get("points_reward") || 10),
    };

    const success = await onSubmitQuiz(quizData);
    if (success) {
      setOpen(false);
      onQuizCreated();
    }
    setLoading(false);
  };

  // Get realms that don't have quizzes yet
  const realmsWithoutQuizzes = realms.filter((realm) => {
    const realmQuizzes = quizzes.filter((q) => q.realm_id === realm.id);
    return realmQuizzes.length === 0;
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🧠 Create New Quiz</DialogTitle>
          <DialogDescription>
            Add a New Quiz to a Realm that Doesn't have One Yet
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="realm_id">Realm</Label>
            <div className="mb-1"></div>
            <select
              id="realm_id"
              name="realm_id"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="">Select a Realm</option>
              {worlds.map((world) => {
                const worldRealms = realmsWithoutQuizzes.filter(
                  (r) => r.world_id === world.id
                );
                if (worldRealms.length === 0) return null;

                return (
                  <optgroup
                    key={world.id}
                    label={`${world.emoji} ${world.name}`}
                  >
                    {worldRealms.map((realm) => (
                      <option key={realm.id} value={realm.id}>
                        {realm.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <div className="mb-1"></div>
            <Input id="title" name="title" placeholder="Quiz Title" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <div className="mb-1"></div>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional description"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="total_questions">Total Questions</Label>
              <div className="mb-1"></div>
              <Input
                id="total_questions"
                name="total_questions"
                type="number"
                min={0}
                defaultValue={0}
              />
            </div>
            <div>
              <Label htmlFor="passing_score">Passing Score (%)</Label>
              <div className="mb-1"></div>
              <Input
                id="passing_score"
                name="passing_score"
                type="number"
                min={0}
                max={100}
                defaultValue={70}
              />
            </div>
            <div>
              <Label htmlFor="points_reward">Points Rewarded</Label>
              <div className="mb-1"></div>
              <Input
                id="points_reward"
                name="points_reward"
                type="number"
                min={0}
                defaultValue={10}
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="magical"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "🧠 Create Quiz"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Create Quiz Questions Dialog Component
const CreateQuizQuestionsDialog = ({
  children,
  quizzes,
  onQuestionsCreated,
  onSubmitQuestions,
}: {
  children: React.ReactNode;
  quizzes: Quiz[];
  onQuestionsCreated: () => void;
  onSubmitQuestions: (
    quizId: string,
    questions: {
      question_text: string;
      question_type: "mcq" | "true_false";
      options: string[] | null;
      correct_answer: string;
      explanation: string | null;
      points: number;
    }[]
  ) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [questions, setQuestions] = useState<
    {
      question_text: string;
      question_type: "mcq" | "true_false";
      options: string[];
      correct_answer: string;
      explanation: string;
      points: number;
    }[]
  >([]);
  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);
  const [existingQuestionsCount, setExistingQuestionsCount] = useState(0);

  useEffect(() => {
    if (!selectedQuizId) return;

    const fetchExistingCount = async () => {
      const { count, error } = await supabase
        .from("quiz_questions")
        .select("id", { count: "exact", head: true })
        .eq("quiz_id", selectedQuizId);

      if (!error && count !== null) {
        setExistingQuestionsCount(count);
      } else {
        console.error("Error fetching existing question count:", error);
        setExistingQuestionsCount(0);
      }
    };

    fetchExistingCount();
  }, [selectedQuizId]);

  const addQuestion = () => {
    if (!selectedQuiz) return;

    const perQuestionPoints =
      selectedQuiz.points_reward / selectedQuiz.total_questions;

    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "mcq",
        options: ["", "", "", ""],
        correct_answer: "",
        explanation: "",
        points: perQuestionPoints,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];

    if (field === "question_type") {
      newQuestions[index].question_type = value as "mcq" | "true_false";

      if (value === "true_false") {
        newQuestions[index].options = ["True", "False"];
        newQuestions[index].correct_answer = "";
      } else {
        newQuestions[index].options = ["", "", "", ""];
        newQuestions[index].correct_answer = "";
      }
    } else if (field === "points" && selectedQuiz) {
      newQuestions[index].points =
        selectedQuiz.points_reward / selectedQuiz.total_questions;
    } else {
      newQuestions[index] = { ...newQuestions[index], [field]: value };
    }

    setQuestions(newQuestions);
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedQuizId) {
      alert("Please Select a Quiz First");
      setLoading(false);
      return;
    }

    if (questions.length === 0) {
      alert("Please Add At Least One Question");
      setLoading(false);
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        alert(`Question ${i + 1}: Please Enter Question Text`);
        setLoading(false);
        return;
      }
      if (q.question_type === "mcq") {
        if (q.options.some((opt) => !opt.trim())) {
          alert(`Question ${i + 1}: Please Fill all MCQ Options`);
          setLoading(false);
          return;
        }
        if (!q.options.includes(q.correct_answer)) {
          alert(`Question ${i + 1}: Correct Answer Must be One of the Options`);
          setLoading(false);
          return;
        }
      } else {
        if (!["true", "false"].includes(q.correct_answer.toLowerCase())) {
          alert(
            `Question ${i + 1}: True/False Answer must be "True" or "False"`
          );
          setLoading(false);
          return;
        }
      }
    }

    const success = await onSubmitQuestions(selectedQuizId, questions);
    if (success) {
      setOpen(false);
      setQuestions([]);
      setSelectedQuizId("");
      onQuestionsCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📝 Create Quiz Questions</DialogTitle>
          <DialogDescription>
            Select a Quiz and Add Questions to it. You can Create Multiple
            Choice or True/False Questions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="quiz-select">Select Quiz</Label>
            <div className="mb-1"></div>
            <select
              id="quiz-select"
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            >
              <option value="">Choose a Quiz...</option>
              {quizzes.map((quiz) => (
                <option key={quiz.id} value={quiz.id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </div>

          {selectedQuiz && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm mb-2">
                Selected Quiz: {selectedQuiz.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {selectedQuiz.description || "No description"}
              </p>
            </div>
          )}

          {selectedQuizId && (
            <div>
              {questions.map((question, index) => (
                <div key={index} className="p-5 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label>Question Text</Label>
                    <div className="mb-1"></div>
                    <Textarea
                      value={question.question_text}
                      onChange={(e) =>
                        updateQuestion(index, "question_text", e.target.value)
                      }
                      placeholder="Enter your Question Here..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <div className="mb-1"></div>
                      <select
                        value={question.question_type}
                        onChange={(e) =>
                          updateQuestion(index, "question_type", e.target.value)
                        }
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                      </select>
                    </div>

                    <div>
                      <Label>Points</Label>
                      <div className="mb-1"></div>
                      <Input
                        type="number"
                        value={question.points}
                        readOnly
                        className="text-black cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {question.question_type === "mcq" ? (
                    <div className="space-y-2">
                      <Label>Options</Label>
                      <div className="mb-1"></div>
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex items-center gap-2"
                        >
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(index, optionIndex, e.target.value)
                            }
                            placeholder={`Option ${String.fromCharCode(
                              65 + optionIndex
                            )}`}
                            required
                          />
                          <input
                            type="radio"
                            name={`correct_${index}`}
                            onChange={() =>
                              updateQuestion(index, "correct_answer", option)
                            }
                            required
                          />
                          <span className="text-sm">Correct</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      <div className="mb-1"></div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`correct_${index}`}
                            value="True"
                            checked={
                              question.correct_answer.toLowerCase() === "true"
                            }
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "correct_answer",
                                e.target.value
                              )
                            }
                            required
                          />
                          True
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`correct_${index}`}
                            value="False"
                            checked={
                              question.correct_answer.toLowerCase() === "false"
                            }
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "correct_answer",
                                e.target.value
                              )
                            }
                            required
                          />
                          False
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Explanation</Label>
                    <div className="mb-1"></div>
                    <Textarea
                      value={question.explanation}
                      onChange={(e) =>
                        updateQuestion(index, "explanation", e.target.value)
                      }
                      placeholder="Explain Why this Answer is Correct..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedQuizId && (
            <div className="flex justify-between">
              {existingQuestionsCount + questions.length <
                selectedQuiz.total_questions && (
                <Button type="button" variant="outline" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              )}
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="magical"
                  disabled={loading || questions.length === 0}
                >
                  {loading
                    ? "Creating..."
                    : `Create ${questions.length} Questions`}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit World Dialog Component
const EditWorldDialog = ({
  children,
  world,
  onWorldUpdated,
}: {
  children: React.ReactNode;
  world: World;
  onWorldUpdated: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: world.name,
    emoji: world.emoji,
    description: world.description,
    order_index: world.order_index,
    is_active: world.is_active,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from("worlds")
        .update({
          name: form.name,
          emoji: form.emoji,
          description: form.description,
          order_index: Number(form.order_index),
          is_active: form.is_active,
        })
        .eq("id", world.id);
      if (error) throw error;
      setOpen(false);
      onWorldUpdated();
    } catch (error) {
      console.error("Error updating world:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>✏️ Edit World</DialogTitle>
          <DialogDescription>Update World Details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="world_name">Name</Label>
            <div className="mb-1"></div>
            <Input
              id="world_name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="world_emoji">Emoji</Label>
            <div className="mb-1"></div>
            <Input
              id="world_emoji"
              value={form.emoji}
              onChange={(e) =>
                setForm((p) => ({ ...p, emoji: e.target.value }))
              }
              required
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="world_desc">Description</Label>
            <div className="mb-1"></div>
            <Textarea
              id="world_desc"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="world_order">Order Index</Label>
              <div className="mb-1"></div>
              <Input
                id="world_order"
                type="number"
                value={form.order_index}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    order_index: Number(e.target.value),
                  }))
                }
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                id="world_active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((p) => ({ ...p, is_active: e.target.checked }))
                }
              />
              <Label htmlFor="world_active">Activate World</Label>
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Updating..." : "💾 Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Realm Dialog Component
const EditRealmDialog = ({
  children,
  realm,
  worlds,
  onRealmUpdated,
}: {
  children: React.ReactNode;
  realm: Realm;
  worlds: World[];
  onRealmUpdated: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: realm.name,
    emoji: realm.emoji,
    description: realm.description,
    world_id: realm.world_id,
    order_index: realm.order_index,
    video_url: realm.video_url || "",
    video_title: realm.video_title || "",
    is_active: realm.is_active,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from("realms")
        .update({
          name: form.name,
          emoji: form.emoji,
          description: form.description,
          world_id: form.world_id,
          order_index: Number(form.order_index),
          video_url: form.video_url || null,
          video_title: form.video_title || null,
          is_active: form.is_active,
        })
        .eq("id", realm.id);
      if (error) throw error;
      setOpen(false);
      onRealmUpdated();
    } catch (error) {
      console.error("Error updating realm:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>✏️ Edit Realm</DialogTitle>
          <DialogDescription>Update Realm Details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="realm_edit_name">Name</Label>
            <div className="mb-1"></div>
            <Input
              id="realm_edit_name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="realm_edit_emoji">Emoji</Label>
            <div className="mb-1"></div>
            <Input
              id="realm_edit_emoji"
              value={form.emoji}
              onChange={(e) =>
                setForm((p) => ({ ...p, emoji: e.target.value }))
              }
              required
              maxLength={2}
            />
          </div>
          <div>
            <Label htmlFor="realm_edit_desc">Description</Label>
            <div className="mb-1"></div>
            <Textarea
              id="realm_edit_desc"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="realm_edit_world">World</Label>
              <div className="mb-1"></div>
              <select
                id="realm_edit_world"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                value={form.world_id}
                onChange={(e) =>
                  setForm((p) => ({ ...p, world_id: e.target.value }))
                }
              >
                {worlds.map((world) => (
                  <option key={world.id} value={world.id}>
                    {world.emoji} {world.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="realm_edit_order">Order Index</Label>
              <div className="mb-1"></div>
              <Input
                id="realm_edit_order"
                type="number"
                value={form.order_index}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    order_index: Number(e.target.value),
                  }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="realm_edit_video_title">Video Title</Label>
              <div className="mb-1"></div>
              <Input
                id="realm_edit_video_title"
                value={form.video_title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, video_title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="realm_edit_video_url">Video URL</Label>
              <div className="mb-1"></div>
              <Input
                id="realm_edit_video_url"
                type="url"
                value={form.video_url}
                onChange={(e) =>
                  setForm((p) => ({ ...p, video_url: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="realm_edit_active"
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm((p) => ({ ...p, is_active: e.target.checked }))
              }
            />
            <Label htmlFor="realm_edit_active">Activate Realm</Label>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Updating..." : "💾 Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Quiz Dialog Component
const EditQuizDialog = ({
  children,
  quiz,
  onQuizUpdated,
  onSubmitQuiz,
}: {
  children: React.ReactNode;
  quiz: Quiz;
  onQuizUpdated: () => void;
  onSubmitQuiz: (
    quizId: string,
    formData: {
      title: string;
      description: string;
      total_questions: number;
      passing_score: number;
      points_reward: number;
    }
  ) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: quiz.title,
    description: quiz.description || "",
    total_questions: quiz.total_questions,
    passing_score: quiz.passing_score,
    points_reward: quiz.points_reward,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const success = await onSubmitQuiz(quiz.id, form);
    if (success) {
      setOpen(false);
      onQuizUpdated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>✏️ Edit Quiz: {quiz.title}</DialogTitle>
          <DialogDescription>Update Quiz Details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="quiz_edit_title">Title</Label>
            <div className="mt-1"></div>
            <Input
              id="quiz_edit_title"
              value={form.title}
              onChange={(e) =>
                setForm((p) => ({ ...p, title: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="quiz_edit_desc">Description</Label>
            <div className="mt-1"></div>
            <Textarea
              id="quiz_edit_desc"
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label htmlFor="quiz_edit_total_questions">Total Questions</Label>
              <div className="mt-1"></div>
              <Input
                id="quiz_edit_total_questions"
                type="number"
                min={0}
                value={form.total_questions}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    total_questions: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="quiz_edit_passing_score">Passing Score (%)</Label>
              <div className="mt-1"></div>
              <Input
                id="quiz_edit_passing_score"
                type="number"
                min={0}
                max={100}
                value={form.passing_score}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    passing_score: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="quiz_edit_points_reward">Points Rewarded</Label>
              <div className="mt-1"></div>
              <Input
                id="quiz_edit_points_reward"
                type="number"
                min={0}
                value={form.points_reward}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    points_reward: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Updating..." : "💾 Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// Edit Quiz Question Dialog Component
const EditQuizQuestionDialog = ({
  children,
  question,
  onQuestionUpdated,
  onSubmitQuestion,
}: {
  children: React.ReactNode;
  question: QuizQuestion;
  onQuestionUpdated: () => void;
  onSubmitQuestion: (
    questionId: string,
    formData: {
      question_text: string;
      question_type: "mcq" | "true_false";
      options: string[] | null;
      correct_answer: string;
      explanation: string | null;
      points: number;
      order_index: number;
    }
  ) => Promise<boolean>;
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    question_text: question.question_text,
    question_type: question.question_type,
    options: Array.isArray(question.options)
      ? question.options
      : ["", "", "", ""],
    correct_answer: question.correct_answer,
    explanation: question.explanation || "",
    points: question.points,
    order_index: question.order_index,
  });

  const updateOption = (index: number, value: string) => {
    const newOptions = [...form.options];
    newOptions[index] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Validate form
    if (form.question_type === "mcq") {
      if (form.options.some((opt) => !opt.trim())) {
        alert("Please Fill all MCQ Options");
        setLoading(false);
        return;
      }
      if (!form.options.includes(form.correct_answer)) {
        alert("Correct Answer Must be One of the Options");
        setLoading(false);
        return;
      }
    } else {
      if (!["true", "false"].includes(form.correct_answer.toLowerCase())) {
        alert("True/False Answer must be 'True' or 'False'");
        setLoading(false);
        return;
      }
    }

    const success = await onSubmitQuestion(question.id, {
      ...form,
      options: form.question_type === "mcq" ? form.options : null,
    });
    if (success) {
      setOpen(false);
      onQuestionUpdated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✏️ Edit Question</DialogTitle>
          <DialogDescription>Update Question Details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question_edit_text">Question Text</Label>
            <div className="mb-1"></div>
            <Textarea
              id="question_edit_text"
              value={form.question_text}
              onChange={(e) =>
                setForm((p) => ({ ...p, question_text: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="question_edit_type">Question Type</Label>
              <div className="mb-1"></div>
              <select
                id="question_edit_type"
                value={form.question_type}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    question_type: e.target.value as "mcq" | "true_false",
                  }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="true_false">True/False</option>
              </select>
            </div>
            <div>
              <Label htmlFor="question_edit_points">Points</Label>
              <div className="mb-1"></div>
              <Input
                id="question_edit_points"
                type="number"
                value={form.points}
                readOnly
                className="text-black cursor-not-allowed"
              />
            </div>
          </div>

          {form.question_type === "mcq" ? (
            <div className="space-y-2">
              <Label>Options</Label>
              <div className="mb-1"></div>
              {form.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    required
                  />
                  <input
                    type="radio"
                    name="correct_answer"
                    checked={form.correct_answer === option}
                    onChange={() =>
                      setForm((p) => ({ ...p, correct_answer: option }))
                    }
                    required
                  />
                  <span className="text-sm">Correct</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <Label>Correct Answer</Label>
              <div className="mb-1"></div>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="correct_answer"
                    value="True"
                    checked={form.correct_answer.toLowerCase() === "true"}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, correct_answer: e.target.value }))
                    }
                    required
                  />
                  True
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="correct_answer"
                    value="False"
                    checked={form.correct_answer.toLowerCase() === "false"}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, correct_answer: e.target.value }))
                    }
                    required
                  />
                  False
                </label>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="question_edit_explanation">Explanation</Label>
            <div className="mb-1"></div>
            <Textarea
              id="question_edit_explanation"
              value={form.explanation}
              onChange={(e) =>
                setForm((p) => ({ ...p, explanation: e.target.value }))
              }
              placeholder="Explain why this answer is correct..."
            />
          </div>

          <div>
            <Label htmlFor="question_edit_order">Order Index</Label>
            <div className="mb-1"></div>
            <Input
              id="question_edit_order"
              type="number"
              min="1"
              value={form.order_index}
              onChange={(e) =>
                setForm((p) => ({ ...p, order_index: Number(e.target.value) }))
              }
              required
            />
          </div>

          <Button
            type="submit"
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Updating..." : "💾 Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
