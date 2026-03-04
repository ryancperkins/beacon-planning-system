import { supabase } from "@/integrations/supabase/client";

export async function seedDemoData(churchId: string, userId: string) {
  // Check if already seeded (has ministries)
  const { data: existing } = await supabase
    .from("ministries")
    .select("id")
    .eq("church_id", churchId)
    .limit(1);
  
  if (existing && existing.length > 0) return;

  // Create West Campus
  await supabase.from("campuses").insert({ church_id: churchId, name: "West Campus" });

  // Get campuses
  const { data: campuses } = await supabase
    .from("campuses")
    .select("*")
    .eq("church_id", churchId);

  const mainCampus = campuses?.find((c) => c.name === "Main Campus") || campuses?.[0];

  // Create ministries
  const ministryData = [
    { church_id: churchId, name: "Communications", color: "#60A5FA" },
    { church_id: churchId, name: "Youth", color: "#A78BFA" },
    { church_id: churchId, name: "Women's Ministry", color: "#F472B6" },
    { church_id: churchId, name: "Outreach", color: "#34D399" },
  ];
  const { data: ministries } = await supabase.from("ministries").insert(ministryData).select();
  if (!ministries) return;

  const comms = ministries.find((m) => m.name === "Communications")!;
  const youth = ministries.find((m) => m.name === "Youth")!;
  const womens = ministries.find((m) => m.name === "Women's Ministry")!;
  const outreach = ministries.find((m) => m.name === "Outreach")!;

  // Create initiatives
  const initiatives = [
    { church_id: churchId, campus_id: mainCampus?.id, ministry_id: comms.id, title: "Easter Campaign 2026", description: "Church-wide Easter outreach", goal: "Increase Easter attendance by 20%", audience: "Community & Members", channels_requested: ["Social Media", "Email", "Print"], initiative_type: "campaign" as const, start_date: "2026-03-15", end_date: "2026-04-05", status: "In Production" as const, token_cost_estimate: 45, created_by: userId },
    { church_id: churchId, ministry_id: youth.id, title: "Youth Summer Series", description: "Summer-long youth engagement series", goal: "Keep youth engaged over summer", audience: "Teens 13-18", channels_requested: ["Social Media", "Video"], initiative_type: "series" as const, start_date: "2026-05-01", end_date: "2026-08-15", status: "Creative Ready" as const, token_cost_estimate: 32, created_by: userId },
    { church_id: churchId, ministry_id: comms.id, title: "Volunteer Appreciation Week", description: "Celebrate and thank volunteers", goal: "Recognize volunteer contributions", audience: "All Volunteers", channels_requested: ["Email", "In-Service Announcement"], initiative_type: "event" as const, start_date: "2026-04-20", end_date: "2026-04-26", status: "Approved" as const, token_cost_estimate: 18, created_by: userId },
    { church_id: churchId, ministry_id: womens.id, title: "Women's Conference Promo", description: "Annual women's conference promotion", goal: "Fill 500 seats for conference", audience: "Women 25+", channels_requested: ["Social Media", "Email", "Print", "Lobby Display"], initiative_type: "event" as const, start_date: "2026-06-05", end_date: "2026-06-07", status: "Needs Info" as const, token_cost_estimate: 28, created_by: userId },
    { church_id: churchId, ministry_id: comms.id, title: "Fall Sermon Series — Rooted", description: "Fall teaching series branding", goal: "Create unified visual identity for fall series", audience: "Congregation", channels_requested: ["Social Media", "Video", "Print"], initiative_type: "series" as const, start_date: "2026-09-07", end_date: "2026-10-26", status: "Draft" as const, token_cost_estimate: 40, created_by: userId },
    { church_id: churchId, ministry_id: outreach.id, title: "Back to School Drive", description: "Community outreach for back to school", goal: "Provide supplies to 200 families", audience: "Local Community", channels_requested: ["Social Media", "Print", "Direct Mail"], initiative_type: "campaign" as const, start_date: "2026-08-01", end_date: "2026-08-10", status: "Intake" as const, token_cost_estimate: 22, created_by: userId },
    { church_id: churchId, ministry_id: comms.id, title: "Small Groups Launch", description: "Promote new small groups season", goal: "Sign up 150 new small group members", audience: "All Members", channels_requested: ["Email", "Social Media", "Lobby Display"], initiative_type: "campaign" as const, start_date: "2026-01-12", end_date: "2026-02-02", status: "Reviewed" as const, token_cost_estimate: 35, created_by: userId },
    { church_id: churchId, ministry_id: comms.id, title: "Christmas Eve Services", description: "Christmas Eve service promotion", goal: "Record Christmas Eve attendance", audience: "Community & Members", channels_requested: ["Social Media", "Email", "Print", "Video", "Direct Mail"], initiative_type: "event" as const, start_date: "2026-12-20", end_date: "2026-12-24", status: "Scheduled" as const, token_cost_estimate: 50, created_by: userId },
    { church_id: churchId, ministry_id: youth.id, title: "Men's Breakfast Series", description: "Monthly men's gathering", goal: "Build community among men", audience: "Men 18+", channels_requested: ["Email"], initiative_type: "series" as const, start_date: "2026-01-05", end_date: "2026-03-30", status: "Complete" as const, token_cost_estimate: 15, created_by: userId },
    { church_id: churchId, ministry_id: outreach.id, title: "Missions Month", description: "Highlight global mission partners", goal: "Raise awareness and support for missions", audience: "Congregation", channels_requested: ["Social Media", "Video", "Print"], initiative_type: "campaign" as const, start_date: "2026-07-01", end_date: "2026-07-31", status: "Needs Info" as const, token_cost_estimate: 30, created_by: userId },
  ];

  const { data: insertedInitiatives } = await supabase.from("initiatives").insert(initiatives).select();

  if (insertedInitiatives && insertedInitiatives.length > 0) {
    const firstInit = insertedInitiatives[0];

    // Activity entries on first initiative
    await supabase.from("initiative_activity").insert([
      { initiative_id: firstInit.id, action: "Initiative created", actor_id: userId },
      { initiative_id: firstInit.id, action: "Brief generated by Beacon AI", actor_id: userId },
      { initiative_id: firstInit.id, action: "Status changed to Approved", actor_id: userId },
      { initiative_id: firstInit.id, action: "Status changed to In Production", actor_id: userId },
    ]);

    // Notes on first initiative
    await supabase.from("initiative_notes").insert([
      { initiative_id: firstInit.id, author_id: userId, content: "Let's coordinate the social content calendar with the youth team — they have overlapping dates." },
      { initiative_id: firstInit.id, author_id: userId, content: "Guest speaker confirmed — need headshot by March 1st." },
    ]);
  }

  // Token balances for current month
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const monthStr = currentMonth.toISOString().split("T")[0];

  await supabase.from("token_balances").insert(
    ministries.map((m) => ({
      church_id: churchId,
      ministry_id: m.id,
      month: monthStr,
      allocated: 100,
      spent: 0,
    }))
  );
}
