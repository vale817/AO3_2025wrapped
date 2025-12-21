import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Type, Users, Heart, Tag, Award, Hash, ArrowUpRight, Upload, FileJson, AlertCircle, RefreshCw, Download, ExternalLink } from 'lucide-react';

// Demo data for users to preview the look without uploading
const DEMO_DATA = {
  "totalFics": 128,
  "totalWords": 1540320,
  "longestFic": {
    "title": "The Infinite Coffee Shop LoopFanficWriter_Supreme",
    "authors": [
      "FanficWriter_Supreme"
    ],
    "words": 245000
  },
  "top5Authors": [
    [ "DailyWriter", 15 ],
    [ "KudoGiver99", 12 ],
    [ "ArchiveUser_X", 8 ],
    [ "BetaReaderPro", 6 ],
    [ "PlotTwistMaster", 5 ]
  ],
  "favCharacters": [
    [ "Harry Potter", 45 ],
    [ "Draco Malfoy", 38 ]
  ],
  "top3Fandoms": [
    [ "Harry Potter - J. K. Rowling", 52 ],
    [ "Marvel Cinematic Universe", 34 ],
    [ "Sherlock (TV)", 15 ]
  ],
  "top5Tags": [
    [ "Alternate Universe - Coffee Shop", 25 ],
    [ "Slow Burn", 20 ],
    [ "Fluff", 18 ],
    [ "Hurt/Comfort", 15 ],
    [ "Enemies to Lovers", 12 ]
  ],
  "favRating": [
    [ "", 128 ]
  ],
  "favShips": [
    [ "Harry Potter/Draco Malfoy", 30 ],
    [ "Steve Rogers/Bucky Barnes", 25 ],
    [ "Sherlock Holmes/John Watson", 12 ],
    [ "Tony Stark/Peter Parker", 8 ],
    [ "Hermione Granger/Ron Weasley", 5 ],
    [ "Thor/Loki", 4 ],
    [ "Natasha Romanov/Wanda Maximoff", 3 ],
    [ "Dean Winchester/Castiel", 3 ],
    [ "Aziraphale/Crowley", 2 ],
    [ "Original Character/Character", 2 ]
  ],
  "longest5Fics": [
    { "title": "The Infinite Coffee Shop LoopFanficWriter_Supreme", "words": 245000, "authors": ["FanficWriter_Supreme"] }, 
    { "title": "Saving the Multiverse, AgainBetaReaderPro", "words": 180500 }, 
    { "title": "50 Reasons WhyDailyWriter", "words": 120000 },
    { "title": "A Study in MagicArchiveUser_X", "words": 95000 },
    { "title": "Winter Soldier's RedemptionKudoGiver99", "words": 88000 }
  ],
  "year": 2025
};

const TEMPLATE_DATA = {
  "totalFics": 0,
  "totalWords": 0,
  "year": 2025,
  "longestFic": {
    "title": "Example TitleAuthorName",
    "authors": ["AuthorName"],
    "words": 0
  },
  "top5Authors": [
    ["Author 1", 0],
    ["Author 2", 0],
    ["Author 3", 0],
    ["Author 4", 0],
    ["Author 5", 0]
  ],
  "favCharacters": [
    ["Character 1", 0],
    ["Character 2", 0]
  ],
  "top3Fandoms": [
    ["Fandom 1", 0],
    ["Fandom 2", 0],
    ["Fandom 3", 0]
  ],
  "top5Tags": [
    ["Tag 1", 0],
    ["Tag 2", 0],
    ["Tag 3", 0],
    ["Tag 4", 0],
    ["Tag 5", 0]
  ],
  "favShips": [
    ["Ship 1", 0],
    ["Ship 2", 0],
    ["Ship 3", 0]
  ],
  "longest5Fics": [
    { "title": "Fic 1", "words": 0 },
    { "title": "Fic 2", "words": 0 },
    { "title": "Fic 3", "words": 0 },
    { "title": "Fic 4", "words": 0 },
    { "title": "Fic 5", "words": 0 }
  ]
};

// Formatting utilities
const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num);
};

