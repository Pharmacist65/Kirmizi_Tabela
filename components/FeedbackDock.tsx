"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Bug, Lightbulb, MessageSquare, Send, X } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/firebase/config";
import type { GameState } from "@/game/types";

type FeedbackDockProps = {
  state: GameState;
};

type FeedbackKind = "bug" | "request" | "balance" | "other";

const feedbackKinds: Record<FeedbackKind, string> = {
  bug: "Hata aldım",
  request: "İstek / dilek",
  balance: "Oynanış dengesi",
  other: "Diğer"
};

const localFeedbackKey = "kirmizi-tabela-local-feedback";
const supportEmail = "cihangir.akman@hotmail.com";

function getLocalFeedbackQueue() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(localFeedbackKey) ?? "[]") as unknown[];
  } catch {
    return [];
  }
}

export function FeedbackDock({ state }: FeedbackDockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [kind, setKind] = useState<FeedbackKind>("bug");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "local" | "error">("idle");

  const context = useMemo(
    () => ({
      pharmacistName: state.pharmacistName,
      pharmacyName: state.pharmacyName,
      scenarioId: state.scenarioId,
      scenarioName: state.scenarioName,
      city: state.city,
      district: state.district,
      startMode: state.startMode,
      day: state.currentDay,
      month: state.month,
      moduleTime: state.timeLabel,
      cash: state.cash,
      debt: state.debt,
      sgkReceivable: state.sgkReceivable,
      posReceivable: state.posReceivable,
      scoreSignals: {
        satisfaction: state.satisfaction,
        stockHealth: state.stockHealth,
        staffMorale: state.staffMorale,
        complianceRisk: state.complianceRisk
      }
    }),
    [state]
  );

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim() || status === "sending") return;

    const payload = {
      kind,
      kindLabel: feedbackKinds[kind],
      message: message.trim(),
      contact: contact.trim(),
      supportEmail,
      context,
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      createdAtText: new Date().toISOString()
    };

    setStatus("sending");

    try {
      if (isFirebaseConfigured && db) {
        await addDoc(collection(db, "feedback"), {
          ...payload,
          createdAt: serverTimestamp()
        });
        setStatus("sent");
      } else {
        const queue = getLocalFeedbackQueue();
        window.localStorage.setItem(localFeedbackKey, JSON.stringify([...queue, payload].slice(-40)));
        setStatus("local");
      }
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <aside className={`feedback-dock ${isOpen ? "open" : ""}`}>
      {isOpen ? (
        <form onSubmit={submitFeedback}>
          <div className="feedback-head">
            <div>
              <strong>İstek, dilek ve hata bildirimi</strong>
              <span>{isFirebaseConfigured ? "Rapor merkeze gönderilir." : "Demo modunda lokal kaydedilir."}</span>
            </div>
            <button aria-label="Bildirimi kapat" type="button" onClick={() => setIsOpen(false)}>
              <X size={17} />
            </button>
          </div>

          <label>
            <span>Konu</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as FeedbackKind)}>
              {Object.entries(feedbackKinds).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Ne oldu?</span>
            <textarea
              rows={5}
              value={message}
              placeholder="Örn: Depo vadesi aldım ama finans ekranında göremedim."
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>

          <label>
            <span>İletişim (opsiyonel)</span>
            <input value={contact} placeholder="E-posta veya ad" onChange={(event) => setContact(event.target.value)} />
          </label>

          <a className="support-mail-link" href={`mailto:${supportEmail}?subject=Kırmızı Tabela destek bildirimi`}>
            Destek maili: {supportEmail}
          </a>

          <button className="feedback-submit" disabled={!message.trim() || status === "sending"} type="submit">
            <Send size={17} />
            {status === "sending" ? "Gönderiliyor" : "Gönder"}
          </button>

          {status !== "idle" && (
            <p className={`feedback-status ${status}`}>
              {status === "sent"
                ? "Bildirim alındı. Teşekkürler."
                : status === "local"
                  ? "Demo modunda lokal kaydedildi. Firebase bağlanınca merkeze gönderim açılır."
                  : status === "error"
                    ? "Gönderim başarısız oldu. Biraz sonra tekrar dene."
                    : "Gönderiliyor..."}
            </p>
          )}
        </form>
      ) : (
        <button className="feedback-fab" type="button" onClick={() => setIsOpen(true)}>
          <MessageSquare size={18} />
          <span>Hata / istek bildir</span>
          <Bug size={16} />
          <Lightbulb size={16} />
        </button>
      )}
    </aside>
  );
}
