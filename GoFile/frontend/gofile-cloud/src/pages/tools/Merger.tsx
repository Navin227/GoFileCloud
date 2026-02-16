import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { Upload, ArrowLeft, Layers, File, X, Plus, Sparkles } from "lucide-react";
// @ts-ignore
import { fetchAuthSession } from "aws-amplify/auth";

export default function Merger() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // -------------------------
  // 📂 File Selection
  // -------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const pdfs = newFiles.filter(file =>
        file.name.toLowerCase().endsWith(".pdf")
      );

      if (pdfs.length !== newFiles.length) {
        alert("Only PDF files are supported.");
      }

      setSelectedFiles(prev => [...prev, ...pdfs]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // -------------------------
  // 🚀 MERGE LOGIC
  // -------------------------
  const handleMergeAction = async () => {
    if (selectedFiles.length < 2) {
      alert("Select at least 2 PDFs.");
      return;
    }

    setLoading(true);
    setDownloadUrl(null);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken;

      const uploadedKeys: string[] = [];

      // 1️⃣ Upload each file
      for (const file of selectedFiles) {
        const res = await fetch(
          `${baseUrl}/upload-url?filename=${file.name}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const { uploadUrl, fileKey } = await res.json();

        await fetch(uploadUrl, {
          method: "PUT",
          body: file
        });

        uploadedKeys.push(fileKey);
      }

      // 2️⃣ Call merge API
      const mergeRes = await fetch(`${baseUrl}/merge`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          files: uploadedKeys
        })
      });

      const data = await mergeRes.json();

      if (data.download_url) {
        setDownloadUrl(data.download_url);
      } else {
        alert("Merge failed");
      }

    } catch (err) {
      console.error(err);
      alert("Merge failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">

        <button
          onClick={() => navigate("/home")}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="text-center mb-12">
          <div className="bg-purple-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers className="text-purple-500" size={32} />
          </div>
          <h1 className="text-3xl font-bold italic">PDF Merger</h1>
        </div>

        {selectedFiles.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#111827] border-2 border-dashed border-slate-800 rounded-3xl p-24 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all"
          >
            <Upload size={40} />
            <p className="mt-4">Select PDF files</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex justify-between p-4 border-b border-slate-800">
                  <span>{file.name}</span>
                  <button onClick={() => removeFile(index)}>
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleMergeAction}
              disabled={loading}
              className="w-full bg-purple-600 py-4 rounded-xl font-bold"
            >
              {loading ? "Merging..." : "Merge PDFs"}
            </button>
          </div>
        )}

        {downloadUrl && (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="block mt-6 text-blue-400 underline text-center"
          >
            Download Merged PDF
          </a>
        )}

      </main>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept=".pdf"
        onChange={handleFileChange}
      />
    </div>
  );
}
