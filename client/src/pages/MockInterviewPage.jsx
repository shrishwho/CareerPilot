import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Send,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  TrendingUp,
  Brain,
  HelpCircle,
  LayoutDashboard,
  History,
  FileText,
  Camera,
  CameraOff,
  Video,
  Eye,
  Columns,
  Layers,
  Volume2,
  VolumeX,
  Clock,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { aiApi, interviewApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CameraFeed } from '../components/CameraFeed';

const PRESET_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Software Engineer',
  'Data Analyst',
  'Custom Role',
];

const INTERVIEW_TYPES = ['HR / Behavioral', 'Technical', 'Mixed'];
const QUESTION_COUNTS = [5, 10, 15];

export const MockInterviewPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Mode: 'setup' | 'interviewing' | 'evaluating' | 'report'
  const [mode, setMode] = useState('setup');

  // Setup Form State
  const [selectedRole, setSelectedRole] = useState(user?.targetRole || 'Full Stack Developer');
  const [customRole, setCustomRole] = useState('');
  const [interviewType, setInterviewType] = useState('Mixed');
  const [numQuestions, setNumQuestions] = useState(5);
  const [jobDescription, setJobDescription] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Camera & Video Interview State
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [cameraLayout, setCameraLayout] = useState('split'); // 'split' | 'pip' | 'hidden'
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);

  // Active Interview State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluations, setEvaluations] = useState({}); // questionIndex -> eval object
  const [answersList, setAnswersList] = useState([]); // list of qa objects
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Final Report State
  const [finalReport, setFinalReport] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Web Speech API Voice Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis || null);

  // Timer for active interview
  useEffect(() => {
    let interval = null;
    if (mode === 'interviewing') {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [mode]);

  // Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setCurrentAnswer(transcript);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          showToast('Microphone access denied. Please type your answer.', 'warning');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch (e) {}
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      showToast('Speech recognition is not supported in this browser. Please type your answer.', 'warning');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      showToast('Voice recording stopped', 'info');
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        showToast('Listening... Speak your answer clearly!', 'info');
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Text-To-Speech for Question Read-Aloud
  const handleReadQuestion = (text) => {
    if (!synthRef.current) {
      showToast('Text-to-speech is not supported on this device.', 'warning');
      return;
    }

    if (isPlayingAudio) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    } else {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      synthRef.current.speak(utterance);
    }
  };

  // Step 1: Start Interview (Fetch Questions from Gemini)
  const handleStartInterview = async () => {
    const targetRoleName = selectedRole === 'Custom Role' ? customRole.trim() || 'Software Engineer' : selectedRole;
    setLoadingQuestions(true);

    try {
      const res = await aiApi.generateQuestions({
        role: targetRoleName,
        interviewType,
        numQuestions,
        jobDescription: jobDescription.trim(),
      });

      if (res.data.success && res.data.questions?.length > 0) {
        setQuestions(res.data.questions);
        setCurrentIndex(0);
        setCurrentAnswer('');
        setEvaluations({});
        setAnswersList([]);
        setFinalReport(null);
        setSessionTime(0);
        setMode('interviewing');
        showToast(`Interview started! ${res.data.questions.length} questions prepared with camera active.`, 'success');

        // Optional: Auto-read first question
        if (synthRef.current) {
          setTimeout(() => {
            handleReadQuestion(res.data.questions[0].question);
          }, 800);
        }
      } else {
        throw new Error('No questions generated');
      }
    } catch (err) {
      console.error('Questions generation error:', err);
      showToast('Failed to generate interview questions. Try again.', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Step 2: Submit Current Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (!currentAnswer.trim()) {
      showToast('Please provide an answer before submitting', 'warning');
      return;
    }

    const currentQ = questions[currentIndex];
    const targetRoleName = selectedRole === 'Custom Role' ? customRole || 'Software Engineer' : selectedRole;

    setIsSubmittingAnswer(true);

    try {
      const res = await aiApi.evaluateAnswer({
        question: currentQ.question,
        answer: currentAnswer,
        role: targetRoleName,
        interviewType,
        jobDescription,
      });

      if (res.data.success && res.data.evaluation) {
        const evalData = res.data.evaluation;
        setEvaluations((prev) => ({
          ...prev,
          [currentIndex]: evalData,
        }));

        // Update answersList
        const updatedAnswer = {
          questionId: currentQ.id || currentIndex + 1,
          question: currentQ.question,
          answer: currentAnswer,
          score: evalData.score,
          relevance: evalData.relevance,
          technicalCorrectness: evalData.technicalCorrectness,
          communication: evalData.communication,
          completeness: evalData.completeness,
          feedback: evalData.feedback,
          improvementSuggestion: evalData.improvementSuggestion,
        };

        setAnswersList((prev) => {
          const filtered = prev.filter((a) => a.questionId !== updatedAnswer.questionId);
          return [...filtered, updatedAnswer];
        });

        showToast(`Answer evaluated! Score: ${evalData.score}/10`, 'success');
      }
    } catch (err) {
      console.error('Answer evaluation error:', err);
      showToast('Failed to evaluate answer. Using heuristic feedback.', 'warning');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Step 3: Move to Next Question or Finish
  const handleNextQuestion = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    if (isPlayingAudio && synthRef.current) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    }

    if (currentIndex + 1 < questions.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextAns = answersList.find((a) => a.questionId === (questions[nextIdx].id || nextIdx + 1));
      setCurrentAnswer(nextAns ? nextAns.answer : '');

      // Read next question aloud
      if (synthRef.current) {
        setTimeout(() => {
          handleReadQuestion(questions[nextIdx].question);
        }, 500);
      }
    } else {
      // Completed all questions -> Generate Final Report
      await handleFinishInterview();
    }
  };

  // Step 4: Finish & Generate Comprehensive Report
  const handleFinishInterview = async () => {
    if (isPlayingAudio && synthRef.current) {
      synthRef.current.cancel();
      setIsPlayingAudio(false);
    }

    const targetRoleName = selectedRole === 'Custom Role' ? customRole || 'Software Engineer' : selectedRole;
    setIsGeneratingReport(true);
    setMode('report');

    try {
      const res = await aiApi.generateFinalReport({
        role: targetRoleName,
        interviewType,
        jobDescription,
        questionsAndAnswers: answersList,
      });

      if (res.data.success && res.data.report) {
        const report = res.data.report;
        setFinalReport(report);

        // Save complete session to MongoDB
        await interviewApi.create({
          role: targetRoleName,
          interviewType,
          jobDescription,
          questions,
          answers: answersList,
          scores: {
            overall: report.overallScore,
            technical: report.technicalScore,
            communication: report.communicationScore,
            confidence: report.confidenceScore,
          },
          finalReport: report,
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        showToast('Interview saved to your history!', 'success');
      }
    } catch (err) {
      console.error('Final report generation error:', err);
      showToast('Failed to generate final report.', 'error');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentEval = evaluations[currentIndex];
  const currentQuestionObj = questions[currentIndex];
  const targetRoleName = selectedRole === 'Custom Role' ? customRole || 'Software Engineer' : selectedRole;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* 1. SETUP MODE */}
      {mode === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Setup Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            {/* Header */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Video Interview Simulator</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Configure Your Mock Interview
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Select your target role, interview style, and test your camera & audio setup before starting.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  1. Select Target Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-3 rounded-xl text-xs font-semibold text-left transition-all border cursor-pointer ${
                        selectedRole === role
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-2 ring-indigo-500/20 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>

                {selectedRole === 'Custom Role' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="e.g. AI Prompt Engineer / DevOps Specialist"
                      className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Interview Type */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  2. Interview Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {INTERVIEW_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterviewType(type)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center transition-all border cursor-pointer ${
                        interviewType === type
                          ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20 font-bold shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  3. Number of Questions
                </label>
                <div className="flex items-center gap-3">
                  {QUESTION_COUNTS.map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setNumQuestions(cnt)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        numQuestions === cnt
                          ? 'bg-purple-50 border-purple-600 text-purple-700 ring-2 ring-purple-500/20 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description Optional */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  4. Job Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job requirements, responsibilities, or tech stack to tailor questions directly to the company..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              {/* Start Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={loadingQuestions}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                >
                  {loadingQuestions ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gemini is generating questions...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>Start Video Mock Interview</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Camera & Readiness Check */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Camera & Audio Preview</h3>
                    <p className="text-[11px] text-slate-500">Test framing before answering</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCameraOn((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCameraOn
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {isCameraOn ? (
                    <>
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Camera Ready</span>
                    </>
                  ) : (
                    <>
                      <CameraOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Camera Off</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Preview Box */}
              <CameraFeed
                isCameraOn={isCameraOn}
                setIsCameraOn={setIsCameraOn}
                isRecording={isRecording}
                candidateName={user?.name || 'Candidate'}
                targetRole={targetRoleName}
                compact={true}
              />

              {/* Interview Best Practice Checklist */}
              <div className="space-y-2 pt-1 text-xs">
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Maintain natural eye contact with the camera.</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Use STAR method (Situation, Task, Action, Result).</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Speak clearly using voice recording or type naturally.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE INTERVIEW SCREEN */}
      {mode === 'interviewing' && currentQuestionObj && (
        <div className="space-y-6">
          {/* Top Interview Control Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Left: Question Counter & Type */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
                {currentIndex + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    {currentQuestionObj.type || interviewType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-medium">
                  {selectedRole === 'Custom Role' ? customRole : selectedRole}
                </div>
              </div>
            </div>

            {/* Middle: Progress Bar & Timer */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatTimer(sessionTime)}</span>
              </div>

              <div className="w-28 sm:w-40 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Right: Camera Layout Toggle & Audio Read Aloud */}
            <div className="flex items-center gap-2">
              {/* Question Read Aloud */}
              <button
                type="button"
                onClick={() => handleReadQuestion(currentQuestionObj.question)}
                title={isPlayingAudio ? 'Stop reading' : 'Read question aloud'}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-purple-100 text-purple-700 border border-purple-300 animate-pulse'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span className="hidden md:inline">{isPlayingAudio ? 'Mute Question' : 'Listen Question'}</span>
              </button>

              {/* Camera Layout Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setCameraLayout('split')}
                  title="Split View (Side-by-Side)"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    cameraLayout === 'split' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Columns className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCameraLayout('pip')}
                  title="Floating Camera"
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    cameraLayout === 'pip' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* INTERVIEW CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT / TOP: LIVE CAMERA FEED (in split mode) */}
            {cameraLayout === 'split' && (
              <div className="lg:col-span-5 space-y-4">
                <CameraFeed
                  isCameraOn={isCameraOn}
                  setIsCameraOn={setIsCameraOn}
                  isRecording={isRecording}
                  candidateName={user?.name || 'Candidate'}
                  targetRole={targetRoleName}
                  layout={cameraLayout}
                  onToggleLayout={() => setCameraLayout('pip')}
                />

                {/* Eye contact & Coaching tips */}
                <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 shadow-md space-y-2 border border-indigo-800/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Live AI Coaching Feedback</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                      Camera Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Look directly into the camera lens while answering. This reinforces confident body language and authentic eye contact.
                  </p>
                </div>
              </div>
            )}

            {/* RIGHT / MAIN: QUESTION & ANSWER PANEL */}
            <div className={cameraLayout === 'split' ? 'lg:col-span-7 space-y-6' : 'lg:col-span-12 space-y-6'}>
              {/* Question Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      Q{currentIndex + 1}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                      "{currentQuestionObj.question}"
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReadQuestion(currentQuestionObj.question)}
                    title="Listen Question"
                    className="p-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shrink-0 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Expected Key Points preview indicator */}
                {currentQuestionObj.expectedKeyPoints?.length > 0 && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800">Interview Tip: </span>
                    Discuss key principles, trade-offs, architecture, and real scenarios.
                  </div>
                )}

                {/* Answer Textarea */}
                <div className="relative pt-1">
                  <textarea
                    rows={cameraLayout === 'split' ? 8 : 7}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here or click '🎤 Record Answer' to speak verbally using real-time speech-to-text..."
                    className={`w-full p-4 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all resize-none leading-relaxed ${
                      isRecording ? 'border-red-400 ring-2 ring-red-400/20' : 'border-slate-200'
                    }`}
                  />

                  {/* Character & word counter */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 px-1">
                    <span>
                      {currentAnswer.trim() ? `${currentAnswer.trim().split(/\s+/).length} words` : '0 words'}
                    </span>
                    {isRecording && (
                      <span className="text-red-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                        Transcribing Speech...
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                  {/* Voice Record Button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4" />
                        <span>Stop Recording</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-slate-600" />
                        <span>🎤 Record Voice</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2.5">
                    {/* Submit Answer Button */}
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmittingAnswer || !currentAnswer.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingAnswer ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Evaluating...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>{currentEval ? 'Re-Evaluate Answer' : 'Submit Answer'}</span>
                        </>
                      )}
                    </button>

                    {/* Next Question / Finish Button */}
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <span>{currentIndex + 1 === questions.length ? 'Finish & Generate Report' : 'Next Question'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Instant Granular Feedback Below Answer */}
              {currentEval && (
                <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/70 rounded-2xl border border-indigo-200/80 p-6 shadow-xs space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Gemini AI Answer Evaluation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Score:</span>
                      <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-xs">
                        {currentEval.score} / 10
                      </span>
                    </div>
                  </div>

                  {/* Rubric Breakdown Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 space-y-1">
                      <span className="text-slate-400 font-medium">Relevance</span>
                      <p className="font-bold text-slate-800">{currentEval.relevance}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 space-y-1">
                      <span className="text-slate-400 font-medium">Tech Correctness</span>
                      <p className="font-bold text-slate-800">{currentEval.technicalCorrectness}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 space-y-1">
                      <span className="text-slate-400 font-medium">Communication</span>
                      <p className="font-bold text-slate-800">{currentEval.communication}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/80 border border-indigo-100 space-y-1">
                      <span className="text-slate-400 font-medium">Completeness</span>
                      <p className="font-bold text-slate-800">{currentEval.completeness}</p>
                    </div>
                  </div>

                  {/* Constructive Feedback */}
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                      <span className="font-bold">Feedback: </span>
                      {currentEval.feedback}
                    </div>

                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900">
                      <span className="font-bold">Improvement Suggestion: </span>
                      {currentEval.improvementSuggestion}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING PICTURE-IN-PICTURE CAMERA (when layout === 'pip') */}
          {cameraLayout === 'pip' && (
            <div className="fixed bottom-6 right-6 z-40 w-72 sm:w-80 shadow-2xl rounded-2xl overflow-hidden border-2 border-indigo-500/50 animate-fade-in">
              <CameraFeed
                isCameraOn={isCameraOn}
                setIsCameraOn={setIsCameraOn}
                isRecording={isRecording}
                candidateName={user?.name || 'Candidate'}
                targetRole={targetRoleName}
                layout={cameraLayout}
                onToggleLayout={() => setCameraLayout('split')}
                compact={true}
              />
            </div>
          )}
        </div>
      )}

      {/* 3. FINAL INTERVIEW REPORT SCREEN */}
      {mode === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
          {isGeneratingReport || !finalReport ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 rounded-2xl border-4 border-indigo-200 border-t-indigo-600 animate-spin flex items-center justify-center" />
              <h3 className="text-base font-bold text-slate-800">
                Gemini AI is analyzing your complete interview performance...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm text-center">
                Calculating overall readiness, communication, technical scores, and personalized topic recommendations.
              </p>
            </div>
          ) : (
            <>
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mock Interview Completed</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Final Interview Performance Report
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Role: <strong>{selectedRole === 'Custom Role' ? customRole : selectedRole}</strong> • Type: {interviewType} • {questions.length} Questions
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-200 px-5 py-3 rounded-2xl shrink-0">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-700">
                      Overall Score
                    </div>
                    <div className="text-3xl font-black text-indigo-900">
                      {finalReport.overallScore}%
                    </div>
                  </div>
                  <Award className="w-8 h-8 text-indigo-600" />
                </div>
              </div>

              {/* 4 Core Score Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Overall Readiness</span>
                  <p className="text-2xl font-black text-slate-900">{finalReport.overallScore}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Technical Mastery</span>
                  <p className="text-2xl font-black text-blue-600">{finalReport.technicalScore}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Communication</span>
                  <p className="text-2xl font-black text-purple-600">{finalReport.communicationScore}%</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Confidence Rating</span>
                  <p className="text-2xl font-black text-emerald-600">{finalReport.confidenceScore}%</p>
                </div>
              </div>

              {/* Performance Summary */}
              {finalReport.summary && (
                <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                  <span className="font-bold text-indigo-900">Executive Summary: </span>
                  {finalReport.summary}
                </div>
              )}

              {/* Strong & Weak Areas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Strong Areas */}
                <div className="p-5 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Strong Areas</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-emerald-800">
                    {finalReport.strongAreas?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                {/* Weak Areas */}
                <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Areas for Improvement</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-amber-800">
                    {finalReport.weakAreas?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions & Recommended Topics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span>Actionable Next Steps</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                    {finalReport.improvementSuggestions?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Recommended Study Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {finalReport.recommendedTopics?.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setMode('setup')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Interview</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <History className="w-4 h-4 text-slate-500" />
                    <span>Interview History</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
