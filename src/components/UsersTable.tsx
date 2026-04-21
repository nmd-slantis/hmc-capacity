"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

const ROLE_STYLES: Record<string, string> = {
  pending: "bg-gray-100 text-gray-500",
  active:  "bg-blue-100 text-blue-700",
  admin:   "bg-[#FF7700] text-white",
};

const ROLES = ["pending", "active", "admin"] as const;

function RoleSelect({ userId, value, onChange }: { userId: string; value: string; onChange: (u: User) => void }) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (role: string) => {
    setSaving(true);
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) onChange(await res.json());
    setSaving(false);
  };

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer appearance-none ${ROLE_STYLES[value] ?? "bg-gray-100 text-gray-500"} disabled:opacity-50`}
    >
      {ROLES.map((r) => (
        <option key={r} value={r} className="bg-white text-gray-700 text-xs">
          {r}
        </option>
      ))}
    </select>
  );
}

export function UsersTable({ currentUserEmail }: { currentUserEmail: string | null | undefined }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => { setUsers(data); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleting(null);
  };

  const handleUpdate = (updated: User) =>
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

  const sorted = [...users].sort((a, b) => {
    const order = { pending: 0, active: 1, admin: 2 };
    const ro = (order[a.role as keyof typeof order] ?? 1) - (order[b.role as keyof typeof order] ?? 1);
    if (ro !== 0) return ro;
    return a.createdAt.localeCompare(b.createdAt);
  });

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <table className="w-full text-xs" style={{ tableLayout: "fixed", borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: "40px" }} />
          <col style={{ width: "220px" }} />
          <col />
          <col style={{ width: "120px" }} />
          <col style={{ width: "160px" }} />
        </colgroup>
        <thead>
          <tr className="bg-[#2e2e30] text-gray-300 text-[10px] tracking-wider uppercase select-none" style={{ height: "36px" }}>
            <th className="px-2 py-2.5" />
            <th className="px-4 py-2.5 text-left font-medium">Name</th>
            <th className="px-4 py-2.5 text-left font-medium">Email</th>
            <th className="px-4 py-2.5 text-left font-medium">Role</th>
            <th className="px-4 py-2.5 text-left font-medium">Joined</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-xs text-gray-400">
                Loading users…
              </td>
            </tr>
          )}

          {!loading && users.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-xs text-gray-400">
                No users found.
              </td>
            </tr>
          )}

          {sorted.map((user) => {
            const isSelf = user.email === currentUserEmail;
            const isPending = user.role === "pending";
            return (
              <tr
                key={user.id}
                className={`border-b border-gray-100 hover:brightness-[0.97] transition-all group ${isPending ? "bg-amber-50" : "bg-white"}`}
              >
                <td className="px-2 py-2 text-center">
                  {!isSelf && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={deleting === user.id}
                      className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors text-[10px] opacity-0 group-hover:opacity-100 disabled:opacity-50"
                      title="Remove user"
                    >
                      ✕
                    </button>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-gray-800">{user.name ?? "—"}</span>
                    {isSelf && (
                      <span className="flex-shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#FF7700]/10 text-[#FF7700]">
                        You
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-gray-600 truncate">{user.email}</td>
                <td className="px-4 py-2.5">
                  {isSelf ? (
                    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_STYLES[user.role] ?? "bg-gray-100 text-gray-500"}`}>
                      {user.role}
                    </span>
                  ) : (
                    <RoleSelect userId={user.id} value={user.role} onChange={handleUpdate} />
                  )}
                </td>
                <td className="px-4 py-2.5 text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="border-t border-gray-100 px-4 py-2.5 text-[10px] text-gray-400">
        Users sign in via Google OAuth. New <strong>@slantis.com</strong> accounts are auto-activated on first sign-in.
      </div>
    </div>
  );
}
