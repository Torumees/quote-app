export default function QuoteCard({ quote, loading, error }) {
  if (loading) return <p>⏳ Laen tsitaati...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!quote) return null;

  const full = `“${quote.text}” — ${quote.author}`;

  return (
    <blockquote
      style={{
        background: "#6b6969ff",
        padding: "16px 20px",
        borderLeft: "4px solid #918f8fff",
        borderRadius: 8,
      }}
    >
      <p style={{ margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
        “{quote.text}”
      </p>
      <footer style={{ marginTop: 8, opacity: 0.9 }}>
        — <strong>{quote.author}</strong>
      </footer>

      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button
          onClick={() => navigator.clipboard?.writeText(full)}
          title="Kopeeri lõikelauale"
          style={{ border: "1px solid #ddd", borderRadius: 6, padding: "6px 10px", background: "transparent" }}
        >
          Kopeeri
        </button>
      </div>
    </blockquote>
  );
}
