// client/src/App.jsx
// The complete, full-featured frontend application for the AI Media Generator.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';

// --- Configuration ---
const API_BASE_URL = 'https://yashdhanani-ai-media-backend.hf.space';

// --- Helper Components ---

const Loader = ({ text = 'Generating...' }) => (
  <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-purple-500 dark:border-purple-400"></div>
    <p className="text-gray-600 dark:text-gray-400 text-lg">{text}</p>
  </div>
);

const FeatureIcon = ({ icon, className = '' }) => (
    <span className={`text-3xl mr-3 ${className}`}>{icon}</span>
);

const DownloadButton = ({ url, filename, mediaType }) => {
    const handleDownload = useCallback(async () => {
        if (!url) return;
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename || `ai-generated-${mediaType}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error("Download failed:", error);
            window.open(url, '_blank');
        }
    }, [url, filename, mediaType]);

    return (
        <button
            onClick={handleDownload}
            className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!url}
        >
            Download {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
        </button>
    );
};

const ImageDropzone = ({ onFileSelect, onClear }) => {
    const [dragging, setDragging] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFile = (file) => {
        setError('');
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Invalid file type. Please upload an image.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File is too large. Please upload an image under 5MB.');
            return;
        }
        onFileSelect(file);
        setPreview(URL.createObjectURL(file));
    };

    const handleDrag = (e, enter) => {
        e.preventDefault();
        e.stopPropagation();
        if (enter) setDragging(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const onZoneClick = () => {
        if (!preview) fileInputRef.current.click();
    };
    
    const clearPreview = (e) => {
        e.stopPropagation();
        setPreview(null);
        setError('');
        onClear();
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div>
            <div 
                onDragEnter={(e) => handleDrag(e, true)}
                onDragOver={(e) => handleDrag(e, true)}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={onZoneClick}
                className={`w-full p-4 bg-gray-100 dark:bg-gray-700/50 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 relative
                ${dragging ? 'border-purple-500 scale-105' : 'border-gray-300 dark:border-gray-600'}`}
            >
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleChange} className="hidden" />
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="w-full h-48 object-contain rounded-md" />
                        <button onClick={clearPreview} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">&times;</button>
                    </>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400">
                        <div className="text-4xl mb-2">📤</div>
                        <p className="font-semibold">Drag & drop an image here</p>
                        <p className="text-sm">or click to select a file (Max 5MB)</p>
                    </div>
                )}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};


// --- Page & Feature Components ---

const Home = ({ setCurrentPage }) => {
    const features = [
        { id: 'TextToImage', icon: '🎨', title: 'Text-to-Image', description: 'Create stunning images from text descriptions.' },
        { id: 'TextToVideo', icon: '🎥', title: 'Text-to-Video', description: 'Generate video clips from a simple text prompt.' },
        { id: 'ImageToVideo', icon: '🎞️', title: 'Image-to-Video', description: 'Animate a static image to create a short video.' },
        { id: 'ImageToVideoAudio', icon: '🎵', title: 'Image-to-Video + Audio', description: 'Animate an image and add a soundtrack.' },
        { id: 'TextImageToVideo', icon: '✨', title: 'Text+Image-to-Video', description: 'Use a prompt to guide the animation of an image.' },
        { id: 'TextImageToVideoAudio', icon: '🔊', title: 'Text+Image-to-Video + Audio', description: 'Guide the animation and add a narrated soundtrack.' },
    ];

    return (
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800 dark:text-white">Choose a Tool</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">Select a generator to start creating AI media.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(feature => (
                    <div key={feature.id} className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
                        <div className="text-5xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{feature.title}</h3>
                        <p className="text-gray-600 dark:text-gray-400 flex-grow">{feature.description}</p>
                        <button
                            onClick={() => setCurrentPage(feature.id)}
                            className="mt-6 w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold rounded-lg transition-all"
                        >
                            Start
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TextToImage = () => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setImageUrl('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/text-to-image`, 
        { prompt },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(response.data);
      setImageUrl(url);
    } catch (err) {
      // Handling potential JSON error response from the server
      if (err.response && err.response.data instanceof Blob && err.response.data.type === "application/json") {
          const errorText = await err.response.data.text();
          const errorJson = JSON.parse(errorText);
          setError(errorJson.message || 'An error occurred.');
      } else {
          setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg transition-all max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white"><FeatureIcon icon="🎨" /> Text-to-Image</h2>
      <div className="space-y-4">
        <textarea
          rows="3"
          className="w-full p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
          placeholder="A majestic lion wearing a crown, studio lighting..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold rounded-lg disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>
      {error && <div className="mt-4 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 p-3 rounded-lg text-center">{error}</div>}
      <div className="mt-6 w-full min-h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 p-2">
        {loading ? <Loader text="Creating image..." /> : imageUrl ? 
          <div className="space-y-4 text-center">
            <img src={imageUrl} alt="Generated" className="max-w-full max-h-[50vh] rounded-lg shadow-md" />
            <DownloadButton url={imageUrl} filename={`ai-image-${prompt.slice(0, 20).replace(/\s/g, '_')}.png`} mediaType="image" />
          </div> :
          <p className="text-gray-500 dark:text-gray-400">Image will appear here</p>
        }
      </div>
    </div>
  );
};

const TextToVideo = () => {
    const [prompt, setPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateVideo = useCallback(async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setLoading(true);
        setError('');
        setVideoUrl('');
        try {
            const response = await axios.post(`${API_BASE_URL}/api/text-to-video`, { prompt });
            setVideoUrl(response.data.videoUrl);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate video.');
        } finally {
            setLoading(false);
        }
    }, [prompt]);

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white"><FeatureIcon icon="🎥" /> Text-to-Video</h2>
            <div className="space-y-4">
                <textarea rows="3" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border rounded-lg" placeholder="A drone flying over a futuristic city..." value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={loading} />
                <button onClick={generateVideo} disabled={loading || !prompt.trim()} className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold rounded-lg disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate Video'}
                </button>
            </div>
            {error && <div className="mt-4 bg-red-100 dark:bg-red-900/50 text-red-600 p-3 rounded-lg text-center">{error}</div>}
            <div className="mt-6 w-full min-h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed p-2">
                {loading ? <Loader text="Rendering video..." /> : videoUrl ?
                    <div className="space-y-4 text-center">
                        <video src={videoUrl} controls className="max-w-full rounded-lg shadow-md" />
                        <DownloadButton url={videoUrl} filename="ai-video.mp4" mediaType="video" />
                    </div> :
                    <p className="text-gray-500">Video will appear here</p>
                }
            </div>
        </div>
    );
};

const ImageToVideo = ({ withAudio = false }) => {
    const [imageFile, setImageFile] = useState(null);
    const [audioPrompt, setAudioPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateVideo = useCallback(async () => {
        if (!imageFile) { setError('Please upload an image.'); return; }
        if (withAudio && !audioPrompt.trim()) { setError('Please describe the audio.'); return; }
        setLoading(true);
        setError('');
        setVideoUrl('');
        const formData = new FormData();
        formData.append('image', imageFile);
        if (withAudio) formData.append('prompt', audioPrompt);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/image-to-video`, formData);
            setVideoUrl(response.data.videoUrl);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate video.');
        } finally {
            setLoading(false);
        }
    }, [imageFile, audioPrompt, withAudio]);

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
                <FeatureIcon icon={withAudio ? "🎵" : "🎞️"} /> {withAudio ? 'Image-to-Video + Audio' : 'Image-to-Video'}
            </h2>
            <div className="space-y-4">
                <ImageDropzone onFileSelect={setImageFile} onClear={() => setImageFile(null)} />
                {withAudio && <textarea rows="2" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border rounded-lg" placeholder="e.g., gentle rain sounds..." value={audioPrompt} onChange={(e) => setAudioPrompt(e.target.value)} disabled={loading} />}
                <button onClick={generateVideo} disabled={loading || !imageFile || (withAudio && !audioPrompt.trim())} className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-cyan-500 text-white font-bold rounded-lg disabled:opacity-50">
                    {loading ? 'Animating...' : 'Generate Video'}
                </button>
            </div>
            {error && <div className="mt-4 bg-red-100 dark:bg-red-900/50 text-red-600 p-3 rounded-lg text-center">{error}</div>}
            <div className="mt-6 w-full min-h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed p-2">
                {loading ? <Loader text="Animating image..." /> : videoUrl ?
                    <div className="space-y-4 text-center">
                        <video src={videoUrl} controls className="max-w-full rounded-lg shadow-md" />
                        <DownloadButton url={videoUrl} filename="ai-animated-image.mp4" mediaType="video" />
                    </div> :
                    <p className="text-gray-500">Upload an image to start</p>
                }
            </div>
        </div>
    );
};

const TextImageToVideo = ({ withAudio = false }) => {
    const [imageFile, setImageFile] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [audioPrompt, setAudioPrompt] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateVideo = useCallback(async () => {
        if (!imageFile) { setError('Please upload an image.'); return; }
        if (!prompt.trim()) { setError('Please enter a prompt for the animation.'); return; }
        if (withAudio && !audioPrompt.trim()) { setError('Please describe the audio.'); return; }
        setLoading(true);
        setError('');
        setVideoUrl('');
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('prompt', prompt);
        if (withAudio) formData.append('audioPrompt', audioPrompt);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/image-to-video`, formData);
            setVideoUrl(response.data.videoUrl);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate video.');
        } finally {
            setLoading(false);
        }
    }, [imageFile, prompt, audioPrompt, withAudio]);

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 flex items-center text-gray-800 dark:text-white">
                <FeatureIcon icon={withAudio ? "🔊" : "✨"} /> {withAudio ? 'Text+Image-to-Video + Audio' : 'Text+Image-to-Video'}
            </h2>
            <div className="space-y-4">
                <ImageDropzone onFileSelect={setImageFile} onClear={() => setImageFile(null)} />
                <textarea rows="2" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border rounded-lg" placeholder="e.g., make the clouds move..." value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={loading} />
                {withAudio && <textarea rows="2" className="w-full p-3 bg-gray-100 dark:bg-gray-700 border rounded-lg" placeholder="e.g., dramatic orchestral music..." value={audioPrompt} onChange={(e) => setAudioPrompt(e.target.value)} disabled={loading} />}
                <button onClick={generateVideo} disabled={loading || !imageFile || !prompt.trim() || (withAudio && !audioPrompt.trim())} className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate Video'}
                </button>
            </div>
            {error && <div className="mt-4 bg-red-100 dark:bg-red-900/50 text-red-600 p-3 rounded-lg text-center">{error}</div>}
            <div className="mt-6 w-full min-h-64 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed p-2">
                {loading ? <Loader text="Animating with prompt..." /> : videoUrl ?
                    <div className="space-y-4 text-center">
                        <video src={videoUrl} controls className="max-w-full rounded-lg shadow-md" />
                        <DownloadButton url={videoUrl} filename="ai-guided-animation.mp4" mediaType="video" />
                    </div> :
                     <p className="text-gray-500">Upload an image and add a prompt</p>
                }
            </div>
        </div>
    );
};


