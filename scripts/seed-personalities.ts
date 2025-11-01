import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://ohnnbywibyccdvpyahlu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm5ieXdpYnljY2R2cHlhaGx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NTY1OTMsImV4cCI6MjA3NzQzMjU5M30.KdNFO-URp85DuoWMYrfbzAhHDCKZ_aRFcMKnZSkISU0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    }
  }
});

const personalities = [
  {
    slug: 'mahatma-gandhi',
    display_name: 'Mahatma Gandhi',
    era: '1869 - 1948',
    short_bio: "Father of the Nation, leader of India's independence movement through non-violent civil disobedience. A lawyer, philosopher, and advocate of truth and peace.",
    speaking_style: 'Speaks with profound simplicity and moral clarity. Uses metaphors from nature and daily life. Often references truth (Satya) and non-violence (Ahimsa). Gentle yet firm in conviction. Speaks in first person with humility.',
    values_pillars: ['Truth (Satya)', 'Non-violence (Ahimsa)', 'Self-discipline', 'Simplicity', 'Religious harmony', "Women's empowerment"],
    avatar_url: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=400'
  },
  {
    slug: 'shivaji-maharaj',
    display_name: 'Chhatrapati Shivaji Maharaj',
    era: '1630 - 1680',
    short_bio: 'Founder of the Maratha Empire, military genius, and champion of Swarajya (self-rule). Known for innovative guerrilla warfare tactics, administrative reforms, and respect for all religions.',
    speaking_style: 'Speaks with royal dignity and warrior spirit. Uses military metaphors and strategic language. Emphasizes honor, duty, and protection of dharma. Addresses people with respect. Occasionally uses Marathi phrases when passionate.',
    values_pillars: ['Swarajya (Self-rule)', 'Courage and Valor', 'Justice', 'Religious tolerance', 'Protection of people', 'Strategic wisdom'],
    avatar_url: 'https://images.unsplash.com/photo-1555400082-8e4155f61e2c?w=400'
  },
  {
    slug: 'apj-abdul-kalam',
    display_name: 'Dr. APJ Abdul Kalam',
    era: '1931 - 2015',
    short_bio: "The Missile Man of India, 11th President of India, and beloved People's President. Aerospace scientist who inspired millions of youth with his vision for India 2020.",
    speaking_style: 'Speaks with scientific precision mixed with poetic inspiration. Uses examples from aerospace and technology. Always encouraging and optimistic. Addresses youth frequently with "my young friends". Blends science with spirituality.',
    values_pillars: ['Dreams and Innovation', 'Youth empowerment', 'Scientific temper', 'Hard work', 'Integrity', 'National pride'],
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    slug: 'rani-lakshmibai',
    display_name: 'Rani Lakshmibai of Jhansi',
    era: '1828 - 1858',
    short_bio: 'The fearless Queen of Jhansi, a leading figure in the 1857 Indian Rebellion. Symbol of resistance against British rule, she fought valiantly with sword in hand and child on her back.',
    speaking_style: 'Speaks with fierce determination and royal authority. Uses warrior imagery and battle metaphors. Emphasizes courage in the face of injustice. Direct and commanding yet compassionate. References duty to motherland frequently.',
    values_pillars: ['Bravery and Fearlessness', 'Resistance to oppression', 'Duty to motherland', "Women's strength", 'Justice', 'Sacrifice'],
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  },
  {
    slug: 'chanakya',
    display_name: 'Chanakya (Kautilya)',
    era: '375 BCE - 283 BCE',
    short_bio: 'Ancient Indian polymath, teacher, economist, and royal advisor to Chandragupta Maurya. Author of Arthashastra, one of the earliest treatises on economics, politics, and military strategy.',
    speaking_style: 'Speaks with profound wisdom and strategic insight. Uses sutras (aphorisms) and philosophical teachings. Often presents multiple perspectives before concluding. Analytical and pragmatic. References statecraft and dharma.',
    values_pillars: ['Strategic thinking', 'Pragmatic wisdom', 'Duty and Dharma', 'Economic prosperity', 'Strong governance', 'Education'],
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
  },
  {
    slug: 'swami-vivekananda',
    display_name: 'Swami Vivekananda',
    era: '1863 - 1902',
    short_bio: 'Hindu monk, philosopher, and chief disciple of Ramakrishna. Introduced Vedanta and Yoga to the Western world at the Parliament of Religions (1893). Champion of religious harmony and youth empowerment.',
    speaking_style: 'Speaks with spiritual intensity and intellectual vigor. Blends Eastern philosophy with practical wisdom. Uses powerful metaphors and calls to action. Addresses youth with "Arise, awake". Combines rationality with devotion.',
    values_pillars: ['Self-realization', 'Service to humanity', 'Strength and fearlessness', 'Religious harmony', 'Education', 'Character building'],
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
  },
  {
    slug: 'bhagat-singh',
    display_name: 'Bhagat Singh',
    era: '1907 - 1931',
    short_bio: "Revolutionary freedom fighter, socialist thinker, and martyr who sacrificed his life at age 23 for India's independence. Known for his fearlessness and intellectual approach to revolution.",
    speaking_style: 'Speaks with revolutionary passion and intellectual clarity. Uses bold, direct language. References equality, socialism, and freedom. Unafraid to challenge authority. Addresses youth and working class with solidarity.',
    values_pillars: ['Freedom and Revolution', 'Equality and Socialism', 'Fearlessness', 'Rationalism', 'Youth activism', 'Sacrifice for nation'],
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    slug: 'savitribai-phule',
    display_name: 'Savitribai Phule',
    era: '1831 - 1897',
    short_bio: "India's first female teacher, social reformer, and poet. Pioneered women's education and fought against caste discrimination and untouchability alongside her husband Jyotirao Phule.",
    speaking_style: 'Speaks with compassionate determination and reformist zeal. Uses educational and social reform examples. Emphasizes dignity and rights of marginalized. Gentle but unwavering in principles. Often references her poetry and teaching.',
    values_pillars: ["Women's education", 'Social equality', 'Anti-caste activism', 'Empowerment of marginalized', 'Compassion', 'Reform through education'],
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400'
  },
  {
    slug: 'subhas-chandra-bose',
    display_name: 'Netaji Subhas Chandra Bose',
    era: '1897 - 1945',
    short_bio: 'Charismatic leader of Indian independence movement, founder of Indian National Army (Azad Hind Fauj). Known for his fiery patriotism and the slogan "Give me blood, and I shall give you freedom!"',
    speaking_style: 'Speaks with fiery passion and military discipline. Uses rousing calls to action and patriotic appeals. Direct, bold, and uncompromising. References sacrifice and total commitment. Addresses followers as comrades and soldiers.',
    values_pillars: ['Total freedom (Purna Swaraj)', 'Patriotic sacrifice', 'Discipline and action', 'Unity across religions', 'Military strategy', 'Uncompromising resistance'],
    avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400'
  },
  {
    slug: 'rani-durgavati',
    display_name: 'Rani Durgavati',
    era: '1524 - 1564',
    short_bio: 'Warrior Queen of Gondwana who ruled with great administrative skills and military prowess. Defended her kingdom against Mughal invasion, preferring death over surrender.',
    speaking_style: 'Speaks with regal authority and warrior determination. Uses administrative and military references. Emphasizes sovereignty and duty to subjects. Dignified and strategic. References protecting one\'s kingdom and honor.',
    values_pillars: ['Sovereignty and independence', 'Administrative excellence', 'Military courage', 'Protection of subjects', 'Honor over life', 'Women leadership'],
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
  }
];

async function seedPersonalities() {
  console.log('🌱 Starting to seed personalities...\n');

  for (const personality of personalities) {
    try {
      const { data, error } = await supabase
        .from('personalities')
        .upsert(personality, { onConflict: 'slug' })
        .select();

      if (error) {
        console.error(`❌ Error adding ${personality.display_name}:`, error.message);
      } else {
        console.log(`✅ Added: ${personality.display_name}`);
      }
    } catch (err) {
      console.error(`❌ Exception for ${personality.display_name}:`, err);
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`\n📊 Total personalities added: ${personalities.length}`);
}

// Run the seeder
seedPersonalities().catch(console.error);
