import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface CameraProps {
  onCapture?: (imageSrc: string) => void;
  autoCaptureInterval?: number; // ms. If 0 or undefined, auto capture is disabled.
  isActive: boolean;
}

export interface CameraHandle {
  capture: () => string | null;
}

const Camera = forwardRef<CameraHandle, CameraProps>(({ onCapture, autoCaptureInterval, isActive }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');

  // Start Camera
  useEffect(() => {
    if (!isActive) {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError('');
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError('Camera permission denied or not available.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Capture Image Helper
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.7); // Compress slightly for speed
        return imageSrc;
      }
    }
    return null;
  };

  // Expose capture method to parent
  useImperativeHandle(ref, () => ({
    capture: () => captureImage()
  }));

  // Auto Capture Loop
  useEffect(() => {
    let intervalId: any;

    if (isActive && autoCaptureInterval && autoCaptureInterval > 0) {
      intervalId = setInterval(() => {
        const img = captureImage();
        if (img && onCapture) {
          onCapture(img);
        }
      }, autoCaptureInterval);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, autoCaptureInterval, onCapture]);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-black rounded-xl overflow-hidden shadow-lg aspect-video">
      {error ? (
        <div className="flex items-center justify-center h-full text-white p-4 text-center">
          {error}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
        />
      )}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI elements can go here */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
         <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
         <span className="text-xs text-white font-mono uppercase tracking-widest">Live Feed</span>
      </div>
    </div>
  );
});

export default Camera;