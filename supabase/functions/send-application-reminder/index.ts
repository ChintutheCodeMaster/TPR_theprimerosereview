import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationSummary {
  schoolName: string;
  applicationType: string;
  deadlineDate: string;
  daysLeft: number;
  completionPct: number;
  completedEssays: number;
  requiredEssays: number;
  recsSubmitted: number;
  recsRequested: number;
}

interface Recipient {
  studentId: string;
  studentName: string;
  applications: ApplicationSummary[];
}

const typeLabel = (type: string) =>
  ({ "early-decision": "Early Decision", "early-action": "Early Action", regular: "Regular", ucas: "UCAS", rolling: "Rolling" }[type] ?? type);

const deadlineLabel = (daysLeft: number) => {
  if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
  if (daysLeft === 0) return "Due today!";
  if (daysLeft === 1) return "Due tomorrow!";
  return `${daysLeft} days left`;
};

const applicationRows = (apps: ApplicationSummary[]) =>
  apps.map((app) => {
    const urgencyColor = app.daysLeft < 0 ? "#dc2626" : app.daysLeft <= 7 ? "#d97706" : "#6d28d9";
    const essaysLeft = app.requiredEssays - app.completedEssays;
    const recsLeft = app.recsRequested - app.recsSubmitted;
    const todos: string[] = [];
    if (essaysLeft > 0) todos.push(`${essaysLeft} essay${essaysLeft > 1 ? "s" : ""} to complete`);
    if (recsLeft > 0) todos.push(`${recsLeft} recommendation${recsLeft > 1 ? "s" : ""} pending`);

    return `
<tr>
  <td style="padding:16px;border-bottom:1px solid #e5e7eb;">
    <p style="margin:0 0 2px;color:#111827;font-size:15px;font-weight:600;">${app.schoolName}</p>
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">${typeLabel(app.applicationType)}</p>
    <p style="margin:0 0 6px;color:${urgencyColor};font-size:13px;font-weight:600;">&#128197; ${deadlineLabel(app.daysLeft)}&nbsp;&nbsp;&#183;&nbsp;&nbsp;Progress: ${app.completionPct}%</p>
    ${todos.length > 0
      ? todos.map((t) => `<span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:12px;padding:2px 8px;border-radius:4px;margin-right:6px;">&#9888; ${t}</span>`).join("")
      : `<span style="display:inline-block;background:#d1fae5;color:#065f46;font-size:12px;padding:2px 8px;border-radius:4px;">&#10003; All tasks complete — ready to submit</span>`}
  </td>
</tr>`;
  }).join("");

const reminderHtml = (
  studentName: string,
  counselorName: string,
  apps: ApplicationSummary[],
  appUrl: string,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Application Deadline Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:linear-gradient(135deg,#6d28d9,#9333ea);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">The Primrose Review</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">College Application Support Platform</p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 20px;color:#111827;font-size:16px;">Hi ${studentName},</p>
              <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.7;">
                Your counselor <strong>${counselorName}</strong> wanted to check in and make sure you're on track with your upcoming college applications.
              </p>

              <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:28px;">
                <div style="background:#f9fafb;padding:12px 16px;border-bottom:1px solid #e5e7eb;">
                  <p style="margin:0;color:#374151;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">Your Applications</p>
                </div>
                <table cellpadding="0" cellspacing="0" width="100%">
                  ${applicationRows(apps)}
                </table>
              </div>

              <p style="margin:0 0 28px;color:#374151;font-size:14px;line-height:1.7;">
                Log in to your dashboard to upload essays and track your recommendation letters. Your counselor is here to help — message them directly if you need anything.
              </p>

              <div style="text-align:center;margin-bottom:32px;">
                <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#6d28d9,#9333ea);color:#ffffff;text-decoration:none;padding:15px 36px;border-radius:10px;font-size:16px;font-weight:600;">
                  Go to My Dashboard &rarr;
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                This reminder was sent by your counselor on The Primrose Review.<br />
                If you believe this was sent in error, please contact ${counselorName} directly.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipients, appUrl } = await req.json() as {
      recipients: Recipient[];
      appUrl?: string;
    };

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!recipients || recipients.length === 0) {
      throw new Error("No recipients provided");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    // Authenticate counselor
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get counselor name
    const { data: counselorProfile } = await admin
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const counselorName = counselorProfile?.full_name ?? "Your Counselor";
    const baseUrl = appUrl ?? "https://primrosereview.com";

    // Send one email per recipient in parallel
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        const { data: { user: studentUser }, error: userError } =
          await admin.auth.admin.getUserById(recipient.studentId);

        if (userError || !studentUser?.email) {
          throw new Error(`No email found for ${recipient.studentName}`);
        }

        const html = reminderHtml(recipient.studentName, counselorName, recipient.applications, baseUrl);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "The Primrose Review <team@primrosecrm.com>",
            to: studentUser.email,
            subject: `Application deadline reminder from ${counselorName} — The Primrose Review`,
            html,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message ?? "Resend API error");
        }

        console.log(`Reminder sent to ${recipient.studentName} <${studentUser.email}>`);
        return recipient.studentName;
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failures = results
      .filter((r): r is PromiseRejectedResult => r.status === "rejected")
      .map((r) => r.reason?.message ?? "Unknown error");

    return new Response(
      JSON.stringify({ success: true, sent, ...(failures.length > 0 && { failures }) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("send-application-reminder error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
