
import { useState, useRef, useEffect } from "react";

interface UseSpeechRecognitionProps {
  isListening: boolean;
  autoRecording: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  lastTranscriptLength: number;
  setLastTranscriptLength: (length: number) => void;
  resetSilenceTimer: () => void;
  silenceTimeout: NodeJS.Timeout | null;
  setSilenceTimeout: (timeout: NodeJS.Timeout | null) => void;
}

export const useSpeechRecognition = ({
  isListening,
  autoRecording
}: UseSpeechRecognitionProps): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState("");
  const [lastTranscriptLength, setLastTranscriptLength] = useState(0);
  const [silenceTimeout, setSilenceTimeout] = useState<NodeJS.Timeout | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event) => {
          const currentTranscript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join("");

          setTranscript(currentTranscript);

          if (currentTranscript.length > lastTranscriptLength) {
            setLastTranscriptLength(currentTranscript.length);
            resetSilenceTimer();
          }
        };

        recognitionRef.current.onend = () => {
          if (isListening) {
            recognitionRef.current?.start();
          }
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
      }
    };
  }, [isListening, lastTranscriptLength, silenceTimeout]);

  const resetSilenceTimer = () => {
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
    }
  };

  return {
    transcript,
    lastTranscriptLength,
    setLastTranscriptLength,
    resetSilenceTimer,
    silenceTimeout,
    setSilenceTimeout
  };
};
