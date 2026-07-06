import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  FileText,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useEssayAnalytics } from "@/hooks/useEssayAnalytics";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

const PIE_COLORS = [
  "oklch(0.78 0.07 155)", // sage
  "oklch(0.80 0.10 85)",  // gold
  "oklch(0.72 0.10 15)",  // pink
  "rgba(255,255,255,0.35)",
];

const chartTooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "8px",
  color: "hsl(var(--foreground))",
};

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const EssayAnalytics = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEssayAnalytics();

  if (isLoading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell>
        <div className="flex items-center justify-center h-96 gap-3 text-[color:var(--pn-pink)]">
          <AlertCircle className="h-6 w-6" />
          <p className="font-serif italic">
            The numbers wouldn't load. Please refresh and try again.
          </p>
        </div>
      </PageShell>
    );
  }

  const statTiles = [
    { label: 'Total essays', value: data.totalEssays, icon: FileText, tone: 'var(--pn-sage)' },
    {
      label: 'Avg AI score',
      value: data.avgScore !== null ? data.avgScore : "—",
      icon: TrendingUp,
      tone: 'var(--pn-sage)',
      hint: data.avgScore === null ? 'No scored essays yet' : null,
    },
    { label: 'Pending review', value: data.pendingReview, icon: Clock, tone: 'var(--pn-gold)' },
    { label: 'Active students', value: data.activeStudents, icon: Users, tone: 'var(--pn-pink)' },
  ];

  return (
    <PageShell>
      <BlurOrb tone="gold" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="hairline hover:bg-white/[0.03] text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/essays")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to essays
        </Button>
      </div>

      <PageHeader
        eyebrow="Analytics"
        title={<>The numbers, softly.</>}
        subtitle={<>Performance and trends across every essay you've read.</>}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-6"
      >
        {/* Summary Stats */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statTiles.map(({ label, value, icon: Icon, tone, hint }) => (
            <HairlineCard key={label}>
              <div className="flex items-center gap-3">
                <div className="hairline rounded-lg p-2" style={{ background: `${tone}20` }}>
                  <Icon className="h-4 w-4" style={{ color: tone }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
                  <p className="num-display text-2xl text-foreground">{value}</p>
                  {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
                </div>
              </div>
            </HairlineCard>
          ))}
        </motion.div>

        {/* Charts Row */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-[color:var(--pn-gold)]" />
              Score distribution
            </h3>
            {data.scoreDistribution.every((d) => d.count === 0) ? (
              <div className="flex items-center justify-center h-[250px] font-serif italic text-muted-foreground">
                Nothing scored yet — AI analysis needed.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" fill="oklch(0.78 0.07 155)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </HairlineCard>

          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
              <CheckCircle className="h-4 w-4 text-[color:var(--pn-sage)]" />
              Essay status
            </h3>
            {data.statusData.length === 0 ? (
              <div className="flex items-center justify-center h-[250px] font-serif italic text-muted-foreground">
                Nothing here yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="rgba(255,255,255,0.08)"
                  >
                    {data.statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </HairlineCard>
        </motion.div>

        {/* Progress Over Time */}
        <motion.div variants={sectionVariants}>
          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-[color:var(--pn-sage)]" />
              How the weeks are moving
            </h3>
            {data.progressOverTime.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] font-serif italic text-muted-foreground">
                Not enough data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.progressOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    domain={[0, 100]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgScore"
                    stroke="oklch(0.78 0.07 155)"
                    strokeWidth={2}
                    name="Avg Score"
                    dot={{ fill: "oklch(0.78 0.07 155)" }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="essaysSubmitted"
                    stroke="oklch(0.80 0.10 85)"
                    strokeWidth={2}
                    name="Essays Submitted"
                    dot={{ fill: "oklch(0.80 0.10 85)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </HairlineCard>
        </motion.div>

        {/* Bottom Row */}
        <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-[color:var(--pn-gold)]" />
              Names to remember
            </h3>
            {data.topPerformers.length === 0 ? (
              <div className="text-center py-8 font-serif italic text-muted-foreground">
                No scored essays yet.
              </div>
            ) : (
              <div className="space-y-3">
                {data.topPerformers.map((student, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 hairline rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[color:var(--pn-gold)]/15 hairline flex items-center justify-center text-sm num-display text-[color:var(--pn-gold)]">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.essay}
                      </p>
                    </div>
                    <div className="num-display text-lg text-[color:var(--pn-sage)]">{student.score}</div>
                  </div>
                ))}
              </div>
            )}
          </HairlineCard>

          <HairlineCard>
            <h3 className="font-serif text-xl text-foreground flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-[color:var(--pn-pink)]" />
              Needs your attention
            </h3>
            {data.needsAttention.length === 0 ? (
              <div className="text-center py-8 font-serif italic text-muted-foreground">
                You're clear. Every essay has been read.
              </div>
            ) : (
              <div className="space-y-3">
                {data.needsAttention.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-[color:var(--pn-pink)]/5 hairline border-[color:var(--pn-pink)]/20"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student.essay}
                      </p>
                    </div>
                    <div className="num-display text-lg text-[color:var(--pn-pink)]">
                      {student.score !== null ? student.score : "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HairlineCard>
        </motion.div>
      </motion.div>
    </PageShell>
  );
};

export default EssayAnalytics;
