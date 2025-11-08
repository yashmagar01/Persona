import { ChatLoadingSkeleton, ChatLoadingMinimal } from "@/components/ChatLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Demo Page for Chat Loading States
 * Displays both loading skeleton variants for testing and verification
 */
export default function ChatLoadingDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/chatboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Chat Loading State Demo</h1>
            <p className="text-muted-foreground">Testing and verification of loading skeleton components</p>
          </div>
        </div>

        {/* Full Chat Loading Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Full Chat Loading Skeleton</CardTitle>
            <CardDescription>
              Complete loading state with header, typing dots, and input area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-orange-500/30 rounded-lg overflow-hidden">
              <div className="h-[600px]">
                <ChatLoadingSkeleton />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minimal Loading State */}
        <Card>
          <CardHeader>
            <CardTitle>Minimal Chat Loading</CardTitle>
            <CardDescription>
              Lightweight version for quick transitions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-orange-500/30 rounded-lg overflow-hidden">
              <div className="h-[300px]">
                <ChatLoadingMinimal />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Implementation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Details</CardTitle>
            <CardDescription>Verification checklist for loading state components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">✅ Implemented Features:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Personality Header Skeleton:</strong> Avatar (w-12 h-12), name (h-5), era (h-4)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Animated Typing Dots:</strong> Three orange dots (●●●) with sequential pulse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Status Text:</strong> "Initializing conversation..." below dots</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Welcome Message Skeleton:</strong> Two-line placeholder (h-6)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Disabled Input Field:</strong> Grayed out with placeholder text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Loading Indicator:</strong> Spinning loader on send button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span><strong>Smooth Fade-in:</strong> 0.5s ease-out animation (animate-fadeIn)</span>
                  </li>
                </ul>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground">🎨 Animation Details:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">●</span>
                    <span><strong>Dot 1:</strong> animationDelay: 0ms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">●</span>
                    <span><strong>Dot 2:</strong> animationDelay: 200ms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">●</span>
                    <span><strong>Dot 3:</strong> animationDelay: 400ms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500">↻</span>
                    <span><strong>Pulse:</strong> All placeholders use animate-pulse</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500">↯</span>
                    <span><strong>Spinner:</strong> Send button shows rotating loader</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500">⟳</span>
                    <span><strong>Fade-in:</strong> Entire component fades in on mount</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Visual Structure */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold text-sm text-foreground mb-3">📐 Component Structure:</h4>
              <pre className="text-xs text-muted-foreground font-mono whitespace-pre">
{`┌────────────────────────────────────────────┐
│ ← [◯] [████████████] [████]                │ ← Header Skeleton
├────────────────────────────────────────────┤
│                                             │
│         [████████████████████████]         │ ← Welcome Message
│         [██████████████]                   │    (2 lines)
│                                             │
│              ● ● ●                          │ ← Animated Dots
│       Initializing conversation...          │ ← Status Text
│                                             │
├────────────────────────────────────────────┤
│ ┌─────────────────────────────────┬──┐    │
│ │ Type a message... (disabled)     │ ⟳ │    │ ← Input Area
│ └─────────────────────────────────┴──┘    │
│     Connecting to [name]...                │ ← Helper Text
└────────────────────────────────────────────┘`}
              </pre>
            </div>

            {/* Testing Notes */}
            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <h4 className="font-semibold text-sm text-orange-400 mb-2">🧪 Testing Notes:</h4>
              <p className="text-xs text-muted-foreground">
                This demo page displays the loading states permanently for verification. 
                In actual usage, these appear for ~100-500ms while chat data loads. 
                To see them in real usage, use DevTools Network throttling (Slow 3G) or add artificial delays.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
