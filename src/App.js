import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, GripVertical, Eye, AlertCircle, Wifi } from 'lucide-react';

export default function DepthRankingApp() {
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztOnk-NdBYlMVy7HdXYCY3O77nbbUCuTHbN5VksOjbMHQ62cROOXb7h5N2u_m7IV6cnw/exec';

  const annotations = {
    "39": ["r", "g", "b"],
    "272": ["y", "b", "g"],
    "315": ["b", "r", "y"],
    "317": ["y", "g", "r"],
    "445": ["r", "y", "b"],
    "473": ["g", "b", "y"],
    "550": ["b", "y", "r"],
    "579": ["r", "g", "y"],
    "645": ["y", "b", "r"],
    "850": ["b", "r", "g"],
    "869": ["g", "y", "b"],
    "908": ["r", "b", "y"],
    "1226": ["y", "g", "r"],
    "1385": ["b", "r", "y"],
    "1449": ["g", "y", "r"]
  };

  const colorNames = {
    "r": "Red",
    "g": "Green",
    "b": "Blue",
    "y": "Yellow"
  };

  // Shuffle function using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate stimulus images with shuffled objects
  const generateStimulusImages = () => {
    return Object.keys(annotations).map(id => {
      const paddedId = id.padStart(4, '0');
      const imageUrl = `${process.env.PUBLIC_URL}/stimulus/${paddedId}.jpg`;
      
      // Create objects with their color codes
      const objects = annotations[id].map((color, index) => ({
        id: index + 1,
        label: colorNames[color],
        color: color
      }));
      
      // Shuffle the objects for random display order
      const shuffledObjects = shuffleArray(objects);
      
      return {
        id: id,
        url: imageUrl,
        objects: shuffledObjects
      };
    });
  };

  const [stimulusImages] = useState(generateStimulusImages());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rankings, setRankings] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  
  const [participantId, setParticipantId] = useState('');
  const [name, setName] = useState('');
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [dominantEye, setDominantEye] = useState('');
  const [eyeToClose, setEyeToClose] = useState('');
  const [showEyeInstruction, setShowEyeInstruction] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  
  const [sessionStartTime] = useState(new Date().toISOString());
  const [showConsentForm, setShowConsentForm] = useState(true);
  const [stimulusStartTime, setStimulusStartTime] = useState(null);
  const [studyComplete, setStudyComplete] = useState(false);
  const [currentTimeSpent, setCurrentTimeSpent] = useState(0);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const currentStimulus = stimulusImages[currentImageIndex];

  // Initialize rankings when component mounts or image changes
  useEffect(() => {
    if (currentStimulus) {
      setRankings(currentStimulus.objects.map((obj, idx) => ({ ...obj, rank: idx + 1 })));
    }
  }, [currentImageIndex]);

  const generateParticipantId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `P${timestamp}${random}`;
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow'
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('error');
    }
  };

  const syncAllToGoogleSheets = async () => {
    setSaveStatus('syncing');
    
    const allData = allResults.map(result => ({
      participantId: participantId,
      name: name || 'N/A',
      enrollmentNumber: enrollmentNumber || 'N/A',
      age: age,
      gender: gender,
      dominantEye: dominantEye,
      eyeToClose: eyeToClose,
      stimulusId: result.stimulusId,
      rankings: result.rankings,
      timeSpent: result.timeSpent,
      timestamp: result.timestamp,
      sessionId: sessionStartTime
    }));
    
    console.log('Syncing all data to Google Sheets:', allData);
    
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          batch: true,
          data: allData
        })
      });
      
      const data = await response.json();
      console.log('Google Sheets sync response:', data);
      
      if (data.status === 'success') {
        setSaveStatus('success');
        console.log('All data synced successfully');
      } else {
        throw new Error(data.message || 'Sync failed');
      }
      
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error);
      setSaveStatus('error');
      alert('Unable to sync data to Google Sheets. Please contact the researcher.');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverIndex(null);
      return;
    }

    const newRankings = [...rankings];
    const draggedElement = newRankings[draggedItem];
    
    newRankings.splice(draggedItem, 1);
    newRankings.splice(dropIndex, 0, draggedElement);
    
    const updatedRankings = newRankings.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    setRankings(updatedRankings);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const reset = () => {
    setRankings(currentStimulus.objects.map((obj, idx) => ({ ...obj, rank: idx + 1 })));
    setSubmitted(false);
  };

  const submit = () => {
    const currentTime = new Date().toISOString();
    const timeSpent = Math.round((new Date(currentTime) - new Date(stimulusStartTime)) / 1000);
    
    // Save as color codes (r, g, b, y) instead of object IDs
    const result = {
      participantId: participantId,
      stimulusId: currentStimulus.id,
      rankings: rankings.map((r, idx) => ({ 
        objectColor: r.color,  // Save color code (r/g/b/y)
        rankPosition: idx + 1 
      })),
      timestamp: currentTime,
      timeSpent: timeSpent
    };
    
    const updatedResults = [...allResults, result];
    setAllResults(updatedResults);
    
    setSubmitted(true);
    setCurrentTimeSpent(0);
    setShowTimeWarning(false);
    
    setTimeout(() => {
      setSaveStatus('');
      
      if (currentImageIndex < stimulusImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
        setSubmitted(false);
        setStimulusStartTime(new Date().toISOString());
      }
    }, 1000);
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setSubmitted(false);
      setSaveStatus('');
      setCurrentTimeSpent(0);
      setShowTimeWarning(false);
      setStimulusStartTime(new Date().toISOString());
    }
  };

  const startStudy = () => {
    if (hasConsented && age && gender && dominantEye) {
      const newParticipantId = generateParticipantId();
      setParticipantId(newParticipantId);
      
      const eyeToCloseValue = dominantEye === 'left' ? 'left' : 'right';
      setEyeToClose(eyeToCloseValue);
      
      setShowConsentForm(false);
      setShowEyeInstruction(true);
      
      setTimeout(() => {
        setShowEyeInstruction(false);
        setStimulusStartTime(new Date().toISOString());
      }, 3000);
    }
  };

  const restartStudy = () => {
    setCurrentImageIndex(0);
    setRankings([]);
    setSubmitted(false);
    setAllResults([]);
    setName('');
    setEnrollmentNumber('');
    setAge('');
    setGender('');
    setDominantEye('');
    setEyeToClose('');
    setHasConsented(false);
    setShowConsentForm(true);
    setShowEyeInstruction(false);
    setStudyComplete(false);
    setSaveStatus('');
    setConnectionStatus('');
    setCurrentTimeSpent(0);
    setShowTimeWarning(false);
    setStimulusStartTime(null);
  };

  useEffect(() => {
    if (!stimulusStartTime || submitted || showConsentForm || showEyeInstruction || studyComplete) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date() - new Date(stimulusStartTime)) / 1000);
      setCurrentTimeSpent(elapsed);
      
      if (elapsed === 15) {
        setShowTimeWarning(true);
      }
      if (elapsed === 18) {
        setShowTimeWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stimulusStartTime, submitted, showConsentForm, showEyeInstruction, studyComplete]);

  useEffect(() => {
    if (allResults.length === stimulusImages.length && allResults.length > 0 && !studyComplete) {
      setStudyComplete(true);
      syncAllToGoogleSheets();
    }
  }, [allResults.length, stimulusImages.length, studyComplete]);

  const canStart = hasConsented && age && gender && dominantEye;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {showConsentForm ? (
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
              Depth Perception Study
            </h1>
            
            <div className="mb-6">
              <button
                onClick={testConnection}
                disabled={connectionStatus === 'testing'}
                className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Wifi className="w-5 h-5" />
                {connectionStatus === 'testing' && 'Testing connection...'}
                {connectionStatus === 'success' && '✓ Connected to Google Sheets'}
                {connectionStatus === 'error' && '✗ Connection failed - check console'}
                {!connectionStatus && 'Test Connection to Google Sheets'}
              </button>
              {connectionStatus === 'success' && (
                <p className="text-xs text-green-600 mt-2 text-center">
                  Your responses will be saved to Google Sheets
                </p>
              )}
              {connectionStatus === 'error' && (
                <p className="text-xs text-red-600 mt-2 text-center">
                  Connection failed. Check browser console for details.
                </p>
              )}
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Study Instructions
              </h2>
              <ul className="space-y-2 text-slate-700">
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span>You will be shown {stimulusImages.length} images with marked objects.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span>For each image, rank the objects by their depth from <strong>nearest to farthest</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span><strong>Important:</strong> You will close your dominant eye for monocular depth estimation.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span>Use drag-and-drop to arrange objects in order.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span>You will have approximately 10-15 seconds per image. Try to be as accurate as possible.</span>
                </li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Participant Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name (optional)"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Enrollment Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value)}
                    placeholder="Enter your enrollment number (optional)"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    min="18"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Dominant Eye <span className="text-red-500">*</span>
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-blue-800 mb-2">
                      <strong>How to find your dominant eye:</strong>
                    </p>
                    <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                      <li>Extend your arms and form a triangle with your hands</li>
                      <li>Focus on a distant object through the triangle</li>
                      <li>Close your left eye - if the object stays in view, your right eye is dominant</li>
                      <li>If the object moves out of view, your left eye is dominant</li>
                    </ol>
                  </div>
                  <select
                    value={dominantEye}
                    onChange={(e) => setDominantEye(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select your dominant eye</option>
                    <option value="left">Left Eye</option>
                    <option value="right">Right Eye</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasConsented}
                  onChange={(e) => setHasConsented(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">
                  I confirm that I have <strong>normal or corrected vision</strong>, <strong>no color blindness</strong>, 
                  and consent to participate in this study. I understand that my responses will be recorded anonymously 
                  for research purposes.
                </span>
              </label>
            </div>

            <button
              onClick={startStudy}
              disabled={!canStart}
              className={`w-full py-4 rounded-lg font-semibold transition-colors ${
                canStart
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {!canStart ? 'Please complete all required fields and consent' : 'Begin Study'}
            </button>
          </div>
        </div>
      ) : showEyeInstruction ? (
        <div className="max-w-2xl mx-auto mt-32">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-16 text-center animate-pulse">
            <div className="mb-8">
              <div className="text-9xl mb-6">👁️</div>
            </div>
            <h2 className="text-5xl font-bold text-white mb-6">
              PLEASE CLOSE YOUR
            </h2>
            <div className="bg-white rounded-2xl py-8 px-12 mb-6">
              <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase">
                {eyeToClose} EYE
              </p>
            </div>
            <p className="text-2xl text-white font-medium">
              Keep it closed throughout the study
            </p>
          </div>
        </div>
      ) : studyComplete ? (
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Study Complete!
            </h2>
            <p className="text-lg text-slate-600 mb-6">
              Thank you for participating in this depth perception study.
            </p>
            
            {saveStatus === 'syncing' && (
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6 animate-pulse">
                <p className="text-blue-800 font-medium">
                  ☁️ Syncing your data to Google Sheets...
                </p>
              </div>
            )}
            {saveStatus === 'success' && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">
                  ✓ All data successfully saved to Google Sheets!
                </p>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
                <p className="text-amber-800 font-medium">
                  ⚠️ Could not sync to Google Sheets. Please contact the researcher.
                </p>
              </div>
            )}
            
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-slate-600">
                <strong>Participant ID:</strong> {participantId}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Completed Stimuli:</strong> {allResults.length} / {stimulusImages.length}
              </p>
            </div>
            <button
              onClick={restartStudy}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Start New Participant
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Depth Perception Study
            </h1>
            <p className="text-slate-600 mb-4">
              Drag objects to rank them from <span className="font-semibold text-blue-600">closest (top)</span> to <span className="font-semibold text-purple-600">farthest (bottom)</span>
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm text-slate-600">Stimulus </span>
                <span className="font-bold text-slate-800">{currentImageIndex + 1}</span>
                <span className="text-sm text-slate-600"> of {stimulusImages.length}</span>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm text-slate-600">Completed: </span>
                <span className="font-bold text-green-600">{allResults.length}</span>
              </div>
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 rounded-xl shadow-lg border-2 border-amber-600">
                <span className="text-lg text-white font-bold drop-shadow-md">
                  👁️ CLOSE YOUR {eyeToClose.toUpperCase()} EYE
                </span>
              </div>
              
              {saveStatus === 'success' && (
                <div className="bg-green-100 px-4 py-2 rounded-lg shadow-sm border border-green-300">
                  <span className="text-sm text-green-800 font-medium">✓ Saved!</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Stimulus</h2>
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-lg font-mono text-sm font-semibold ${
                    currentTimeSpent >= 15 ? 'bg-red-100 text-red-700 animate-pulse' : 
                    currentTimeSpent >= 10 ? 'bg-amber-100 text-amber-700' : 
                    'bg-blue-100 text-blue-700'
                  }`}>
                    ⏱️ {currentTimeSpent}s
                  </div>
                  <button
                    onClick={prevImage}
                    disabled={currentImageIndex === 0}
                    className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                    title="Previous stimulus"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {showTimeWarning && (
                <div className="mb-4 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg shadow-lg border-2 border-red-600 animate-pulse">
                  <div className="flex items-center gap-3 text-white">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-lg">⚠️ 15 Seconds Elapsed</p>
                      <p className="text-sm text-red-50">Please submit your ranking soon</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <img
                  src={currentStimulus.url}
                  alt={`Stimulus ${currentStimulus.id}`}
                  className="w-full h-auto rounded-lg shadow-md"
                  style={{ maxHeight: '95vh', objectFit: 'contain' }}
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Image {currentImageIndex + 1}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Rankings</h2>
                <button
                  onClick={reset}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  💡 <span className="font-medium">Drag and drop</span> to reorder objects
                </p>
              </div>

              <div className="mb-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white text-center font-bold shadow-md">
                ↑ NEAREST (Closest to you)
              </div>

              <div className="space-y-2 mb-2">
                {rankings.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-move transition-all ${
                      draggedItem === index
                        ? 'opacity-50 border-blue-400 bg-blue-50'
                        : dragOverIndex === index
                        ? 'border-blue-400 bg-blue-50 scale-105'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />

                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg shadow-sm flex items-center justify-center font-bold border-2 ${
                      item.color === 'r' ? 'bg-red-500 border-red-600' :
                      item.color === 'g' ? 'bg-green-500 border-green-600' :
                      item.color === 'b' ? 'bg-blue-500 border-blue-600' :
                      item.color === 'y' ? 'bg-yellow-400 border-yellow-500' :
                      'bg-slate-100 border-slate-200'
                    }`}>
                      <span className="text-transparent">.</span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-500">
                        {index === 0 ? 'Closest' : index === rankings.length - 1 ? 'Farthest' : `Position ${index + 1}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white text-center font-bold shadow-md">
                ↓ FARTHEST (Farthest from you)
              </div>

              <button
                onClick={submit}
                disabled={submitted}
                className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  !submitted
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-slate-300 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-5 h-5" />
                {submitted ? 'Moving to next...' : currentImageIndex === stimulusImages.length - 1 ? 'Submit Final Rankings' : 'Submit & Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}