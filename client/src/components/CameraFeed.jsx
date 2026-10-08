import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Sparkles,
  User,
  AlertCircle,
  Eye,
  CheckCircle,
  RefreshCw,
  Sliders
} from 'lucide-react';

export const CameraFeed = ({
  isCameraOn,
  setIsCameraOn,
  isRecording,
  candidateName = 'Candidate',
  targetRole = 'Software Engineer',
  layout = 'split', // 'split' | 'compact' | 'floating'
  onToggleLayout,
  compact = false,
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [permissionError, setPermissionError] = useState('');
  const [isMirrored, setIsMirrored] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('16/9');

  // Start / Stop Camera Stream
  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      if (!isCameraOn) {
        stopCamera();
        return;
      }

      setIsConnecting(true);
      setPermissionError('');

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access is not supported by your browser.');
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false, // audio handled by Web Speech API or separate
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error('Webcam access error:', err);
        setHasPermission(false);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('Camera permission was denied. Please allow camera access in browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setPermissionError('No camera found on this device.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setPermissionError('Camera is already in use by another application.');
        } else {
          setPermissionError(err.message || 'Unable to access camera.');
        }
        setIsCameraOn(false);
      } finally {
        setIsConnecting(false);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (isCameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      active = false;
      stopCamera();
    };
  }, [isCameraOn]);

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  const toggleMirror = () => {
    setIsMirrored((prev) => !prev);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 shadow-xl transition-all duration-300 flex flex-col justify-between ${
        compact ? 'h-52 sm:h-64' : 'h-[260px] sm:h-[340px] md:h-[400px]'
      }`}
    >
      {/* Video Element */}
      {isCameraOn && !permissionError ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isMirrored ? 'scale-x-[-1]' : ''
            }`}
          />
        </div>
      ) : (
        /* Camera Off / Error State */
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3 relative group shadow-inner">
            <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center">
              <CameraOff className="w-3 h-3 text-slate-400" />
            </div>
          </div>

          <h4 className="text-sm font-bold text-white mb-1">
            {permissionError ? 'Camera Access Required' : 'Camera is Turned Off'}
          </h4>

          <p className="text-xs text-slate-400 max-w-xs mb-4">
            {permissionError
              ? permissionError
              : 'Turn on your camera to simulate a realistic video interview environment with eye contact.'}
          </p>

          <button
            type="button"
            onClick={toggleCamera}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{permissionError ? 'Retry Camera Access' : 'Turn On Camera'}</span>
          </button>
        </div>
      )}

      {/* Top Overlay Badge & Header */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          {/* Live Indicator */}
          {isCameraOn && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white shadow-sm pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE CAM</span>
            </div>
          )}

          {/* Voice Indicator Badge */}
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-md text-[11px] font-bold text-white shadow-sm pointer-events-auto animate-pulse">
              <Mic className="w-3 h-3" />
              <span>LISTENING</span>
            </div>
          )}
        </div>

        {/* Framing & Eye contact tip */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 pointer-events-auto">
          <Eye className="w-3 h-3 text-indigo-400" />
          <span>Eye Contact Coach</span>
        </div>
      </div>

      {/* Bottom Control Bar Overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        {/* Candidate Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-white pointer-events-auto shadow-sm">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <div className="text-left">
            <p className="text-xs font-bold leading-tight truncate max-w-[120px] sm:max-w-[160px]">
              {candidateName}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px] sm:max-w-[160px]">
              {targetRole}
            </p>
          </div>
        </div>

        {/* Video Toolbar Buttons */}
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/10 pointer-events-auto shadow-sm">
          {/* Toggle Camera */}
          <button
            type="button"
            onClick={toggleCamera}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isCameraOn
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-red-500/80 text-white hover:bg-red-600'
            }`}
          >
            {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>

          {/* Flip Mirror */}
          {isCameraOn && (
            <button
              type="button"
              onClick={toggleMirror}
              title={isMirrored ? 'Disable Mirror' : 'Enable Mirror'}
              className={`p-2 rounded-lg text-white hover:bg-slate-700 transition-colors cursor-pointer ${
                isMirrored ? 'bg-indigo-600/60 text-indigo-200' : 'bg-slate-800'
              }`}
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          )}

          {/* Toggle Layout (Split vs Pip/Fullscreen) */}
          {onToggleLayout && (
            <button
              type="button"
              onClick={onToggleLayout}
              title={layout === 'split' ? 'Switch to Compact/Float' : 'Switch to Split Screen'}
              className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {layout === 'split' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
