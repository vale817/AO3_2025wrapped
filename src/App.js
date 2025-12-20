import React, { useState, useEffect, useRef } from "react";
// 1. 引入生成 PDF 必须的两个库
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  BookOpen,
  Type,
  Users,
  Heart,
  Tag,
  Award,
  Hash,
  ArrowUpRight,
  Upload,
  FileJson,
  AlertCircle,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";

// Demo data
const DEMO_DATA = {
  totalFics: 128,
  totalWords: 1540320,
  longestFic: {
    title: "The Infinite Coffee Shop Loop",
    authors: ["FanficWriter_Supreme"],
    words: 245000,
  },
  top5Authors: [
    ["DailyWriter", 15],
    ["KudoGiver99", 12],
    ["ArchiveUser_X", 8],
    ["BetaReaderPro", 6],
    ["PlotTwistMaster", 5],
  ],
  favCharacters: [
    ["Harry Potter", 45],
    ["Draco Malfoy", 38],
  ],
  top3Fandoms: [
    ["Harry Potter - J. K. Rowling", 52],
    ["Marvel Cinematic Universe", 34],
    ["Sherlock (TV)", 15],
  ],
  top5Tags: [
    ["Alternate Universe - Coffee Shop", 25],
    ["Slow Burn", 20],
    ["Fluff", 18],
    ["Hurt/Comfort", 15],
    ["Enemies to Lovers", 12],
  ],
  favRating: [["", 128]],
  favShips: [
    ["Harry Potter/Draco Malfoy", 30],
    ["Steve Rogers/Bucky Barnes", 25],
    ["Sherlock Holmes/John Watson", 12],
    ["Tony Stark/Peter Parker", 8],
    ["Hermione Granger/Ron Weasley", 5],
    ["Thor/Loki", 4],
    ["Natasha Romanov/Wanda Maximoff", 3],
    ["Dean Winchester/Castiel", 3],
    ["Aziraphale/Crowley", 2],
    ["Original Character/Character", 2],
  ],
  longest5Fics: [
    { title: "The Infinite Coffee Shop Loop", words: 245000 },
    { title: "Saving the Multiverse, Again", words: 180500 },
    { title: "50 Reasons Why", words: 120000 },
    { title: "A Study in Magic", words: 95000 },
    { title: "Winter Soldier's Redemption", words: 88000 },
  ],
  year: 2025,
};

const TEMPLATE_DATA = {
  totalFics: 0,
  totalWords: 0,
  year: 2025,
  longestFic: { title: "Example Title", authors: ["Author Name"], words: 0 },
  top5Authors: [["Author 1", 0]],
  favCharacters: [["Character 1", 0]],
  top3Fandoms: [["Fandom 1", 0]],
  top5Tags: [["Tag 1", 0]],
  favShips: [["Ship 1", 0]],
  longest5Fics: [{ title: "Fic 1", words: 0 }],
};

