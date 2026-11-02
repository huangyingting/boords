"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FileText } from "lucide-react";

export default function SharedScriptPage() {
  const params = useParams<{ shortSlug: string }>();
  const [script, setScript] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/share/script/${params.shortSlug}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          setError(data.error || "Shared script not found");
        } else {
          setScript(data.script);
        }
      })
      .catch(() => setError("Failed to load shared script"));
  }, [params.shortSlug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        {error}
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading shared script...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F0] text-[#121212]">
      <header className="h-14 px-6 bg-white border-b border-[#E5E4DE] flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm">
          <FileText className="w-4 h-4 text-[#D97706]" />
          <span>{script.title}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#F2F2EE] text-xs">
            {script.status}
          </span>
        </div>
        <span className="text-xs text-[#5C5B57]">
          Shared by {script.team?.name}
        </span>
      </header>

      <main className="max-w-4xl mx-auto p-6 md:p-10">
        <div className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F2EE] border-b border-[#E5E4DE] text-xs uppercase text-[#5C5B57]">
              <tr>
                <th className="py-3 px-4 w-40">SCENE</th>
                <th className="py-3 px-4">AUDIO / VOICEOVER</th>
                <th className="py-3 px-4">VISUAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E4DE]">
              {(script.scenes || []).map((scene: any, idx: number) => (
                <tr key={scene.id || idx}>
                  <td className="py-3 px-4 font-semibold text-xs">
                    {scene.sceneTitle}
                  </td>
                  <td className="py-3 px-4 text-xs">{scene.audioText}</td>
                  <td className="py-3 px-4 text-xs text-[#5C5B57]">
                    {scene.visualText}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
