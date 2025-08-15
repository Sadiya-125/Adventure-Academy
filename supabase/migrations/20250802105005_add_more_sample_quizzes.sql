-- Add more sample quizzes for all realms
INSERT INTO public.quizzes (id, realm_id, title, description, total_questions, passing_score, points_reward) VALUES
-- World of Time - Daily Schedules (already exists)
-- World of Time - Time Priorities (already exists)
-- World of Time - Punctuality Power (already exists)

-- World of Time - Time Management Mastery
('75747a59-9c7b-4ad6-8c48-ddebb0424a5e', '52de4c0c-582f-412b-b46c-37cabbffdddd', 'Time Management Mastery Quiz', 'Test your advanced time management skills', 3, 70, 15),

-- World of Emotions - Emotional Awareness
('75747a59-9c7b-4ad6-8c48-ddebb0424a6e', '52de4c0c-582f-412b-b46c-37cabbffdddd', 'Emotional Awareness Quiz', 'Test your understanding of emotions', 3, 70, 15),

-- World of Money - Financial Basics
('75747a59-9c7b-4ad6-8c48-ddebb0424a7e', '52de4c0c-582f-412b-b46c-37cabbffdddd', 'Financial Basics Quiz', 'Test your knowledge of money management', 3, 70, 15),

-- World of Wellness - Health Habits
('75747a59-9c7b-4ad6-8c48-ddebb0424a8e', '52de4c0c-582f-412b-b46c-37cabbffdddd', 'Health Habits Quiz', 'Test your understanding of healthy habits', 3, 70, 15);

-- Add sample questions for the new quizzes
INSERT INTO public.quiz_questions (id, quiz_id, question_text, question_type, options, correct_answer, explanation, order_index, points) VALUES
-- Time Management Mastery Quiz
('75747a59-9c7b-4ad6-8c48-ddebb0424a9e', '75747a59-9c7b-4ad6-8c48-ddebb0424a5e', 'What is the best way to prioritize tasks?', 'mcq', '["By deadline", "By importance", "By both importance and urgency", "By difficulty"]', 'By both importance and urgency', 'The Eisenhower Matrix helps prioritize tasks by both importance and urgency.', 1, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a10e', '75747a59-9c7b-4ad6-8c48-ddebb0424a5e', 'How long should you work before taking a break?', 'mcq', '["30 minutes", "45 minutes", "60 minutes", "90 minutes"]', '45 minutes', 'The Pomodoro Technique suggests 45 minutes of focused work followed by a 15-minute break.', 2, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a11e', '75747a59-9c7b-4ad6-8c48-ddebb0424a5e', 'What should you do with tasks that are not important and not urgent?', 'mcq', '["Do them first", "Delegate them", "Eliminate them", "Postpone them"]', 'Eliminate them', 'Tasks that are neither important nor urgent should be eliminated to save time.', 3, 5),

-- Emotional Awareness Quiz
('75747a59-9c7b-4ad6-8c48-ddebb0424a12e', '75747a59-9c7b-4ad6-8c48-ddebb0424a6e', 'What is emotional intelligence?', 'mcq', '["Being emotional", "Understanding and managing emotions", "Crying a lot", "Being happy all the time"]', 'Understanding and managing emotions', 'Emotional intelligence is the ability to understand and manage your own emotions and those of others.', 1, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a13e', '75747a59-9c7b-4ad6-8c48-ddebb0424a6e', 'How can you calm down when you are angry?', 'mcq', '["Yell at someone", "Take deep breaths", "Ignore the feeling", "Break something"]', 'Take deep breaths', 'Taking deep breaths helps activate the parasympathetic nervous system and calm down.', 2, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a14e', '75747a59-9c7b-4ad6-8c48-ddebb0424a6e', 'What is empathy?', 'mcq', '["Feeling sorry for someone", "Understanding how someone else feels", "Being sad", "Crying with someone"]', 'Understanding how someone else feels', 'Empathy is the ability to understand and share the feelings of another person.', 3, 5),

-- Financial Basics Quiz
('75747a59-9c7b-4ad6-8c48-ddebb0424a15e', '75747a59-9c7b-4ad6-8c48-ddebb0424a7e', 'What is a budget?', 'mcq', '["A plan for spending money", "A way to save money", "A type of bank account", "A loan"]', 'A plan for spending money', 'A budget is a plan that helps you track your income and expenses.', 1, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a16e', '75747a59-9c7b-4ad6-8c48-ddebb0424a7e', 'What is the 50/30/20 rule?', 'mcq', '["A savings rule", "A spending rule", "A budgeting rule", "A tax rule"]', 'A budgeting rule', 'The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and saving 20%.', 2, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a17e', '75747a59-9c7b-4ad6-8c48-ddebb0424a7e', 'What is compound interest?', 'mcq', '["Interest on interest", "Simple interest", "A type of loan", "A bank fee"]', 'Interest on interest', 'Compound interest is when you earn interest on both your original money and the interest you have already earned.', 3, 5),

-- Health Habits Quiz
('75747a59-9c7b-4ad6-8c48-ddebb0424a18e', '75747a59-9c7b-4ad6-8c48-ddebb0424a8e', 'How much water should you drink daily?', 'mcq', '["2 glasses", "4 glasses", "6-8 glasses", "10 glasses"]', '6-8 glasses', 'Most health experts recommend drinking 6-8 glasses of water daily.', 1, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a19e', '75747a59-9c7b-4ad6-8c48-ddebb0424a8e', 'How much sleep do children need?', 'mcq', '["6-8 hours", "8-10 hours", "10-12 hours", "12-14 hours"]', '10-12 hours', 'Children typically need 10-12 hours of sleep for proper growth and development.', 2, 5),
('75747a59-9c7b-4ad6-8c48-ddebb0424a20e', '75747a59-9c7b-4ad6-8c48-ddebb0424a8e', 'What is the best way to stay healthy?', 'mcq', '["Eat junk food", "Exercise regularly", "Stay up late", "Skip meals"]', 'Exercise regularly', 'Regular exercise is one of the best ways to maintain good health.', 3, 5); 