import { useState } from "react";
import { Send, Search, MessageSquare, ArrowLeft } from "lucide-react";
import type { PathType } from "@/lib/onboarding";
import { loadConversations, saveConversations, loadMessages, saveMessages, uid, type Conversation, type Message } from "@/lib/store";
import { EmptyState } from "@/lib/auth";

export function Messaging({ type }: { type: PathType }) {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations(type));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");

  const active = conversations.find((c) => c.id === activeId);
  const [messages, setMessages] = useState<Message[]>([]);

  const openConversation = (id: string) => {
    setActiveId(id);
    setMessages(loadMessages(id));
    setConversations((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c));
      saveConversations(type, next);
      return next;
    });
  };

  const send = () => {
    if (!draft.trim() || !activeId) return;
    const msg: Message = { id: uid(), from: "me", text: draft.trim(), at: "now" };
    const next = [...messages, msg];
    setMessages(next);
    saveMessages(activeId, next);
    setDraft("");
    setConversations((prev) => prev.map((c) => (c.id === activeId ? { ...c, lastMessage: msg.text, lastAt: "now" } : c)));
  };

  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid h-[calc(100vh-12rem)] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-card md:grid-cols-[320px_1fr]">
      {/* Conversation list */}
      <div className={`flex flex-col border-r border-border ${activeId ? "hidden md:flex" : ""}`}>
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search conversations…" className="field pl-10" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No conversations found</p>
          ) : filtered.map((c) => (
            <button key={c.id} onClick={() => openConversation(c.id)}
              className={`flex w-full gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted ${activeId === c.id ? "bg-secondary/40" : ""}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">
                {c.name.charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{c.lastAt}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.role}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm text-muted-foreground">{c.lastMessage}</p>
                  {c.unread > 0 && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold text-[11px] font-bold text-ink">{c.unread}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation view */}
      <div className={`flex flex-col ${!activeId ? "hidden md:flex" : ""}`}>
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <button onClick={() => setActiveId(null)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted md:hidden">
                <ArrowLeft className="size-5" />
              </button>
              <span className="grid size-10 place-items-center rounded-full bg-secondary text-sm font-semibold text-primary">{active.name.charAt(0)}</span>
              <div>
                <p className="font-semibold text-foreground">{active.name}</p>
                <p className="text-xs text-muted-foreground">{active.role}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-4">
              {messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Start the conversation</p>
                </div>
              ) : messages.map((m) => (
                <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.from === "me" ? "bg-primary text-primary-foreground" : "bg-card text-foreground ring-1 ring-border"}`}>
                    <p>{m.text}</p>
                    <p className={`mt-1 text-xs ${m.from === "me" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{m.at}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type a message…" className="field flex-1" />
              <button onClick={send} disabled={!draft.trim()} className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-card hover:bg-primary-deep disabled:opacity-40">
                <Send className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center p-8">
            <EmptyState icon={<MessageSquare className="size-6" />} title="Select a conversation" text="Choose a conversation from the list to view messages." />
          </div>
        )}
      </div>
    </div>
  );
}