// Formatting utilities
const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Components
const StatCard = ({
  icon: Icon,
  label,
  value,
  subtext,
  colorClass = "text-red-500",
}) => (
  <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-red-900 transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-full bg-gray-900 ${colorClass}`}>
        <Icon size={24} />
      </div>
      {subtext && (
        <span className="text-xs text-gray-400 font-mono">{subtext}</span>
      )}
    </div>
    <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">
      {label}
    </h3>
    <p className="text-3xl font-bold text-gray-100">{value}</p>
  </div>
);

const ProgressBar = ({ label, value, max, color = "bg-red-600" }) => {
  const width = Math.min(100, Math.max(5, (value / max) * 100));
  return (
    <div className="mb-4 group">
      <div className="flex justify-between items-end mb-1">
        <span className="text-sm font-medium text-gray-200 truncate pr-4 max-w-[80%]">
          {label}
        </span>
        <span className="text-xs font-mono text-gray-400">{value}</span>
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
      <span
        key={idx}
        className="px-3 py-1 bg-gray-700 hover:bg-red-900 text-gray-200 text-sm rounded-full transition-colors duration-200 cursor-default border border-gray-600 flex items-center gap-2"
      >
        <Hash size={12} className="text-red-400" />
        {tag}
        <span className="bg-gray-900 text-gray-400 text-xs px-1.5 py-0.5 rounded-md ml-1">
          {count}
        </span>
      </span>
    ))}
  </div>
);

const ListItem = ({ rank, title, subtitle, value }) => (
  <div className="flex items-center p-3 bg-gray-900/50 rounded-lg mb-2 border-l-2 border-transparent hover:border-red-600 transition-all">
    <div className="font-mono text-xl font-bold text-gray-600 w-8 flex-shrink-0">
      #{rank}
    </div>
    <div className="flex-grow min-w-0 pr-4">
      <div className="text-gray-200 font-medium truncate">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 truncate">{subtitle}</div>
      )}
    </div>
    {value && (
      <div className="text-sm font-mono text-red-400 flex-shrink-0">
        {value}
      </div>
    )}
  </div>
);

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [animate, setAnimate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // 2. 添加下载状态和 Ref
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef(null);
  const printRef = useRef(null); // 这个 Ref 用来包裹需要打印的内容

  useEffect(() => {
    if (data) {
      setTimeout(() => setAnimate(true), 50);
    } else {
      setAnimate(false);
    }
  }, [data]);

  // 3. 实现 PDF 下载功能
  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) return;

    setIsDownloading(true);

    try {
      // 生成 Canvas，注意这里 backgroundColor 设置为深色，以匹配 AO3 风格
      const canvas = await html2canvas(element, {
        scale: 2, // 提高清晰度
        useCORS: true,
        backgroundColor: "#111827", // 强制背景色为 gray-900，防止透明或变白
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      // 计算自适应高度：创建一个和图片比例一致的 PDF 页面
      // 这样生成的是一张长图 PDF，不会把内容截断
      const pdfWidth = 210; // A4 宽度 (mm)
      const imgProps = canvas;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // 初始化 PDF，使用自定义页面大小
      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AO3-Wrapped-${data.year || 2025}.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("生成 PDF 失败，请重试。");
    } finally {
      setIsDownloading(false);
    }
  };

  const validateData = (json) => {
    const requiredKeys = [
      "totalFics",
      "totalWords",
      "top5Authors",
      "top3Fandoms",
    ];
    const missingKeys = requiredKeys.filter((key) => !(key in json));
    if (missingKeys.length > 0) {
      throw new Error(
        `Invalid data format. Missing keys: ${missingKeys.join(", ")}`
      );
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
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
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
    setTimeout(() => setData(null), 300);
  };

  // Upload Screen
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="bg-red-900/20 p-4 rounded-full inline-block mb-4">
              <BookOpen className="text-red-600 w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              AO3 Wrapped Generator
            </h1>
            <p className="text-gray-400">
              Upload your{" "}
              <span className="font-mono text-red-400 bg-gray-800 px-1 rounded">
                .json
              </span>{" "}
              stats file to visualize your reading year.
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
              ${
                isDragging
                  ? "border-red-500 bg-red-900/10"
                  : "border-gray-700 hover:border-red-500/50 hover:bg-gray-800"
              }
              ${error ? "border-red-500" : ""}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".json"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center gap-4">
              <div className="bg-gray-800 p-3 rounded-full">
                <Upload className="text-gray-300 w-8 h-8" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-200">
                  Click or drag file here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Accepts AO3 JSON data format
                </p>
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
              <button
                onClick={loadDemo}
                className="flex-1 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <FileJson size={16} /> View Demo
              </button>
              <button
                onClick={downloadTemplate}
                className="flex-1 bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 px-4 py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <Download size={16} /> JSON Template
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main App Report
  const maxFandomCount = Math.max(
    ...(data.top3Fandoms?.map((i) => i[1]) || [1]),
    1
  );
  const maxShipCount = Math.max(...(data.favShips?.map((i) => i[1]) || [1]), 1);
  const avgWords = Math.round(data.totalWords / (data.totalFics || 1));

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
              <h1 className="text-xl font-bold tracking-tight text-white">
                AO3 Wrapped
              </h1>
              <p className="text-xs text-red-200 font-mono tracking-widest uppercase">
                Your Reading Year {data.year || new Date().getFullYear()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* 4. 新增下载按钮 */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg px-4 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isDownloading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Download size={14} />
              )}
              {isDownloading ? "Generating..." : "Save PDF"}
            </button>
            <button
              onClick={resetData}
              className="flex items-center gap-2 text-xs font-medium text-red-200 bg-red-950/50 hover:bg-red-950 border border-red-800 rounded-lg px-3 py-1.5 transition-colors"
            >
              <RefreshCw size={14} />
              Upload New
            </button>
          </div>
        </div>
      </header>

      {/* 5. 这里添加 ref={printRef}，让 PDF 只截取这个部分 */}
      <main
        ref={printRef}
        className={`max-w-6xl mx-auto px-4 py-8 space-y-8 transition-all duration-1000 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        {/* Hero Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={BookOpen}
            label="Total Fics Read"
            value={formatNumber(data.totalFics)}
            colorClass="text-blue-400"
          />
          <StatCard
            icon={Type}
            label="Total Words"
            value={formatNumber(data.totalWords)}
            subtext={`${formatNumber(avgWords)} avg`}
            colorClass="text-green-400"
          />
          <StatCard
            icon={Users}
            label="Top Fandom"
            value={data.top3Fandoms?.[0]?.[0].split(" - ")[0] || "N/A"}
            subtext={`${data.top3Fandoms?.[0]?.[1] || 0} works`}
            colorClass="text-purple-400"
          />
          <StatCard
            icon={Heart}
            label="Top Pairing"
            value={
              data.favShips?.[0]?.[0]
                ? data.favShips[0][0].length > 20
                  ? data.favShips[0][0].substring(0, 20) + "..."
                  : data.favShips[0][0]
                : "N/A"
            }
            subtext={`${data.favShips?.[0]?.[1] || 0} works`}
            colorClass="text-red-400"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Award className="text-yellow-500" />
                Top Fandoms
              </h2>
              <div className="space-y-2">
                {data.top3Fandoms?.map(([name, count], i) => (
                  <ProgressBar
                    key={i}
                    label={name}
                    value={count}
                    max={maxFandomCount}
                    color="bg-gradient-to-r from-red-700 to-red-500"
                  />
                ))}
                {(!data.top3Fandoms || data.top3Fandoms.length === 0) && (
                  <p className="text-gray-500 text-sm">
                    No fandom data available.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Heart className="text-pink-500" />
                Top Relationships
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {data.favShips?.slice(0, 10).map(([name, count], i) => (
                  <ProgressBar
                    key={i}
                    label={name}
                    value={count}
                    max={maxShipCount}
                    color="bg-pink-600"
                  />
                ))}
                {(!data.favShips || data.favShips.length === 0) && (
                  <p className="text-gray-500 text-sm">
                    No relationship data available.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ArrowUpRight className="text-blue-500" />
                Longest Reads
              </h2>
              <div className="space-y-1">
                {data.longest5Fics?.map((fic, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-700 transition-colors border-b border-gray-700/50 last:border-0"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                          i === 0
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <span className="truncate font-medium text-gray-300 group-hover:text-white transition-colors">
                        {fic.title}
                      </span>
                    </div>
                    <span className="font-mono text-sm text-gray-400 flex-shrink-0 ml-4">
                      {formatNumber(fic.words)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {data.longestFic && (
              <div className="bg-gradient-to-br from-red-900/50 to-gray-800 rounded-xl p-1 border border-red-700/30">
                <div className="bg-gray-900/90 rounded-lg p-6 h-full backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-red-400 mb-4 text-sm font-bold uppercase tracking-wider">
                    <Award size={16} />
                    Book of the Year
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                    {data.longestFic.title}
                  </h3>
                  <p className="text-gray-400 mb-6 flex items-center gap-2">
                    by{" "}
                    <span className="text-gray-200">
                      {data.longestFic.authors?.join(", ")}
                    </span>
                  </p>
                  <div className="inline-block px-4 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <span className="block text-xs text-gray-500 uppercase">
                      Word Count
                    </span>
                    <span className="text-xl font-mono font-bold text-red-400">
                      {formatNumber(data.longestFic.words)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Tag className="text-green-500" />
                Top Tags
              </h2>
              {data.top5Tags ? (
                <TagCloud tags={data.top5Tags} />
              ) : (
                <p className="text-gray-500 text-sm">No tag data available.</p>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="text-orange-500" />
                Top Authors
              </h2>
              <div className="space-y-1">
                {data.top5Authors?.map(([name, count], i) => (
                  <ListItem
                    key={i}
                    rank={i + 1}
                    title={name}
                    value={`${count} fics`}
                  />
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="text-indigo-400" />
                Favorite Characters
              </h2>
              <div className="space-y-1">
                {data.favCharacters?.map(([name, count], i) => (
                  <ListItem key={i} rank={i + 1} title={name} value={count} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="text-center text-gray-500 text-sm mt-12 pb-8 border-t border-gray-800 pt-8">
          <p>Generated based on your AO3 history file</p>
          <p className="mt-2 text-xs text-gray-600">
            This report is private and generated locally.
          </p>
        </footer>
      </main>
    </div>
  );
}
