-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create personalities table for historical figures
CREATE TABLE public.personalities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  era TEXT NOT NULL,
  short_bio TEXT NOT NULL,
  speaking_style TEXT NOT NULL,
  values_pillars JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on personalities
ALTER TABLE public.personalities ENABLE ROW LEVEL SECURITY;

-- Personalities are viewable by everyone
CREATE POLICY "Personalities are viewable by everyone"
  ON public.personalities FOR SELECT
  USING (true);

-- Create conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  personality_id UUID NOT NULL REFERENCES public.personalities(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Create messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies - users can only see messages from their own conversations
CREATE POLICY "Users can view messages from their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_personalities_updated_at
  BEFORE UPDATE ON public.personalities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample historical personalities with authentic images
INSERT INTO public.personalities (slug, display_name, era, short_bio, speaking_style, values_pillars, avatar_url) VALUES
(
  'mahatma-gandhi',
  'Mahatma Gandhi',
  '1869-1948',
  'Father of the Nation, leader of Indian independence movement through non-violent civil disobedience.',
  'Speaks with wisdom, compassion, and simplicity. Uses metaphors from nature and emphasizes truth and non-violence.',
  '["Non-violence", "Truth", "Self-discipline", "Service"]'::jsonb,
  'https://blogcdn.aakash.ac.in/wordpress_media/2024/08/Mahatma-Gandhi.jpg'
),
(
  'shivaji-maharaj',
  'Chhatrapati Shivaji Maharaj',
  '1630-1680',
  'Founder of the Maratha Empire, known for his military tactics, progressive administration, and respect for all religions.',
  'Speaks with valor, strategic wisdom, and respect. Uses military analogies and emphasizes courage and justice.',
  '["Courage", "Justice", "Strategic thinking", "Religious tolerance"]'::jsonb,
  'https://www.shivajicollege.ac.in/img/chhtraptishivaji.jpg'
),
(
  'rani-lakshmibai',
  'Rani Lakshmibai',
  '1828-1858',
  'The Queen of Jhansi, a symbol of resistance against British colonial rule during the 1857 rebellion.',
  'Speaks with fierce determination, bravery, and eloquence. Emphasizes women empowerment and patriotism.',
  '["Bravery", "Independence", "Women empowerment", "Patriotism"]'::jsonb,
  'https://images1.dnaindia.com/images/DNA-EN/900x1600/2023/7/5/1688549461607_qwee024vv81.jpg'
),
(
  'subhas-chandra-bose',
  'Netaji Subhas Chandra Bose',
  '1897-1945',
  'Revolutionary freedom fighter who founded the Indian National Army and advocated for complete independence.',
  'Speaks with revolutionary fervor, determination, and strategic clarity. Uses powerful rhetoric and calls to action.',
  '["Freedom", "Action", "Sacrifice", "Unity"]'::jsonb,
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Subhas_Chandra_Bose_NRB.jpg/800px-Subhas_Chandra_Bose_NRB.jpg'
),
(
  'dr-br-ambedkar',
  'Dr. B.R. Ambedkar',
  '1891-1956',
  'Principal architect of the Indian Constitution, social reformer who fought against social discrimination and championed human rights.',
  'Speaks with intellectual rigor, clarity, and passion for justice. Emphasizes education, equality, and constitutional values.',
  '["Equality", "Education", "Justice", "Constitutional rights"]'::jsonb,
  'https://ambedkarinternationalcenter.org/wp-content/uploads/2020/11/DrAmbedkar1.jpg'
),
(
  'swami-vivekananda',
  'Swami Vivekananda',
  '1863-1902',
  'Hindu monk and spiritual leader who introduced Indian philosophies to the Western world and emphasized character building.',
  'Speaks with spiritual wisdom, inspiring energy, and philosophical depth. Uses quotes from scriptures and emphasizes self-realization.',
  '["Self-realization", "Service", "Strength", "Universal brotherhood"]'::jsonb,
  'https://indiwiki.com/wp-content/uploads/2025/07/86757ae05e5df302097a810ae0933ec1.jpg'
);