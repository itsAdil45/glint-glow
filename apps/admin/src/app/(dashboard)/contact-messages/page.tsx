"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Mail, Phone, Trash2 } from "lucide-react";
import {
  fetchAdminContactMessages,
  updateContactMessage,
  deleteContactMessage,
  ContactMessage,
} from "@/lib/api-contact";
import { cn } from "@/lib/utils";

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminContactMessages()
      .then(setMessages)
      .finally(() => setLoading(false));
  }, []);

  async function handleOpen(msg: ContactMessage) {
    const next = openId === msg._id ? null : msg._id;
    setOpenId(next);
    if (next && !msg.isRead) {
      const updated = await updateContactMessage(msg._id, { isRead: true });
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? updated : m)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    await deleteContactMessage(id);
    setMessages((prev) => prev.filter((m) => m._id !== id));
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-semibold">Contact Messages</h1>
        {unreadCount > 0 && (
          <span className="text-xs font-medium bg-ink text-white rounded-full px-2 py-0.5">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="bg-surface border border-line rounded-lg divide-y divide-line">
        {loading ? (
          <p className="p-5 text-sm text-muted">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="p-5 text-sm text-muted">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const open = openId === msg._id;
            return (
              <div key={msg._id}>
                <button
                  onClick={() => handleOpen(msg)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-left"
                >
                  {!msg.isRead && <span className="h-2 w-2 rounded-full bg-accent-ink shrink-0" />}
                  <div className={cn("flex-1 min-w-0", msg.isRead && "pl-4")}>
                    <p className={cn("text-sm truncate", !msg.isRead && "font-semibold")}>
                      {msg.subject || "No subject"}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {msg.name} · {msg.email}
                    </p>
                  </div>
                  <span className="text-xs text-muted shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn("shrink-0 text-muted transition-transform", open && "rotate-180")}
                  />
                </button>
                {open && (
                  <div className="px-5 pb-4 pl-11">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed mb-3">{msg.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-ink">
                        <Mail size={13} /> {msg.email}
                      </a>
                      {msg.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} /> {msg.phone}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(msg._id)}
                        className="flex items-center gap-1.5 text-danger hover:underline ml-auto"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
