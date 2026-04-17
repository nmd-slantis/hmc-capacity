"use client";

import { useRef, useState } from "react";

interface FileUploadCellProps {
  rowId: string;
  fileUrl: string | null;
  fileName: string | null;
  onSaved: (url: string | null, name: string | null) => void;
}

export function FileUploadCell({ rowId, fileUrl, fileName, onSaved }: FileUploadCellProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) { alert("Upload failed — check Vercel Blob is configured."); return; }
      const { url, name } = await res.json();
      onSaved(url, name); // optimistic
      await fetch(`/api/planning/${rowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceOrderFileUrl: url, serviceOrderFileName: name }),
      });
    } finally {
      setUploading(false);
    }
  };

  const clear = async () => {
    onSaved(null, null); // optimistic
    await fetch(`/api/planning/${rowId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceOrderFileUrl: null, serviceOrderFileName: null }),
    });
  };

  if (fileUrl) {
    return (
      <div className="flex items-center gap-1 text-xs">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#FF7700] hover:underline truncate flex-1 min-w-0"
          title={fileName ?? fileUrl}
        >
          <span className="text-[11px] flex-shrink-0">📎</span>
          <span className="truncate">{fileName ?? "File"}</span>
        </a>
        <button
          onClick={clear}
          className="text-gray-400 hover:text-rose-500 flex-shrink-0 text-[10px]"
          title="Remove file"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-[10px] text-gray-400 hover:text-[#FF7700] flex items-center gap-1 transition-colors disabled:opacity-50"
      >
        <span>📎</span>
        <span>{uploading ? "Uploading…" : "Attach"}</span>
      </button>
    </>
  );
}
