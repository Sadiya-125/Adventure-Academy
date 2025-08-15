-- Create sample worlds with proper data
INSERT INTO public.worlds (name, emoji, description, order_index, is_active) VALUES
('World of Time', '⏰', 'Master scheduling, punctuality, and time management skills', 1, true),
('World of Emotions', '😊', 'Learn emotional intelligence, empathy, and social skills', 2, true),
('World of Money', '💰', 'Discover budgeting, saving, and financial responsibility', 3, true),
('World of Wellness', '🍎', 'Build healthy habits, nutrition, and self-care routines', 4, true);

-- Create sample realms for each world (3 realms per world as specified)
-- World of Time realms
INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Daily Schedules', '📅', 'Learn to create and follow daily schedules',
  w.id, 1, 'Creating Your Perfect Daily Schedule', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true
FROM public.worlds w WHERE w.name = 'World of Time';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Time Priorities', '⭐', 'Understand how to prioritize tasks and activities',
  w.id, 2, 'Setting Priorities That Matter', 'https://www.youtube.com/watch?v=9bZkp7q19f0', true
FROM public.worlds w WHERE w.name = 'World of Time';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Punctuality Power', '⚡', 'Master the art of being on time',
  w.id, 3, 'Why Being On Time Is Your Superpower', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', true
FROM public.worlds w WHERE w.name = 'World of Time';

-- World of Emotions realms
INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Feeling Detective', '🔍', 'Learn to identify and name your emotions',
  w.id, 1, 'Becoming an Emotion Detective', 'https://example.com/video4', true
FROM public.worlds w WHERE w.name = 'World of Emotions';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Kindness Kingdom', '👑', 'Practice empathy and kindness toward others',
  w.id, 2, 'Building Your Kindness Kingdom', 'https://example.com/video5', true
FROM public.worlds w WHERE w.name = 'World of Emotions';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Conflict Resolution', '🤝', 'Learn peaceful ways to solve disagreements',
  w.id, 3, 'Solving Problems Like a Hero', 'https://example.com/video6', true
FROM public.worlds w WHERE w.name = 'World of Emotions';

-- World of Money realms
INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Saving Superhero', '🦸', 'Learn the power of saving money',
  w.id, 1, 'Becoming a Saving Superhero', 'https://example.com/video7', true
FROM public.worlds w WHERE w.name = 'World of Money';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Budget Builder', '🏗️', 'Create and manage your first budget',
  w.id, 2, 'Building Your Money Plan', 'https://example.com/video8', true
FROM public.worlds w WHERE w.name = 'World of Money';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Smart Spender', '🛒', 'Make wise choices when spending money',
  w.id, 3, 'Shopping Smart and Strong', 'https://example.com/video9', true
FROM public.worlds w WHERE w.name = 'World of Money';

-- World of Wellness realms
INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Nutrition Navigator', '🧭', 'Discover healthy eating habits',
  w.id, 1, 'Navigating Your Nutrition Journey', 'https://example.com/video10', true
FROM public.worlds w WHERE w.name = 'World of Wellness';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Exercise Explorer', '🏃', 'Find fun ways to stay active',
  w.id, 2, 'Exploring the World of Movement', 'https://example.com/video11', true
FROM public.worlds w WHERE w.name = 'World of Wellness';

INSERT INTO public.realms (name, emoji, description, world_id, order_index, video_title, video_url, is_active)
SELECT 
  'Sleep Sanctuary', '😴', 'Create healthy sleep habits',
  w.id, 3, 'Building Your Perfect Sleep Routine', 'https://example.com/video12', true
FROM public.worlds w WHERE w.name = 'World of Wellness';

-- Create sample badges
INSERT INTO public.badges (name, emoji, description, criteria, points_value, is_active) VALUES
('First Steps', '👶', 'Complete your first realm', '{"type": "realm_complete", "count": 1}', 10, true),
('Time Master', '⏰', 'Complete all World of Time realms', '{"type": "world_complete", "world": "World of Time"}', 50, true),
('Emotion Expert', '😊', 'Complete all World of Emotions realms', '{"type": "world_complete", "world": "World of Emotions"}', 50, true),
('Money Wizard', '💰', 'Complete all World of Money realms', '{"type": "world_complete", "world": "World of Money"}', 50, true),
('Wellness Warrior', '🍎', 'Complete all World of Wellness realms', '{"type": "world_complete", "world": "World of Wellness"}', 50, true),
('Quiz Champion', '🧠', 'Score 100% on 5 quizzes', '{"type": "perfect_quiz", "count": 5}', 75, true),
('Adventure Hero', '🏆', 'Complete all available realms', '{"type": "all_realms_complete"}', 200, true);