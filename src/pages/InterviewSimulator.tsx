
import React, { useRef, useEffect } from "react";
import { toast } from "sonner";
import { useInterviewState } from "@/hooks/useInterviewState";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useInterviewSpeech } from "@/hooks/useInterviewSpeech";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import InterviewHeader from "@/components/interview/InterviewHeader";
import WelcomeScreen from "@/components/interview/WelcomeScreen";
import LoadingScreen from "@/components/interview/LoadingScreen";
import InterviewContainer from "@/components/interview/InterviewContainer";
import FinalFeedback from "@/components/interview/FinalFeedback";

const InterviewSimulator = () => {
  const {
    status,
    setStatus,
    transcript,
    setTranscript,
    displayedTranscript,
    setDisplayedTranscript,
    feedback,
    isListening,
    setIsListening,
    isSpeaking,
    setIsSpeaking,
    programName,
    setProgramName,
    currentQuestion,
    questions,
    currentQuestionIndex,
    audioEnabled,
    setAudioEnabled,
    completedAnswer,
    setCompletedAnswer,
    fadeIn,
    currentFeedback,
    questionFeedbacks,
    autoRecording,
    setAutoRecording,
    silenceTimeout,
    setSilenceTimeout,
    lastTranscriptLength,
    setLastTranscriptLength,
    startInterview,
    submitResponse,
    continueToNextQuestion,
    resetInterview
  } = useInterviewState();

  const {
    resetSilenceTimer
  } = useSpeechRecognition({
    isListening,
    autoRecording
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
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
  }, [isListening, lastTranscriptLength, silenceTimeout, setLastTranscriptLength, resetSilenceTimer, setTranscript]);

  // Auto-stop on 3 seconds of silence
  useEffect(() => {
    if (silenceTimeout) {
      clearTimeout(silenceTimeout);
    }

    if (autoRecording && isListening) {
      const timeout = setTimeout(() => {
        stopListeningAndSubmit();
      }, 3000);

      setSilenceTimeout(timeout);
    }
  }, [autoRecording, isListening, lastTranscriptLength, silenceTimeout]);

  const {
    speakCurrentQuestion,
    toggleListening,
    stopListeningAndSubmit
  } = useInterviewSpeech({
    status,
    currentQuestion,
    audioEnabled,
    isSpeaking,
    setIsSpeaking,
    isListening,
    setIsListening,
    autoRecording,
    resetSilenceTimer,
    setTranscript,
    setDisplayedTranscript,
    transcript,
    setCompletedAnswer,
    silenceTimeout,
    setSilenceTimeout
  });

  const toggleAudio = () => {
    setAudioEnabled(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-red-50">
      <div className="flex-1 container mx-auto px-4 py-12">
        <InterviewHeader status={status} />

        {status === "idle" && (
          <WelcomeScreen
            programName={programName}
            setProgramName={setProgramName}
            startInterview={startInterview}
          />
        )}

        {status === "preparing" && (
          <LoadingScreen programName={programName} />
        )}

        {status === "interviewing" && (
          <InterviewContainer
            currentQuestion={currentQuestion}
            isSpeaking={isSpeaking}
            audioEnabled={audioEnabled}
            toggleAudio={toggleAudio}
            speakCurrentQuestion={speakCurrentQuestion}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            isListening={isListening}
            toggleListening={toggleListening}
            displayedTranscript={displayedTranscript}
            completedAnswer={completedAnswer}
            resetInterview={resetInterview}
            submitResponse={submitResponse}
            autoRecording={autoRecording}
            setAutoRecording={setAutoRecording}
            fadeIn={fadeIn}
          />
        )}

        {(status === "question-feedback" || status === "detailed-feedback") && currentFeedback && (
          <FeedbackDisplay
            feedback={currentFeedback}
            questionText={currentQuestion}
            userResponse={completedAnswer}
            onContinue={continueToNextQuestion}
            audioEnabled={audioEnabled}
          />
        )}

        {status === "final-feedback" && (
          <FinalFeedback
            feedback={feedback}
            questionFeedbacks={questionFeedbacks}
            questions={questions}
            resetInterview={resetInterview}
          />
        )}
      </div>
    </div>
  );
};

export default InterviewSimulator;
