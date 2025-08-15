-- Add RLS policies for student_progress table
-- Enable RLS on student_progress table
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

-- Policy for students to read their own progress
CREATE POLICY "Students can view own progress" ON public.student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND id = student_progress.student_id
    )
  );

-- Policy for students to insert their own progress
CREATE POLICY "Students can insert own progress" ON public.student_progress
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND id = student_progress.student_id
    )
  );

-- Policy for students to update their own progress
CREATE POLICY "Students can update own progress" ON public.student_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND id = student_progress.student_id
    )
  );

-- Policy for admins to read all progress
CREATE POLICY "Admins can view all progress" ON public.student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for admins to update all progress
CREATE POLICY "Admins can update all progress" ON public.student_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Policy for parents to read their children's progress
CREATE POLICY "Parents can view children progress" ON public.student_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'parent'
    )
  ); 