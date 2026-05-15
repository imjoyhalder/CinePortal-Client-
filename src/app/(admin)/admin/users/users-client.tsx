"use client";

import { useState, useEffect } from "react";
import {
  FiShield, FiUser, FiTrash2, FiSearch, FiX,
  FiSlash, FiCheckCircle, FiChevronUp, FiChevronDown,
} from "react-icons/fi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { ApiResponse, User } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type SortField = "name" | "reviews" | "createdAt";
type SortOrder = "asc" | "desc";

interface UsersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary?: { total: number; active: number; banned: number; admins: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PLAN_STYLE: Record<string, string> = {
  MONTHLY: "bg-green-500/10 text-green-600 border-green-500/30",
  YEARLY:  "bg-purple-500/10 text-purple-600 border-purple-500/30",
  FREE:    "",
};
const PLAN_LABEL: Record<string, string> = { MONTHLY: "Monthly", YEARLY: "Yearly", FREE: "Free", ADMIN: "Admin" };

function SortableHeader({ label, field, current, order, onSort }: {
  label: string; field: SortField; current: SortField; order: SortOrder; onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wide select-none hover:text-foreground transition-colors">
      {label}
      {active && order === "asc"
        ? <FiChevronUp className="w-3 h-3 text-primary" />
        : active
        ? <FiChevronDown className="w-3 h-3 text-primary" />
        : <span className="flex flex-col opacity-40"><FiChevronUp className="w-2.5 h-2.5 -mb-0.5" /><FiChevronDown className="w-2.5 h-2.5" /></span>
      }
    </button>
  );
}

function PaginationBar({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }
  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e-${i}`} className="px-2 text-muted-foreground text-sm">…</span>
          : <Button key={p} size="sm" variant={p === page ? "default" : "outline"} className="w-9" onClick={() => onChange(p as number)}>{p}</Button>
      )}
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const LIMIT = 20;

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  variant: "destructive" | "default";
  onConfirm: () => Promise<void>;
}

const CONFIRM_CLOSED: ConfirmState = {
  open: false, title: "", description: "", confirmLabel: "Confirm", variant: "destructive", onConfirm: async () => {},
};

export default function AdminUsersClient() {
  const [users, setUsers]     = useState<User[]>([]);
  const [meta, setMeta]       = useState<UsersMeta | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(CONFIRM_CLOSED);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [debouncedSearch, setDeb] = useState("");
  const [roleFilter, setRoleFilter]   = useState("ALL");
  const [bannedFilter, setBannedFilter] = useState("ALL");
  const [sortField, setSortField]   = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder]   = useState<SortOrder>("desc");

  // Derived loading — no synchronous setState in effect
  const requestKey = `${page}|${roleFilter}|${bannedFilter}|${debouncedSearch}|${sortField}|${sortOrder}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const loading = requestKey !== loadedKey;

  useEffect(() => {
    const t = setTimeout(() => { setDeb(search); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), sortBy: sortField, sortOrder });
    if (roleFilter   !== "ALL") params.set("role",   roleFilter);
    if (bannedFilter === "active") params.set("banned", "false");
    if (bannedFilter === "banned") params.set("banned", "true");
    if (debouncedSearch) params.set("search", debouncedSearch);

    api.get<ApiResponse<User[]>>(`/admin/users?${params}`)
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data ?? []);
        setMeta((res.meta as unknown as UsersMeta) ?? null);
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setUsers([]);
        setLoadedKey(requestKey);
        toast.error(err instanceof Error ? err.message : "Failed to load users");
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  function handleSort(field: SortField) {
    if (field === sortField) setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortOrder("desc"); }
    setPage(1);
  }

  function runConfirm(state: Omit<ConfirmState, "open">) {
    setConfirmState({ ...state, open: true });
  }

