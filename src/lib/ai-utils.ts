import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { YoutubeTranscript } from "youtube-transcript";
import { config } from "./config";

const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY!);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

function sanitizeJson(raw: string): string {
  return raw
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim()
    .replace(/:\s*"([^"]*?)"(?=\s*[,}])/g, (match, p1) => {
      const escaped = p1.replace(/"/g, '\\"');
      return `: "${escaped}"`;
    });
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gemini-1.5-flash",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
) {
  const list_input: boolean = Array.isArray(user_prompt);
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nYou are to output ${
      list_output && "an array of objects in"
    } the following in json format: ${JSON.stringify(
      output_format
    )}. \nDo not put quotation marks or escape character \\ in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden\nAny output key containing < and > indicates you must generate the key name to replace it. Example input: {'<location>': 'description of location'}, Example output: {school: a place for education}`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate an array of json, one json for each input element.`;
    }

    const final_prompt = system_prompt + output_format_prompt + error_msg;
    const input_prompt = Array.isArray(user_prompt)
      ? user_prompt.join("\n")
      : user_prompt;

    const result = await geminiModel.generateContent(
      final_prompt + "\n" + input_prompt
    );

    const raw = result.response.text();
    const sanitized = sanitizeJson(raw);

    if (verbose) {
      console.log("System Prompt:", final_prompt);
      console.log("User Prompt:", input_prompt);
      console.log("Gemini Raw Output:", raw);
      console.log("Sanitized Output:", sanitized);
    }

    try {
      let output = JSON.parse(sanitized);

      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error("Output format not in an array of json");
        }
      } else {
        output = [output];
      }

      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          if (/<.*?>/.test(key)) {
            continue;
          }

          if (!(key in output[index])) {
            throw new Error(`${key} not in json output`);
          }

          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        if (output_value_only) {
          output[index] = Object.values(output[index]);
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0];
    } catch (e) {
      error_msg = `\n\nResult: ${raw}\n\nSanitized: ${sanitized}\n\nError message: ${e}`;
      console.log("An exception occurred:", e);
    }
  }

  return [];
}

export async function searchYoutube(searchQuery: string) {
  try {
    const kidsQuery = `${searchQuery} Kids Educational Video`;

    const { data } = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?key=${
        config.YOUTUBE_API_KEY
      }&q=${encodeURIComponent(
        kidsQuery
      )}&videoDuration=medium&videoEmbeddable=true&type=video&maxResults=5&videoCategoryId=27`, // 27 is Education Category
      {
        params: {
          key: config.YOUTUBE_API_KEY,
          q: kidsQuery,
          videoDuration: "medium",
          videoEmbeddable: "true",
          type: "video",
          maxResults: 5,
          videoCategoryId: "27", // Education Category
          part: "snippet",
        },
      }
    );

    if (!data || !Array.isArray(data.items) || data.items.length === 0) {
      console.warn("⚠️ No YouTube Results Found For:", kidsQuery);
      return null;
    }

    const firstItem = data.items[0];
    const videoId = firstItem?.id?.videoId;
    const videoTitle = firstItem?.snippet?.title;
    if (!videoId || !videoTitle) {
      console.warn("⚠️ YouTube Result Does Not Contain VideoId or Title.");
      return null;
    }

    return {
      videoId,
      videoTitle,
    };
  } catch (err: unknown) {
    const error = err as {
      message?: string;
      response?: { status?: number; data?: unknown };
    };
    console.error("❌ YouTube API Error:", {
      message: error.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return null;
  }
}

export async function getTranscript(videoId: string) {
  try {
    const { data } = await axios.get(
      `http://localhost:5000/api/transcript/${videoId}`
    );
    return data.transcript;
  } catch (error) {
    console.error("Transcript Fetch Failed:", error);
    return "";
  }
}

