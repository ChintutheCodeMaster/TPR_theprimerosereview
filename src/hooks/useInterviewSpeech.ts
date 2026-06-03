
import { useEffect } from "react";
import { speakText } from "@/utils/textToSpeech";
import { toast } from "sonner";

interface UseInterviewSpeechProps {
  status: "idle" | "preparing" | "interviewing" | "feedback" | "question-feedback" | "detailed-feedback" | "final-feedback";
  currentQuestion: string;
  audioEnabled: boolean;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  autoRecording: boolean;
  resetSilenceTimer: () => void;
  recognitionRef?: React.MutableRefObject<SpeechRecognition | null>;
  setTranscript: (transcript: string) => void;
  setDisplayedTranscript: (transcript: string) => void;
  transcript: string;
  setCompletedAnswer: (answer: string) => void;
  silenceTimeout: NodeJS.Timeout | null;
  setSilenceTimeout: (timeout: NodeJS.Timeout | null) => void;
}

export const useInterviewSpeech = ({
  status,
  currentQuestion,
  audioEnabled,
  isSpeaking,
  setIsSpeaking,
  isListening,
  setIsListening,
  autoRecording,
  resetSilenceTimer,
  recognitionRef,
  setTranscript,
  setDisplayedTranscript,
  transcript,
  setCompletedAnswer,
  silenceTimeout,
  setSilenceTimeout
}: UseInterviewSpeechProps) => {

  useEffect(() => {
    if (status === "interviewing" && currentQuestion && audioEnabled) {
      speakCurrentQuestion();
    }
  }, [currentQuestion, status, audioEnabled]);

  useEffect(() => {
    if (status === "interviewing" && !isSpeaking && autoRecording && !isListening) {
      const timer = setTimeout(() => {
        startListening();
        toast.info("Recording started automatically", {
          duration: 2000,
          position: "bottom-center"
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status, isSpeaking, autoRecording, isListening]);

  const speakCurrentQuestion = async () => {
    if (!audioEnabled) return;

    setIsSpeaking(true);
    await speakText(currentQuestion);
    setIsSpeaking(false);
  };

  const startListening = () => {
    setIsListening(true);
    setTranscript("");
    setDisplayedTranscript("");
    if (recognitionRef?.current) {
      recognitionRef.current.start();
    }
    resetSilenceTimer();
  };

  const stopListeningAndSubmit = () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef?.current) {
        recognitionRef.current.stop();
      }

      if (silenceTimeout) {
        clearTimeout(silenceTimeout);
        setSilenceTimeout(null);
      }

      setDisplayedTranscript(transcript);
      setCompletedAnswer(transcript);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListeningAndSubmit();
    } else {
      startListening();
    }
  };

  const toggleAudio = () => {
    setIsSpeaking(false);
  };

  return {
    speakCurrentQuestion,
    startListening,
    stopListeningAndSubmit,
    toggleListening,
    toggleAudio
  };
};
