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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Play,
  Brain,
  Lock,
  CheckCircle,
  Star,
  Clock,
  Heart,
  DollarSign,
  Apple,
  Trophy,
  Medal,
  Video,
  BookOpen,
  Target,
  Award,
  AlertCircle,
  X,
} from "lucide-react";

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

interface Quiz {
  id: string;
  realm_id: string;
  title: string;
  description?: string;
  total_questions: number;
  passing_score: number;
  points_reward: number;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "mcq" | "true_false";
  options?: string[];
  correct_answer: string;
  explanation?: string;
  order_index: number;
  points: number;
  created_at?: string;
}

interface StudentProgress {
  id: string;
  student_id: string;
  realm_id: string;
  video_watched: boolean;
  video_watched_at?: string;
  quiz_completed: boolean;
  quiz_score?: number;
  quiz_attempts: number;
  quiz_best_score: number;
  quiz_completed_at?: string;
  is_completed: boolean;
  completed_at?: string;
  points_earned: number;
}

interface World {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface WorldViewProps {
  worldId: string;
  onBack: () => void;
}

// Utility function to convert YouTube URLs to embed URLs
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";

  // Handle different YouTube URL formats
  const youtubeRegex =
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);

  if (match) {
    const videoId = match[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }

  // If it's already an embed URL, return as is
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  // For other URLs, return as is (could be other video platforms)
  return url;
};

// Custom Alert Dialog Component
interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: "success" | "error" | "info" | "warning";
  onConfirm?: () => void;
  confirmText?: string;
  showCancel?: boolean;
}

