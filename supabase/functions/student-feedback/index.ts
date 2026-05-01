import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RECIPIENT = "tamir1.oren@gmail.com";

const ratingLabel = (r: number | null) => {
  if (!r) return null;
  return ["", "⭐ Poor", "⭐⭐ Fair", "⭐⭐⭐ Good", "⭐⭐⭐⭐ Great", "⭐⭐⭐⭐⭐ Amazing!"][r];
};

const feedbackHtml = (
  studentName: string,
  feedbackText: string,
  rating: number | null,
  category: string | null,
  mood: string | null,
  submittedAt: string,
) => {
  const formattedDate = new Date(submittedAt).toLocaleString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const metaRows = [
    category ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:120px;">Category</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:500;">${category}</td></tr>` : "",
    rating   ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Rating</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:500;">${ratingLabel(rating)}</td></tr>` : "",
    mood     ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Mood</td><td style="padding:6px 0;color:#111827;font-size:13px;font-weight:500;">${mood}</td></tr>` : "",
  ].filter(Boolean).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Student Feedback — The Primrose Review</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9,#ec4899);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">The Primrose Review</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">New Student Feedback Received 💬</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 0;">
              <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;font-style:italic;border-left:3px solid #e5e7eb;padding-left:14px;color:#6b7280;">
                Hi Tamir 😊, greetings from your very own talented developer Sumeet, please find the feedback from your students below.
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 40px 40px;">

              <!-- Student name -->
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#6d28d9,#ec4899);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <span style="color:#fff;font-size:18px;font-weight:700;">${studentName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p style="margin:0;color:#111827;font-size:16px;font-weight:700;">${studentName}</p>
                  <p style="margin:2px 0 0;color:#9ca3af;font-size:12px;">${formattedDate}</p>
                </div>
              </div>

              <!-- Meta (category / rating / mood) -->
              ${metaRows ? `
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:12px 16px;margin-bottom:20px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                  ${metaRows}
                </table>
              </div>` : ""}

              <!-- Feedback text -->
              <div style="background:linear-gradient(135deg,#faf5ff,#fdf2f8);border:1px solid #e9d5ff;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#7c3aed;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Feedback</p>
                <p style="margin:0;color:#1f2937;font-size:15px;line-height:1.8;">${feedbackText.replace(/\n/g, "<br/>")}</p>
              </div>

              <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
                This feedback was submitted through the Student Portal on The Primrose Review platform.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                The Primrose Review &bull; College Application Support Platform<br />
                Built with &#10084; by Sumeet
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { studentName, feedbackText, rating, category, mood, submittedAt } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    if (!studentName || !feedbackText) {
      throw new Error("studentName and feedbackText are required");
    }

    const html = feedbackHtml(
      studentName,
      feedbackText,
      rating ?? null,
      category ?? null,
      mood ?? null,
      submittedAt ?? new Date().toISOString(),
    );

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "The Primrose Review <team@primrosecrm.com>",
        to: RECIPIENT,
        subject: `New feedback from ${studentName} — The Primrose Review`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message ?? "Resend API error");
    }

    console.log(`Feedback email sent to ${RECIPIENT} for student ${studentName}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("student-feedback error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