  async function executeConfirm() {
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
      setConfirmState(CONFIRM_CLOSED);
    } finally {
      setConfirmLoading(false);
    }
  }

  function promptToggleRole(user: User) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    runConfirm({
      title: newRole === "ADMIN" ? "Make Admin" : "Remove Admin",
      description: newRole === "ADMIN"
        ? `Grant admin access to ${user.name}? They will have full control over the platform.`
        : `Remove admin access from ${user.name}? They will revert to a regular user.`,
      confirmLabel: newRole === "ADMIN" ? "Make Admin" : "Remove Admin",
      variant: newRole === "ADMIN" ? "default" : "destructive",
      onConfirm: async () => {
        await api.patch(`/admin/users/${user.id}/role`, { role: newRole });
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
        toast.success(`${user.name} is now ${newRole}`);
      },
    });
  }

  function promptToggleBan(user: User) {
    const banned = !user.banned;
    runConfirm({
      title: banned ? "Ban User" : "Unban User",
      description: banned
        ? `Ban ${user.name}? They will be blocked from accessing the platform.`
        : `Unban ${user.name}? They will regain access to the platform.`,
      confirmLabel: banned ? "Ban User" : "Unban User",
      variant: banned ? "destructive" : "default",
      onConfirm: async () => {
        await api.patch(`/admin/users/${user.id}/ban`, { banned });
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, banned } : u));
        toast.success(`${user.name} has been ${banned ? "banned" : "unbanned"}`);
      },
    });
  }

  function promptDeleteUser(user: User) {
    runConfirm({
      title: "Delete User",
      description: `Permanently delete "${user.name}" (${user.email})? All their reviews, comments and data will be removed. This cannot be undone.`,
      confirmLabel: "Delete User",
      variant: "destructive",
      onConfirm: async () => {
        await api.delete(`/admin/users/${user.id}`);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        toast.success(`${user.name} deleted`);
      },
    });
  }

  const summary = meta?.summary;
  const totalPages = meta?.totalPages ?? 1;
  const filteredTotal = meta?.total ?? 0;
  const startIndex = (page - 1) * LIMIT;
  const hasFilters = search || roleFilter !== "ALL" || bannedFilter !== "ALL";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-sm text-muted-foreground">{summary?.total ?? 0} registered users</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Users",   value: summary?.total,  color: "text-foreground",     bg: "bg-muted/30",             border: "border-border/40"        },
          { label: "Active Users",  value: summary?.active, color: "text-green-600",       bg: "bg-green-500/5",          border: "border-green-500/20"     },
          { label: "Banned Users",  value: summary?.banned, color: "text-destructive",     bg: "bg-destructive/5",        border: "border-destructive/20"   },
          { label: "Admin Users",   value: summary?.admins, color: "text-primary",         bg: "bg-primary/5",            border: "border-primary/20"       },
        ].map(({ label, value, color, bg, border }) => (
          <Card key={label} className={`${bg} ${border}`}>
            <CardContent className="py-3 px-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
              <p className={`text-2xl font-black mt-1 ${color}`}>
                {loading && value === undefined ? <Skeleton className="h-7 w-12 mt-1" /> : (value ?? 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-52">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <select
          value={bannedFilter}
          onChange={(e) => { setBannedFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>

        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="ALL">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={() => { setSearch(""); setRoleFilter("ALL"); setBannedFilter("ALL"); setPage(1); }}>
            <FiX className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border/60">
              <tr>
                <th className="px-4 py-3 text-left w-10 text-xs font-semibold uppercase tracking-wide text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left text-muted-foreground">
                  <SortableHeader label="User" field="name" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Plan</th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden md:table-cell">
                  <SortableHeader label="Reviews" field="reviews" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left text-muted-foreground hidden lg:table-cell">
                  <SortableHeader label="Joined" field="createdAt" current={sortField} order={sortOrder} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="bg-background">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-6" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-36" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-14" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-8" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-5 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-8 w-28 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <FiUser className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <tr key={user.id} className={`bg-background hover:bg-muted/20 transition-colors ${user.banned ? "opacity-60" : ""}`}>

                    {/* # */}
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{startIndex + i + 1}</td>

                    {/* User */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage src={user.image ?? undefined} alt={user.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold truncate max-w-36">{user.name}</p>
                            {user.banned && (
                              <span className="text-[9px] font-bold uppercase tracking-wide text-destructive bg-destructive/10 px-1 py-0.5 rounded">Banned</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-48">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {user.role === "ADMIN" ? (
                        <Badge className="text-[10px] px-1.5 py-0 gap-1 font-medium">
                          <FiShield className="w-2.5 h-2.5" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">User</Badge>
                      )}
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-1.5 py-0 font-medium border ${PLAN_STYLE[user.subscription?.plan ?? "FREE"] ?? ""}`}
                      >
                        {PLAN_LABEL[user.subscription?.plan ?? "FREE"]}
                      </Badge>
                    </td>

                    {/* Reviews */}
                    <td className="px-4 py-3 hidden md:table-cell text-xs font-mono text-muted-foreground">
                      {user._count?.reviews ?? 0}
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {user.banned ? (
                        <div className="flex items-center gap-1 text-destructive">
                          <FiSlash className="w-3 h-3 shrink-0" />
                          <span className="text-xs font-medium">Banned</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-green-600">
                          <FiCheckCircle className="w-3 h-3 shrink-0" />
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Toggle role */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-muted-foreground hover:text-foreground"
                          title={user.role === "ADMIN" ? "Demote to User" : "Make Admin"}
                          onClick={() => promptToggleRole(user)}
                        >
                          {user.role === "ADMIN"
                            ? <FiUser className="w-3.5 h-3.5" />
                            : <FiShield className="w-3.5 h-3.5" />}
                        </Button>

                        {/* Ban / Unban */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className={`w-8 h-8 ${user.banned ? "text-green-600 hover:text-green-700 hover:bg-green-500/10" : "text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"}`}
                          title={user.banned ? "Unban user" : "Ban user"}
                          onClick={() => promptToggleBan(user)}
                        >
                          {user.banned
                            ? <FiCheckCircle className="w-3.5 h-3.5" />
                            : <FiSlash className="w-3.5 h-3.5" />}
                        </Button>

                        {/* Delete */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Delete user"
                          onClick={() => promptDeleteUser(user)}
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      {!loading && users.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Showing {startIndex + 1}–{Math.min(startIndex + LIMIT, filteredTotal)} of {filteredTotal} users
          </p>
          <PaginationBar page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => !confirmLoading && setConfirmState((s) => ({ ...s, open }))}
        title={confirmState.title}
        description={confirmState.description}
        confirmLabel={confirmState.confirmLabel}
        variant={confirmState.variant}
        loading={confirmLoading}
        onConfirm={executeConfirm}
      />
    </div>
  );
}
