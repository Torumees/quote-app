import { useEffect, useState } from "react";
import QuoteCard from "./components/QuoteCard";
import Clock from "./components/Clock";

const LS_KEY = "quote_last_v2"; // uus võti (jäta vana lugemiseks migratsioonis)
const OLD_LS_KEY = "quote_last_v1";
const MAX_RECENT = 3;

export default function App() {
  const [quote, setQuote] = useState(null); // {id, text, author} | null
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [recentQuotes, setRecentQuotes] = useState([]); // Array<{id?, text, author}>

  // --- Utils ---
  function normalizeQuote(input) {
    // lubame nii stringi kui objekti
    if (!input) return null;
    if (typeof input === "string") {
      // üritame parsimist: "tsitaat" - Author
      const m = input.match(/^"?(.*?)"?\s*-\s*(.+)$/);
      if (m) return { text: m[1], author: m[2] };
      return { text: input, author: "Unknown" };
    }
    if (typeof input === "object") {
      const text = String(input.text ?? input.quote ?? "").trim();
      const author = String(input.author ?? "Unknown").trim();
      const id = input.id ?? undefined;
      if (!text) return null;
      return { id, text, author };
    }
    return null;
  }

  function dedupeKey(q) {
    // eelistame id-d; kui puudub, siis text+author lower-case
    if (q?.id != null) return `id:${q.id}`;
    return `ta:${(q.text || "").toLowerCase()}::${(q.author || "").toLowerCase()}`;
    // (ta = text-author)
  }

  // --- Fetch ---
  async function loadQuote() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("https://dummyjson.com/quotes/random");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json(); // {id, quote, author}
      const q = normalizeQuote({ id: data.id, text: data.quote, author: data.author });
      setQuote(q);
    } catch (e) {
      setErr("Tsitaadi laadimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  }

  // --- LocalStorage: laadimine (koos migratsiooniga) ---
  useEffect(() => {
    try {
      // uusi loeme uuest võtme alt
      const rawNew = localStorage.getItem(LS_KEY);
      if (rawNew) {
        const parsed = JSON.parse(rawNew);
        const arr = Array.isArray(parsed) ? parsed.map(normalizeQuote).filter(Boolean) : [];
        setRecentQuotes(arr);
        return;
      }
      // migratsioon vanast formaadist (v1: stringid)
      const rawOld = localStorage.getItem(OLD_LS_KEY);
      if (rawOld) {
        let arr = [];
        try {
          const parsed = JSON.parse(rawOld);
          arr = (Array.isArray(parsed) ? parsed : [parsed]).map(normalizeQuote).filter(Boolean);
        } catch {
          arr = [normalizeQuote(rawOld)].filter(Boolean);
        }
        setRecentQuotes(arr.slice(0, MAX_RECENT));
        // salvesta kohe uude võtmesse
        localStorage.setItem(LS_KEY, JSON.stringify(arr.slice(0, MAX_RECENT)));
      }
    } catch {
      setRecentQuotes([]);
    }
  }, []);

  // --- Kui tuleb uus quote, salvestame recent'i ---
  useEffect(() => {
    if (!quote) return;
    setRecentQuotes(prev => {
      const base = Array.isArray(prev) ? prev : [];
      const seen = new Set();
      const next = [quote, ...base]
        .filter(q => {
          const key = dedupeKey(q);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, MAX_RECENT);
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [quote]);

  function clearRecent() {
    setRecentQuotes([]);
    try { localStorage.removeItem(LS_KEY); } catch {}
  }

  return (
    <main style={{ maxWidth: 700, margin: "50px auto", padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>Quote App</h1>
        {/* Clock ei vaja <h2> ümbrist */}
        <Clock />
      </div>

      <QuoteCard quote={quote} loading={loading} error={err} />

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <button onClick={loadQuote} disabled={loading} style={{ padding: "10px 20px" }}>
          {loading ? "Laen..." : "Uus tsitaat"}
        </button>
        {recentQuotes.length > 0 && (
          <button onClick={clearRecent} title="Tühjenda hiljutised" style={{ padding: "10px 12px" }}>
            Tühjenda viimased
          </button>
        )}
      </div>

      {recentQuotes.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Viimased tsitaadid</h3>
          <ul style={{ paddingLeft: 18 }}>
            {recentQuotes.map((q) => {
              const key = dedupeKey(q);
              return (
                <li key={key} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setQuote(q)}
                    style={{
                      background: "transparent",
                      border: "1px solid #ddd",
                      borderRadius: 8,
                      padding: "8px 10px",
                      cursor: "pointer",
                      width: "100%",
                      textAlign: "left",
                    }}
                    title="Kasuta seda tsitaati"
                  >
                    “{q.text}” — <em>{q.author}</em>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </main>
  );
}
