import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, Sparkles } from "lucide-react";
import { generatePersonalityResponse } from "@/lib/gemini";
import { toast } from "sonner";

const DEMO_PERSONALITIES = [
  {
    slug: 'mahatma-gandhi',
    display_name: 'Mahatma Gandhi',
    era: '1869 - 1948',
    short_bio: "Father of the Nation, leader of India's independence movement through non-violent civil disobedience.",
    speaking_style: 'Speaks with profound simplicity and moral clarity. Uses metaphors from nature and daily life. Often references truth (Satya) and non-violence (Ahimsa).',
    values_pillars: ['Truth (Satya)', 'Non-violence (Ahimsa)', 'Self-discipline'],
    avatar_url: 'https://blogcdn.aakash.ac.in/wordpress_media/2024/08/Mahatma-Gandhi.jpg'
  },
  {
    slug: 'apj-abdul-kalam',
    display_name: 'Dr. APJ Abdul Kalam',
    era: '1931 - 2015',
    short_bio: "The Missile Man of India, 11th President of India, and beloved People's President.",
    speaking_style: 'Speaks with scientific precision mixed with poetic inspiration. Always encouraging and optimistic. Addresses youth frequently with "my young friends".',
    values_pillars: ['Dreams and Innovation', 'Youth empowerment', 'Hard work'],
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    slug: 'shivaji-maharaj',
    display_name: 'Chhatrapati Shivaji Maharaj',
    era: '1630 - 1680',
    short_bio: 'Founder of the Maratha Empire, military genius, and champion of Swarajya (self-rule).',
    speaking_style: 'Speaks with royal dignity and warrior spirit. Uses military metaphors and strategic language.',
    values_pillars: ['Swarajya (Self-rule)', 'Courage and Valor', 'Justice'],
    avatar_url: 'https://images.unsplash.com/photo-1555400082-8e4155f61e2c?w=400'
  }
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const DemoChat = () => {
  const [selectedPersonality, setSelectedPersonality] = useState(DEMO_PERSONALITIES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Generate AI response
      const response = await generatePersonalityResponse(
        selectedPersonality,
        messages,
        userMessage
      );

      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      toast.success(`${selectedPersonality.display_name} replied!`);
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error(error.message || "Failed to get response");
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold mb-2">🏛️ Historical Chatboard Demo</h1>
          <p className="text-muted-foreground">Chat with AI-powered historical personalities (No login required)</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Personality Selector */}
          <Card className="p-4 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Select Personality</h2>
            {DEMO_PERSONALITIES.map((personality) => (
              <button
                key={personality.slug}
                onClick={() => {
                  setSelectedPersonality(personality);
                  setMessages([]);
                }}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPersonality.slug === personality.slug
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="font-semibold">{personality.display_name}</div>
                <div className="text-xs text-muted-foreground">{personality.era}</div>
              </button>
            ))}
          </Card>

          {/* Chat Area */}
          <Card className="md:col-span-2 flex flex-col" style={{ height: '600px' }}>
            {/* Personality Info */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  🏛️
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedPersonality.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPersonality.era}</p>
                </div>
                <Badge variant="secondary">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </div>
              <p className="text-sm mt-2 text-muted-foreground">{selectedPersonality.short_bio}</p>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p className="mb-2">Start a conversation with {selectedPersonality.display_name}</p>
                  <p className="text-sm">Try asking about their life, values, or advice for today</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${selectedPersonality.display_name} anything...`}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoChat;