// --- Main App Component ---
export default function App() {
  const [theme, setTheme] = useState('dark');
  const [currentPage, setCurrentPage] = useState('Home');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const navLinks = [
      { id: 'Home', label: 'Home' },
      { id: 'TextToImage', label: 'T2I' },
      { id: 'TextToVideo', label: 'T2V' },
      { id: 'ImageToVideo', label: 'I2V' },
      { id: 'ImageToVideoAudio', label: 'I2V+A' },
      { id: 'TextImageToVideo', label: 'T+I2V' },
      { id: 'TextImageToVideoAudio', label: 'T+I2V+A' },
  ];

  const renderPage = () => {
      switch (currentPage) {
          case 'TextToImage': return <TextToImage />;
          case 'TextToVideo': return <TextToVideo />;
          case 'ImageToVideo': return <ImageToVideo />;
          case 'ImageToVideoAudio': return <ImageToVideo withAudio={true} />;
          case 'TextImageToVideo': return <TextImageToVideo />;
          case 'TextImageToVideoAudio': return <TextImageToVideo withAudio={true} />;
          case 'Home':
          default:
              return <Home setCurrentPage={setCurrentPage} />;
      }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button onClick={() => setCurrentPage('Home')} className="flex items-center space-x-3">
              <div className="text-3xl">🤖</div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500 hidden sm:block">
                AI Media Generator
              </h1>
          </button>
          <div className="flex items-center space-x-2">
            <nav className="hidden md:flex items-center space-x-1 bg-gray-200 dark:bg-gray-700/50 p-1 rounded-full">
                {navLinks.map(link => (
                    <button
                        key={link.id}
                        onClick={() => setCurrentPage(link.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                            currentPage === link.id
                            ? 'bg-white dark:bg-gray-800 shadow text-purple-600 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        {link.label}
                    </button>
                ))}
            </nav>
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-xl">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        {renderPage()}
      </main>

      <footer className="text-center py-6 mt-8">
        <p className="text-gray-500 dark:text-gray-400">Developed by Yash Dhanani</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            &copy; 2025 Yash Dhanani. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
