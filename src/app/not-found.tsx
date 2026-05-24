import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body
        style={{
          background: "#050816",
          color: "#F9FAFB",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "3rem", color: "#22D3EE" }}>404</h1>
            <p style={{ color: "#9CA3AF", marginTop: "0.5rem" }}>
              Page not found
            </p>
            <Link
              href="/es"
              style={{
                display: "inline-block",
                marginTop: "1.5rem",
                color: "#22D3EE",
                textDecoration: "underline",
              }}
            >
              BG KeyForge
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
