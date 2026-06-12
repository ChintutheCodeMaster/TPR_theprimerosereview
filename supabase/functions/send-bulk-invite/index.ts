import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const inviteHtml = (name: string, signupLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>The Primrose Challenge - 10 Days Remaining</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9,#9333ea);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
                The Primrose Challenge
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                10 days remaining &mdash; in partnership with BISW
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">
                Dear BISW Students,
              </p>

              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">
                There are just <strong>10 days remaining</strong> to take part in the Primrose Challenge.
              </p>

              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">
                Your challenge is simple: draft the best hook for your personal statement or college essay. In just a few lines, capture a moment, idea, or experience that makes the reader want to keep reading. The strongest essays often begin with a powerful opening.
              </p>

              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">
                Need help refining your draft? The <strong>Primrose Lab</strong> is available for you to experiment, receive feedback, and fine-tune your ideas before submitting. Use it to strengthen your narrative, sharpen your writing, and explore different ways to tell your story.
              </p>

              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.7;">
                And yes, there are prizes!
              </p>

              <!-- Prizes -->
              <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 14px;color:#374151;font-size:15px;line-height:1.7;">
                  <span style="font-size:18px;margin-right:6px;">&#127942;</span>
                  The winning student will receive <strong>3 hours of 1:1 consultation</strong> with one of Primrose's top admissions consultants, providing personalised guidance on university selection, applications, essays, and admissions strategy.
                </p>
                <p style="margin:0;color:#374151;font-size:15px;line-height:1.7;">
                  <span style="font-size:18px;margin-right:6px;">&#127942;</span>
                  An additional prize includes a <strong>joint consultation session for you and your parent(s)</strong> with the Primrose team, offering expert advice and the opportunity to ask all your questions about the admissions journey ahead.
                </p>
              </div>

              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.7;">
                Don't wait until the last minute &mdash; this is your chance to test your ideas, receive meaningful feedback, and elevate your application.
              </p>

              <p style="margin:0 0 8px;color:#111827;font-size:15px;font-weight:600;">
                Deadline: in 10 days
              </p>

              <!-- How to take part -->
              <p style="margin:24px 0 12px;color:#111827;font-size:15px;font-weight:600;">
                How to take part
              </p>
              <p style="margin:0 0 16px;color:#374151;font-size:16px;line-height:1.7;">
                If you haven't signed up yet, please use the link below to create your account and join the challenge. If you're already signed up, simply log in and enjoy the challenge!
              </p>

              <!-- CTA -->
              <div style="text-align:center;margin-bottom:20px;">
                <a href="${signupLink}"
                   style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#9333ea);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:10px;font-size:16px;font-weight:600;">
                  Sign Up &amp; Join the Challenge &rarr;
                </a>
              </div>

              <p style="margin:0 0 28px;color:#6b7280;font-size:14px;line-height:1.7;text-align:center;">
                Already signed up? Log in at <a href="https://primrosecrm.com" style="color:#6d28d9;text-decoration:none;">primrosecrm.com</a> and head to the Primrose Lab to get started.
              </p>

              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">
                We can't wait to read what you come up with.
              </p>

              <p style="margin:0 0 4px;color:#374151;font-size:16px;line-height:1.7;">
                Best of luck,
              </p>
              <p style="margin:0 0 4px;color:#111827;font-size:16px;font-weight:600;">
                The Primrose Team
              </p>
              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.7;">
                In partnership with BISW
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 10px;color:#6b7280;font-size:13px;">
                <a href="mailto:team@primrosecrm.com" style="color:#6b7280;text-decoration:none;">team@primrosecrm.com</a>
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                You're receiving this because your school is participating in The Primrose Challenge.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, referralLink } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error("recipients must be a non-empty array");
    }
    if (!referralLink) throw new Error("referralLink is required");

    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const recipient of recipients) {
      const { email, name } = recipient;
      if (!email) continue;

      const displayName = name?.trim() || email.split("@")[0];

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "The Primrose Review <team@primrosecrm.com>",
          to: email,
          subject: "The Primrose Challenge - 10 Days Remaining",
          html: inviteHtml(displayName, referralLink),
        }),
      });

      if (res.ok) {
        results.sent++;
      } else {
        const err = await res.json();
        results.failed++;
        results.errors.push(`${email}: ${err.message || "unknown error"}`);
      }
    }

    console.log(`Bulk invite: ${results.sent} sent, ${results.failed} failed`);

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-bulk-invite error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
