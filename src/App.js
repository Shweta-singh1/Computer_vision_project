import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Download, Upload, Info, CheckCircle } from 'lucide-react';

const DepthExperiment = () => {
  const [stage, setStage] = useState('consent');
  const [participantInfo, setParticipantInfo] = useState({
    id: '',
    age: '',
    gender: '',
    visualExperience: '',
    consentGiven: false
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [eyeClosed, setEyeClosed] = useState(null);
  const [rankings, setRankings] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [images, setImages] = useState([]);
  const [results, setResults] = useState([]);

  // Load images from storage on mount
  useEffect(() => {
    loadImagesFromStorage();
  }, []);

  const loadImagesFromStorage = async () => {
    try {
      const imageList = await window.storage.list('experiment_image_');
      if (imageList && imageList.keys && imageList.keys.length > 0) {
        const loadedImages = [];
        for (const key of imageList.keys) {
          const result = await window.storage.get(key);
          if (result) {
            loadedImages.push(JSON.parse(result.value));
          }
        }
        setImages(loadedImages);
      }
    } catch (error) {
      console.log('No images loaded from storage yet');
    }
  };

  const handleConsentSubmit = (e) => {
    e.preventDefault();
    if (participantInfo.age && participantInfo.gender && participantInfo.consentGiven) {
      setStage('instructions');
    }
  };

  const startExperiment = () => {
    if (images.length === 0) {
      alert('Please upload experiment images first (Admin Panel)');
      return;
    }
    const randomEye = Math.random() > 0.5 ? 'left' : 'right';
    setEyeClosed(randomEye);
    setStage('experiment');
  };

  const currentImage = images[currentImageIndex];
  const currentRanking = rankings[currentImageIndex] || [];

  const handleDragStart = (e, object) => {
    setDraggedItem(object);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newRanking = [...currentRanking];
    const draggedIndex = newRanking.findIndex(obj => obj.id === draggedItem.id);
    
    if (draggedIndex !== -1) {
      newRanking.splice(draggedIndex, 1);
    }
    
    newRanking.splice(targetIndex, 0, draggedItem);
    
    setRankings({
      ...rankings,
      [currentImageIndex]: newRanking
    });
    setDraggedItem(null);
  };

  const addToRanking = (object) => {
    const newRanking = [...currentRanking, object];
    setRankings({
      ...rankings,
      [currentImageIndex]: newRanking
    });
  };

  const removeFromRanking = (objectId) => {
    const newRanking = currentRanking.filter(obj => obj.id !== objectId);
    setRankings({
      ...rankings,
      [currentImageIndex]: newRanking
    });
  };

  const handleNext = () => {
    if (currentRanking.length !== currentImage?.objects?.length) {
      alert('Please rank all objects before proceeding');
      return;
    }

    const result = {
      imageId: currentImage.id,
      participantId: participantInfo.id,
      eyeClosed: eyeClosed,
      ranking: currentRanking.map((obj, idx) => ({
        objectId: obj.id,
        rank: idx + 1
      })),
      timestamp: new Date().toISOString()
    };

    const newResults = [...results, result];
    setResults(newResults);

    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      const randomEye = Math.random() > 0.5 ? 'left' : 'right';
      setEyeClosed(randomEye);
    } else {
      saveResults(newResults);
      setStage('complete');
    }
  };

  const saveResults = async (finalResults) => {
    try {
      const resultData = {
        participantInfo,
        results: finalResults,
        completedAt: new Date().toISOString()
      };
      await window.storage.set(
        `result_${participantInfo.id}_${Date.now()}`,
        JSON.stringify(resultData)
      );
    } catch (error) {
      console.error('Error saving results:', error);
    }
  };

  const downloadResults = () => {
    const data = {
      participantInfo,
      results,
      completedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `depth_experiment_${participantInfo.id}_${Date.now()}.json`;
    a.click();
  };

  // Admin Panel Component
  const AdminPanel = () => {
    const [imageUrl, setImageUrl] = useState('');
    const [imageId, setImageId] = useState('');
    const [objects, setObjects] = useState([{ id: 1, label: 'Object 1' }]);

    const handleAddObject = () => {
      setObjects([...objects, { id: objects.length + 1, label: `Object ${objects.length + 1}` }]);
    };

    const handleObjectChange = (index, value) => {
      const newObjects = [...objects];
      newObjects[index].label = value;
      setObjects(newObjects);
    };

    const handleSaveImage = async () => {
      if (!imageUrl || !imageId || objects.length < 3) {
        alert('Please provide image URL, ID, and at least 3 objects');
        return;
      }

      const imageData = {
        id: imageId,
        url: imageUrl,
        objects: objects.filter(obj => obj.label.trim() !== '')
      };

      try {
        await window.storage.set(`experiment_image_${imageId}`, JSON.stringify(imageData));
        alert('Image saved successfully!');
        await loadImagesFromStorage();
        setImageUrl('');
        setImageId('');
        setObjects([{ id: 1, label: 'Object 1' }]);
      } catch (error) {
        console.error('Error saving image:', error);
        alert('Error saving image');
      }
    };

    const downloadAllResults = async () => {
      try {
        const resultsList = await window.storage.list('result_');
        if (resultsList && resultsList.keys) {
          const allResults = [];
          for (const key of resultsList.keys) {
            const result = await window.storage.get(key);
            if (result) {
              allResults.push(JSON.parse(result.value));
            }
          }
          const blob = new Blob([JSON.stringify(allResults, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `all_results_${Date.now()}.json`;
          a.click();
        }
      } catch (error) {
        console.error('Error downloading results:', error);
      }
    };

    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Admin Panel - Upload Experiment Images</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Image ID</label>
          <input
            type="text"
            value={imageId}
            onChange={(e) => setImageId(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., img_001"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Annotated Objects (3-4 objects)</label>
          {objects.map((obj, idx) => (
            <input
              key={obj.id}
              type="text"
              value={obj.label}
              onChange={(e) => handleObjectChange(idx, e.target.value)}
              className="w-full p-2 border rounded mb-2"
              placeholder={`Object ${idx + 1} label`}
            />
          ))}
          {objects.length < 4 && (
            <button
              onClick={handleAddObject}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Object
            </button>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSaveImage}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save Image
          </button>
          <button
            onClick={downloadAllResults}
            className="px-6 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-2"
          >
            <Download size={20} />
            Download All Results
          </button>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Loaded Images: {images.length}</h3>
          <button
            onClick={() => setStage('consent')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Go to Experiment
          </button>
        </div>
      </div>
    );
  };

  if (stage === 'admin') {
    return <AdminPanel />;
  }

  if (stage === 'consent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Depth Perception Study</h1>
          
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Info size={24} />
              Study Information
            </h2>
            <p className="text-gray-700 mb-2">
              You will be shown images with occluded objects and asked to rank visible objects by their depth (nearest to farthest).
            </p>
            <p className="text-gray-700 mb-2">
              Duration: Approximately 15-20 minutes
            </p>
            <p className="text-gray-700">
              You will be asked to close one eye during the experiment for monocular depth estimation.
            </p>
          </div>

          <form onSubmit={handleConsentSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Participant ID</label>
              <input
                type="text"
                required
                value={participantInfo.id}
                onChange={(e) => setParticipantInfo({...participantInfo, id: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter your ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Age</label>
              <input
                type="number"
                required
                min="18"
                max="50"
                value={participantInfo.age}
                onChange={(e) => setParticipantInfo({...participantInfo, age: e.target.value})}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <select
                required
                value={participantInfo.gender}
                onChange={(e) => setParticipantInfo({...participantInfo, gender: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Experience with visual tasks</label>
              <select
                required
                value={participantInfo.visualExperience}
                onChange={(e) => setParticipantInfo({...participantInfo, visualExperience: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="">Select...</option>
                <option value="none">None</option>
                <option value="some">Some</option>
                <option value="extensive">Extensive</option>
              </select>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                checked={participantInfo.consentGiven}
                onChange={(e) => setParticipantInfo({...participantInfo, consentGiven: e.target.checked})}
                className="mt-1"
              />
              <label className="text-sm">
                I confirm that I have normal or corrected vision, no color blindness, and consent to participate in this study.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Continue to Instructions
            </button>
          </form>

          <button
            onClick={() => setStage('admin')}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Admin Panel
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Instructions</h1>
          
          <div className="space-y-4 text-gray-700">
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
              <p className="font-semibold">Important: Monocular Vision</p>
              <p>You will be instructed to close one eye (left or right) for each image. Please keep that eye closed throughout the ranking task.</p>
            </div>

            <ol className="list-decimal list-inside space-y-3">
              <li>You will see an image with numbered objects marked on it.</li>
              <li>One object in each image is occluded (hidden with a mask).</li>
              <li>Your task is to rank the visible numbered objects from <strong>nearest to farthest</strong>.</li>
              <li>Drag and drop objects to arrange them in order.</li>
              <li>Once all objects are ranked, click "Next" to proceed.</li>
            </ol>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="font-semibold mb-2">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use depth cues like size, position, texture, and overlap</li>
                <li>Take your time - there's no time limit</li>
                <li>Trust your perception</li>
              </ul>
            </div>
          </div>

          <button
            onClick={startExperiment}
            className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
          >
            Start Experiment
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'experiment' && currentImage) {
    const availableObjects = currentImage.objects.filter(
      obj => !currentRanking.find(ranked => ranked.id === obj.id)
    );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Image {currentImageIndex + 1} of {images.length}</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-red-100 rounded-lg">
                {eyeClosed === 'left' ? <EyeOff size={24} /> : <Eye size={24} />}
                <span className="font-semibold">Close your {eyeClosed} eye</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <img
                  src={currentImage.url}
                  alt="Experiment stimulus"
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Available Objects</h3>
                <div className="space-y-2 mb-6">
                  {availableObjects.map(obj => (
                    <div
                      key={obj.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, obj)}
                      onClick={() => addToRanking(obj)}
                      className="p-3 bg-gray-100 rounded cursor-move hover:bg-gray-200 transition"
                    >
                      {obj.label}
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-semibold mb-3">
                  Rank Objects (Nearest → Farthest)
                </h3>
                <div className="space-y-2">
                  {currentRanking.map((obj, idx) => (
                    <div
                      key={obj.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, obj)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className="p-3 bg-indigo-100 rounded cursor-move hover:bg-indigo-200 transition flex justify-between items-center"
                    >
                      <span>
                        <strong>{idx + 1}.</strong> {obj.label}
                      </span>
                      <button
                        onClick={() => removeFromRanking(obj.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {currentRanking.length < currentImage.objects.length && (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, currentRanking.length)}
                      className="p-8 border-2 border-dashed border-gray-300 rounded text-center text-gray-500"
                    >
                      Drop or click objects here
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={currentRanking.length !== currentImage.objects.length}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {currentImageIndex < images.length - 1 ? 'Next Image' : 'Complete Experiment'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Experiment Complete!</h1>
          <p className="text-gray-700 mb-6">
            Thank you for participating in our depth perception study. Your responses have been recorded.
          </p>
          <button
            onClick={downloadResults}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
          >
            <Download size={20} />
            Download Your Results
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default DepthExperiment;