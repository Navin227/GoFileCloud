import { useRef, useState, useEffect } from "react";
// @ts-ignore
import { fetchAuthSession } from "aws-amplify/auth";

type ConversionType =
  | "pdf_to_docx"
  | "docx_to_pdf"
  | "pptx_to_pdf";

export default function Converter() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [conversion, setConversion] = useState<ConversionType>("pdf_to_docx");
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // -------------------------
  // ✅ File validation logic
  // -------------------------
  const isValidFile = (file: File) => {
    const name = file.name.toLowerCase();

    if (conversion === "pdf_to_docx") return name.endsWith(".pdf");
    if (conversion === "docx_to_pdf") return name.endsWith(".docx");
    if (conversion === "pptx_to_pdf") return name.endsWith(".pptx");

    return false;
  };

  // -------------------------
  // 🚀 Start Conversion
  // -------------------------
  const startConvert = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Select a file");

    if (!isValidFile(file)) {
      return alert("❌ Invalid file type for selected conversion");
    }

    setLoading(true);
    setDownloadUrl(null);
    setJobId(null);

    const session = await fetchAuthSession();
    const token = session.tokens?.idToken;

    // 1️⃣ Get upload URL
    const res = await fetch(
      `${baseUrl}/upload-url?filename=${file.name}&contentType=${encodeURIComponent(file.type)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const { uploadUrl, fileKey } = await res.json();

    // 2️⃣ Upload file
    await fetch(uploadUrl, {
  method: "PUT",
  body: file
});



    // 3️⃣ Trigger convert
    const conv = await fetch(`${baseUrl}/convert`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bucket: "gofile-uploads-dev",
        key: fileKey,
        conversion
      })
    });

    const data = await conv.json();
    setJobId(data.jobId);
    setLoading(false);
  };

  // -------------------------
  // 🔁 POLLING (auto)
  // -------------------------
  useEffect(() => {
    if (!jobId) return;

    let interval: any;

    const poll = async () => {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken;

      const res = await fetch(
        `${baseUrl}/convert?jobId=${jobId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        clearInterval(interval);
      }
    };

    interval = setInterval(poll, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  // -------------------------
  // 🖼️ UI
  // -------------------------
  return (
    <div className="p-8 max-w-xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">File Converter</h1>

      <input type="file" ref={fileRef} />

      <select
        className="mt-4 p-2 bg-slate-800 w-full"
        value={conversion}
        onChange={e => setConversion(e.target.value as ConversionType)}
      >
        <option value="pdf_to_docx">PDF → DOCX</option>
        <option value="docx_to_pdf">DOCX → PDF</option>
        <option value="pptx_to_pdf">PPTX → PDF</option>
      </select>

      <button
        className="mt-4 bg-blue-600 px-6 py-2 rounded w-full"
        onClick={startConvert}
        disabled={loading}
      >
        {loading ? "Converting..." : "Convert"}
      </button>

      {jobId && !downloadUrl && (
        <p className="mt-4 text-yellow-400">
          Processing… please wait ⏳
        </p>
      )}

      {downloadUrl && (
        <a
          href={downloadUrl}
          target="_blank"
          rel="noreferrer"
          className="block mt-4 text-blue-400 underline"
        >
          Download Converted File
        </a>
      )}
    </div>
  );
}
