"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/workspace/AppShell";
import { Activity, ShieldCheck, Filter } from "lucide-react";

export default function ActivityPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedDays, setSelectedDays] = useState("30");

  const loadWorkspace = useCallback(async () => {
    const res = await fetch("/api/workspace");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) {
      setWorkspace(await res.json());
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading Activity & Audit Logs...
      </div>
    );
  }

  const logs = (workspace?.auditLogs || []).filter((log: any) => {
    if (selectedProjectId && log.projectId !== selectedProjectId) return false;
    if (selectedAction && !log.action.includes(selectedAction)) return false;
    return true;
  });

  return (
    <AppShell
      user={workspace?.user}
      team={workspace?.team}
      role={workspace?.role}
      projects={workspace?.projects || []}
      notifications={workspace?.notifications || []}
      onRefresh={loadWorkspace}
    >
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-[#D97706]" />
              Activity & Audit Log
            </h1>
            <p className="text-sm text-[#5C5B57] mt-1">
              Complete security and collaboration audit trail across your studio
              workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-[#5C5B57]" />
            <select
              aria-label="Filter by project"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-medium"
            >
              <option value="">All projects</option>
              {(workspace?.projects || []).map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by event type"
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-medium"
            >
              <option value="">All types</option>
              <option value="auth">Authentication</option>
              <option value="invite">Invitation Codes</option>
              <option value="member">Role & Member Changes</option>
              <option value="storyboard">Storyboards</option>
              <option value="script">Scripts</option>
              <option value="comment">Comments</option>
            </select>

            <select
              aria-label="Filter by timeframe"
              value={selectedDays}
              onChange={(e) => setSelectedDays(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-medium"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="bg-white border border-[#E5E4DE] rounded-2xl overflow-hidden shadow-2xs">
          {logs.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#5C5B57]">
              No matching activity events found.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E4DE]">
              {logs.map((log: any) => {
                let meta: Record<string, any> = {};
                try {
                  meta = JSON.parse(log.metadataJson || "{}");
                } catch {}

                return (
                  <div
                    key={log.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F6F6F0]/60 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#121212] flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#F2F2EE]">
                            {log.action}
                          </span>
                          <span>
                            by{" "}
                            {log.actor?.name ||
                              log.actorEmail ||
                              "System / Guest"}
                          </span>
                        </div>
                        {Object.keys(meta).length > 0 && (
                          <div className="text-xs text-[#5C5B57] mt-1 font-mono">
                            {JSON.stringify(meta)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-[#5C5B57] shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
