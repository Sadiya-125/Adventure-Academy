-- Add sample quizzes for realms
INSERT INTO public.quizzes (realm_id, title, description, total_questions, passing_score, points_reward)
SELECT 
  r.id, 
  'Daily Schedule Quiz', 
  'Test your knowledge about creating and following daily schedules',
  3, 70, 10
FROM public.realms r WHERE r.name = 'Daily Schedules';

INSERT INTO public.quizzes (realm_id, title, description, total_questions, passing_score, points_reward)
SELECT 
  r.id, 
  'Time Priorities Quiz', 
  'Test your understanding of task prioritization',
  3, 70, 10
FROM public.realms r WHERE r.name = 'Time Priorities';

INSERT INTO public.quizzes (realm_id, title, description, total_questions, passing_score, points_reward)
SELECT 
  r.id, 
  'Punctuality Quiz', 
  'Test your knowledge about being on time',
  3, 70, 10
FROM public.realms r WHERE r.name = 'Punctuality Power';

-- Add sample quiz questions for Daily Schedules quiz
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'What is the first step in creating a daily schedule?',
  'mcq',
  '["Set specific times for each activity", "List all your tasks for the day", "Check your calendar", "Set your alarm"]',
  'List all your tasks for the day',
  'Before you can schedule anything, you need to know what tasks you need to complete.',
  1, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Daily Schedules';

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'Which of the following is NOT a good scheduling tip?',
  'mcq',
  '["Leave some free time for unexpected events", "Schedule your most important tasks first", "Try to do everything at once", "Break big tasks into smaller ones"]',
  'Try to do everything at once',
  'Trying to do everything at once usually leads to getting nothing done well.',
  2, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Daily Schedules';

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'What should you do if you fall behind on your schedule?',
  'mcq',
  '["Give up and try again tomorrow", "Panic and rush through everything", "Stay calm and adjust your schedule", "Ignore the schedule completely"]',
  'Stay calm and adjust your schedule',
  'It\'s normal for schedules to need adjustments. Stay flexible and realistic.',
  3, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Daily Schedules';

-- Add sample quiz questions for Time Priorities quiz
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'What does the "urgent and important" quadrant represent?',
  'mcq',
  '["Tasks that can be ignored", "Tasks that need immediate attention", "Tasks that can be delegated", "Tasks that can be scheduled later"]',
  'Tasks that need immediate attention',
  'Urgent and important tasks are crises and deadlines that require immediate action.',
  1, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Time Priorities';

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'Which type of task should you focus on most?',
  'mcq',
  '["Urgent but not important", "Important but not urgent", "Neither urgent nor important", "Urgent and important"]',
  'Important but not urgent',
  'Important but not urgent tasks are where you should spend most of your time to prevent them from becoming urgent.',
  2, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Time Priorities';

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'What is the best way to handle tasks that are urgent but not important?',
  'mcq',
  '["Do them immediately", "Delegate them to others", "Ignore them completely", "Schedule them for later"]',
  'Delegate them to others',
  'Urgent but not important tasks are often interruptions that can be delegated to free up your time.',
  3, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Time Priorities';

-- Add sample quiz questions for Punctuality Power quiz
INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'How early should you arrive for an important meeting?',
  'mcq',
  '["Exactly on time", "5-10 minutes early", "15-20 minutes early", "30 minutes early"]',
  '5-10 minutes early',
  'Arriving 5-10 minutes early shows respect and gives you time to settle in.',
  1, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Punctuality Power';

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'What is the best way to ensure you\'re on time?',
  'mcq',
  '["Set multiple alarms", "Plan your route and add buffer time", "Rush at the last minute", "Hope for the best"]',
  'Plan your route and add buffer time',
  'Planning ahead and adding extra time for unexpected delays is the key to punctuality.',
  2, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Punctuality Power';

INSERT INTO public.quiz_questions (quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points)
SELECT 
  q.id,
  'Why is being punctual important?',
  'mcq',
  '["It shows respect for others\' time", "It makes you look important", "It saves money", "It\'s just a good habit"]',
  'It shows respect for others\' time',
  'Being punctual demonstrates that you value and respect other people\'s time and commitments.',
  3, 1
FROM public.quizzes q 
JOIN public.realms r ON q.realm_id = r.id 
WHERE r.name = 'Punctuality Power'; 