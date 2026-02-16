import { useRef, useState } from "react";
// @ts-ignore
import { fetchAuthSession } from "aws-amplify/auth";

export default function Compressor() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [level, setLevel] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleCompress = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Select a PDF");

    setLoading(true);
    setResult(null);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      // 1️⃣ Get upload URL
      const res = await fetch(
        `${baseUrl}/upload-url?filename=${file.name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { uploadUrl, fileKey } = await res.json();

      // 2️⃣ Upload file to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" }
      });

      // 3️⃣ Start compression (ASYNC)
      const compRes = await fetch(`${baseUrl}/compress`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          bucket: "gofile-uploads-dev",
          key: fileKey,
          level
        })
      });

      const { jobId } = await compRes.json();

      // 4️⃣ POLL STATUS
      const poll = setInterval(async () => {
        const statusRes = await fetch(
          `${baseUrl}/compress?jobId=${jobId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await statusRes.json();

        if (data.status === "DONE") {
          setResult(data);
          setLoading(false);
          clearInterval(poll);
        }

        if (data.status === "FAILED") {
          alert("Compression failed");
          setLoading(false);
          clearInterval(poll);
        }
      }, 2000);

    } catch (err) {
      console.error(err);
      alert("Compression failed");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">PDF Compressor</h1>

      <input type="file" accept=".pdf" ref={fileRef} />

      <div className="mt-4">
        <label className="mr-2">Compression level:</label>
        <select
          value={level}
          onChange={e => setLevel(e.target.value)}
          className="bg-slate-800 p-2 rounded"
        >
          <option value="low">Low (Best quality)</option>
          <option value="medium">Medium</option>
          <option value="high">High (Smallest size)</option>
        </select>
      </div>

      <button
        onClick={handleCompress}
        disabled={loading}
        className="mt-6 bg-blue-600 px-6 py-2 rounded"
      >
        {loading ? "Compressing..." : "Compress PDF"}
      </button>

      {result?.downloadUrl && (
        <div className="mt-6 bg-slate-900 p-4 rounded">
          <a
            href={result.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-blue-400 underline"
          >
            Download Compressed PDF
          </a>
        </div>
      )}
    </div>
  );
}
