"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/workspace/AppShell";
import {
  Settings,
  Users,
  Palette,
  CheckCircle2,
  LayoutTemplate,
  Code2,
  CreditCard,
  Sparkles,
  User,
  Shield,
  Bell,
  Building2,
  KeyRound,
  Copy,
  Check,
  Ban,
  Plus,
  Trash2,
} from "lucide-react";

const SETTINGS_NAV = [
  {
    group: "Team Settings",
    items: [
      { slug: "team/general", label: "General", icon: Settings },
      { slug: "team/members", label: "Members & Invites", icon: Users },
      { slug: "team/branding", label: "Custom Branding", icon: Palette },
      { slug: "team/statuses", label: "Workflow Statuses", icon: CheckCircle2 },
      {
        slug: "team/templates",
        label: "Storyboard Templates",
        icon: LayoutTemplate,
      },
      { slug: "team/api", label: "API & Webhooks", icon: Code2 },
      { slug: "team/billing", label: "Billing Details", icon: CreditCard },
      { slug: "billing/plan", label: "Plans & AI Credits", icon: Sparkles },
    ],
  },
  {
    group: "Personal Account",
    items: [
      { slug: "account/details", label: "Account Details", icon: User },
      { slug: "account/security", label: "Password & 2FA", icon: Shield },
      { slug: "account/notifications", label: "Notifications", icon: Bell },
      { slug: "account/teams", label: "Your Teams", icon: Building2 },
    ],
  },
];