const AlertDialog = ({
  open,
  onOpenChange,
  title,
  description,
  type = "info",
  onConfirm,
  confirmText = "OK",
  showCancel = false,
}: AlertDialogProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-orange-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700";
      case "error":
        return "bg-red-600 hover:bg-red-700";
      case "warning":
        return "bg-orange-600 hover:bg-orange-700";
      default:
        return "bg-blue-600 hover:bg-blue-700";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-lg">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-base mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          {showCancel && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button
            className={getButtonVariant()}
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              }
              onOpenChange(false);
            }}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const WorldView = ({ worldId, onBack }: WorldViewProps) => {
  const { user } = useAuth();
  const [world, setWorld] = useState<World | null>(null);
  const [realms, setRealms] = useState<Realm[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRealm, setSelectedRealm] = useState<Realm | null>(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [showQuizDialog, setShowQuizDialog] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [quizResults, setQuizResults] = useState<{
    correct: number;
    total: number;
    percentage: number;
    wrongAnswers: Array<{
      question: string;
      userAnswer: string;
      correctAnswer: string;
      explanation: string;
    }>;
  } | null>(null);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);

  // Alert Dialog State
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error" | "info" | "warning";
    onConfirm?: () => void;
    confirmText?: string;
    showCancel?: boolean;
  }>({
    open: false,
    title: "",
    description: "",
    type: "info",
  });

  const showAlert = (
    title: string,
    description: string,
    type: "success" | "error" | "info" | "warning" = "info",
    onConfirm?: () => void,
    confirmText?: string,
    showCancel?: boolean
  ) => {
    setAlertDialog({
      open: true,
      title,
      description,
      type,
      onConfirm,
      confirmText,
      showCancel,
    });
  };

  const closeAlert = () => {
    setAlertDialog((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchWorldData();
  }, [worldId]);

  const fetchWorldData = async () => {
    if (!user) return;

    try {
      // Fetch world details
      const { data: worldData } = await supabase
        .from("worlds")
        .select("*")
        .eq("id", worldId)
        .single();

      if (worldData) {
        setWorld(worldData);
      }

      // Fetch realms for this world
      const { data: realmsData } = await supabase
        .from("realms")
        .select("*")
        .eq("world_id", worldId)
        .eq("is_active", true)
        .order("order_index");

      if (realmsData) {
        setRealms(realmsData);
      }

      // Fetch quizzes for all realms
      const { data: quizzesData } = await supabase
        .from("quizzes")
        .select("*")
        .in("realm_id", realmsData?.map((r) => r.id) || []);

      if (quizzesData) {
        setQuizzes(quizzesData);
      }

      // Fetch student progress
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileData) {
        const { data: progressData } = await supabase
          .from("student_progress")
          .select("*")
          .eq("student_id", profileData.id)
          .in("realm_id", realmsData?.map((r) => r.id) || []);

        if (progressData) {
          setProgress(progressData);
        }
      }
    } catch (error) {
      console.error("Error fetching world data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWorldIcon = (worldName: string) => {
    switch (worldName.toLowerCase()) {
      case "world of time":
        return <Clock className="w-6 h-6" />;
      case "world of emotions":
        return <Heart className="w-6 h-6" />;
      case "world of money":
        return <DollarSign className="w-6 h-6" />;
      case "world of wellness":
        return <Apple className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const isRealmUnlocked = (realm: Realm) => {
    const realmIndex = realms.findIndex((r) => r.id === realm.id);
    if (realmIndex === 0) return true;

    const prevRealm = realms[realmIndex - 1];
    return progress.some((p) => p.realm_id === prevRealm.id && p.is_completed);
  };

  const isVideoUnlocked = (realm: Realm) => {
    return isRealmUnlocked(realm);
  };

  const isQuizUnlocked = (realm: Realm) => {
    const realmProgress = getRealmProgress(realm.id);
    return isRealmUnlocked(realm) && realmProgress?.video_watched;
  };

  const canRetakeQuiz = (realm: Realm) => {
    const realmProgress = getRealmProgress(realm.id);
    return realmProgress?.quiz_completed && !realmProgress?.is_completed;
  };

  const getRealmProgress = (realmId: string) => {
    return progress.find((p) => p.realm_id === realmId);
  };

  const getRealmQuiz = (realmId: string) => {
    return quizzes.find((q) => q.realm_id === realmId);
  };

  const handleVideoWatch = async (realm: Realm) => {
    setSelectedRealm(realm);
    setShowVideoDialog(true);
  };

  const handleVideoComplete = async () => {
    if (!selectedRealm || !user) return;

    setIsUpdatingProgress(true);

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error Fetching Profile:", profileError);
        showAlert(
          "Error",
          "Error: Could Not Fetch User Profile. Please Try Again."
        );
        return;
      }

      if (profileData) {
        const existingProgress = progress.find(
          (p) => p.realm_id === selectedRealm.id
        );

        if (existingProgress) {
          const { error: updateError } = await supabase
            .from("student_progress")
            .update({
              video_watched: true,
              video_watched_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingProgress.id);

          if (updateError) {
            console.error("Error Updating Progress:", updateError);
            showAlert(
              "Error",
              "Error: Could Not Update Progress. Please Try Again."
            );
            return;
          }
        } else {
          const { error: insertError } = await supabase
            .from("student_progress")
            .insert({
              student_id: profileData.id,
              realm_id: selectedRealm.id,
              video_watched: true,
              video_watched_at: new Date().toISOString(),
            });

          if (insertError) {
            console.error("Error Creating Progress:", insertError);
            showAlert(
              "Error",
              "Error: Could Not Create Progress Record. Please Try Again."
            );
            return;
          }
        }

        await fetchWorldData();

        setShowVideoDialog(false);

        showAlert(
          "Video Completed! ✅",
          "You've Successfully Watched the Video. You Can Now Take the Quiz!",
          "success"
        );
      }
    } catch (error) {
      console.error("Error Updating Video Progress:", error);
      showAlert(
        "Error",
        "An Unexpected Error Occurred. Please Try Again.",
        "error"
      );
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleQuizStart = async (realm: Realm) => {
    const quiz = getRealmQuiz(realm.id);

    if (!quiz) return;

    try {
      setSelectedRealm(realm);

      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quiz.id)
        .order("order_index");

      if (questionsData) {
        const transformedQuestions = questionsData.map((q) => ({
          ...q,
          options: Array.isArray(q.options)
            ? q.options
            : typeof q.options === "string"
            ? JSON.parse(q.options)
            : [],
        }));
        setQuizQuestions(transformedQuestions);
        setCurrentQuiz(quiz);
        setCurrentQuestionIndex(0);
        setQuizScore(0);
        setQuizCompleted(false);
        setSelectedAnswer("");
        setQuizAnswers([]);
        setQuizResults(null);
        setShowQuizDialog(true);
      }
    } catch (error) {
      console.error("Error Fetching Quiz Questions:", error);
    }
  };

  const handleQuizAnswer = () => {
    if (!currentQuiz || currentQuestionIndex >= quizQuestions.length) return;

    const currentQuestion = quizQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    const newAnswers = [...quizAnswers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setQuizAnswers(newAnswers);

    if (isCorrect) {
      setQuizScore((prev) => prev + currentQuestion.points);
    }

    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer("");
    } else {
      const finalScore = isCorrect
        ? quizScore + currentQuestion.points
        : quizScore;
      const totalPoints = quizQuestions.reduce((sum, q) => sum + q.points, 0);
      const percentage = Math.round((finalScore / totalPoints) * 100);

      const wrongAnswers = quizQuestions
        .map((q, index) => {
          const userAnswer = newAnswers[index] || "";
          if (userAnswer !== q.correct_answer) {
            return {
              question: q.question_text,
              userAnswer: userAnswer,
              correctAnswer: q.correct_answer,
              explanation: q.explanation || "No Explanation Available",
            };
          }
          return null;
        })
        .filter(Boolean);

      setQuizResults({
        correct: Math.round((finalScore / totalPoints) * quizQuestions.length),
        total: quizQuestions.length,
        percentage,
        wrongAnswers,
      });

      setQuizCompleted(true);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (!currentQuiz || !selectedRealm || !user) {
      console.error("Missing Required Data for Quiz Completion:", {
        currentQuiz,
        selectedRealm,
        user,
      });
      return;
    }

    setIsUpdatingProgress(true);
    console.log("Starting Quiz Completion Process:", {
      score,
      realmId: selectedRealm.id,
      quizId: currentQuiz.id,
    });

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        console.error("Error Fetching Profile:", profileError);
        showAlert(
          "Error",
          "Could Not Fetch User Profile. Please Try Again.",
          "error"
        );
        return;
      }

      if (!profileData) {
        console.error("No Profile Data Found for User:", user.id);
        showAlert(
          "Error",
          "User Profile Not Found. Please Try Again.",
          "error"
        );
        return;
      }

      const existingProgress = progress.find(
        (p) => p.realm_id === selectedRealm.id
      );

      const isPassed = score >= currentQuiz.passing_score;
      const pointsEarned = isPassed ? currentQuiz.points_reward : 0;
      const isCompleted = existingProgress?.video_watched && isPassed;

      const currentAttempts = existingProgress?.quiz_attempts || 0;
      const newAttempts = currentAttempts + 1;
      const currentBestScore = existingProgress?.quiz_best_score || 0;
      const newBestScore = Math.max(currentBestScore, score);
      const currentPointsEarned = existingProgress?.points_earned || 0;
      const totalPointsEarned = isPassed
        ? currentPointsEarned + pointsEarned
        : currentPointsEarned;

      console.log("Quiz Completion Calculations:", {
        score,
        passingScore: currentQuiz.passing_score,
        isPassed,
        pointsEarned,
        videoWatched: existingProgress?.video_watched,
        isCompleted,
        currentAttempts,
        newAttempts,
        currentBestScore,
        newBestScore,
        totalPointsEarned,
      });

      let updateResult;

      if (existingProgress) {
        const updateData = {
          quiz_completed: true,
          quiz_score: score,
          quiz_attempts: newAttempts,
          quiz_best_score: newBestScore,
          quiz_completed_at: new Date().toISOString(),
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          points_earned: totalPointsEarned,
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("student_progress")
          .update(updateData)
          .eq("id", existingProgress.id)
          .select();

        if (error) {
          console.error("Error Updating Progress:", error);
          showAlert(
            "Error",
            `Could Not Update Progress. ${error.message}`,
            "error"
          );
          return;
        }
        updateResult = data;
      } else {
        const insertData = {
          student_id: profileData.id,
          realm_id: selectedRealm.id,
          quiz_completed: true,
          quiz_score: score,
          quiz_attempts: 1,
          quiz_best_score: score,
          quiz_completed_at: new Date().toISOString(),
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          points_earned: pointsEarned,
        };

        const { data, error } = await supabase
          .from("student_progress")
          .insert(insertData)
          .select();

        if (error) {
          console.error("Error Creating Progress:", error);
          showAlert(
            "Error",
            `Could Not Create Progress Record. ${error.message}`,
            "error"
          );
          return;
        }
        updateResult = data;
      }

      await fetchWorldData();

      setShowQuizDialog(false);
      setQuizCompleted(false);
      setQuizResults(null);
      setQuizAnswers([]);

      if (isPassed) {
        showAlert(
          "Congratulations! 🎉",
          `You Passed the Quiz with ${score}%! You Earned ${pointsEarned} Points. This was Attempt #${newAttempts}.`,
          "success"
        );
      } else {
        const retryMessage =
          newAttempts > 1
            ? `This was Attempt #${newAttempts}. Your Best Score so Far is ${newBestScore}%. Keep Practicing!`
            : `This was Attempt #${newAttempts}. Keep Practicing to Improve your Score!`;

        showAlert(
          "Quiz Completed",
          `Quiz Completed with ${score}%. ${retryMessage}`,
          "warning"
        );
      }
    } catch (error) {
      console.error("Error Updating Quiz Progress:", error);
      showAlert(
        "Error",
        "An Unexpected Error OccurredWhile Saving your Progress. Please Try Again.",
        "error"
      );
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleFinishQuiz = () => {
    if (!quizResults) {
      console.error("No Quiz Results Available");
      showAlert("Error", "Error: No Quiz Results to Save. Please Try Again.");
      return;
    }
    handleQuizComplete(quizResults.percentage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-quest-blue/10">
        <Card variant="magical" className="p-8">
          <div className="text-center">
            <div className="animate-sparkle mb-4">
              <Star className="w-12 h-12 mx-auto text-primary" />
            </div>
            <p className="text-lg font-bold">🌟 Loading your World...</p>
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
          <div className="flex items-center sm:justify-start gap-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-white text-primary hover:bg-white hover:text-primary px-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Back to Worlds</span>
            </Button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold truncate">
                {world?.emoji} {world?.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* World Description */}
        <Card variant="magical" className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {world?.emoji} Welcome to {world?.name}!
            </CardTitle>
            <CardDescription className="text-center text-lg">
              {world?.description}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Realms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {realms.map((realm, index) => {
            const realmProgress = getRealmProgress(realm.id);
            const realmQuiz = getRealmQuiz(realm.id);
            const unlocked = isRealmUnlocked(realm);
            const isCompleted = realmProgress?.is_completed;

            return (
              <Card
                key={realm.id}
                variant={
                  isCompleted ? "completed" : unlocked ? "world" : "locked"
                }
                className="group hover:shadow-lg transition-all duration-300 flex flex-col justify-center"
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center mb-4 relative">
                    <span className="text-4xl">{realm.emoji}</span>
                    {isCompleted && (
                      <Medal className="absolute -top-2 -right-2 w-6 h-6 text-treasure-gold" />
                    )}
                    {!unlocked && (
                      <Lock className="absolute -top-2 -right-2 w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{realm.name}</CardTitle>
                  <CardDescription>{realm.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col justify-center h-full space-y-4">
                  {/* Progress Indicators */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      <span>{realmProgress?.video_watched ? "✅" : "⏸️"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      <span>
                        {realmProgress?.quiz_completed
                          ? `${realmProgress.quiz_score}%`
                          : "❌"}
                      </span>
                    </div>
                  </div>

                  {/* Quiz Attempts and Best Score */}
                  {realmProgress?.quiz_attempts > 0 && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Attempts:</span>
                        <span>{realmProgress.quiz_attempts}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Best Score:</span>
                        <span>{realmProgress.quiz_best_score}%</span>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {realmProgress?.is_completed
                          ? "100%"
                          : realmProgress?.video_watched
                          ? "50%"
                          : "0%"}
                      </span>
                    </div>
                    <Progress
                      value={
                        realmProgress?.is_completed
                          ? 100
                          : realmProgress?.video_watched
                          ? 50
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      variant={isVideoUnlocked(realm) ? "magical" : "outline"}
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (isVideoUnlocked(realm)) {
                          handleVideoWatch(realm);
                        } else {
                          showAlert(
                            "Realm Locked",
                            "Complete the Previous Realm to Unlock this Video.",
                            "warning"
                          );
                        }
                      }}
                      disabled={
                        !isVideoUnlocked(realm) || realmProgress?.video_watched
                      }
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {!isVideoUnlocked(realm) ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Video Locked
                        </>
                      ) : realmProgress?.video_watched ? (
                        "Video Watched"
                      ) : (
                        "Watch Video"
                      )}
                    </Button>

                    <Button
                      variant={
                        realmProgress?.video_watched ? "quest" : "outline"
                      }
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        if (realmProgress?.video_watched) {
                          handleQuizStart(realm);
                        } else {
                          showAlert(
                            "Video Required",
                            "You Must Watch the Video Before Taking the Quiz.",
                            "warning"
                          );
                        }
                      }}
                      disabled={
                        !realmProgress?.video_watched ||
                        (realmProgress?.quiz_completed &&
                          realmProgress?.is_completed)
                      }
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {!realmProgress?.video_watched ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Quiz Locked
                        </>
                      ) : realmProgress?.quiz_completed &&
                        realmProgress?.is_completed ? (
                        "Quiz Completed"
                      ) : realmProgress?.quiz_completed &&
                        !realmProgress?.is_completed ? (
                        "Retake Quiz"
                      ) : (
                        "Take Quiz"
                      )}
                    </Button>
                  </div>

                  {/* Points Display */}
                  {realmProgress?.points_earned > 0 && (
                    <div className="flex items-center justify-center gap-2 text-sm text-treasure-gold">
                      <Star className="w-4 h-4" />
                      <span>{realmProgress.points_earned} Points Earned</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Video Dialog */}
      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1 xs:gap-2">
              <Video className="w-4 h-4 shrink-0" />
              {selectedRealm?.video_title || "Learning Video"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRealm?.video_url &&
            getYouTubeEmbedUrl(selectedRealm.video_url) ? (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <iframe
                  src={getYouTubeEmbedUrl(selectedRealm.video_url)}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  title={selectedRealm.video_title || "Learning Video"}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4" />
                  <p>
                    {selectedRealm?.video_url
                      ? "Invalid Video URL. Please Check the Video Link."
                      : "Video Content will be Available Here"}
                  </p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowVideoDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVideoComplete}
                disabled={isUpdatingProgress}
              >
                {isUpdatingProgress ? "Updating..." : "Mark as Watched"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      <Dialog open={showQuizDialog} onOpenChange={setShowQuizDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {currentQuiz?.title}
            </DialogTitle>
          </DialogHeader>

          {!quizCompleted ? (
            <div className="space-y-6">
              {currentQuestionIndex < quizQuestions.length && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Question {currentQuestionIndex + 1} of{" "}
                        {quizQuestions.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {quizQuestions[currentQuestionIndex]?.points || 1}{" "}
                          Points
                        </Badge>
                        <div className="w-24 sm:w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                ((currentQuestionIndex + 1) /
                                  quizQuestions.length) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-2 mb-4">
                        <Brain className="w-5 h-5 text-primary mt-1 shrink-0" />
                        <h3 className="text-lg font-semibold break-words whitespace-normal">
                          {quizQuestions[currentQuestionIndex]?.question_text}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {quizQuestions[currentQuestionIndex]?.options?.map(
                          (option, index) => (
                            <Button
                              key={index}
                              variant={
                                selectedAnswer === option
                                  ? "default"
                                  : "outline"
                              }
                              className="w-full justify-start text-left h-auto py-3 transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base"
                              onClick={() => setSelectedAnswer(option)}
                            >
                              <div className="flex items-start gap-3 break-words">
                                <div className="min-w-[24px] w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                  {String.fromCharCode(65 + index)}
                                </div>
                                <span className="flex-1 break-words whitespace-normal">
                                  {option}
                                </span>
                                {selectedAnswer === option && (
                                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                    <div className="w-2 h-2 bg-white rounded-full" />
                                  </div>
                                )}
                              </div>
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleQuizAnswer}
                      disabled={!selectedAnswer}
                      className="min-w-[120px]"
                    >
                      {currentQuestionIndex + 1 === quizQuestions.length
                        ? "Finish Quiz"
                        : "Next Question"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Trophy className="w-16 h-16 mx-auto text-treasure-gold" />
                </div>
                <h3 className="text-2xl font-bold">Quiz Completed!</h3>

                {quizResults && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-primary/10 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                        <div className="text-2xl font-bold text-primary">
                          {quizResults.percentage}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score
                        </div>
                      </div>
                      <div className="bg-green-100 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                        <div className="text-2xl font-bold text-green-600">
                          {quizResults.correct}/{quizResults.total}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Correct
                        </div>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-4 transform transition-all duration-300 hover:scale-105">
                        <div className="text-2xl font-bold text-blue-600">
                          {quizResults.percentage >=
                          (currentQuiz?.passing_score || 70)
                            ? currentQuiz?.points_reward || 0
                            : 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Points Earned
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-2">
                          Quiz Summary
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">
                              Total Questions:
                            </span>{" "}
                            {quizResults.total}
                          </div>
                          <div>
                            <span className="font-medium">
                              Correct Answers:
                            </span>{" "}
                            {quizResults.correct}
                          </div>
                          <div>
                            <span className="font-medium">Passing Score:</span>{" "}
                            {currentQuiz?.passing_score || 70}%
                          </div>
                          <div>
                            <span className="font-medium">Your Score:</span>{" "}
                            {quizResults.percentage}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-lg">
                      {quizResults.percentage >=
                      (currentQuiz?.passing_score || 70) ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <span className="text-2xl">🎉</span>
                          <span>Congratulations! You Passed!</span>
                          <span className="text-2xl">🎉</span>
                        </div>
                      ) : (
                        <div className="text-orange-600">
                          Keep Practicing to Improve your Score!
                        </div>
                      )}
                    </div>

                    {quizResults.wrongAnswers.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-left flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Review Your Answers
                        </h4>
                        <div className="space-y-3">
                          {quizResults.wrongAnswers.map((wrong, index) => (
                            <div
                              key={index}
                              className="bg-red-50 border border-red-200 rounded-lg p-4 text-left transform transition-all duration-200 hover:scale-[1.02]"
                            >
                              <div className="font-semibold text-red-800 mb-2">
                                {wrong.question}
                              </div>
                              <div className="space-y-1 text-sm">
                                <div>
                                  <span className="font-medium">
                                    Your Answer:
                                  </span>{" "}
                                  <span className="text-red-600">
                                    {wrong.userAnswer}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">
                                    Correct Answer:
                                  </span>{" "}
                                  <span className="text-green-600">
                                    {wrong.correctAnswer}
                                  </span>
                                </div>
                                <div className="mt-2 text-gray-700">
                                  <span className="font-medium">
                                    Explanation:
                                  </span>{" "}
                                  {wrong.explanation}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQuizDialog(false);
                      setQuizCompleted(false);
                      setQuizResults(null);
                      setShowQuizResults(false);
                    }}
                  >
                    Close
                  </Button>
                  {quizResults && (
                    <Button
                      onClick={handleFinishQuiz}
                      disabled={isUpdatingProgress}
                      className="bg-gradient-to-r from-primary to-quest-blue hover:from-primary/90 hover:to-quest-blue/90"
                    >
                      {isUpdatingProgress ? "Updating..." : "Save Progress"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={closeAlert}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
        onConfirm={alertDialog.onConfirm}
        confirmText={alertDialog.confirmText}
        showCancel={alertDialog.showCancel}
      />
    </div>
  );
};
