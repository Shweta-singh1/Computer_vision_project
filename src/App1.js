// import React, { useState, useEffect } from 'react';
// import { Check, ChevronLeft, ChevronRight, RotateCcw, GripVertical, Eye } from 'lucide-react';

// import demo1 from './assets/demo1.png';
// import demo2 from './assets/demo2.png';
// import demo3 from './assets/demo3.png';

// export default function DepthRankingApp() {
//   const stimulusImages = [
//     { 
//       id: 1, 
//       url: demo1, 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//     { 
//       id: 2, 
//       url: demo2, 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//     { 
//       id: 3, 
//       url: demo3, 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//   ];

//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [rankings, setRankings] = useState(
//     stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id }))
//   );
//   const [submitted, setSubmitted] = useState(false);
//   const [allResults, setAllResults] = useState([]);
//   const [draggedItem, setDraggedItem] = useState(null);
//   const [dragOverIndex, setDragOverIndex] = useState(null);
  
//   // Participant information
//   const [participantId, setParticipantId] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState('');
//   const [dominantEye, setDominantEye] = useState('');
//   const [hasConsented, setHasConsented] = useState(false);
  
//   const [sessionStartTime] = useState(new Date().toISOString());
//   const [showConsentForm, setShowConsentForm] = useState(true);
//   const [stimulusStartTime, setStimulusStartTime] = useState(new Date().toISOString());
//   const [studyComplete, setStudyComplete] = useState(false);

//   const currentStimulus = stimulusImages[currentImageIndex];

//   // Generate unique participant ID
//   const generateParticipantId = () => {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 1000);
//     return `P${timestamp}${random}`;
//   };

//   // Save results to backend/storage whenever allResults changes
//   useEffect(() => {
//     if (allResults.length > 0 && !studyComplete) {
//       saveToBackend(allResults);
//     }
//   }, [allResults]);

//   // Check if study is complete
//   useEffect(() => {
//     if (allResults.length === stimulusImages.length && allResults.length > 0) {
//       setStudyComplete(true);
//       // Final save with complete flag
//       saveToBackend(allResults, true);
//     }
//   }, [allResults]);

//   const saveToBackend = async (results, isComplete = false) => {
//     try {
//       await fetch('http://localhost:3001/api/save-results', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           participantId: participantId,
//           sessionId: sessionStartTime,
//           participantInfo: {
//             age,
//             gender,
//             dominantEye
//           },
//           results: results,
//           isComplete: isComplete,
//           completedAt: new Date().toISOString()
//         }),
//       });
      
//       console.log('Results saved successfully');
//     } catch (error) {
//       console.log('Saving to localStorage as fallback');
//       const existingData = JSON.parse(localStorage.getItem('depthStudyResults') || '[]');
//       const updatedData = [...existingData, {
//         participantId: participantId,
//         sessionId: sessionStartTime,
//         participantInfo: { age, gender, dominantEye },
//         results: results,
//         isComplete: isComplete,
//         savedAt: new Date().toISOString()
//       }];
//       localStorage.setItem('depthStudyResults', JSON.stringify(updatedData));
//     }
//   };

//   const handleDragStart = (e, index) => {
//     setDraggedItem(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     setDragOverIndex(index);
//   };

//   const handleDragLeave = () => {
//     setDragOverIndex(null);
//   };

//   const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
    
//     if (draggedItem === null || draggedItem === dropIndex) {
//       setDraggedItem(null);
//       setDragOverIndex(null);
//       return;
//     }

//     const newRankings = [...rankings];
//     const draggedElement = newRankings[draggedItem];
    
//     newRankings.splice(draggedItem, 1);
//     newRankings.splice(dropIndex, 0, draggedElement);
    
//     const updatedRankings = newRankings.map((item, index) => ({
//       ...item,
//       rank: index + 1
//     }));

//     setRankings(updatedRankings);
//     setDraggedItem(null);
//     setDragOverIndex(null);
//   };

//   const handleDragEnd = () => {
//     setDraggedItem(null);
//     setDragOverIndex(null);
//   };

//   const reset = () => {
//     setRankings(currentStimulus.objects.map(obj => ({ ...obj, rank: obj.id })));
//     setSubmitted(false);
//   };

//   const submit = () => {
//     const currentTime = new Date().toISOString();
//     const timeSpent = Math.round((new Date(currentTime) - new Date(stimulusStartTime)) / 1000);
    
//     const result = {
//       participantId: participantId,
//       stimulusId: currentStimulus.id,
//       rankings: rankings.map((r, idx) => ({ 
//         objectId: r.id, 
//         objectLabel: r.label, 
//         rankPosition: idx + 1 
//       })),
//       timestamp: currentTime,
//       timeSpent: timeSpent
//     };
    
//     setAllResults(prev => [...prev, result]);
//     setSubmitted(true);
//   };

