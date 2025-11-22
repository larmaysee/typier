import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Typoria - Multilingual Typing Test";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)",
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              background: "linear-gradient(to right, #3b82f6, #a855f7)",
              backgroundClip: "text",
              color: "transparent",
              display: "flex",
            }}
          >
            Typoria
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              color: "#f9fafb",
              textAlign: "center",
              maxWidth: 900,
            }}
          >
            Multilingual Typing Test & Practice
          </div>

          <div
            style={{
              fontSize: 28,
              color: "#9ca3af",
              textAlign: "center",
              maxWidth: 800,
            }}
          >
            Test your typing speed in English, Lisu, and Myanmar
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 60,
          }}
        >
          {["Real-time Feedback", "Detailed Stats", "Multiple Languages"].map((feature) => (
            <div
              key={feature}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 24px",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderRadius: 8,
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#3b82f6",
                }}
              />
              <div
                style={{
                  fontSize: 20,
                  color: "#e5e7eb",
                }}
              >
                {feature}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
