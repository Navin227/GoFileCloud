import { useRef, useState } from "react";
// @ts-ignore
import { fetchAuthSession } from "aws-amplify/auth";

type SplitType = "range" | "pages";

interface SplitDef {
  id: string;
  type: SplitType;
  from?: number;
  to?: number;
  pages?: string; // comma-separated input
  name?: string;
}

export default function Splitter() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [splits, setSplits] = useState<SplitDef[]>([
    { id: crypto.randomUUID(), type: "range", from: 1, to: 1, name: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ name: string; url: string }[]>([]);

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  // ---------- helpers ----------
  const addSplit = () => {
    setSplits([
      ...splits,
      { id: crypto.randomUUID(), type: "range", from: 1, to: 1, name: "" }
    ]);
  };

  const removeSplit = (id: string) => {
    setSplits(splits.filter(s => s.id !== id));
  };

  const updateSplit = (id: string, patch: Partial<SplitDef>) => {
    setSplits(splits.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  // ---------- submit ----------
  const handleSplit = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Select a PDF");

    setLoading(true);
    setResults([]);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken;

      // 1️⃣ get upload URL
      const urlRes = await fetch(
        `${baseUrl}/upload-url?filename=${file.name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { uploadUrl, fileKey } = await urlRes.json();

      // 2️⃣ upload PDF
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": "application/pdf" }
      });

      // 3️⃣ build split payload dynamically
      const payload = {
        bucket: "gofile-uploads-dev",
        key: fileKey,
        splits: splits.map((s) => {
          if (s.type === "range") {
            return {
              type: "range",
              from: Number(s.from),
              to: Number(s.to),
              name: s.name || undefined
            };
          }
          return {
            type: "pages",
            pages: (s.pages || "")
              .split(",")
              .map(p => Number(p.trim()))
              .filter(Boolean),
            name: s.name || undefined
          };
        })
      };

      // 4️⃣ call /split
      const res = await fetch(`${baseUrl}/split`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      setResults(data.files || []);

    } catch (err) {
      console.error(err);
      alert("Split failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="p-8 max-w-4xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">PDF Splitter</h1>

      <input type="file" accept=".pdf" ref={fileRef} className="mb-6" />

      <div className="space-y-4">
        {splits.map((s, idx) => (
          <div key={s.id} className="bg-slate-900 p-4 rounded space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Split {idx + 1}</h3>
              {splits.length > 1 && (
                <button
                  onClick={() => removeSplit(s.id)}
                  className="text-red-400 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <select
              value={s.type}
              onChange={e =>
                updateSplit(s.id, { type: e.target.value as SplitType })
              }
              className="bg-slate-800 p-2 rounded w-full"
            >
              <option value="range">Page Range</option>
              <option value="pages">Custom Pages</option>
            </select>

            {s.type === "range" ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="From"
                  value={s.from}
                  onChange={e =>
                    updateSplit(s.id, { from: Number(e.target.value) })
                  }
                  className="bg-slate-800 p-2 rounded w-full"
                />
                <input
                  type="number"
                  placeholder="To"
                  value={s.to}
                  onChange={e =>
                    updateSplit(s.id, { to: Number(e.target.value) })
                  }
                  className="bg-slate-800 p-2 rounded w-full"
                />
              </div>
            ) : (
              <input
                type="text"
                placeholder="Pages (e.g. 1,4,5,8)"
                value={s.pages}
                onChange={e =>
                  updateSplit(s.id, { pages: e.target.value })
                }
                className="bg-slate-800 p-2 rounded w-full"
              />
            )}

            <input
              type="text"
              placeholder="Output name (optional)"
              value={s.name}
              onChange={e =>
                updateSplit(s.id, { name: e.target.value })
              }
              className="bg-slate-800 p-2 rounded w-full"
            />
          </div>
        ))}
      </div>

      <button
        onClick={addSplit}
        className="mt-4 bg-slate-700 px-4 py-2 rounded"
      >
        + Add Split
      </button>

      <button
        onClick={handleSplit}
        disabled={loading}
        className="block mt-6 bg-blue-600 px-6 py-2 rounded"
      >
        {loading ? "Splitting..." : "Split PDF"}
      </button>

      {results.length > 0 && (
        <div className="mt-8 space-y-2">
          <h2 className="font-semibold">Downloads</h2>
          {results.map((f, i) => (
            <a
              key={i}
              href={f.url}
              target="_blank"
              rel="noreferrer"
              className="block text-blue-400 underline"
            >
              {f.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