export async function getQuestionsFromTranscript(
  transcript: string,
  course_title: string
) {
  const questions: unknown[] = await strict_output(
    `You are a Helpful AI that Generates Quiz Questions and Answers. Follow the Exact Schema below to Generate 4 Questions in Total:
    - Exactly 2 Multiple-Choice Questions (MCQ)
    - Exactly 2 True/False Questions

    Schema Requirements:
    question_text: The Text of the Question.
    question_type: Either "mcq" or "true_false".
    options:
    - For MCQs: Provide 4 Options.
    - For True/False: Options must be ["True", "False"].
    order_index: Must be in Ascending Order starting from 1.`,

    `Generate a Random Question Related to the Course "${course_title}" using the Context of the Following Transcript: ${transcript}`,
    {
      question_texts: "array",
      question_types: "array",
      options_arrays: "array",
      correct_answers: "array",
      explanations: "array",
      order_indices: "array",
      points_values: "array",
    }
  );

  return questions;
}

export async function generateWorldWithAI(worldData: {
  name: string;
  description: string;
  emoji: string;
}) {
  try {
    const realms = await strict_output(
      `You are an Educational Content Creator. Your Task is to Generate 2 Engaging Realms for the Given World.
      Each Realm must be Educational, Age-Appropriate for Students aged 8 to 14, and Designed for Learning through YouTube Videos.
      
      Important Instructions:
      - Realm Name:
        - Must be Specific, Clear, and Keyword-friendly.
        - It will be directly used as the YouTube Search Term for finding Educational Videos.
        - Avoid Vague or Generic Names.

      - Realm Description:
        - A Short, Engaging, and Educational Explanation that Relates to the Theme.

      - Emoji:
        - An Emoji that best Represents the Theme of the Realm Visually.

      - Order Index:
        - Must be in Ascending Order starting from 1.
        - This will Determine the Order of Realms in the World.
      `,
      `Create 2 Realms for the World: ${worldData.name} - ${worldData.description}`,
      {
        realm_names: "array",
        realm_descriptions: "array",
        realm_emojis: "array",
        realm_order_indices: "array",
      }
    );
    console.log("Generated Realms:", realms);

    const processedRealms = [];
    for (let i = 0; i < realms.realm_names.length; i++) {
      try {
        const realmName = realms.realm_names[i];
        console.log(`Processing Realm ${i + 1}:`, realmName);
        const realmDescription = realms.realm_descriptions[i];
        const realmEmoji = realms.realm_emojis[i];
        const realmOrderIndex = realms.realm_order_indices[i];

        let searchTerm = realmName;

        if (realmName.includes(":")) {
          const parts = realmName.split(":");
          searchTerm = parts[1].trim();
        }

        const result = await searchYoutube(searchTerm);

        let videoUrl = null;
        let videoTitle = null;

        if (result) {
          videoUrl = `https://www.youtube.com/watch?v=${result.videoId}`;
          videoTitle = result.videoTitle;
        }

        processedRealms.push({
          name: realmName,
          description: realmDescription,
          emoji: realmEmoji,
          order_index: realmOrderIndex,
          video_url: videoUrl,
          video_title: videoTitle,
        });
      } catch (error) {
        console.error(`Error Processing Realm ${i}:`, error);
        processedRealms.push({
          name: realms.realm_names[i] || `Realm ${i + 1}`,
          description: realms.realm_descriptions[i] || "Educational Content",
          emoji: realms.realm_emojis[i] || "📚",
          order_index: realms.realm_order_indices[i] || (i + 1).toString(),
          video_url: null,
          video_title: null,
        });
      }
    }

    const realmQuizzes = [];
    for (let i = 0; i < processedRealms.length; i++) {
      const realm = processedRealms[i];

      const quiz = await strict_output(
        `You are an Educational Quiz Creator. Generate a Quiz for the Given Realm. The points_reward must be a Multiple of 4 (e.g., 8, 12, 16, 20, 24).`,
        `Create a Quiz for the Realm: ${realm.name} - ${realm.description}`,
        {
          title: "string",
          description: "string",
          total_questions: "4",
          passing_score: "70",
          points_reward: "string",
        }
      );

      let quizQuestions;
      if (realm.video_url) {
        console.log(`Fetching Transcript for Realm ${realm.name}...`);
        try {
          const videoId = realm.video_url.split("v=")[1];
          const transcript = await getTranscript(videoId);
          console.log(`Transcript Fetched: ${transcript}`);
          if (transcript) {
            quizQuestions = await getQuestionsFromTranscript(
              transcript,
              realm.name
            );
          }
          console.log(
            `Quiz Questions Generated for Realm ${realm.name}:`,
            quizQuestions
          );
        } catch (error) {
          console.error(
            `Error Getting Transcript for Realm ${realm.name}:`,
            error
          );
        }
      }

      if (!quizQuestions) {
        quizQuestions = await strict_output(
          `You are a Helpful AI that Generates Quiz Questions and Answers. Follow the Exact Schema below to Generate 4 Questions in Total:
          - Exactly 2 Multiple-Choice Questions (MCQ)
          - Exactly 2 True/False Questions

          Schema Requirements:
          question_text: The Text of the Question.
          question_type: Either "mcq" or "true_false".
          options:
          - For MCQs: Provide 4 Options.
          - For True/False: Options must be ["True", "False"].
          order_index: Must be in Ascending Order starting from 1.`,

          `Create 4 Questions for the Quiz: ${quiz.title} - ${quiz.description}`,
          {
            question_texts: "array",
            question_types: "array",
            options_arrays: "array",
            correct_answers: "array",
            explanations: "array",
            order_indices: "array",
            points_values: "array",
          }
        );
      }

      const processedQuestions = [];
      const totalQuestions = 4;
      const pointsPerQuestion = Math.floor(
        parseInt(quiz.points_reward) / totalQuestions
      );

      for (let j = 0; j < totalQuestions; j++) {
        let questionData;
        if (quizQuestions && quizQuestions.question_texts) {
          questionData = {
            question_text:
              quizQuestions.question_texts[j] || `Question ${j + 1}`,
            question_type: quizQuestions.question_types[j] || "mcq",
            options: quizQuestions.options_arrays?.[j] || [
              "Option A",
              "Option B",
              "Option C",
              "Option D",
            ],
            correct_answer: quizQuestions.correct_answers?.[j] || "Option A",
            explanation: quizQuestions.explanations?.[j] || "",
            order_index: quizQuestions.order_indices?.[j] || (j + 1).toString(),
            points:
              quizQuestions.points_values?.[j] || pointsPerQuestion.toString(),
          };
        } else {
          questionData = {
            question_text:
              quizQuestions.question_texts[j] || `Question ${j + 1}`,
            question_type: quizQuestions.question_types[j] || "mcq",
            options: quizQuestions.options_arrays[j] || [
              "Option A",
              "Option B",
              "Option C",
              "Option D",
            ],
            correct_answer: quizQuestions.correct_answers[j] || "Option A",
            explanation: quizQuestions.explanations[j] || "",
            order_index: quizQuestions.order_indices[j] || (j + 1).toString(),
            points:
              quizQuestions.points_values[j] || pointsPerQuestion.toString(),
          };
        }

        if (questionData.question_type === "true_false") {
          questionData.options = ["True", "False"];
          if (!["True", "False"].includes(questionData.correct_answer)) {
            questionData.correct_answer = "True";
          }
        }
        questionData.points = pointsPerQuestion.toString();
        processedQuestions.push(questionData);
      }

      realmQuizzes.push({
        realm_id: i,
        quiz,
        quizQuestions: processedQuestions,
      });
    }

    return {
      realms: processedRealms,
      realmQuizzes,
    };
  } catch (error) {
    console.error("Error Generating World with AI:", error);
    throw new Error("Failed to Generate World Content with AI");
  }
}