// --- DATA CLEANING HELPER (ENHANCED) ---
const getCleanFicData = (fic, allAuthors = []) => {
  if (!fic) return { title: '', author: '' };
  
  let cleanTitle = fic.title || '';
  let author = '';

  // 1. Explicit author data (Best case)
  if (fic.authors && fic.authors.length > 0) {
    author = fic.authors[0]; 
  } 
  // 2. Match against known authors list (Fallback)
  else if (allAuthors.length > 0) {
    for (const knownAuthor of allAuthors) {
      if (cleanTitle.endsWith(knownAuthor)) {
        author = knownAuthor;
        break; 
      }
    }
  }

  // 3. Heuristic Match (Last Resort for "TitleAuthor" string with no author data)
  if (!author) {
    const stickyRegex = /([a-z0-9\u4e00-\u9fa5!?.")\]}’'>])([A-Z][a-zA-Z0-9_]*)$/;
    const match = cleanTitle.match(stickyRegex);
    if (match && match[2]) {
      author = match[2];
    }
  }

  // Strip author from title if found
  if (author && cleanTitle.endsWith(author)) {
    cleanTitle = cleanTitle.substring(0, cleanTitle.length - author.length);
  }

  return { title: cleanTitle, author };
};

// --- URL GENERATORS ---

const getAo3WorkUrl = (fic, knownAuthors = []) => {
  if (!fic) return '#';
  if (fic.url) return fic.url;
  
  const { title } = getCleanFicData(fic, knownAuthors);
  return `https://archiveofourown.org/works/search?work_search%5Bquery%5D=${encodeURIComponent(title)}`;
};

const getAo3TagUrl = (tag) => {
  if (!tag) return '#';
  const safeTag = tag.replace(/\//g, '*s*');
  return `https://archiveofourown.org/tags/${encodeURIComponent(safeTag)}/works`;
};

const getAo3AuthorUrl = (authorName) => {
  if (!authorName) return '#';
  return `https://archiveofourown.org/users/${encodeURIComponent(authorName)}/works`;
};

// --- COMPONENTS ---

const StatCard = ({ icon: Icon, label, value, subtext, colorClass = "text-red-500" }) => {
  // Check if value is a string and long, to adjust font size slightly
  const isLongText = typeof value === 'string' && value.length > 20;
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-red-900 transition-all duration-300 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full bg-gray-900 ${colorClass}`}>
          <Icon size={24} />
        </div>
        {subtext && <span className="text-xs text-gray-400 font-mono">{subtext}</span>}
      </div>
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-auto">{label}</h3>
      {/* Added break-words and conditional font sizing for long text */}
      <p className={`${isLongText ? 'text-xl' : 'text-3xl'} font-bold text-gray-100 break-words mt-1 leading-tight`}>
        {value}
      </p>
    </div>
  );
};

const ProgressBar = ({ label, value, max, color = "bg-red-600" }) => {
  const width = Math.min(100, Math.max(5, (value / max) * 100));
  return (
    <div className="mb-4 group">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-gray-200 break-words pr-4 max-w-[85%] group-hover:text-white transition-colors leading-tight">
          {label}
        </span>
        <span className="text-xs font-mono text-gray-400 flex-shrink-0">{value}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

const TagCloud = ({ tags }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map(([tag, count], idx) => (
      <a 
        key={idx} 
        href={getAo3TagUrl(tag)}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 bg-gray-700 hover:bg-red-900 text-gray-200 text-sm rounded-full transition-colors duration-200 cursor-pointer border border-gray-600 hover:border-red-700 flex items-center gap-2 group"
      >
        <Hash size={12} className="text-red-400 group-hover:text-red-200 flex-shrink-0" />
        <span className="break-words">{tag}</span>
        <span className="bg-gray-900 text-gray-400 text-xs px-1.5 py-0.5 rounded-md ml-1 group-hover:bg-red-950 group-hover:text-red-200 flex-shrink-0">{count}</span>
      </a>
    ))}
  </div>
);

const ListItem = ({ rank, title, subtitle, value, isAuthor = false }) => {
  const Content = () => (
    <>
      <div className="font-mono text-xl font-bold text-gray-600 w-8 flex-shrink-0">#{rank}</div>
      <div className="flex-grow min-w-0 pr-4">
        <div className={`font-medium break-words flex flex-wrap items-center gap-2 ${isAuthor ? 'text-gray-200 group-hover:text-red-300 transition-colors' : 'text-gray-200'}`}>
          {title}
          {isAuthor && <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 flex-shrink-0" />}
        </div>
        {subtitle && <div className="text-xs text-gray-500 break-words mt-0.5">{subtitle}</div>}
      </div>
      {value && <div className="text-sm font-mono text-red-400 flex-shrink-0 ml-2">{value}</div>}
    </>
  );

  if (isAuthor) {
    return (
      <a 
        href={getAo3AuthorUrl(title)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start p-3 bg-gray-900/50 rounded-lg mb-2 border-l-2 border-transparent hover:border-red-600 transition-all cursor-pointer group hover:bg-gray-800"
      >
        <Content />
      </a>
    );
  }

  return (
    <div className="flex items-start p-3 bg-gray-900/50 rounded-lg mb-2 border-l-2 border-transparent hover:border-red-600 transition-all">
      <Content />
    </div>
  );
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (data) {
      setTimeout(() => setAnimate(true), 50);
    } else {
      setAnimate(false);
    }
  }, [data]);

  const validateData = (json) => {
    if (!json || typeof json !== 'object') {
      throw new Error("Invalid JSON format.");
    }
    const requiredKeys = ['totalFics', 'totalWords', 'top5Authors', 'top3Fandoms'];
    const missingKeys = requiredKeys.filter(key => !(key in json));
    if (missingKeys.length > 0) {
      throw new Error(`Invalid data format. Missing keys: ${missingKeys.join(', ')}`);
    }
    return json;
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setError(null);
    if (file.type !== "application/json" && !file.name.endsWith('.json')) {
      setError("Please upload a valid JSON file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        const validatedData = validateData(json);
        setData(validatedData);
      } catch (err) {
        setError("Error parsing JSON: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const loadDemo = () => {
    setError(null);
    setData(DEMO_DATA);
  };

  const downloadTemplate = () => {
    const dataStr = JSON.stringify(TEMPLATE_DATA, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ao3_stats_template.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetData = () => {
    setAnimate(false);
    setData(null);
  };

  // --------------------------------------------------------------------------
  // Upload Screen Render
  // --------------------------------------------------------------------------
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="bg-red-900/20 p-4 rounded-full inline-block mb-4">
              <BookOpen className="text-red-600 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AO3 Wrapped Generator</h1>
            <p className="text-gray-400">Upload your <span className="font-mono text-red-400 bg-gray-800 px-1 rounded">.json</span> stats file to visualize your reading year.</p>
          </div>

          <div 
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
              ${isDragging ? 'border-red-500 bg-red-900/10' : 'border-gray-700 hover:border-red-500/50 hover:bg-gray-800'}
              ${error ? 'border-red-500' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
            
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-800 p-3 rounded-full">
                <Upload className="text-gray-300 w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-200">Click or drag file here</p>
                <p className="text-sm text-gray-500 mt-1">Accepts AO3 JSON data format</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
             <div className="flex gap-3 justify-center">
                <button onClick={loadDemo} className="flex-1 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <FileJson size={16} /> View Demo
                </button>
                <button onClick={downloadTemplate} className="flex-1 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                  <Download size={16} /> JSON Template
                </button>
             </div>
             <p className="text-center text-xs text-gray-600 mt-2">
               Download the template to fill in your own data manually or via script.
             </p>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Report Screen Render (Main App)
  // --------------------------------------------------------------------------
  const maxFandomCount = Math.max(...(data?.top3Fandoms?.map(i => i[1]) || [1]), 1);
  const maxShipCount = Math.max(...(data?.favShips?.map(i => i[1]) || [1]), 1);
  const avgWords = Math.round((data?.totalWords || 0) / (data?.totalFics || 1));

  // Gather known authors to help with title splitting
  const knownAuthors = [];
  if (data?.top5Authors) {
    data.top5Authors.forEach(a => {
      if (Array.isArray(a) && a[0]) knownAuthors.push(a[0]);
    });
  }
  if (data?.longestFic?.authors) {
    data.longestFic.authors.forEach(a => {
      if (a && !knownAuthors.includes(a)) knownAuthors.push(a);
    });
  }

  // Prepare Book of the Year data
  const bookOfTheYear = data?.longestFic ? getCleanFicData(data.longestFic, knownAuthors) : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-red-900 selection:text-white pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-900 to-gray-900 border-b border-red-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <BookOpen className="text-red-700" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">AO3 Wrapped</h1>
              <p className="text-xs text-red-200 font-mono tracking-widest uppercase">Your Reading Year {data?.year || new Date().getFullYear()}</p>
            </div>
          </div>
          <button 
            onClick={resetData}
            className="flex items-center gap-2 text-xs font-medium text-red-200 bg-red-950/50 hover:bg-red-950 border border-red-800 rounded-lg px-3 py-1.5 transition-colors"
          >
            <RefreshCw size={14} />
            Upload New File
          </button>
        </div>
      </header>

      <main className={`max-w-6xl mx-auto px-4 py-8 space-y-8 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Hero Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={BookOpen} label="Total Fics Read" value={formatNumber(data?.totalFics || 0)} colorClass="text-blue-400" />
          <StatCard icon={Type} label="Total Words" value={formatNumber(data?.totalWords || 0)} subtext={`${formatNumber(avgWords)} avg`} colorClass="text-green-400" />
          <StatCard icon={Users} label="Top Fandom" value={data?.top3Fandoms?.[0]?.[0].split(' - ')[0] || "N/A"} subtext={`${data?.top3Fandoms?.[0]?.[1] || 0} works`} colorClass="text-purple-400" />
          {/* REMOVED TRUNCATION HERE: Directly displaying the full string */}
          <StatCard icon={Heart} label="Top Pairing" value={data?.favShips?.[0]?.[0] || "N/A"} subtext={`${data?.favShips?.[0]?.[1] || 0} works`} colorClass="text-red-400" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content - Left Column (Charts) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Fandoms */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="text-yellow-500" />
                Top Fandoms
              </h2>
              <div className="space-y-2">
                {data?.top3Fandoms?.map(([name, count], i) => (
                  <ProgressBar key={i} label={name} value={count} max={maxFandomCount} color="bg-gradient-to-r from-red-700 to-red-500" />
                ))}
                {(!data?.top3Fandoms || data.top3Fandoms.length === 0) && <p className="text-gray-500 text-sm">No fandom data available.</p>}
              </div>
            </div>

            {/* Ships */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Heart className="text-pink-500" />
                Top Relationships
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {data?.favShips?.slice(0, 10).map(([name, count], i) => (
                  <a 
                    key={i} 
                    href={getAo3TagUrl(name)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <ProgressBar 
                      label={name} 
                      value={count} 
                      max={maxShipCount} 
                      color="bg-pink-600" 
                    />
                  </a>
                ))}
                 {(!data?.favShips || data.favShips.length === 0) && <p className="text-gray-500 text-sm">No relationship data available.</p>}
              </div>
            </div>

             {/* Longest Fics */}
             <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ArrowUpRight className="text-blue-500" />
                Longest Reads
              </h2>
              <div className="space-y-1">
                {data?.longest5Fics?.map((fic, i) => {
                  let ficDataToUse = fic;
                  if (data.longestFic && data.longestFic.title === fic.title) {
                     ficDataToUse = { ...fic, authors: data.longestFic.authors };
                  }
                  
                  const { title: cleanTitle, author } = getCleanFicData(ficDataToUse, knownAuthors);

                  return (
                    <a 
                      key={i} 
                      href={getAo3WorkUrl(ficDataToUse, knownAuthors)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0 cursor-pointer"
                    >
                      <div className="flex items-start gap-3 overflow-hidden">
                         <span className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mt-0.5 ${i === 0 ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-400'}`}>
                           {i + 1}
                         </span>
                         <div className="flex flex-col min-w-0">
                           <span className="font-medium text-gray-300 group-hover:text-red-300 transition-colors break-words leading-tight">
                             {cleanTitle} <ExternalLink size={10} className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
                           </span>
                           {author && (
                             <span className="text-xs text-gray-500 break-words group-hover:text-gray-400">
                               by {author}
                             </span>
                           )}
                         </div>
                      </div>
                      <span className="font-mono text-sm text-gray-400 flex-shrink-0 ml-4 mt-0.5">
                        {formatNumber(fic.words)}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            
            {/* Longest Fic Card */}
            {data?.longestFic && bookOfTheYear && (
              <div className="bg-gradient-to-br from-red-900/50 to-gray-800 rounded-xl p-1 border border-red-700/30">
                <div className="bg-gray-900/90 rounded-lg p-6 h-full backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-red-400 mb-4 text-sm font-bold uppercase tracking-wider">
                    <Award size={16} />
                    Book of the Year
                  </div>
                  <a 
                    href={getAo3WorkUrl(data.longestFic, knownAuthors)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group cursor-pointer"
                  >
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-red-300 group-hover:underline decoration-red-900/50 underline-offset-4 transition-all flex items-center flex-wrap gap-2 break-words">
                      {bookOfTheYear.title} <ExternalLink size={16} className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 flex-shrink-0" />
                    </h3>
                  </a>
                  <p className="text-gray-400 mb-6 flex items-center gap-2">
                     by <span className="text-gray-200">{bookOfTheYear.author || data.longestFic.authors?.join(", ")}</span>
                  </p>
                  <div className="inline-block px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="block text-xs text-gray-500 uppercase">Word Count</span>
                    <span className="text-xl font-mono font-bold text-red-400">{formatNumber(data.longestFic.words)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Tag className="text-green-500" />
                Top Tags
              </h2>
              {data?.top5Tags ? <TagCloud tags={data.top5Tags} /> : <p className="text-gray-500 text-sm">No tag data available.</p>}
            </div>

             {/* Authors */}
             <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="text-orange-500" />
                Top Authors
              </h2>
              <div className="space-y-1">
                {data?.top5Authors?.map(([name, count], i) => (
                  <ListItem 
                    key={i} 
                    rank={i + 1} 
                    title={name} 
                    value={`${count} fics`} 
                    isAuthor={true}
                  />
                ))}
              </div>
            </div>

             {/* Characters */}
             <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="text-indigo-400" />
                Favorite Characters
              </h2>
              <div className="space-y-1">
                {data?.favCharacters?.map(([name, count], i) => (
                  <ListItem 
                    key={i} 
                    rank={i + 1} 
                    title={name} 
                    value={count} 
                  />
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm mt-12 pb-8 border-t border-gray-800 pt-8">
          <p>Generated based on your AO3 history file</p>
          <p className="mt-2 text-xs text-gray-600">This report is private and generated locally.</p>
        </footer>

      </main>
    </div>
  );
}