//   const nextImage = () => {
//     if (currentImageIndex < stimulusImages.length - 1) {
//       setCurrentImageIndex(prev => prev + 1);
//       setRankings(stimulusImages[currentImageIndex + 1].objects.map(obj => ({ ...obj, rank: obj.id })));
//       setSubmitted(false);
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const prevImage = () => {
//     if (currentImageIndex > 0) {
//       setCurrentImageIndex(prev => prev - 1);
//       setRankings(stimulusImages[currentImageIndex - 1].objects.map(obj => ({ ...obj, rank: obj.id })));
//       setSubmitted(false);
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const startStudy = () => {
//     if (hasConsented && age && gender && dominantEye) {
//       const newParticipantId = generateParticipantId();
//       setParticipantId(newParticipantId);
//       setShowConsentForm(false);
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const restartStudy = () => {
//     // Reset all state for new participant
//     setCurrentImageIndex(0);
//     setRankings(stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id })));
//     setSubmitted(false);
//     setAllResults([]);
//     setAge('');
//     setGender('');
//     setDominantEye('');
//     setHasConsented(false);
//     setShowConsentForm(true);
//     setStudyComplete(false);
//     setStimulusStartTime(new Date().toISOString());
//   };

//   const canStart = hasConsented && age && gender && dominantEye;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
//       {showConsentForm ? (
//         <div className="max-w-3xl mx-auto mt-12">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
//               Depth Perception Study
//             </h1>
            
//             {/* Instructions */}
//             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
//                 <Eye className="w-5 h-5" />
//                 Study Instructions
//               </h2>
//               <ul className="space-y-2 text-slate-700">
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>You will be shown {stimulusImages.length} images with marked objects.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>For each image, rank the objects by their depth from <strong>nearest to farthest</strong>.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span><strong>Important:</strong> Close one eye during the experiment for monocular depth estimation.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>Use drag-and-drop to arrange objects in order.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>Take your time and be as accurate as possible.</span>
//                 </li>
//               </ul>
//             </div>

//             {/* Participant Information */}
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold text-slate-800 mb-4">Participant Information</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Age
//                   </label>
//                   <input
//                     type="number"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                     placeholder="Enter your age"
//                     min="18"
//                     max="100"
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Gender
//                   </label>
//                   <select
//                     value={gender}
//                     onChange={(e) => setGender(e.target.value)}
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   >
//                     <option value="">Select gender</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                     <option value="prefer-not-to-say">Prefer not to say</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Dominant Eye
//                   </label>
//                   <select
//                     value={dominantEye}
//                     onChange={(e) => setDominantEye(e.target.value)}
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   >
//                     <option value="">Select dominant eye</option>
//                     <option value="left">Left</option>
//                     <option value="right">Right</option>
//                     <option value="unsure">Not sure</option>
//                   </select>
//                   <p className="text-xs text-slate-500 mt-1">
//                     Tip: To find your dominant eye, form a triangle with your hands and look at a distant object through it. Close one eye at a time - your dominant eye keeps the object centered.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Consent */}
//             <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
//               <label className="flex items-start gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={hasConsented}
//                   onChange={(e) => setHasConsented(e.target.checked)}
//                   className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
//                 />
//                 <span className="text-sm text-slate-700">
//                   I confirm that I have <strong>normal or corrected vision</strong>, <strong>no color blindness</strong>, 
//                   and consent to participate in this study. I understand that my responses will be recorded anonymously 
//                   for research purposes.
//                 </span>
//               </label>
//             </div>

//             <button
//               onClick={startStudy}
//               disabled={!canStart}
//               className={`w-full py-4 rounded-lg font-semibold transition-colors ${
//                 canStart
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-slate-300 text-slate-500 cursor-not-allowed'
//               }`}
//             >
//               {!canStart ? 'Please complete all fields and consent' : 'Begin Study'}
//             </button>
//           </div>
//         </div>
//       ) : studyComplete ? (
//         <div className="max-w-2xl mx-auto mt-20">
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Check className="w-10 h-10 text-green-600" />
//             </div>
//             <h2 className="text-3xl font-bold text-slate-800 mb-4">
//               Study Complete!
//             </h2>
//             <p className="text-lg text-slate-600 mb-6">
//               Thank you for participating in this depth perception study. Your responses have been recorded.
//             </p>
//             <div className="bg-slate-50 rounded-lg p-4 mb-6">
//               <p className="text-sm text-slate-600">
//                 <strong>Participant ID:</strong> {participantId}
//               </p>
//               <p className="text-sm text-slate-600">
//                 <strong>Completed Stimuli:</strong> {allResults.length} / {stimulusImages.length}
//               </p>
//             </div>
//             <button
//               onClick={restartStudy}
//               className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
//             >
//               Start New Participant
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-slate-800 mb-2">
//               Depth Perception Study
//             </h1>
//             <p className="text-slate-600 mb-4">
//               Drag objects to rank them from <span className="font-semibold text-blue-600">closest (top)</span> to <span className="font-semibold text-purple-600">farthest (bottom)</span>
//             </p>
//             <div className="flex items-center justify-center gap-4">
//               <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
//                 <span className="text-sm text-slate-600">Stimulus </span>
//                 <span className="font-bold text-slate-800">{currentImageIndex + 1}</span>
//                 <span className="text-sm text-slate-600"> of {stimulusImages.length}</span>
//               </div>
//               <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
//                 <span className="text-sm text-slate-600">Completed: </span>
//                 <span className="font-bold text-green-600">{allResults.length}</span>
//               </div>
//               <div className="bg-amber-100 px-4 py-2 rounded-lg shadow-sm border border-amber-300">
//                 <span className="text-sm text-amber-800 font-medium">👁️ Remember: Keep one eye closed</span>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Image Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-slate-800">Stimulus</h2>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={prevImage}
//                     disabled={currentImageIndex === 0}
//                     className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
//                     title="Previous stimulus"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={nextImage}
//                     disabled={currentImageIndex === stimulusImages.length - 1}
//                     className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
//                     title="Next stimulus"
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//               <div className="relative">
//                 <img
//                   src={currentStimulus.url}
//                   alt={`Stimulus ${currentStimulus.id}`}
//                   className="w-full rounded-lg shadow-md"
//                 />
//                 <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium">
//                   Image {currentImageIndex + 1}
//                 </div>
//               </div>
//             </div>

//             {/* Ranking Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-slate-800">Rankings</h2>
//                 <button
//                   onClick={reset}
//                   className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
//                 >
//                   <RotateCcw className="w-4 h-4" />
//                   Reset
//                 </button>
//               </div>

//               <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <p className="text-sm text-blue-800 text-center">
//                   💡 <span className="font-medium">Drag and drop</span> to reorder objects
//                 </p>
//               </div>

//               <div className="space-y-2 mb-6">
//                 {rankings.map((item, index) => (
//                   <div
//                     key={item.id}
//                     draggable
//                     onDragStart={(e) => handleDragStart(e, index)}
//                     onDragOver={(e) => handleDragOver(e, index)}
//                     onDragLeave={handleDragLeave}
//                     onDrop={(e) => handleDrop(e, index)}
//                     onDragEnd={handleDragEnd}
//                     className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-move transition-all ${
//                       draggedItem === index
//                         ? 'opacity-50 border-blue-400 bg-blue-50'
//                         : dragOverIndex === index
//                         ? 'border-blue-400 bg-blue-50 scale-105'
//                         : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
//                     }`}
//                   >
//                     <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    
//                     <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-sm flex items-center justify-center font-bold text-white">
//                       {index + 1}
//                     </div>
                    
//                     <div className="flex-grow">
//                       <p className="font-medium text-slate-700">{item.label}</p>
//                       <p className="text-xs text-slate-500">
//                         {index === 0 ? 'Closest' : index === rankings.length - 1 ? 'Farthest' : `Position ${index + 1}`}
//                       </p>
//                     </div>

//                     <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-700 border-2 border-slate-200">
//                       {item.id}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={submit}
//                 disabled={submitted}
//                 className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
//                   !submitted
//                     ? 'bg-green-600 hover:bg-green-700 text-white'
//                     : 'bg-slate-200 text-slate-400 cursor-not-allowed'
//                 }`}
//               >
//                 <Check className="w-5 h-5" />
//                 {submitted ? 'Submitted!' : 'Submit Rankings'}
//               </button>

//               {submitted && (
//                 <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                   <p className="text-green-800 font-medium text-center mb-2">
//                     ✓ Rankings saved successfully!
//                   </p>
//                   {currentImageIndex < stimulusImages.length - 1 && (
//                     <button
//                       onClick={nextImage}
//                       className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//                     >
//                       Next Stimulus →
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import React, { useState, useEffect } from 'react';
// import { Check, ChevronLeft, ChevronRight, RotateCcw, GripVertical, Eye, AlertCircle, Wifi } from 'lucide-react';

// export default function DepthRankingApp() {
//   // Your Google Apps Script Web App URL
//   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6g3hhpLaDd0Lli6zRKcxWWUGwrjcoLKZ0T3Pd4J9wQ35TS9UrgfSklOZaTcCZk8w1Mw/exec';

//   // Demo images - replace these with your actual image imports
//   const stimulusImages = [
//     { 
//       id: 1, 
//       url: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=800&h=600&fit=crop', 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//     { 
//       id: 2, 
//       url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop', 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//     { 
//       id: 3, 
//       url: 'https://images.unsplash.com/photo-1415604934674-561df9abf539?w=800&h=600&fit=crop', 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//   ];

//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [rankings, setRankings] = useState(
//     stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id }))
//   );
//   const [submitted, setSubmitted] = useState(false);
//   const [allResults, setAllResults] = useState([]);
//   const [draggedItem, setDraggedItem] = useState(null);
//   const [dragOverIndex, setDragOverIndex] = useState(null);
//   const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'success', 'error'
//   const [connectionTested, setConnectionTested] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState(''); // 'testing', 'success', 'error'
  
//   // Participant information
//   const [participantId, setParticipantId] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState('');
//   const [dominantEye, setDominantEye] = useState('');
//   const [hasConsented, setHasConsented] = useState(false);
  
//   const [sessionStartTime] = useState(new Date().toISOString());
//   const [showConsentForm, setShowConsentForm] = useState(true);
//   const [stimulusStartTime, setStimulusStartTime] = useState(new Date().toISOString());
//   const [studyComplete, setStudyComplete] = useState(false);

//   const currentStimulus = stimulusImages[currentImageIndex];

//   // Generate unique participant ID
//   const generateParticipantId = () => {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 1000);
//     return `P${timestamp}${random}`;
//   };

//   // Test connection to Google Sheets
//   const testConnection = async () => {
//     setConnectionStatus('testing');
//     try {
//       const response = await fetch(GOOGLE_SCRIPT_URL, {
//         method: 'GET',
//         redirect: 'follow'
//       });
      
//       const data = await response.json();
//       console.log('Connection test response:', data);
      
//       if (data.status === 'success') {
//         setConnectionStatus('success');
//         setConnectionTested(true);
//       } else {
//         setConnectionStatus('error');
//       }
//     } catch (error) {
//       console.error('Connection test failed:', error);
//       setConnectionStatus('error');
//     }
//   };

//   // Save to Google Sheets with better error handling
//   const saveToGoogleSheets = async (result) => {
//     setSaveStatus('saving');
    
//     const payload = {
//       participantId: result.participantId,
//       age: age,
//       gender: gender,
//       dominantEye: dominantEye,
//       stimulusId: result.stimulusId,
//       rankings: result.rankings,
//       timeSpent: result.timeSpent,
//       timestamp: result.timestamp,
//       sessionId: sessionStartTime
//     };
    
//     console.log('Sending to Google Sheets:', payload);
    
//     try {
//       const response = await fetch(GOOGLE_SCRIPT_URL, {
//         method: 'POST',
//         redirect: 'follow',
//         headers: {
//           'Content-Type': 'text/plain',
//         },
//         body: JSON.stringify(payload)
//       });
      
//       const data = await response.json();
//       console.log('Google Sheets response:', data);
      
//       if (data.status === 'success') {
//         setSaveStatus('success');
//         console.log('Data saved successfully:', data.message);
//       } else {
//         throw new Error(data.message || 'Unknown error');
//       }
      
//       // Clear success message after 3 seconds
//       setTimeout(() => setSaveStatus(''), 3000);
      
//     } catch (error) {
//       console.error('Error saving to Google Sheets:', error);
//       setSaveStatus('error');
      
//       // Fallback: Save to browser storage
//       try {
//         const existingData = JSON.parse(localStorage.getItem('depthStudyBackup') || '[]');
//         existingData.push({
//           ...result,
//           age,
//           gender,
//           dominantEye,
//           sessionId: sessionStartTime,
//           savedAt: new Date().toISOString()
//         });
//         localStorage.setItem('depthStudyBackup', JSON.stringify(existingData));
//         console.log('Data saved to local backup');
//       } catch (localError) {
//         console.error('Failed to save backup:', localError);
//       }
//     }
//   };

//   const handleDragStart = (e, index) => {
//     setDraggedItem(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     setDragOverIndex(index);
//   };

//   const handleDragLeave = () => {
//     setDragOverIndex(null);
//   };

//   const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
    
//     if (draggedItem === null || draggedItem === dropIndex) {
//       setDraggedItem(null);
//       setDragOverIndex(null);
//       return;
//     }

//     const newRankings = [...rankings];
//     const draggedElement = newRankings[draggedItem];
    
//     newRankings.splice(draggedItem, 1);
//     newRankings.splice(dropIndex, 0, draggedElement);
    
//     const updatedRankings = newRankings.map((item, index) => ({
//       ...item,
//       rank: index + 1
//     }));

//     setRankings(updatedRankings);
//     setDraggedItem(null);
//     setDragOverIndex(null);
//   };

//   const handleDragEnd = () => {
//     setDraggedItem(null);
//     setDragOverIndex(null);
//   };

//   const reset = () => {
//     setRankings(currentStimulus.objects.map(obj => ({ ...obj, rank: obj.id })));
//     setSubmitted(false);
//   };

//   const submit = async () => {
//     const currentTime = new Date().toISOString();
//     const timeSpent = Math.round((new Date(currentTime) - new Date(stimulusStartTime)) / 1000);
    
//     const result = {
//       participantId: participantId,
//       stimulusId: currentStimulus.id,
//       rankings: rankings.map((r, idx) => ({ 
//         objectId: r.id, 
//         objectLabel: r.label, 
//         rankPosition: idx + 1 
//       })),
//       timestamp: currentTime,
//       timeSpent: timeSpent
//     };
    
//     // Save to Google Sheets
//     await saveToGoogleSheets(result);
    
//     // Store locally for tracking
//     setAllResults(prev => [...prev, result]);
//     setSubmitted(true);
//   };

//   const nextImage = () => {
//     if (currentImageIndex < stimulusImages.length - 1) {
//       setCurrentImageIndex(prev => prev + 1);
//       setRankings(stimulusImages[currentImageIndex + 1].objects.map(obj => ({ ...obj, rank: obj.id })));
//       setSubmitted(false);
//       setSaveStatus('');
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const prevImage = () => {
//     if (currentImageIndex > 0) {
//       setCurrentImageIndex(prev => prev - 1);
//       setRankings(stimulusImages[currentImageIndex - 1].objects.map(obj => ({ ...obj, rank: obj.id })));
//       setSubmitted(false);
//       setSaveStatus('');
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const startStudy = () => {
//     if (hasConsented && age && gender && dominantEye) {
//       const newParticipantId = generateParticipantId();
//       setParticipantId(newParticipantId);
//       setShowConsentForm(false);
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const restartStudy = () => {
//     // Reset all state for new participant
//     setCurrentImageIndex(0);
//     setRankings(stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id })));
//     setSubmitted(false);
//     setAllResults([]);
//     setAge('');
//     setGender('');
//     setDominantEye('');
//     setHasConsented(false);
//     setShowConsentForm(true);
//     setStudyComplete(false);
//     setSaveStatus('');
//     setConnectionTested(false);
//     setConnectionStatus('');
//     setStimulusStartTime(new Date().toISOString());
//   };

//   // Check if study is complete
//   useEffect(() => {
//     if (allResults.length === stimulusImages.length && allResults.length > 0) {
//       setStudyComplete(true);
//     }
//   }, [allResults.length, stimulusImages.length]);

//   const canStart = hasConsented && age && gender && dominantEye;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
//       {showConsentForm ? (
//         <div className="max-w-3xl mx-auto mt-12">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
//               Depth Perception Study
//             </h1>
            
//             {/* Connection Test */}
//             <div className="mb-6">
//               <button
//                 onClick={testConnection}
//                 disabled={connectionStatus === 'testing'}
//                 className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-2"
//               >
//                 <Wifi className="w-5 h-5" />
//                 {connectionStatus === 'testing' && 'Testing connection...'}
//                 {connectionStatus === 'success' && '✓ Connected to Google Sheets'}
//                 {connectionStatus === 'error' && '✗ Connection failed - check console'}
//                 {!connectionStatus && 'Test Connection to Google Sheets'}
//               </button>
//               {connectionStatus === 'success' && (
//                 <p className="text-xs text-green-600 mt-2 text-center">
//                   Your responses will be saved to Google Sheets
//                 </p>
//               )}
//               {connectionStatus === 'error' && (
//                 <p className="text-xs text-red-600 mt-2 text-center">
//                   Connection failed. Data will be saved locally as backup. Check browser console for details.
//                 </p>
//               )}
//             </div>

//             {/* Instructions */}
//             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
//                 <Eye className="w-5 h-5" />
//                 Study Instructions
//               </h2>
//               <ul className="space-y-2 text-slate-700">
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>You will be shown {stimulusImages.length} images with marked objects.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>For each image, rank the objects by their depth from <strong>nearest to farthest</strong>.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span><strong>Important:</strong> Close one eye during the experiment for monocular depth estimation.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>Use drag-and-drop to arrange objects in order.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>Take your time and be as accurate as possible.</span>
//                 </li>
//               </ul>
//             </div>

//             {/* Participant Information */}
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold text-slate-800 mb-4">Participant Information</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Age
//                   </label>
//                   <input
//                     type="number"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                     placeholder="Enter your age"
//                     min="18"
//                     max="100"
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Gender
//                   </label>
//                   <select
//                     value={gender}
//                     onChange={(e) => setGender(e.target.value)}
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   >
//                     <option value="">Select gender</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                     <option value="prefer-not-to-say">Prefer not to say</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Dominant Eye
//                   </label>
//                   <select
//                     value={dominantEye}
//                     onChange={(e) => setDominantEye(e.target.value)}
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   >
//                     <option value="">Select dominant eye</option>
//                     <option value="left">Left</option>
//                     <option value="right">Right</option>
//                     <option value="unsure">Not sure</option>
//                   </select>
//                   <p className="text-xs text-slate-500 mt-1">
//                     Tip: To find your dominant eye, form a triangle with your hands and look at a distant object through it. Close one eye at a time - your dominant eye keeps the object centered.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Consent */}
//             <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
//               <label className="flex items-start gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={hasConsented}
//                   onChange={(e) => setHasConsented(e.target.checked)}
//                   className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
//                 />
//                 <span className="text-sm text-slate-700">
//                   I confirm that I have <strong>normal or corrected vision</strong>, <strong>no color blindness</strong>, 
//                   and consent to participate in this study. I understand that my responses will be recorded anonymously 
//                   for research purposes.
//                 </span>
//               </label>
//             </div>

//             <button
//               onClick={startStudy}
//               disabled={!canStart}
//               className={`w-full py-4 rounded-lg font-semibold transition-colors ${
//                 canStart
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-slate-300 text-slate-500 cursor-not-allowed'
//               }`}
//             >
//               {!canStart ? 'Please complete all fields and consent' : 'Begin Study'}
//             </button>
//           </div>
//         </div>
//       ) : studyComplete ? (
//         <div className="max-w-2xl mx-auto mt-20">
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Check className="w-10 h-10 text-green-600" />
//             </div>
//             <h2 className="text-3xl font-bold text-slate-800 mb-4">
//               Study Complete!
//             </h2>
//             <p className="text-lg text-slate-600 mb-6">
//               Thank you for participating in this depth perception study. Your responses have been saved to Google Sheets.
//             </p>
//             <div className="bg-slate-50 rounded-lg p-4 mb-6">
//               <p className="text-sm text-slate-600">
//                 <strong>Participant ID:</strong> {participantId}
//               </p>
//               <p className="text-sm text-slate-600">
//                 <strong>Completed Stimuli:</strong> {allResults.length} / {stimulusImages.length}
//               </p>
//             </div>
//             <button
//               onClick={restartStudy}
//               className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
//             >
//               Start New Participant
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-slate-800 mb-2">
//               Depth Perception Study
//             </h1>
//             <p className="text-slate-600 mb-4">
//               Drag objects to rank them from <span className="font-semibold text-blue-600">closest (top)</span> to <span className="font-semibold text-purple-600">farthest (bottom)</span>
//             </p>
//             <div className="flex items-center justify-center gap-4 flex-wrap">
//               <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
//                 <span className="text-sm text-slate-600">Stimulus </span>
//                 <span className="font-bold text-slate-800">{currentImageIndex + 1}</span>
//                 <span className="text-sm text-slate-600"> of {stimulusImages.length}</span>
//               </div>
//               <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
//                 <span className="text-sm text-slate-600">Completed: </span>
//                 <span className="font-bold text-green-600">{allResults.length}</span>
//               </div>
//               <div className="bg-amber-100 px-4 py-2 rounded-lg shadow-sm border border-amber-300">
//                 <span className="text-sm text-amber-800 font-medium">👁️ Remember: Keep one eye closed</span>
//               </div>
              
//               {/* Save Status Indicator */}
//               {saveStatus === 'saving' && (
//                 <div className="bg-blue-100 px-4 py-2 rounded-lg shadow-sm border border-blue-300">
//                   <span className="text-sm text-blue-800 font-medium">💾 Saving...</span>
//                 </div>
//               )}
//               {saveStatus === 'success' && (
//                 <div className="bg-green-100 px-4 py-2 rounded-lg shadow-sm border border-green-300">
//                   <span className="text-sm text-green-800 font-medium">✓ Saved to Google Sheets</span>
//                 </div>
//               )}
//               {saveStatus === 'error' && (
//                 <div className="bg-red-100 px-4 py-2 rounded-lg shadow-sm border border-red-300">
//                   <span className="text-sm text-red-800 font-medium">⚠ Saved locally (backup)</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Image Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-slate-800">Stimulus</h2>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={prevImage}
//                     disabled={currentImageIndex === 0}
//                     className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
//                     title="Previous stimulus"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={nextImage}
//                     disabled={currentImageIndex === stimulusImages.length - 1}
//                     className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
//                     title="Next stimulus"
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//               <div className="relative">
//                 <img
//                   src={currentStimulus.url}
//                   alt={`Stimulus ${currentStimulus.id}`}
//                   className="w-full rounded-lg shadow-md"
//                 />
//                 <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium">
//                   Image {currentImageIndex + 1}
//                 </div>
//               </div>
              
//               {/* Note about demo images */}
//               <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-xs text-yellow-800 flex items-start gap-2">
//                   <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
//                   <span><strong>Note:</strong> Replace the demo images in the code with your actual study images before deployment.</span>
//                 </p>
//               </div>
//             </div>

//             {/* Ranking Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-slate-800">Rankings</h2>
//                 <button
//                   onClick={reset}
//                   className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
//                 >
//                   <RotateCcw className="w-4 h-4" />
//                   Reset
//                 </button>
//               </div>

//               <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <p className="text-sm text-blue-800 text-center">
//                   💡 <span className="font-medium">Drag and drop</span> to reorder objects
//                 </p>
//               </div>

//               <div className="space-y-2 mb-6">
//                 {rankings.map((item, index) => (
//                   <div
//                     key={item.id}
//                     draggable
//                     onDragStart={(e) => handleDragStart(e, index)}
//                     onDragOver={(e) => handleDragOver(e, index)}
//                     onDragLeave={handleDragLeave}
//                     onDrop={(e) => handleDrop(e, index)}
//                     onDragEnd={handleDragEnd}
//                     className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-move transition-all ${
//                       draggedItem === index
//                         ? 'opacity-50 border-blue-400 bg-blue-50'
//                         : dragOverIndex === index
//                         ? 'border-blue-400 bg-blue-50 scale-105'
//                         : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
//                     }`}
//                   >
//                     <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    
//                     <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-sm flex items-center justify-center font-bold text-white">
//                       {index + 1}
//                     </div>
                    
//                     <div className="flex-grow">
//                       <p className="font-medium text-slate-700">{item.label}</p>
//                       <p className="text-xs text-slate-500">
//                         {index === 0 ? 'Closest' : index === rankings.length - 1 ? 'Farthest' : `Position ${index + 1}`}
//                       </p>
//                     </div>

//                     <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-700 border-2 border-slate-200">
//                       {item.id}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <button
//                 onClick={submit}
//                 disabled={submitted}
//                 className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
//                   !submitted
//                     ? 'bg-green-600 hover:bg-green-700 text-white'
//                     : 'bg-slate-200 text-slate-400 cursor-not-allowed'
//                 }`}
//               >
//                 <Check className="w-5 h-5" />
//                 {submitted ? 'Submitted!' : 'Submit Rankings'}
//               </button>

//               {submitted && (
//                 <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                   <p className="text-green-800 font-medium text-center mb-2">
//                     ✓ Rankings saved successfully!
//                   </p>
//                   {currentImageIndex < stimulusImages.length - 1 && (
//                     <button
//                       onClick={nextImage}
//                       className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//                     >
//                       Next Stimulus →
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import React, { useState, useEffect } from 'react';
// import { Check, ChevronLeft, ChevronRight, RotateCcw, GripVertical, Eye, AlertCircle, Wifi } from 'lucide-react';

// export default function DepthRankingApp() {
//   // Your Google Apps Script Web App URL
//   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwofmGWu9KaS2nzy6Zel2xO0Un4EwnTpE3qbtVsyuqJZ6giBv-ELfVJx7UAwPyW2gvouw/exec';

//   // Demo images - replace these with your actual image imports
//   const stimulusImages = [
//     { 
//       id: 1, 
//       url: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=800&h=600&fit=crop', 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//     { 
//       id: 2, 
//       url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop', 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//     { 
//       id: 3, 
//       url: 'https://images.unsplash.com/photo-1415604934674-561df9abf539?w=800&h=600&fit=crop', 
//       objects: [
//         { id: 1, label: 'Object 1' },
//         { id: 2, label: 'Object 2' },
//         { id: 3, label: 'Object 3' },
//         { id: 4, label: 'Object 4' }
//       ]
//     },
//   ];

//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [rankings, setRankings] = useState(
//     stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id }))
//   );
//   const [submitted, setSubmitted] = useState(false);
//   const [allResults, setAllResults] = useState([]);
//   const [draggedItem, setDraggedItem] = useState(null);
//   const [dragOverIndex, setDragOverIndex] = useState(null);
//   const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'success', 'error', 'syncing'
//   const [connectionTested, setConnectionTested] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState(''); // 'testing', 'success', 'error'
  
//   // Participant information
//   const [participantId, setParticipantId] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState('');
//   const [assignedEye, setAssignedEye] = useState(''); // Randomly assigned eye to close
//   const [showEyeInstruction, setShowEyeInstruction] = useState(false); // Show eye instruction screen
//   const [hasConsented, setHasConsented] = useState(false);
  
//   const [sessionStartTime] = useState(new Date().toISOString());
//   const [showConsentForm, setShowConsentForm] = useState(true);
//   const [stimulusStartTime, setStimulusStartTime] = useState(new Date().toISOString());
//   const [studyComplete, setStudyComplete] = useState(false);

//   const currentStimulus = stimulusImages[currentImageIndex];

//   // Generate unique participant ID
//   const generateParticipantId = () => {
//     const timestamp = Date.now();
//     const random = Math.floor(Math.random() * 1000);
//     return `P${timestamp}${random}`;
//   };

//   // Test connection to Google Sheets
//   const testConnection = async () => {
//     setConnectionStatus('testing');
//     try {
//       const response = await fetch(GOOGLE_SCRIPT_URL, {
//         method: 'GET',
//         redirect: 'follow'
//       });
      
//       const data = await response.json();
//       console.log('Connection test response:', data);
      
//       if (data.status === 'success') {
//         setConnectionStatus('success');
//         setConnectionTested(true);
//       } else {
//         setConnectionStatus('error');
//       }
//     } catch (error) {
//       console.error('Connection test failed:', error);
//       setConnectionStatus('error');
//     }
//   };

//   // Save ALL data to Google Sheets when study is complete
//   const syncAllToGoogleSheets = async () => {
//     setSaveStatus('syncing');
    
//     const allData = allResults.map(result => ({
//       participantId: participantId,
//       age: age,
//       gender: gender,
//       assignedEye: assignedEye,
//       stimulusId: result.stimulusId,
//       rankings: result.rankings,
//       timeSpent: result.timeSpent,
//       timestamp: result.timestamp,
//       sessionId: sessionStartTime
//     }));
    
//     console.log('Syncing all data to Google Sheets:', allData);
    
//     try {
//       // Send all responses in one batch
//       const response = await fetch(GOOGLE_SCRIPT_URL, {
//         method: 'POST',
//         redirect: 'follow',
//         headers: {
//           'Content-Type': 'text/plain',
//         },
//         body: JSON.stringify({
//           batch: true,
//           data: allData
//         })
//       });
      
//       const data = await response.json();
//       console.log('Google Sheets sync response:', data);
      
//       if (data.status === 'success') {
//         setSaveStatus('success');
//         console.log('All data synced successfully');
        
//         // Clear localStorage after successful sync
//         try {
//           const storageKey = `depthStudy_${participantId}`;
//           localStorage.removeItem(storageKey);
//           console.log('Local backup cleared');
//         } catch (e) {
//           console.error('Error clearing localStorage:', e);
//         }
//       } else {
//         throw new Error(data.message || 'Sync failed');
//       }
      
//     } catch (error) {
//       console.error('Error syncing to Google Sheets:', error);
//       setSaveStatus('error');
//       alert('Unable to sync data to Google Sheets. Your data is safely stored locally. Please contact the researcher.');
//     }
//   };

//   const handleDragStart = (e, index) => {
//     setDraggedItem(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     setDragOverIndex(index);
//   };

//   const handleDragLeave = () => {
//     setDragOverIndex(null);
//   };

//   const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
    
//     if (draggedItem === null || draggedItem === dropIndex) {
//       setDraggedItem(null);
//       setDragOverIndex(null);
//       return;
//     }

//     const newRankings = [...rankings];
//     const draggedElement = newRankings[draggedItem];
    
//     newRankings.splice(draggedItem, 1);
//     newRankings.splice(dropIndex, 0, draggedElement);
    
//     const updatedRankings = newRankings.map((item, index) => ({
//       ...item,
//       rank: index + 1
//     }));

//     setRankings(updatedRankings);
//     setDraggedItem(null);
//     setDragOverIndex(null);
//   };

//   const handleDragEnd = () => {
//     setDraggedItem(null);
//     setDragOverIndex(null);
//   };

//   const reset = () => {
//     setRankings(currentStimulus.objects.map(obj => ({ ...obj, rank: obj.id })));
//     setSubmitted(false);
//   };

//   const submit = () => {
//     const currentTime = new Date().toISOString();
//     const timeSpent = Math.round((new Date(currentTime) - new Date(stimulusStartTime)) / 1000);
    
//     const result = {
//       participantId: participantId,
//       stimulusId: currentStimulus.id,
//       rankings: rankings.map((r, idx) => ({ 
//         objectId: r.id, 
//         objectLabel: r.label, 
//         rankPosition: idx + 1 
//       })),
//       timestamp: currentTime,
//       timeSpent: timeSpent
//     };
    
//     // Save to localStorage instantly (no waiting!)
//     const updatedResults = [...allResults, result];
//     setAllResults(updatedResults);
    
//     try {
//       const storageKey = `depthStudy_${participantId}`;
//       localStorage.setItem(storageKey, JSON.stringify({
//         participantId,
//         age,
//         gender,
//         assignedEye,
//         sessionId: sessionStartTime,
//         results: updatedResults
//       }));
//       setSaveStatus('success');
//     } catch (error) {
//       console.error('Error saving to localStorage:', error);
//       setSaveStatus('error');
//     }
    
//     setSubmitted(true);
    
//     // Clear status after 2 seconds
//     setTimeout(() => setSaveStatus(''), 2000);
//   };

//   const nextImage = () => {
//     if (currentImageIndex < stimulusImages.length - 1) {
//       setCurrentImageIndex(prev => prev + 1);
//       setRankings(stimulusImages[currentImageIndex + 1].objects.map(obj => ({ ...obj, rank: obj.id })));
//       setSubmitted(false);
//       setSaveStatus('');
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const prevImage = () => {
//     if (currentImageIndex > 0) {
//       setCurrentImageIndex(prev => prev - 1);
//       setRankings(stimulusImages[currentImageIndex - 1].objects.map(obj => ({ ...obj, rank: obj.id })));
//       setSubmitted(false);
//       setSaveStatus('');
//       setStimulusStartTime(new Date().toISOString());
//     }
//   };

//   const startStudy = () => {
//     if (hasConsented && age && gender) {
//       const newParticipantId = generateParticipantId();
//       setParticipantId(newParticipantId);
      
//       // Randomly assign which eye to close (left or right)
//       const randomEye = Math.random() < 0.5 ? 'left' : 'right';
//       setAssignedEye(randomEye);
      
//       setShowConsentForm(false);
//       setShowEyeInstruction(true);
      
//       // Show eye instruction for 3 seconds, then start study
//       setTimeout(() => {
//         setShowEyeInstruction(false);
//         setStimulusStartTime(new Date().toISOString());
//       }, 3000);
//     }
//   };

//   const restartStudy = () => {
//     // Reset all state for new participant
//     setCurrentImageIndex(0);
//     setRankings(stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id })));
//     setSubmitted(false);
//     setAllResults([]);
//     setAge('');
//     setGender('');
//     setAssignedEye('');
//     setHasConsented(false);
//     setShowConsentForm(true);
//     setShowEyeInstruction(false);
//     setStudyComplete(false);
//     setSaveStatus('');
//     setConnectionTested(false);
//     setConnectionStatus('');
//     setStimulusStartTime(new Date().toISOString());
//   };

//   // Check if study is complete and sync data
//   useEffect(() => {
//     if (allResults.length === stimulusImages.length && allResults.length > 0 && !studyComplete) {
//       setStudyComplete(true);
//       // Sync all data to Google Sheets now that study is complete
//       syncAllToGoogleSheets();
//     }
//   }, [allResults.length, stimulusImages.length, studyComplete]);

//   const canStart = hasConsented && age && gender;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
//       {showConsentForm ? (
//         <div className="max-w-3xl mx-auto mt-12">
//           <div className="bg-white rounded-xl shadow-lg p-8">
//             <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
//               Depth Perception Study
//             </h1>
            
//             {/* Connection Test */}
//             <div className="mb-6">
//               <button
//                 onClick={testConnection}
//                 disabled={connectionStatus === 'testing'}
//                 className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-2"
//               >
//                 <Wifi className="w-5 h-5" />
//                 {connectionStatus === 'testing' && 'Testing connection...'}
//                 {connectionStatus === 'success' && '✓ Connected to Google Sheets'}
//                 {connectionStatus === 'error' && '✗ Connection failed - check console'}
//                 {!connectionStatus && 'Test Connection to Google Sheets'}
//               </button>
//               {connectionStatus === 'success' && (
//                 <p className="text-xs text-green-600 mt-2 text-center">
//                   Your responses will be saved to Google Sheets
//                 </p>
//               )}
//               {connectionStatus === 'error' && (
//                 <p className="text-xs text-red-600 mt-2 text-center">
//                   Connection failed. Data will be saved locally as backup. Check browser console for details.
//                 </p>
//               )}
//             </div>

//             {/* Instructions */}
//             <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
//                 <Eye className="w-5 h-5" />
//                 Study Instructions
//               </h2>
//               <ul className="space-y-2 text-slate-700">
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>You will be shown {stimulusImages.length} images with marked objects.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>For each image, rank the objects by their depth from <strong>nearest to farthest</strong>.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span><strong>Important:</strong> You will be instructed which eye to close for monocular depth estimation.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>Use drag-and-drop to arrange objects in order.</span>
//                 </li>
//                 <li className="flex gap-2">
//                   <span className="font-semibold">•</span>
//                   <span>Take your time and be as accurate as possible.</span>
//                 </li>
//               </ul>
//             </div>

//             {/* Participant Information */}
//             <div className="mb-6">
//               <h3 className="text-lg font-semibold text-slate-800 mb-4">Participant Information</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Age
//                   </label>
//                   <input
//                     type="number"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                     placeholder="Enter your age"
//                     min="18"
//                     max="100"
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Gender
//                   </label>
//                   <select
//                     value={gender}
//                     onChange={(e) => setGender(e.target.value)}
//                     className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none"
//                   >
//                     <option value="">Select gender</option>
//                     <option value="male">Male</option>
//                     <option value="female">Female</option>
//                     <option value="other">Other</option>
//                     <option value="prefer-not-to-say">Prefer not to say</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             {/* Consent */}
//             <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
//               <label className="flex items-start gap-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={hasConsented}
//                   onChange={(e) => setHasConsented(e.target.checked)}
//                   className="mt-1 w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
//                 />
//                 <span className="text-sm text-slate-700">
//                   I confirm that I have <strong>normal or corrected vision</strong>, <strong>no color blindness</strong>, 
//                   and consent to participate in this study. I understand that my responses will be recorded anonymously 
//                   for research purposes.
//                 </span>
//               </label>
//             </div>

//             <button
//               onClick={startStudy}
//               disabled={!canStart}
//               className={`w-full py-4 rounded-lg font-semibold transition-colors ${
//                 canStart
//                   ? 'bg-blue-600 hover:bg-blue-700 text-white'
//                   : 'bg-slate-300 text-slate-500 cursor-not-allowed'
//               }`}
//             >
//               {!canStart ? 'Please complete all fields and consent' : 'Begin Study'}
//             </button>
//           </div>
//         </div>
//       ) : showEyeInstruction ? (
//         <div className="max-w-2xl mx-auto mt-32">
//           <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-16 text-center animate-pulse">
//             <div className="mb-8">
//               <div className="text-9xl mb-6">👁️</div>
//             </div>
//             <h2 className="text-5xl font-bold text-white mb-6">
//               PLEASE CLOSE YOUR
//             </h2>
//             <div className="bg-white rounded-2xl py-8 px-12 mb-6">
//               <p className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase">
//                 {assignedEye} EYE
//               </p>
//             </div>
//             <p className="text-2xl text-white font-medium">
//               Keep it closed throughout the study
//             </p>
//           </div>
//         </div>
//       ) : studyComplete ? (
//         <div className="max-w-2xl mx-auto mt-20">
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//             <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Check className="w-10 h-10 text-green-600" />
//             </div>
//             <h2 className="text-3xl font-bold text-slate-800 mb-4">
//               Study Complete!
//             </h2>
//             <p className="text-lg text-slate-600 mb-6">
//               Thank you for participating in this depth perception study.
//             </p>
            
//             {/* Sync Status */}
//             {saveStatus === 'syncing' && (
//               <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6 animate-pulse">
//                 <p className="text-blue-800 font-medium">
//                   ☁️ Syncing your data to Google Sheets...
//                 </p>
//               </div>
//             )}
//             {saveStatus === 'success' && (
//               <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
//                 <p className="text-green-800 font-medium">
//                   ✓ All data successfully saved to Google Sheets!
//                 </p>
//               </div>
//             )}
//             {saveStatus === 'error' && (
//               <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
//                 <p className="text-amber-800 font-medium">
//                   ⚠️ Your data is safely stored locally but could not sync to Google Sheets.
//                 </p>
//                 <p className="text-sm text-amber-700 mt-2">
//                   Please contact the researcher. Your responses are not lost.
//                 </p>
//               </div>
//             )}
            
//             <div className="bg-slate-50 rounded-lg p-4 mb-6">
//               <p className="text-sm text-slate-600">
//                 <strong>Participant ID:</strong> {participantId}
//               </p>
//               <p className="text-sm text-slate-600">
//                 <strong>Completed Stimuli:</strong> {allResults.length} / {stimulusImages.length}
//               </p>
//             </div>
//             <button
//               onClick={restartStudy}
//               className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
//             >
//               Start New Participant
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-slate-800 mb-2">
//               Depth Perception Study
//             </h1>
//             <p className="text-slate-600 mb-4">
//               Drag objects to rank them from <span className="font-semibold text-blue-600">closest (top)</span> to <span className="font-semibold text-purple-600">farthest (bottom)</span>
//             </p>
//             <div className="flex items-center justify-center gap-4 flex-wrap">
//               <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
//                 <span className="text-sm text-slate-600">Stimulus </span>
//                 <span className="font-bold text-slate-800">{currentImageIndex + 1}</span>
//                 <span className="text-sm text-slate-600"> of {stimulusImages.length}</span>
//               </div>
//               <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
//                 <span className="text-sm text-slate-600">Completed: </span>
//                 <span className="font-bold text-green-600">{allResults.length}</span>
//               </div>
//               <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 rounded-xl shadow-lg border-2 border-amber-600">
//                 <span className="text-lg text-white font-bold drop-shadow-md">
//                   👁️ CLOSE YOUR {assignedEye.toUpperCase()} EYE
//                 </span>
//               </div>
              
//               {/* Save Status Indicator */}
//               {saveStatus === 'saving' && (
//                 <div className="bg-blue-100 px-4 py-2 rounded-lg shadow-sm border border-blue-300">
//                   <span className="text-sm text-blue-800 font-medium">💾 Saved locally</span>
//                 </div>
//               )}
//               {saveStatus === 'success' && (
//                 <div className="bg-green-100 px-4 py-2 rounded-lg shadow-sm border border-green-300">
//                   <span className="text-sm text-green-800 font-medium">✓ Saved locally</span>
//                 </div>
//               )}
//               {saveStatus === 'syncing' && (
//                 <div className="bg-blue-100 px-4 py-2 rounded-lg shadow-sm border border-blue-300 animate-pulse">
//                   <span className="text-sm text-blue-800 font-medium">☁️ Syncing to Google Sheets...</span>
//                 </div>
//               )}
//               {saveStatus === 'error' && (
//                 <div className="bg-red-100 px-4 py-2 rounded-lg shadow-sm border border-red-300">
//                   <span className="text-sm text-red-800 font-medium">⚠ Saved locally only</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Image Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-slate-800">Stimulus</h2>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={prevImage}
//                     disabled={currentImageIndex === 0}
//                     className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
//                     title="Previous stimulus"
//                   >
//                     <ChevronLeft className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={nextImage}
//                     disabled={currentImageIndex === stimulusImages.length - 1}
//                     className="p-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
//                     title="Next stimulus"
//                   >
//                     <ChevronRight className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//               <div className="relative">
//                 <img
//                   src={currentStimulus.url}
//                   alt={`Stimulus ${currentStimulus.id}`}
//                   className="w-full rounded-lg shadow-md"
//                 />
//                 <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium">
//                   Image {currentImageIndex + 1}
//                 </div>
//               </div>
              
//               {/* Note about demo images */}
//               <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <p className="text-xs text-yellow-800 flex items-start gap-2">
//                   <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
//                   <span><strong>Note:</strong> Replace the demo images in the code with your actual study images before deployment.</span>
//                 </p>
//               </div>
//             </div>

//             {/* Ranking Section */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold text-slate-800">Rankings</h2>
//                 <button
//                   onClick={reset}
//                   className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
//                 >
//                   <RotateCcw className="w-4 h-4" />
//                   Reset
//                 </button>
//               </div>

//               <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                 <p className="text-sm text-blue-800 text-center">
//                   💡 <span className="font-medium">Drag and drop</span> to reorder objects
//                 </p>
//               </div>

//               {/* Header: Nearest */}
//               <div className="mb-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white text-center font-bold shadow-md">
//                 ↑ NEAREST (Closest to you)
//               </div>

//               <div className="space-y-2 mb-2">
//                 {rankings.map((item, index) => (
//                   <div
//                     key={item.id}
//                     draggable
//                     onDragStart={(e) => handleDragStart(e, index)}
//                     onDragOver={(e) => handleDragOver(e, index)}
//                     onDragLeave={handleDragLeave}
//                     onDrop={(e) => handleDrop(e, index)}
//                     onDragEnd={handleDragEnd}
//                     className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-move transition-all ${
//                       draggedItem === index
//                         ? 'opacity-50 border-blue-400 bg-blue-50'
//                         : dragOverIndex === index
//                         ? 'border-blue-400 bg-blue-50 scale-105'
//                         : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
//                     }`}
//                   >
//                     <GripVertical className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    
//                     <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-sm flex items-center justify-center font-bold text-white">
//                       {index + 1}
//                     </div>
                    
//                     <div className="flex-grow">
//                       <p className="font-medium text-slate-700">{item.label}</p>
//                       <p className="text-xs text-slate-500">
//                         {index === 0 ? 'Closest' : index === rankings.length - 1 ? 'Farthest' : `Position ${index + 1}`}
//                       </p>
//                     </div>

//                     <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-700 border-2 border-slate-200">
//                       {item.id}
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Footer: Farthest */}
//               <div className="mb-6 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white text-center font-bold shadow-md">
//                 ↓ FARTHEST (Farthest from you)
//               </div>

//               <button
//                 onClick={submit}
//                 disabled={submitted}
//                 className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
//                   !submitted
//                     ? 'bg-green-600 hover:bg-green-700 text-white'
//                     : 'bg-slate-200 text-slate-400 cursor-not-allowed'
//                 }`}
//               >
//                 <Check className="w-5 h-5" />
//                 {submitted ? 'Submitted!' : 'Submit Rankings'}
//               </button>

//               {submitted && (
//                 <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
//                   <p className="text-green-800 font-medium text-center mb-2">
//                     ✓ Rankings saved successfully!
//                   </p>
//                   {currentImageIndex < stimulusImages.length - 1 && (
//                     <button
//                       onClick={nextImage}
//                       className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//                     >
//                       Next Stimulus →
//                     </button>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect } from 'react';
import { Check, ChevronLeft, ChevronRight, RotateCcw, GripVertical, Eye, AlertCircle, Wifi } from 'lucide-react';

export default function DepthRankingApp() {
  // Your Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIQu7L5lPgxOsIpx8ePc6QifsiGKTvFTZgzda545A8xtsnlDhO5VKAFLG-i0AOol4uew/exec';

  // Demo images - replace these with your actual image imports
  // const stimulusImages = [
  //   { 
  //     id: 1, 
  //     url: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=800&h=600&fit=crop', 
  //     objects: [
  //       { id: 1, label: 'Object 1' },
  //       { id: 2, label: 'Object 2' },
  //       { id: 3, label: 'Object 3' },
  //       { id: 4, label: 'Object 4' }
  //     ]
  //   },
  //   { 
  //     id: 2, 
  //     url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=600&fit=crop', 
  //     objects: [
  //       { id: 1, label: 'Object 1' },
  //       { id: 2, label: 'Object 2' },
  //       { id: 3, label: 'Object 3' },
  //       { id: 4, label: 'Object 4' }
  //     ]
  //   },
  //   { 
  //     id: 3, 
  //     url: 'https://images.unsplash.com/photo-1415604934674-561df9abf539?w=800&h=600&fit=crop', 
  //     objects: [
  //       { id: 1, label: 'Object 1' },
  //       { id: 2, label: 'Object 2' },
  //       { id: 3, label: 'Object 3' },
  //       { id: 4, label: 'Object 4' }
  //     ]
  //   },
  // ];
  // Annotation data mapping stimulus IDs to color labels
  // Annotation data mapping stimulus IDs to color labels
  // Annotation data mapping stimulus IDs to color labels
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

  // Color name mapping for display
  const colorNames = {
    "r": "Red",
    "g": "Green",
    "b": "Blue",
    "y": "Yellow"
  };

  // Generate stimulus images from your JPG files
  const stimulusImages = Object.keys(annotations).map(id => {
    const paddedId = id.padStart(4, '0');
    const imageUrl = `${process.env.PUBLIC_URL}/stimulus/${paddedId}.jpg`;
    console.log('Loading image:', imageUrl); // Debug log
    return {
      id: id,
      url: imageUrl,
      objects: annotations[id].map((color, index) => ({
        id: index + 1,
        label: colorNames[color],
        color: color
      }))
    };
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rankings, setRankings] = useState(
    stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id }))
  );
  const [submitted, setSubmitted] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'success', 'error', 'syncing'
  const [connectionStatus, setConnectionStatus] = useState(''); // 'testing', 'success', 'error'
  
  // Participant information
  const [participantId, setParticipantId] = useState('');
  const [name, setName] = useState(''); // Optional
  const [enrollmentNumber, setEnrollmentNumber] = useState(''); // Optional
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [assignedEye, setAssignedEye] = useState(''); // Randomly assigned eye to close
  const [showEyeInstruction, setShowEyeInstruction] = useState(false); // Show eye instruction screen
  const [hasConsented, setHasConsented] = useState(false);
  
  const [sessionStartTime] = useState(new Date().toISOString());
  const [showConsentForm, setShowConsentForm] = useState(true);
  const [stimulusStartTime, setStimulusStartTime] = useState(new Date().toISOString());
  const [studyComplete, setStudyComplete] = useState(false);

  const currentStimulus = stimulusImages[currentImageIndex];

  // Generate unique participant ID
  const generateParticipantId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `P${timestamp}${random}`;
  };

  // Test connection to Google Sheets
  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow'
      });
      
      const data = await response.json();
      console.log('Connection test response:', data);
      
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

  // Save ALL data to Google Sheets when study is complete
  const syncAllToGoogleSheets = async () => {
    setSaveStatus('syncing');
    
    const allData = allResults.map(result => ({
      participantId: participantId,
      name: name || 'N/A',
      enrollmentNumber: enrollmentNumber || 'N/A',
      age: age,
      gender: gender,
      assignedEye: assignedEye,
      stimulusId: result.stimulusId,
      rankings: result.rankings,
      timeSpent: result.timeSpent,
      timestamp: result.timestamp,
      sessionId: sessionStartTime
    }));
    
    console.log('Syncing all data to Google Sheets:', allData);
    
    try {
      // Send all responses in one batch
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
        
        // Clear localStorage after successful sync
        try {
          const storageKey = `depthStudy_${participantId}`;
          localStorage.removeItem(storageKey);
          console.log('Local backup cleared');
        } catch (e) {
          console.error('Error clearing localStorage:', e);
        }
      } else {
        throw new Error(data.message || 'Sync failed');
      }
      
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error);
      setSaveStatus('error');
      alert('Unable to sync data to Google Sheets. Your data is safely stored locally. Please contact the researcher.');
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
    setRankings(currentStimulus.objects.map(obj => ({ ...obj, rank: obj.id })));
    setSubmitted(false);
  };

  const submit = () => {
    const currentTime = new Date().toISOString();
    const timeSpent = Math.round((new Date(currentTime) - new Date(stimulusStartTime)) / 1000);
    
    const result = {
      participantId: participantId,
      stimulusId: currentStimulus.id,
      rankings: rankings.map((r, idx) => ({ 
        objectId: r.id, 
        objectLabel: r.label, 
        rankPosition: idx + 1 
      })),
      timestamp: currentTime,
      timeSpent: timeSpent
    };
    
    // Save to localStorage instantly (no waiting!)
    const updatedResults = [...allResults, result];
    setAllResults(updatedResults);
    
    try {
      const storageKey = `depthStudy_${participantId}`;
      localStorage.setItem(storageKey, JSON.stringify({
        participantId,
        name,
        enrollmentNumber,
        age,
        gender,
        assignedEye,
        sessionId: sessionStartTime,
        results: updatedResults
      }));
      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      setSaveStatus('error');
    }
    
    setSubmitted(true);
    
    // Clear status after 1 second, then move to next image
    setTimeout(() => {
      setSaveStatus('');
      
      // Automatically move to next image if not the last one
      if (currentImageIndex < stimulusImages.length - 1) {
        setCurrentImageIndex(prev => prev + 1);
        setRankings(stimulusImages[currentImageIndex + 1].objects.map(obj => ({ ...obj, rank: obj.id })));
        setSubmitted(false);
        setStimulusStartTime(new Date().toISOString());
      }
    }, 1000);
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setRankings(stimulusImages[currentImageIndex - 1].objects.map(obj => ({ ...obj, rank: obj.id })));
      setSubmitted(false);
      setSaveStatus('');
      setStimulusStartTime(new Date().toISOString());
    }
  };

  const startStudy = () => {
    if (hasConsented && age && gender) {
      const newParticipantId = generateParticipantId();
      setParticipantId(newParticipantId);
      
      // Randomly assign which eye to close (left or right)
      const randomEye = Math.random() < 0.5 ? 'left' : 'right';
      setAssignedEye(randomEye);
      
      setShowConsentForm(false);
      setShowEyeInstruction(true);
      
      // Show eye instruction for 3 seconds, then start study
      setTimeout(() => {
        setShowEyeInstruction(false);
        setStimulusStartTime(new Date().toISOString());
      }, 3000);
    }
  };

  const restartStudy = () => {
    // Reset all state for new participant
    setCurrentImageIndex(0);
    setRankings(stimulusImages[0].objects.map(obj => ({ ...obj, rank: obj.id })));
    setSubmitted(false);
    setAllResults([]);
    setName('');
    setEnrollmentNumber('');
    setAge('');
    setGender('');
    setAssignedEye('');
    setHasConsented(false);
    setShowConsentForm(true);
    setShowEyeInstruction(false);
    setStudyComplete(false);
    setSaveStatus('');
    setConnectionStatus('');
    setStimulusStartTime(new Date().toISOString());
  };

  // Check if study is complete and sync data
  useEffect(() => {
    if (allResults.length === stimulusImages.length && allResults.length > 0 && !studyComplete) {
      setStudyComplete(true);
      // Sync all data to Google Sheets now that study is complete
      syncAllToGoogleSheets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allResults.length, stimulusImages.length, studyComplete]);

  const canStart = hasConsented && age && gender;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {showConsentForm ? (
        <div className="max-w-3xl mx-auto mt-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
              Depth Perception Study
            </h1>
            
            {/* Connection Test */}
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
                  Connection failed. Data will be saved locally as backup. Check browser console for details.
                </p>
              )}
            </div>

            {/* Instructions */}
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
                  <span><strong>Important:</strong> You will be instructed which eye to close for monocular depth estimation.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span>Use drag-and-drop to arrange objects in order.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">•</span>
                  <span>You will have 10 sec per image try to be as accurate as possible.</span>
                </li>
              </ul>
            </div>

            {/* Participant Information */}
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
              </div>
            </div>

            {/* Consent */}
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
              {!canStart ? 'Please complete all fields and consent' : 'Begin Study'}
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
                {assignedEye} EYE
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
            
            {/* Sync Status */}
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
                  ⚠️ Your data is safely stored locally but could not sync to Google Sheets.
                </p>
                <p className="text-sm text-amber-700 mt-2">
                  Please contact the researcher. Your responses are not lost.
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
                  👁️ CLOSE YOUR {assignedEye.toUpperCase()} EYE
                </span>
              </div>
              
              {/* Save Status Indicator */}
              {saveStatus === 'success' && (
                <div className="bg-green-100 px-4 py-2 rounded-lg shadow-sm border border-green-300">
                  <span className="text-sm text-green-800 font-medium">✓ Saved!</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="bg-red-100 px-4 py-2 rounded-lg shadow-sm border border-red-300">
                  <span className="text-sm text-red-800 font-medium">⚠ Saved locally only</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Stimulus</h2>
                <div className="flex gap-2">
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
              <div className="relative">
                <img
                  src={currentStimulus.url}
                  alt={`Stimulus ${currentStimulus.id}`}
                  className="w-full rounded-lg shadow-md"
                />
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  Image {currentImageIndex + 1}
                </div>
              </div>
              
              {/* Note about demo images */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span><strong>Note:</strong> Replace the demo images in the code with your actual study images before deployment.</span>
                </p>
              </div>
            </div>

            {/* Ranking Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
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

              {/* Header: Nearest */}
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
                    
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-sm flex items-center justify-center font-bold text-white">
                      {index + 1}
                    </div>
                    
                    <div className="flex-grow">
                      <p className="font-medium text-slate-700">{item.label}</p>
                      <p className="text-xs text-slate-500">
                        {index === 0 ? 'Closest' : index === rankings.length - 1 ? 'Farthest' : `Position ${index + 1}`}
                      </p>
                    </div>

                    <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-lg shadow-sm flex items-center justify-center font-bold text-slate-700 border-2 border-slate-200">
                      {item.id}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: Farthest */}
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