export default function SettingsCatchAllPage() {
  const params = useParams<{ section: string[] }>();
  const router = useRouter();
  const rawRoute = (params.section || ["team", "general"]).join("/");
  const ROUTE_ALIASES: Record<string, string> = {
    "team/manage": "team/members",
    "team/users": "team/members",
    "team/domain": "team/branding",
    "team/connections": "team/branding",
    "team/usage": "billing/plan",
    "account/profile": "account/details",
    "account/password": "account/security",
    "account/notification": "account/notifications",
    "account/membership": "account/teams",
  };
  const activeRoute = ROUTE_ALIASES[rawRoute] || rawRoute;

  const [workspace, setWorkspace] = useState<any>(null);
  const [apiData, setApiData] = useState<{ apiKeys: any[]; webhooks: any[] }>({
    apiKeys: [],
    webhooks: [],
  });
  const [loading, setLoading] = useState(true);
  const [savedBanner, setSavedBanner] = useState("");

  // Team General & Branding states
  const [teamName, setTeamName] = useState("");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandDark, setBrandDark] = useState(false);
  const [brandFooter, setBrandFooter] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingDetails, setBillingDetails] = useState("");

  // Invite creation states
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("CREATOR");
  const [inviteMaxUses, setInviteMaxUses] = useState(1);
  const [inviteExpiresHours, setInviteExpiresHours] = useState(168);
  const [inviteNote, setInviteNote] = useState("");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Status & Template creation states
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#3B82F6");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateRatio, setNewTemplateRatio] = useState("16:9");

  // API & Webhooks states
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedRawKey, setGeneratedRawKey] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  // Account states
  const [accName, setAccName] = useState("");
  const [accUsername, setAccUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyStatus, setNotifyStatus] = useState(true);

  const loadAll = useCallback(async () => {
    const [wsRes, keysRes] = await Promise.all([
      fetch("/api/workspace"),
      fetch("/api/team/api-keys"),
    ]);
    if (wsRes.status === 401) {
      router.push("/login");
      return;
    }
    if (wsRes.ok) {
      const ws = await wsRes.json();
      setWorkspace(ws);
      setTeamName(ws.team?.name || "");
      setBrandLogo(ws.team?.logoUrl || "");
      setBrandDark(Boolean(ws.team?.brandDarkMode));
      setBrandFooter(ws.team?.customFooterText || "");
      setBillingEmail(ws.team?.billingEmail || "");
      setBillingDetails(ws.team?.billingDetails || "");
      setAccName(ws.user?.name || "");
      setAccUsername(ws.user?.username || "");
      setTwoFactor(Boolean(ws.user?.twoFactorEnabled));
      setNotifyComments(Boolean(ws.user?.notifyEmailComments ?? true));
      setNotifyMentions(Boolean(ws.user?.notifyEmailMentions ?? true));
      setNotifyStatus(Boolean(ws.user?.notifyEmailStatusChanges ?? true));
    }
    if (keysRes.ok) {
      setApiData(await keysRes.json());
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const flashSaved = (msg: string) => {
    setSavedBanner(msg);
    setTimeout(() => setSavedBanner(""), 3000);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: teamName,
        logoUrl: brandLogo || null,
        brandDarkMode: brandDark,
        customFooterText: brandFooter,
        billingEmail,
        billingDetails,
      }),
    });
    if (res.ok) {
      flashSaved("Team settings saved.");
      loadAll();
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteEmail.trim() || null,
        role: inviteRole,
        maxUses: Number(inviteMaxUses),
        expiresInHours: Number(inviteExpiresHours),
        note: inviteNote.trim() || null,
      }),
    });
    if (res.ok) {
      setInviteEmail("");
      setInviteNote("");
      flashSaved("Invitation code generated and logged.");
      loadAll();
    }
  };

  const handleRevokeInvite = async (id: string) => {
    const res = await fetch(`/api/invites/${id}`, { method: "PATCH" });
    if (res.ok) {
      flashSaved("Invitation code revoked.");
      loadAll();
    }
  };

  const handleUpdateMember = async (
    membershipId: string,
    patch: Record<string, unknown>
  ) => {
    const res = await fetch("/api/team/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipId, ...patch }),
    });
    if (res.ok) {
      flashSaved("Member permissions updated.");
      loadAll();
    }
  };

  const handleAddStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatusName.trim()) return;
    await fetch("/api/team/statuses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newStatusName.trim(),
        color: newStatusColor,
      }),
    });
    setNewStatusName("");
    loadAll();
  };

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    await fetch("/api/team/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTemplateName.trim(),
        aspectRatio: newTemplateRatio,
      }),
    });
    setNewTemplateName("");
    loadAll();
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/team/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "Studio API Key" }),
    });
    if (res.ok) {
      const data = await res.json();
      setGeneratedRawKey(data.rawKey);
      setNewKeyName("");
      loadAll();
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    const res = await fetch("/api/team/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "webhook", url: newWebhookUrl.trim() }),
    });
    if (res.ok) {
      setNewWebhookUrl("");
      loadAll();
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: accName,
        username: accUsername,
        ...(newPassword ? { newPassword } : {}),
        twoFactorEnabled: twoFactor,
        notifyEmailComments: notifyComments,
        notifyEmailMentions: notifyMentions,
        notifyEmailStatusChanges: notifyStatus,
      }),
    });
    if (res.ok) {
      setNewPassword("");
      flashSaved("Account settings updated.");
      loadAll();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F0] flex items-center justify-center text-sm text-[#5C5B57]">
        Loading Settings...
      </div>
    );
  }

  return (
    <AppShell
      user={workspace?.user}
      team={workspace?.team}
      role={workspace?.role}
      projects={workspace?.projects || []}
      notifications={workspace?.notifications || []}
      onRefresh={loadAll}
    >
      <div className="max-w-7xl mx-auto p-6 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Settings Left Navigation */}
        <aside className="md:col-span-3 space-y-6">
          {SETTINGS_NAV.map((group) => (
            <div key={group.group}>
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5C5B57] px-3 mb-2">
                {group.group}
              </h2>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeRoute === item.slug;
                  return (
                    <Link
                      key={item.slug}
                      href={`/settings/${item.slug}`}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        active
                          ? "bg-white text-[#121212] border border-[#E5E4DE] shadow-2xs"
                          : "text-[#5C5B57] hover:text-[#121212] hover:bg-black/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Settings Main Content */}
        <div className="md:col-span-9 space-y-6">
          {savedBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              {savedBanner}
            </div>
          )}

          {/* 1. Team General */}
          {activeRoute === "team/general" && (
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-5">
              <h1 className="text-xl font-bold">Team General Settings</h1>
              <form onSubmit={handleSaveTeam} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* 2. Team Members & Invite Codes */}
          {activeRoute === "team/members" && (
            <div className="space-y-6">
              {/* Generate Single-Use / Expiring Invitation Codes */}
              <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#D97706]" />
                  <h1 className="text-xl font-bold">
                    Invite-Only Registration Codes
                  </h1>
                </div>
                <p className="text-xs text-[#5C5B57]">
                  Generate single-use or expiring invitation codes for new team
                  members. Every code creation, redemption, and revocation is
                  recorded in the Audit Log.
                </p>

                <form
                  onSubmit={handleCreateInvite}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2"
                >
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#5C5B57] mb-1">
                      Restrict Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@studio.com"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#5C5B57] mb-1">
                      Assigned Role
                    </label>
                    <select
                      aria-label="Invite Role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-semibold"
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="CREATOR">Creator</option>
                      <option value="MEMBER">Member</option>
                      <option value="REVIEWER">Reviewer (Read/Comment)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#5C5B57] mb-1">
                      Max Uses
                    </label>
                    <select
                      aria-label="Invite Max Uses"
                      value={inviteMaxUses}
                      onChange={(e) => setInviteMaxUses(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-semibold"
                    >
                      <option value={1}>Single-use (1 use)</option>
                      <option value={5}>Multi-use (5 uses)</option>
                      <option value={10}>Studio batch (10 uses)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-[#5C5B57] mb-1">
                      Expiration
                    </label>
                    <select
                      aria-label="Invite Expiration"
                      value={inviteExpiresHours}
                      onChange={(e) =>
                        setInviteExpiresHours(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs font-semibold"
                    >
                      <option value={24}>Expires in 24 hours</option>
                      <option value={168}>Expires in 7 days</option>
                      <option value={720}>Expires in 30 days</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={inviteNote}
                      onChange={(e) => setInviteNote(e.target.value)}
                      placeholder="Optional note (e.g. Freelance storyboard artist for Q4 shoot)"
                      className="w-full px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                    />
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-xl bg-[#121212] text-white text-xs font-semibold hover:bg-black/90"
                    >
                      Generate Invite Code
                    </button>
                  </div>
                </form>

                {/* Active & Historical Invites Table */}
                <div className="mt-6 border border-[#E5E4DE] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F2F2EE] border-b border-[#E5E4DE] uppercase text-[#5C5B57]">
                      <tr>
                        <th className="py-2.5 px-3">Invitation Code</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3">Uses</th>
                        <th className="py-2.5 px-3">Status / Expires</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E4DE]">
                      {(workspace?.invites || []).map((inv: any) => {
                        const isRevoked = Boolean(inv.revokedAt);
                        const isExhausted = inv.usedCount >= inv.maxUses;
                        const isExpired =
                          new Date(inv.expiresAt).getTime() < Date.now();
                        const statusLabel = isRevoked
                          ? "Revoked"
                          : isExhausted
                          ? "Redeemed"
                          : isExpired
                          ? "Expired"
                          : "Active";

                        return (
                          <tr key={inv.id}>
                            <td className="py-2.5 px-3 font-mono font-semibold">
                              <div>{inv.code}</div>
                              {inv.email && (
                                <div className="text-[11px] text-[#5C5B57]">
                                  Locked to: {inv.email}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">
                              {inv.role}
                            </td>
                            <td className="py-2.5 px-3">
                              {inv.usedCount} / {inv.maxUses}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  statusLabel === "Active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : statusLabel === "Redeemed"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (navigator.clipboard) {
                                    await navigator.clipboard.writeText(
                                      inv.code
                                    );
                                  }
                                  setCopiedCodeId(inv.id);
                                  setTimeout(() => setCopiedCodeId(null), 2000);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-[#E5E4DE] inline-flex items-center gap-1 hover:bg-[#F6F6F0]"
                              >
                                {copiedCodeId === inv.id ? (
                                  <>
                                    <Check className="w-3 h-3" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy
                                  </>
                                )}
                              </button>
                              {statusLabel === "Active" && (
                                <button
                                  type="button"
                                  onClick={() => handleRevokeInvite(inv.id)}
                                  className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 inline-flex items-center gap-1 hover:bg-red-100"
                                >
                                  <Ban className="w-3 h-3" /> Revoke
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Team Members Table */}
              <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold">
                  Workspace Members ({(workspace?.memberships || []).length})
                </h2>
                <div className="divide-y divide-[#E5E4DE]">
                  {(workspace?.memberships || []).map((m: any) => (
                    <div
                      key={m.id}
                      className="py-3 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm">
                          {m.user?.name}{" "}
                          {m.revokedAt && (
                            <span className="text-xs text-red-600">
                              (Access Revoked)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#5C5B57]">
                          {m.user?.email}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Role for ${m.user?.email}`}
                          disabled={m.role === "OWNER"}
                          value={m.role}
                          onChange={(e) =>
                            handleUpdateMember(m.id, { role: e.target.value })
                          }
                          className="px-3 py-1.5 rounded-xl border border-[#E5E4DE] bg-white text-xs font-semibold"
                        >
                          <option value="OWNER">Owner</option>
                          <option value="ADMIN">Admin</option>
                          <option value="CREATOR">Creator</option>
                          <option value="MEMBER">Member</option>
                          <option value="REVIEWER">Reviewer</option>
                        </select>

                        {m.role !== "OWNER" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateMember(m.id, {
                                revoke: !m.revokedAt,
                              })
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                              m.revokedAt
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {m.revokedAt ? "Restore Access" : "Revoke Member"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. Custom Branding */}
          {activeRoute === "team/branding" && (
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-4">
              <h1 className="text-xl font-bold">Custom Branding</h1>
              <form onSubmit={handleSaveTeam} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#5C5B57] mb-1">
                    Custom Studio Logo URL
                  </label>
                  <input
                    type="text"
                    value={brandLogo}
                    onChange={(e) => setBrandLogo(e.target.value)}
                    placeholder="https://studio.com/logo.svg"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                </div>
                <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                  <span>Enable Dark Mode on shared client links</span>
                  <input
                    type="checkbox"
                    checked={brandDark}
                    onChange={(e) => setBrandDark(e.target.checked)}
                  />
                </label>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#5C5B57] mb-1">
                    Custom Share Link Footer Text
                  </label>
                  <input
                    type="text"
                    value={brandFooter}
                    onChange={(e) => setBrandFooter(e.target.value)}
                    placeholder="Confidential — Property of Studio"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                >
                  Save Branding
                </button>
              </form>
            </div>
          )}

          {/* 4. Workflow Statuses */}
          {activeRoute === "team/statuses" && (
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-5">
              <h1 className="text-xl font-bold">Workflow Statuses</h1>
              <div className="space-y-2">
                {(workspace?.statuses || []).map((st: any) => (
                  <div
                    key={st.id}
                    className="p-3 rounded-xl border border-[#E5E4DE] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: st.color }}
                      />
                      <div>
                        <div className="font-bold text-sm">{st.name}</div>
                        <div className="text-xs text-[#5C5B57]">
                          {st.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddStatus} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  placeholder="New status name (e.g. Client Signed Off)"
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                />
                <input
                  type="color"
                  value={newStatusColor}
                  onChange={(e) => setNewStatusColor(e.target.value)}
                  className="w-10 h-9 rounded-lg border border-[#E5E4DE]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Status
                </button>
              </form>
            </div>
          )}

          {/* 5. Storyboard Templates */}
          {activeRoute === "team/templates" && (
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-5">
              <h1 className="text-xl font-bold">Storyboard Templates</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(workspace?.templates || []).map((tpl: any) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-xl border border-[#E5E4DE] flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-sm">{tpl.name}</div>
                      <div className="text-xs text-[#5C5B57]">
                        Aspect Ratio: {tpl.aspectRatio} • Numbering:{" "}
                        {tpl.frameNumberFormat}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddTemplate} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Template name (e.g. Cinema Anamorphic)"
                  className="flex-1 px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                />
                <select
                  value={newTemplateRatio}
                  onChange={(e) => setNewTemplateRatio(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-[#E5E4DE] bg-white text-xs"
                >
                  <option value="16:9">16:9</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                  <option value="4:5">4:5</option>
                  <option value="2.39:1">2.39:1</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                >
                  Create Template
                </button>
              </form>
            </div>
          )}

          {/* 6. API Keys & Webhooks */}
          {activeRoute === "team/api" && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-4">
                <h1 className="text-xl font-bold">API Keys</h1>
                {generatedRawKey && (
                  <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#F4BD64] text-xs">
                    <div className="font-bold">
                      Copy your new API key now (shown once):
                    </div>
                    <div className="font-mono mt-1 select-all">
                      {generatedRawKey}
                    </div>
                  </div>
                )}
                <form onSubmit={handleCreateApiKey} className="flex gap-2">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="Key label (e.g. CI Pipeline)"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                  >
                    Create API Key
                  </button>
                </form>

                <div className="divide-y divide-[#E5E4DE] text-xs">
                  {apiData.apiKeys.map((k: any) => (
                    <div
                      key={k.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold">{k.name}</span>{" "}
                        <span className="font-mono text-[#5C5B57]">
                          ({k.keyPrefix})
                        </span>
                      </div>
                      <span className="text-[#5C5B57]">
                        {k.revokedAt ? "Revoked" : "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-bold">Webhooks</h2>
                <form onSubmit={handleCreateWebhook} className="flex gap-2">
                  <input
                    type="url"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                    placeholder="https://api.yourstudio.com/webhooks/boords"
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                  >
                    Add Webhook
                  </button>
                </form>
                <div className="divide-y divide-[#E5E4DE] text-xs">
                  {apiData.webhooks.map((wh: any) => (
                    <div
                      key={wh.id}
                      className="py-2.5 flex items-center justify-between"
                    >
                      <span className="font-mono">{wh.url}</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetch(
                            `/api/team/api-keys?id=${wh.id}&type=webhook`,
                            { method: "DELETE" }
                          );
                          loadAll();
                        }}
                        className="text-red-600 hover:underline inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7. Billing Details & 8. Plan */}
          {(activeRoute === "team/billing" ||
            activeRoute === "billing/plan") && (
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-5">
              <h1 className="text-xl font-bold">
                Subscription Plan & Billing Details
              </h1>
              <div className="p-4 rounded-xl bg-[#F6F6F0] border border-[#E5E4DE] flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase font-bold text-[#5C5B57]">
                    Current Plan
                  </div>
                  <div className="text-lg font-bold">
                    {workspace?.team?.planName || "Free"} Plan
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#5C5B57]">AI Credits</div>
                  <div className="font-bold text-sm">
                    {workspace?.team?.aiCreditsRemaining ?? 30} /{" "}
                    {workspace?.team?.aiCreditsTotal ?? 30}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveTeam} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#5C5B57] mb-1">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    value={billingEmail}
                    onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="finance@studio.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#5C5B57] mb-1">
                    Company Address & VAT Details
                  </label>
                  <textarea
                    rows={3}
                    value={billingDetails}
                    onChange={(e) => setBillingDetails(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                >
                  Save Billing Details
                </button>
              </form>
            </div>
          )}

          {/* 9-12. Account Settings */}
          {activeRoute.startsWith("account/") && (
            <div className="bg-white border border-[#E5E4DE] rounded-2xl p-6 space-y-5">
              <h1 className="text-xl font-bold">Personal Account Settings</h1>
              <form onSubmit={handleSaveAccount} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#5C5B57] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#5C5B57] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={accUsername}
                    onChange={(e) => setAccUsername(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#5C5B57] mb-1">
                    Change Password (optional)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E5E4DE] text-xs"
                  />
                </div>
                <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                  <span>Two-Factor Authentication (2FA)</span>
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={(e) => setTwoFactor(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between text-xs font-semibold cursor-pointer">
                  <span>Email notifications for new comments</span>
                  <input
                    type="checkbox"
                    checked={notifyComments}
                    onChange={(e) => setNotifyComments(e.target.checked)}
                  />
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold"
                >
                  Save Account Settings
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
