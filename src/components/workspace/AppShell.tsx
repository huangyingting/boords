"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  Images,
  Activity,
  Users,
  Archive,
  Plus,
  Search,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Folder,
  Sparkles,
  Menu,
  X,
  Film,
  FileText,
  KeyRound,
} from "lucide-react";

export interface WorkspaceProject {
  id: string;
  slug: string;
  name: string;
  isArchived: boolean;
  isShared?: boolean;
  shareSlug?: string | null;
  _count?: { storyboards: number; scripts: number };
}

export interface WorkspaceNotification {
  id: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AppShellProps {
  children: React.ReactNode;
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
  } | null;
  team?: {
    id: string;
    hashId: string;
    name: string;
    planName: string;
    aiCreditsRemaining: number;
    aiCreditsTotal: number;
  } | null;
  role?: string;
  projects?: WorkspaceProject[];
  notifications?: WorkspaceNotification[];
  onProjectCreated?: (project: WorkspaceProject) => void;
  onRefresh?: () => void;
}

export function AppShell({
  children,
  user,
  team,
  role = "OWNER",
  projects = [],
  notifications = [],
  onProjectCreated,
  onRefresh,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [teamMenuOpen, setTeamMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"unread" | "all">("unread");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingProject, setCreatingProject] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeProjects = projects.filter((p) => !p.isArchived);
  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const displayedNotifs =
    notifTab === "unread" ? unreadNotifs : notifications;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setCreatingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewProjectName("");
        setNewProjectModalOpen(false);
        if (onProjectCreated) {
          onProjectCreated(data.project);
        } else if (onRefresh) {
          onRefresh();
        } else {
          router.push(`/p/${data.project.slug}`);
        }
      }
    } finally {
      setCreatingProject(false);
    }
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    if (onRefresh) onRefresh();
  };

  const navItems = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/library", label: "Assets", icon: Images },
    { href: "/activity", label: "Activity", icon: Activity },
    { href: "/settings/team/members", label: "Team", icon: Users },
    { href: "/archive", label: "Archive", icon: Archive },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#F2F2EE] border-r border-[#E5E4DE] w-[260px] select-none">
      {/* Team Switcher Header */}
      <div className="p-3.5 border-b border-[#E5E4DE] relative">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setTeamMenuOpen((v) => !v)}
            className="flex-1 flex items-center justify-between px-2.5 py-2 rounded-xl hover:bg-black/5 transition text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#121212] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {(team?.name || "B").slice(0, 1).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-sm font-semibold text-[#121212] truncate">
                  {team?.name || "Studio Workspace"}
                </div>
                <div className="text-[11px] text-[#5C5B57] uppercase tracking-wider">
                  {role} • {team?.planName || "Free"}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-[#5C5B57] shrink-0" />
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-black/5 text-[#5C5B57] hover:text-[#121212] transition"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D97706]" />
            )}
          </button>
        </div>

        {teamMenuOpen && (
          <div className="absolute left-3.5 right-3.5 top-16 z-50 bg-white border border-[#E5E4DE] rounded-2xl shadow-lg p-1.5 text-sm">
            <Link
              href="/settings/team/general"
              onClick={() => setTeamMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F6F6F0]"
            >
              <Settings className="w-4 h-4 text-[#5C5B57]" />
              <span>Team settings</span>
            </Link>
            <Link
              href="/settings/team/members"
              onClick={() => setTeamMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F6F6F0]"
            >
              <KeyRound className="w-4 h-4 text-[#5C5B57]" />
              <span>Members & Invite Codes</span>
            </Link>
            <Link
              href="/settings/account/details"
              onClick={() => setTeamMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F6F6F0]"
            >
              <Users className="w-4 h-4 text-[#5C5B57]" />
              <span>Account settings</span>
            </Link>
            <div className="my-1 border-t border-[#E5E4DE]" />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* Notifications Popover */}
        {notifOpen && (
          <div className="absolute left-3.5 top-16 w-80 z-50 bg-white border border-[#E5E4DE] rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm">Notifications</span>
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-xs text-[#5C5B57] hover:text-[#121212] underline"
              >
                Mark all read
              </button>
            </div>
            <div className="flex gap-1 p-1 rounded-xl bg-[#F2F2EE] mb-3 text-xs font-medium">
              <button
                type="button"
                onClick={() => setNotifTab("unread")}
                className={`flex-1 py-1 rounded-lg ${
                  notifTab === "unread"
                    ? "bg-white text-[#121212] shadow-2xs"
                    : "text-[#5C5B57]"
                }`}
              >
                Unread ({unreadNotifs.length})
              </button>
              <button
                type="button"
                onClick={() => setNotifTab("all")}
                className={`flex-1 py-1 rounded-lg ${
                  notifTab === "all"
                    ? "bg-white text-[#121212] shadow-2xs"
                    : "text-[#5C5B57]"
                }`}
              >
                All ({notifications.length})
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {displayedNotifs.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5C5B57]">
                  You have no {notifTab === "unread" ? "unread " : ""}
                  notifications.
                </div>
              ) : (
                displayedNotifs.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-[#F6F6F0] text-xs"
                  >
                    <div className="font-semibold text-[#121212]">{n.title}</div>
                    <div className="text-[#5C5B57] mt-0.5">{n.message}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Search Button */}
      <div className="px-3.5 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#E5E4DE] text-xs text-[#5C5B57] hover:border-[#121212]/40 transition"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-[#F2F2EE] text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${
                active
                  ? "bg-white text-[#121212] shadow-2xs font-semibold"
                  : "text-[#5C5B57] hover:text-[#121212] hover:bg-black/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Projects Section */}
      <div className="mt-4 px-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C5B57]">
            Projects
          </span>
          {role !== "REVIEWER" && (
            <button
              type="button"
              aria-label="New Project"
              onClick={() => setNewProjectModalOpen(true)}
              className="p-1 rounded-lg hover:bg-black/10 text-[#5C5B57] hover:text-[#121212] transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="mt-1 space-y-0.5">
          {activeProjects.length === 0 ? (
            <div className="px-3 py-3 text-xs text-[#5C5B57]">
              No projects yet.
            </div>
          ) : (
            activeProjects.map((project) => {
              const active = pathname === `/p/${project.slug}`;
              return (
                <Link
                  key={project.id}
                  href={`/p/${project.slug}`}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition ${
                    active
                      ? "bg-white text-[#121212] font-semibold shadow-2xs"
                      : "text-[#5C5B57] hover:text-[#121212] hover:bg-black/5"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Folder className="w-4 h-4 shrink-0 text-[#D97706]" />
                    <span className="truncate">{project.name}</span>
                  </span>
                  {project._count && (
                    <span className="text-[11px] text-[#5C5B57]">
                      {(project._count.storyboards || 0) +
                        (project._count.scripts || 0)}
                    </span>
                  )}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom AI Credits & User Footer */}
      <div className="p-3.5 border-t border-[#E5E4DE] space-y-3">
        <div className="p-3 rounded-xl bg-white border border-[#E5E4DE]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              AI credits
            </span>
            <span className="text-[#5C5B57]">
              {team?.aiCreditsRemaining ?? 30} credits left
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-[#F2F2EE] overflow-hidden">
            <div
              className="h-full bg-[#F4BD64]"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    ((team?.aiCreditsRemaining ?? 30) /
                      Math.max(1, team?.aiCreditsTotal ?? 30)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
          <Link
            href="/settings/billing/plan"
            className="mt-2.5 block w-full py-1.5 rounded-lg bg-[#121212] text-white text-center text-xs font-semibold hover:bg-black/90 transition"
          >
            Upgrade
          </Link>
        </div>

        <div className="flex items-center justify-between px-1 text-xs text-[#5C5B57]">
          <div className="truncate">
            <div className="font-semibold text-[#121212] truncate">
              {user?.name || "Workspace User"}
            </div>
            <div className="truncate text-[11px]">{user?.email}</div>
          </div>
          <Link
            href="/settings/account/details"
            aria-label="Account Settings"
            className="p-1.5 rounded-lg hover:bg-black/5 text-[#5C5B57] hover:text-[#121212]"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F6F6F0] text-[#121212]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block shrink-0">{SidebarContent()}</aside>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 flex">{SidebarContent()}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="md:hidden h-14 px-4 border-b border-[#E5E4DE] bg-[#F2F2EE] flex items-center justify-between">
          <button
            type="button"
            aria-label="Open Navigation"
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#E5E4DE]"
          >
            <Menu className="w-4 h-4" />
          </button>
          <span className="font-bold text-sm">
            {team?.name || "Boords Workspace"}
          </span>
          <Link
            href="/settings/team/members"
            className="px-2.5 py-1.5 rounded-lg bg-[#121212] text-white text-xs font-medium"
          >
            Team
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      {/* New Project Modal */}
      {newProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New project</h2>
              <button
                type="button"
                onClick={() => setNewProjectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F2F2EE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label
                  htmlFor="new-project-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#5C5B57] mb-1.5"
                >
                  Project Name
                </label>
                <input
                  id="new-project-name"
                  type="text"
                  required
                  autoFocus
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Nike Summer Campaign"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5E4DE] bg-[#F6F6F0]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#121212]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E4DE] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="px-4 py-2 rounded-xl bg-[#121212] text-white text-xs font-semibold hover:bg-black/90 disabled:opacity-50"
                >
                  {creatingProject ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Command Palette Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center pt-20 p-4">
          <div className="bg-white border border-[#E5E4DE] rounded-2xl shadow-xl max-w-lg w-full p-4">
            <div className="flex items-center gap-2 border-b border-[#E5E4DE] pb-3">
              <Search className="w-4 h-4 text-[#5C5B57]" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Jump to project, storyboard, script, or setting..."
                className="flex-1 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="text-xs text-[#5C5B57] px-2 py-0.5 rounded bg-[#F2F2EE]"
              >
                ESC
              </button>
            </div>

            <div className="mt-3 max-h-72 overflow-y-auto space-y-1">
              {activeProjects
                .filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((p) => (
                  <Link
                    key={p.id}
                    href={`/p/${p.slug}`}
                    onClick={() => setSearchModalOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F6F6F0] text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <Folder className="w-4 h-4 text-[#D97706]" />
                      {p.name}
                    </span>
                    <span className="text-xs text-[#5C5B57]">Project</span>
                  </Link>
                ))}
              <Link
                href="/dashboard"
                onClick={() => setSearchModalOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F6F6F0] text-sm"
              >
                <span className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#5C5B57]" />
                  All Storyboards & Scripts
                </span>
                <span className="text-xs text-[#5C5B57]">Home</span>
              </Link>
              <Link
                href="/library"
                onClick={() => setSearchModalOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F6F6F0] text-sm"
              >
                <span className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-[#5C5B57]" />
                  Asset Library & Playground
                </span>
                <span className="text-xs text-[#5C5B57]">Assets</span>
              </Link>
              <Link
                href="/settings/team/members"
                onClick={() => setSearchModalOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#F6F6F0] text-sm"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#5C5B57]" />
                  Team Members & Invitation Codes
                </span>
                <span className="text-xs text-[#5C5B57]">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
