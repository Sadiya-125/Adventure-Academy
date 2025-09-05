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
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  Star,
  Trophy,
  Target,
  Clock,
  Lock,
  Medal,
  Award,
  Zap,
  Crown as CrownIcon,
  Play,
  Brain,
  LogOut,
} from "lucide-react";
import { WorldView } from "./WorldView";
import { useToast } from "@/components/ui/use-toast";

interface World {
  id: string;
  name: string;
  emoji: string;
  description: string;
  order_index: number;
  is_active: boolean;
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
}

interface StudentProgress {
  id: string;
  realm_id: string;
  video_watched: boolean;
  quiz_completed: boolean;
  quiz_score?: number;
  points_earned: number;
  is_completed: boolean;
}

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
}

interface LeaderboardEntry {
  id: string;
  full_name: string;
  total_points: number;
  worlds_completed: number;
  realms_completed: number;
  rank: number;
  member_since?: string;
}

export const StudentDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [realms, setRealms] = useState<Realm[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorldId, setSelectedWorldId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [lastLeaderboardUpdate, setLastLeaderboardUpdate] =
    useState<Date | null>(null);
  const [stats, setStats] = useState({
    worldsCompleted: 0,
    adventurePoints: 0,
    successRate: 0,
    realmsConquered: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (leaderboard.length === 0 && !leaderboardLoading) {
      fetchLeaderboard();
    }
  }, [leaderboard.length, leaderboardLoading]);

  // Add new useEffect to refresh leaderboard when data changes
  useEffect(() => {
    if (progress.length > 0 && worlds.length > 0 && realms.length > 0) {
      fetchLeaderboard();
    }
  }, [progress, worlds, realms]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch worlds
      const { data: worldsData } = await supabase
        .from("worlds")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (worldsData) {
        setWorlds(worldsData);
      }

      // Fetch realms
      const { data: realmsData } = await supabase
        .from("realms")
        .select("*")
        .eq("is_active", true)
        .order("order_index");

      if (realmsData) {
        setRealms(realmsData);
      }

      // Fetch student progress
      if (profileData) {
        const { data: progressData } = await supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", profileData.id);

        if (progressData) {
          setProgress(progressData);

          // Calculate stats
          const completedRealms = progressData.filter((p) => p.is_completed);
          const totalPoints = progressData.reduce(
            (sum, p) => sum + (p.points_earned || 0),
            0
          );
          const totalQuizzes = progressData.filter(
            (p) => p.quiz_completed
          ).length;
          const passedQuizzes = progressData.filter(
            (p) => p.quiz_score && p.quiz_score >= 70
          ).length;
          const successRate =
            totalQuizzes > 0
              ? Math.round((passedQuizzes / totalQuizzes) * 100)
              : 0;

          // Calculate completed worlds - a world is completed only when ALL its realms are completed
          const completedWorlds =
            worldsData?.filter((world) => {
              const worldRealms =
                realmsData?.filter((r) => r.world_id === world.id) || [];
              const completedWorldRealms = worldRealms.filter((realm) =>
                progressData.some(
                  (p) => p.realm_id === realm.id && p.is_completed
                )
              );
              return (
                completedWorldRealms.length === worldRealms.length &&
                worldRealms.length > 0
              );
            }) || [];

          setStats({
            worldsCompleted: completedWorlds.length,
            adventurePoints: totalPoints,
            successRate,
            realmsConquered: completedRealms.length,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      // Fetch all student profiles (no filtering by points to show all students)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, created_at")
        .eq("role", "student")
        .order("full_name");

      console.log("profilesData", profilesData);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error Loading Leaderboard",
          description: "Failed to load student profiles. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!profilesData || profilesData.length === 0) {
        setLeaderboard([]);
        return;
      }

      // Get all progress data for all students
      const { data: progressData, error: progressError } = await supabase
        .from("student_progress")
        .select(
          "student_id, points_earned, is_completed, realm_id, created_at"
        );

      if (progressError) {
        console.error("Error fetching progress:", progressError);
        toast({
          title: "Error Loading Leaderboard",
          description: "Failed to load progress data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Process the data to calculate points and rankings
      const processedData = profilesData
        .map((user) => {
          const userProgress =
            progressData?.filter(
              (progress) => progress.student_id === user.id
            ) || [];

          // Calculate total points from all completed realms
          const totalPoints = userProgress.reduce(
            (sum, progress) => sum + (progress.points_earned || 0),
            0
          );

          const completedRealms = userProgress.filter(
            (progress) => progress.is_completed
          );

          // Calculate completed worlds - a world is completed only when ALL its realms are completed
          const completedWorlds = worlds.filter((world) => {
            const worldRealms = realms.filter((r) => r.world_id === world.id);
            const completedWorldRealms = worldRealms.filter((realm) =>
              completedRealms.some((p) => p.realm_id === realm.id)
            );
            return (
              completedWorldRealms.length === worldRealms.length &&
              worldRealms.length > 0
            );
          });

          return {
            id: user.id,
            full_name: user.full_name,
            total_points: totalPoints,
            worlds_completed: completedWorlds.length,
            realms_completed: completedRealms.length,
            rank: 0,
            member_since: user.created_at,
          };
        })
        .sort((a, b) => {
          // Sort by total points (descending), then by realms completed, then by name
          if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points;
          }
          if (b.realms_completed !== a.realms_completed) {
            return b.realms_completed - a.realms_completed;
          }
          return a.full_name.localeCompare(b.full_name);
        })
        .map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

      setLeaderboard(processedData);
      setLastLeaderboardUpdate(new Date());

      // Log success for debugging
      console.log(`Leaderboard updated with ${processedData.length} students`);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast({
        title: "Error Loading Leaderboard",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const isWorldUnlocked = (worldIndex: number) => {
    if (worldIndex === 0) return true;

    const prevWorld = worlds[worldIndex - 1];
    if (!prevWorld) return false;

    const prevWorldRealms = realms.filter((r) => r.world_id === prevWorld.id);
    const completedPrevRealms = prevWorldRealms.filter((realm) =>
      progress.some((p) => p.realm_id === realm.id && p.is_completed)
    );

    return completedPrevRealms.length === prevWorldRealms.length;
  };

  const isRealmUnlocked = (realm: Realm) => {
    const worldRealms = realms
      .filter((r) => r.world_id === realm.world_id)
      .sort((a, b) => a.order_index - b.order_index);

    const realmIndex = worldRealms.findIndex((r) => r.id === realm.id);

    if (realmIndex === 0) return true;

    const prevRealm = worldRealms[realmIndex - 1];
    return progress.some((p) => p.realm_id === prevRealm.id && p.is_completed);
  };

  const getRealmProgress = (realmId: string) => {
    return progress.find((p) => p.realm_id === realmId);
  };

  const handleEnterWorld = (worldId: string) => {
    setSelectedWorldId(worldId);
  };

  const handleBackToWorlds = () => {
    setSelectedWorldId(null);
    fetchData(); // Refresh data when returning
    fetchLeaderboard(); // Also refresh leaderboard to show latest points
  };

  if (selectedWorldId) {
    return <WorldView worldId={selectedWorldId} onBack={handleBackToWorlds} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-quest-blue/10">
        <Card variant="magical" className="p-8">
          <div className="text-center">
            <div className="animate-sparkle mb-4">
              <Star className="w-12 h-12 mx-auto text-primary" />
            </div>
            <p className="text-lg font-bold">🌟 Loading your Adventure...</p>
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
              <CrownIcon className="w-8 h-8 animate-sparkle" />
              <h1 className="text-xl sm:text-2xl font-bold hidden sm:block">
                Adventure Academy
              </h1>
              <h1 className="text-xl font-bold sm:hidden">Adventure Academy</h1>
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
            <h2 className="font-bold ml-1">👨‍🎓 {profile?.full_name}</h2>
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
              🌟 Welcome back, {profile?.full_name}! Ready for Your Next Quest?
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card variant="quest" className="text-center">
            <CardContent className="p-6">
              <Target className="w-8 h-8 mx-auto mb-2 text-quest-blue" />
              <p className="text-2xl font-bold">{stats.worldsCompleted}</p>
              <p className="text-sm text-muted-foreground">
                🌍 Worlds Completed
              </p>
            </CardContent>
          </Card>

          <Card variant="magical" className="text-center">
            <CardContent className="p-6">
              <Star className="w-8 h-8 mx-auto mb-2 text-treasure-gold" />
              <p className="text-2xl font-bold">{stats.adventurePoints}</p>
              <p className="text-sm text-muted-foreground">
                🌟 Adventure Points
              </p>
            </CardContent>
          </Card>

          <Card variant="completed" className="text-center">
            <CardContent className="p-6">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{stats.successRate}%</p>
              <p className="text-sm text-muted-foreground">✅ Success Rate</p>
            </CardContent>
          </Card>

          <Card variant="floating" className="text-center">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.realmsConquered}</p>
              <p className="text-sm text-muted-foreground">
                🏰 Realms Conquered
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="worlds" className="w-full">
          <div className="overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 pt-2 sm:pt-3">
            <TabsList className="w-max sm:w-full mb-4 xs:mb-6 sm:mb-8 flex gap-2 xs:gap-3 sm:gap-4 p-1 xs:p-1.5 sm:p-2 rounded-lg mx-auto sm:mx-0">
              <TabsTrigger
                value="worlds"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 h-auto rounded-md whitespace-nowrap"
              >
                <span className="inline-block text-xl">🌍</span>{" "}
                <span className="ml-1 xs:ml-2">Explore Worlds</span>
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 h-auto rounded-md whitespace-nowrap"
              >
                <span className="inline-block text-xl">🗺️</span>{" "}
                <span className="ml-1 xs:ml-2">Adventure Map</span>
              </TabsTrigger>
              <TabsTrigger
                value="leaderboard"
                className="data-[state=active]:bg-primary data-[state=active]:text-white text-base px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-2.5 h-auto rounded-md whitespace-nowrap"
              >
                <span className="inline-block text-xl">🏆</span>{" "}
                <span className="ml-1 xs:ml-2">Leaderboard</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="worlds">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {worlds.map((world, index) => {
                const worldRealms = realms.filter(
                  (r) => r.world_id === world.id
                );
                const completedRealms = worldRealms.filter((realm) =>
                  progress.some(
                    (p) => p.realm_id === realm.id && p.is_completed
                  )
                );
                const unlocked = isWorldUnlocked(index);
                const worldProgress =
                  (completedRealms.length / worldRealms.length) * 100;

                return (
                  <Card
                    key={world.id}
                    variant={unlocked ? "world" : "locked"}
                    className={`group cursor-pointer transition-all duration-300 hover:scale-105 ${
                      unlocked ? "hover:shadow-lg" : "opacity-60"
                    } flex flex-col justify-center h-full`}
                    onClick={() => {
                      if (unlocked) {
                        handleEnterWorld(world.id);
                      }
                    }}
                  >
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center mb-4 relative">
                        <div
                          className={`p-3 rounded-full ${
                            unlocked ? "bg-primary/20" : "bg-gray-200"
                          }`}
                        >
                          <span className="text-3xl">{world.emoji}</span>
                        </div>
                        {!unlocked && (
                          <Lock className="absolute -top-2 -right-2 w-6 h-6 text-muted-foreground" />
                        )}
                        {unlocked && worldProgress === 100 && (
                          <CheckCircle className="absolute -top-2 -right-2 w-6 h-6 text-success" />
                        )}
                        {unlocked &&
                          worldProgress > 0 &&
                          worldProgress < 100 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                          )}
                      </div>
                      <CardTitle className="text-base sm:text-lg">
                        {world.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {world.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {completedRealms.length}/{worldRealms.length}
                          </span>
                        </div>
                        <Progress value={worldProgress} className="h-2" />
                        {unlocked ? (
                          <div className="space-y-2">
                            <Button
                              variant="magical"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnterWorld(world.id);
                              }}
                            >
                              🚀 Enter World
                            </Button>
                            {worldProgress > 0 && (
                              <div className="text-sm text-center text-muted-foreground">
                                {worldProgress === 100
                                  ? "World Completed! 🎉"
                                  : `${Math.round(worldProgress)}% Complete`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              disabled
                            >
                              🔒 Locked
                            </Button>
                            <div className="text-sm text-center text-muted-foreground">
                              Complete Previous Worlds to Unlock
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card variant="magical">
              <CardHeader>
                <CardTitle className="text-center">
                  🗺️ Your Adventure Map
                </CardTitle>
                <CardDescription className="text-center">
                  Click on worlds and realms to explore! Complete realms to
                  unlock new areas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {worlds.map((world, worldIndex) => {
                    const worldRealms = realms
                      .filter((r) => r.world_id === world.id)
                      .sort((a, b) => a.order_index - b.order_index);
                    const worldUnlocked = isWorldUnlocked(worldIndex);
                    const completedWorldRealms = worldRealms.filter((realm) =>
                      progress.some(
                        (p) => p.realm_id === realm.id && p.is_completed
                      )
                    );
                    const worldProgress =
                      (completedWorldRealms.length / worldRealms.length) * 100;

                    return (
                      <div key={world.id} className="space-y-4">
                        {/* World Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-primary/10 to-quest-blue/10 rounded-lg border-2 border-primary/20">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-3 rounded-full ${
                                worldUnlocked ? "bg-primary/20" : "bg-gray-200"
                              }`}
                            >
                              <span className="text-3xl">{world.emoji}</span>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold flex items-center gap-2">
                                {world.name}
                                {!worldUnlocked && (
                                  <Lock className="w-5 h-5 text-muted-foreground" />
                                )}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {world.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-2xl font-bold text-primary">
                              {completedWorldRealms.length}/{worldRealms.length}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Realms
                            </div>
                            <Progress
                              value={worldProgress}
                              className="w-full sm:w-24 h-2 mt-1"
                            />
                          </div>
                        </div>

                        {/* Realms Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {worldRealms.map((realm, realmIndex) => {
                            const realmProgress = getRealmProgress(realm.id);
                            const realmUnlocked = isRealmUnlocked(realm);
                            const isCompleted = realmProgress?.is_completed;
                            const canClick = worldUnlocked && realmUnlocked;

                            return (
                              <Card
                                key={realm.id}
                                variant={
                                  isCompleted
                                    ? "completed"
                                    : realmUnlocked
                                    ? "world"
                                    : "locked"
                                }
                                className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                                  canClick ? "hover:shadow-lg" : "opacity-60"
                                }`}
                                onClick={() => {
                                  if (canClick) {
                                    handleEnterWorld(world.id);
                                  }
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-2xl">
                                        {realm.emoji}
                                      </span>
                                      <h4 className="font-bold text-md sm:text-lg">
                                        {realm.name}
                                      </h4>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      {isCompleted && (
                                        <Medal className="w-5 h-5 text-treasure-gold" />
                                      )}
                                      {!realmUnlocked && (
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                      )}
                                      {canClick && !isCompleted && (
                                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <Play className="w-3 h-3" />
                                        Video
                                      </span>
                                      <span
                                        className={
                                          realmProgress?.video_watched
                                            ? "text-green-600"
                                            : "text-gray-400"
                                        }
                                      >
                                        {realmProgress?.video_watched
                                          ? "✅"
                                          : "⏸️"}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="flex items-center gap-1">
                                        <Brain className="w-3 h-3" />
                                        Quiz
                                      </span>
                                      <span
                                        className={
                                          realmProgress?.quiz_completed
                                            ? "text-green-600"
                                            : "text-gray-400"
                                        }
                                      >
                                        {realmProgress?.quiz_completed
                                          ? `${realmProgress.quiz_score}%`
                                          : "❌"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="mt-3">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Progress</span>
                                      <span>
                                        {isCompleted
                                          ? "100%"
                                          : realmProgress?.video_watched
                                          ? "50%"
                                          : "0%"}
                                      </span>
                                    </div>
                                    <Progress
                                      value={
                                        isCompleted
                                          ? 100
                                          : realmProgress?.video_watched
                                          ? 50
                                          : 0
                                      }
                                      className="h-1"
                                    />
                                  </div>

                                  {/* Click Hint */}
                                  {canClick && (
                                    <div className="mt-2 text-sm text-center text-primary font-medium">
                                      Click to Explore
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        {/* World Completion Status */}
                        {worldProgress === 100 && (
                          <div className="flex items-center justify-center gap-2 p-3 bg-success/10 rounded-lg border border-success/20">
                            <CheckCircle className="w-5 h-5 text-success" />
                            <span className="font-semibold text-success">
                              World Completed! 🎉
                            </span>
                          </div>
                        )}

                        {/* World Lock Message */}
                        {!worldUnlocked && (
                          <div className="flex items-center justify-center gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <Lock className="w-5 h-5 text-orange-600" />
                            <span className="text-orange-800">
                              Complete Previous Worlds to Unlock {world.name}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Map Legend */}
                <div className="mt-8 p-4 bg-white rounded-xl shadow-sm w-full">
                  <h4 className="font-bold text-lg mb-4 text-center">
                    🗺️ Map Legend
                  </h4>
                  <div className="flex justify-between flex-wrap gap-6 text-sm md:text-base">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-primary rounded-lg border border-primary/30"></div>
                      <span className="font-medium text-gray-700">
                        Available
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-success rounded-lg border border-success/30"></div>
                      <span className="font-medium text-gray-700">
                        Completed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-300 rounded-lg border border-gray-400/40"></div>
                      <span className="font-medium text-gray-700">Locked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse border-2 border-primary/50"></div>
                      <span className="font-medium text-gray-700">Current</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card variant="magical">
              <CardHeader>
                <CardTitle className="text-center flex items-center justify-center gap-2">
                  <Trophy className="w-6 h-6 text-treasure-gold animate-pulse" />
                  Adventure Leaderboard
                  <Trophy className="w-6 h-6 text-treasure-gold animate-pulse" />
                </CardTitle>
                <CardDescription className="text-center">
                  Compete with fellow adventurers and climb the ranks! 🚀
                  {lastLeaderboardUpdate && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Last updated: {lastLeaderboardUpdate.toLocaleTimeString()}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center mb-6">
                  <Button
                    onClick={fetchLeaderboard}
                    disabled={leaderboardLoading}
                    className="bg-gradient-to-r from-treasure-gold to-quest-blue hover:from-treasure-gold/90 hover:to-quest-blue/90"
                  >
                    {leaderboardLoading ? (
                      <>
                        Loading...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Refresh Leaderboard
                      </>
                    )}
                  </Button>
                </div>

                {leaderboardLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Loading Leaderboard...
                    </p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No Students Found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Students Will Appear Here Once They Start Their Adventure!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = entry.id === profile?.id;
                      const getRankIcon = (rank: number) => {
                        switch (rank) {
                          case 1:
                            return (
                              <CrownIcon className="w-6 h-6 animate-pulse" />
                            );
                          case 2:
                            return (
                              <Medal className="w-6 h-6 animate-pulse" />
                            );
                          case 3:
                            return (
                              <Award className="w-6 h-6 animate-pulse" />
                            );
                          default:
                            return (
                              <span className="text-lg font-bold text-muted-foreground">
                                #{rank}
                              </span>
                            );
                        }
                      };

                      const getRankBadge = (rank: number) => {
                        switch (rank) {
                          default:
                            return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
                        }
                      };

                      return (
                        <Card
                          key={entry.id}
                          variant={isCurrentUser ? "magical" : "default"}
                          className={`transition-all duration-300 hover:scale-[1.02] ${
                            isCurrentUser ? "ring-2 ring-primary shadow-lg" : ""
                          } overflow-hidden`}
                        >
                          <CardContent className="p-2 xs:p-3 sm:p-4">
                            <div className="flex items-center justify-between gap-3 xs:gap-4 sm:gap-5 flex-wrap">
                              <div className="flex items-center gap-3 xs:gap-4 sm:gap-5 min-w-0 w-full sm:w-auto">
                                <div className="flex items-center justify-center w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/10 to-primary/30 rounded-full">
                                  {getRankIcon(entry.rank)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 xs:gap-3 flex-wrap">
                                    <h3 className="font-semibold text-base xs:text-lg sm:text-xl truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none">
                                      {entry.full_name}
                                      {isCurrentUser && (
                                        <span className="ml-1 xs:ml-2 text-primary">
                                            (You)
                                        </span>
                                      )}
                                    </h3>
                                    <Badge
                                      className={`${getRankBadge(
                                        entry.rank
                                      )} text-xs sm:text-sm whitespace-nowrap px-3 py-1 shadow-sm`}
                                    >
                                      Rank #{entry.rank}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-3 xs:gap-4 sm:gap-5 mt-3 text-sm text-muted-foreground flex-wrap">
                                    <div className="flex items-center gap-1.5 xs:gap-2 bg-treasure-gold/10 px-2 py-1 rounded-md">
                                      <Star className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-treasure-gold" />
                                      <span className="font-medium text-treasure-gold">
                                        {entry.total_points}{" "}
                                        <span className="hidden xs:inline">
                                          Points
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 xs:gap-2 bg-quest-blue/10 px-2 py-1 rounded-md">
                                      <Target className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-quest-blue" />
                                      <span className="font-medium text-quest-blue">
                                        {entry.worlds_completed}{" "}
                                        <span className="hidden xs:inline">
                                          Worlds
                                        </span>
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 xs:gap-2 bg-primary/10 px-2 py-1 rounded-md">
                                      <Trophy className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-primary" />
                                      <span className="font-medium text-primary">
                                        {entry.realms_completed}{" "}
                                        <span className="hidden xs:inline">
                                          Realms
                                        </span>
                                      </span>
                                    </div>
                                    {entry.member_since && (
                                      <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-md">
                                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                                        <span className="text-gray-600">
                                          Member Since{" "}
                                          {new Date(
                                            entry.member_since
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-auto sm:mt-0 w-full sm:w-auto">
                                <div className="bg-gradient-to-r from-treasure-gold/5 to-treasure-gold/10 p-3 rounded-lg shadow-inner">
                                  <div className="text-lg xs:text-xl sm:text-2xl font-bold text-treasure-gold flex items-center justify-center gap-2">
                                    <Star className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7" />
                                    {entry.total_points}
                                  </div>
                                  <div className="text-base font-bold text-center text-treasure-gold">
                                    Total Points
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
