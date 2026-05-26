
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Square, Camera, CameraOff, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import LiveMicrophone from "./LiveMicrophone";

interface UserResponseSideProps {
  isListening: boolean;
  toggleListening: () => void;
  displayedTranscript: string;
  completedAnswer: string;
  resetInterview: () => void;
  submitResponse: () => void;
  autoRecording: boolean;
  setAutoRecording: (auto: boolean) => void;
}

const UserResponseSide: React.FC<UserResponseSideProps> = ({
  isListening,
  toggleListening,
  displayedTranscript,
  completedAnswer,
  resetInterview,
  submitResponse,
  autoRecording,
  setAutoRecording,
}) => {
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [streamTracks, setStreamTracks] = useState<MediaStreamTrack[]>([]);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  const toggleCamera = async () => {
    if (cameraOn) {
      try {
        streamTracks.forEach(track => track.stop());
        setStreamTracks([]);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        setCameraOn(false);
        setIsVideoLoaded(false);
        setCameraError(null);
      } catch (err) {
        console.error("Error turning off camera:", err);
      }
    } else {
      try {
        setCameraError(null);
        setIsVideoLoaded(false);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: false
        });

        const tracks = stream.getTracks();
        setStreamTracks(tracks);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              setIsVideoLoaded(true);
              setCameraOn(true);
              toast.success("Camera is now on");
            } catch (e) {
              setCameraError("Error playing video feed");
              toast.error("Failed to start video playback");
            }
          };
        } else {
          setCameraError("Video element not found");
          toast.error("Could not initialize video display");
        }
      } catch (err) {
        setCameraError(`Could not access camera: ${err instanceof Error ? err.message : 'Unknown error'}`);
        toast.error("Could not access camera. Please check permissions.");
      }
    }
  };

  useEffect(() => {
    return () => {
      streamTracks.forEach(track => track.stop());
    };
  }, [streamTracks]);

  const toggleAutoRecording = () => {
    setAutoRecording(!autoRecording);
    toast.info(!autoRecording
      ? "Auto recording enabled. Recording will start automatically."
      : "Auto recording disabled. You'll need to manually record."
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-lg font-semibold text-red-900 font-serif">Your Response</Label>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAutoRecording}
            className="flex items-center gap-1 h-8 px-2 border-red-200 hover:bg-red-50"
            title={autoRecording ? "Turn off auto recording" : "Turn on auto recording"}
          >
            {autoRecording ? (
              <>
                <ToggleRight className="h-4 w-4 text-red-800" />
                <span className="text-xs text-red-800">Auto</span>
              </>
            ) : (
              <>
                <ToggleLeft className="h-4 w-4 text-red-800" />
                <span className="text-xs text-red-800">Manual</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleCamera}
            className="flex items-center gap-1 h-8 px-2 border-red-200 hover:bg-red-50"
            title={cameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {cameraOn ? (
              <>
                <CameraOff className="h-4 w-4 text-red-800" />
                <span className="text-xs text-red-800">Hide</span>
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 text-red-800" />
                <span className="text-xs text-red-800">Show me</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 relative" ref={videoContainerRef}>
        <div
          className={`h-full rounded-xl transition-all duration-300 flex flex-col ${
            isListening
              ? 'border-2 border-red-500 bg-white shadow-md pulse-border'
              : 'border-2 border-red-200 bg-red-50'
          }`}
        >
          <div className="flex-1 flex items-center justify-center relative overflow-hidden rounded-t-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transform scale-x-[-1] absolute inset-0 ${isVideoLoaded && cameraOn ? 'opacity-100' : 'opacity-0'}`}
            />

            {!cameraOn && !isListening && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-50">
                <span className="text-red-900 font-medium text-lg font-serif">Camera Off</span>
              </div>
            )}

            {!cameraOn && isListening && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 bg-opacity-50">
                <LiveMicrophone isActive={isListening} size="lg" />
                <span className="text-red-900 font-medium text-lg font-serif mt-8">Recording in progress...</span>
              </div>
            )}

            {cameraOn && !isVideoLoaded && !cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                <div className="w-10 h-10 border-2 border-red-800 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-100 bg-opacity-80 text-red-800 p-4 text-center">
                <span className="font-medium font-serif">Camera error</span>
                <span className="text-xs mt-1">{cameraError}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3 bg-red-800 hover:bg-red-900"
                  onClick={toggleCamera}
                >
                  Try Again
                </Button>
              </div>
            )}

            {isListening && cameraOn && (
              <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-800 bg-opacity-80 text-white px-3 py-1 rounded-full">
                <div className="relative w-3 h-3">
                  <div className="absolute inset-0 bg-red-100 rounded-full animate-ping"></div>
                  <div className="absolute inset-0 bg-red-100 rounded-full"></div>
                </div>
                <span className="text-sm font-medium">Recording...</span>
              </div>
            )}
          </div>

          <div className="flex justify-between p-4 bg-white border-t border-red-200 rounded-b-xl">
            <Button
              variant="outline"
              onClick={resetInterview}
              className="border-red-200 text-red-900 hover:bg-red-50 transition-all duration-300 font-serif"
            >
              End Interview
            </Button>

            <div className="flex items-center space-x-2">
              {!autoRecording && (
                <div className="flex items-center mr-2">
                  <LiveMicrophone isActive={isListening} size="sm" />
                  <Button
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "outline"}
                    size="sm"
                    className={`transition-all duration-300 font-serif ml-2 ${
                      isListening ? 'bg-red-800 hover:bg-red-900' : 'border-red-800 text-red-800 hover:bg-red-50'
                    }`}
                  >
                    {isListening ? <Square className="h-4 w-4 mr-1" /> : "Record"}
                  </Button>
                </div>
              )}

              <Button
                onClick={submitResponse}
                disabled={!displayedTranscript.trim() && !completedAnswer.trim()}
                className={`bg-red-800 hover:bg-red-900 text-white transition-all duration-300 font-serif ${
                  !displayedTranscript.trim() && !completedAnswer.trim() ? 'opacity-50' : ''
                }`}
              >
                Submit Answer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserResponseSide;
