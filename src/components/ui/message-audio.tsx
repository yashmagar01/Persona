import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Loader2, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MessageAudioProps {
  audioUrl: string;
  autoPlay?: boolean;
  className?: string;
}

export const MessageAudio = React.forwardRef<HTMLDivElement, MessageAudioProps>(
  ({ audioUrl, autoPlay = false, className }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    // Auto-play on mount (if enabled and audio loads successfully)
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      const handleCanPlay = () => {
        setIsLoading(false);
        if (autoPlay) {
          audio.play().catch((e) => {
            console.log("Autoplay blocked by browser:", e);
            toast.info("🔊 Voice message ready. Click to play!", {
              duration: 3000,
            });
          });
        }
      };

      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      };

      const handleError = (e: ErrorEvent) => {
        console.error("Audio playback error:", e);
        setError(true);
        setIsLoading(false);
        toast.error("Failed to load audio", {
          description: "Audio unavailable—reading text instead",
        });
      };

      const handleTimeUpdate = () => {
        if (audio.duration) {
          const progress = (audio.currentTime / audio.duration) * 100;
          setProgress(progress);
          setCurrentTime(audio.currentTime);
        }
      };

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("play", handlePlay);
      audio.addEventListener("pause", handlePause);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError as any);
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("play", handlePlay);
        audio.removeEventListener("pause", handlePause);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError as any);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }, [autoPlay]);

    const togglePlayPause = () => {
      if (!audioRef.current) return;

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e) => {
          console.error("Playback failed:", e);
          toast.error("Playback failed", {
            description: "Please try again",
          });
        });
      }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!audioRef.current) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newTime = (percentage / 100) * audioRef.current.duration;

      audioRef.current.currentTime = newTime;
      setProgress(percentage);
    };

    const formatTime = (seconds: number): string => {
      if (isNaN(seconds)) return "0:00";
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (error) {
      return (
        <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)} ref={ref}>
          <VolumeX className="h-3 w-3" />
          <span>Audio unavailable</span>
        </div>
      );
    }

    return (
      <div className={cn("flex flex-col gap-2 mt-2", className)} ref={ref}>
        <audio ref={audioRef} src={audioUrl} preload="metadata" className="hidden" />

        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            disabled={isLoading}
            className="h-8 w-8 rounded-full hover:bg-primary/10"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </Button>

          {/* Progress Bar */}
          <div className="flex-1 flex items-center gap-2">
            <div
              className="flex-1 h-1.5 bg-muted rounded-full cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <div
                className="h-full bg-primary transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="text-xs text-muted-foreground tabular-nums min-w-[4rem] text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Volume Icon */}
          <Volume2 className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Browser Native Controls (Fallback for mobile) */}
        <audio controls className="w-full h-8 md:hidden">
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support audio playback.
        </audio>
      </div>
    );
  }
);

MessageAudio.displayName = "MessageAudio";
