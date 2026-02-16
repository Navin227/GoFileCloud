import { useRef, useState } from "react";
// @ts-ignore
import { fetchAuthSession } from "aws-amplify/auth";

export default function Summarize() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Select a PDF");

    setLoading(true);
    setSummary("");

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken;

      // 1️⃣ Get upload URL
      const res = await fetch(
        `${baseUrl}/upload-url?filename=${file.name}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { uploadUrl, fileKey } = await res.json();

      // 2️⃣ Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": "application/pdf",
        },
      });

      // 3️⃣ Call summarize
const sumRes = await fetch(`${baseUrl}/summarize`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    bucket: "gofile-uploads-dev",
    key: fileKey,
  }),
});

if (!sumRes.ok) {
  const text = await sumRes.text();
  throw new Error(`Summarize failed: ${text}`);
}

const data = await sumRes.json();
setSummary(
  data.summary ||
  data.message ||
  JSON.stringify(data, null, 2)
);


    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">PDF Summarizer</h1>

      <input
        type="file"
        accept=".pdf"
        ref={fileRef}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-600 px-6 py-2 rounded"
      >
        {loading ? "Summarizing..." : "Upload & Summarize"}
      </button>

      {summary && (
        <div className="mt-6 bg-slate-900 p-4 rounded">
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="whitespace-pre-wrap">{summary}</p>
        </div>
      )}
    </div>
  );
}
