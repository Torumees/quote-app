import { useEffect, useState } from "react";
import QuoteCard from "./components/QuoteCard";

const LS_KEY = "quote_last_v1";
const MAX_RECENT = 3;

export default function App() {
  const [quote, setQuote] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [recentQuotes, setRecentQuotes] = useState([]);

  async function loadQuote() {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("https://dummyjson.com/quotes/random");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const arr = await res.json();
      const data = Array.isArray(arr) ? arr[0] : arr;
      const text = `"${data.quote}" - ${data.author}`;
      setQuote(text);
    } catch (e) {
      setErr("Tsitaadi laadimine ebaõnnestus");
    } finally {
      setLoading(false);
    }
  }

   // 1) Kontrolli, kas localStorage's on tsitaat
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setRecentQuotes(parsed);
      else if (typeof parsed === "string") setRecentQuotes([parsed]);
      else setRecentQuotes([]);
    } catch {
      setRecentQuotes([]);
    }
  }, []);

  // 2) Salvesta uus tsitaat
  useEffect(() => {
    if (!quote || typeof quote !== "string") return;
    saveRecentQuote(quote);
  }, [quote]);

  function saveRecentQuote(text) {
    const q = String(text || "").trim();
    if (!q) return;

    setRecentQuotes(prev => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [q, ...base.filter(item => String(item) !== q)].slice(0, MAX_RECENT);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }


  return (
    <main style={{ maxWidth: 600, margin: "50px auto", padding: 16 }}>
      <h1>Quote of the Day</h1>

      <QuoteCard quote={quote} loading={loading} error={err} />

      <button
        onClick={loadQuote}
        disabled={loading}
        style={{ marginTop: 16, padding: "10px 20px" }}
      >
        {loading ? "Laen..." : "Uuenda"}
      </button>

      {recentQuotes.length > 0 && (
        <div style={{marginTop: 24 }}>
          <h3 style={{ marginBottom: 8 }}>Viimased tsitaadid</h3>
          <ul style={{ paddingLeft: 18}}>
            {recentQuotes.map((t) => (
              <li key={t} style={{ marginBottom: 6 }}>
                <button
                  onClick={() => setQuote(t)}
                  style={{
                  background: "transparent",
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
                title="Kasuta seda tsitaati"
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
