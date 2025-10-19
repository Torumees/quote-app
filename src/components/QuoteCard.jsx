export default function QuoteCard({ quote, loading, error }) {
  if (loading) return <p>⏳ Laen tsitaati...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  if (!quote) return null;

  return (
    <blockquote
      style={{
        background: "#6b6969ff",
        padding: "16px 20px",
        borderLeft: "4px solid #918f8fff",
        borderRadius: 8,
        fontStyle: "italic",
      }}
    >
      {quote}
    </blockquote>
  );
}
