import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Music,
  Star,
  BookOpen,
  Trophy,
  Heart,
  Utensils,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  PartyPopper,
} from "lucide-react";
import { useSchoolActivities, type SchoolActivity } from "@/hooks/useSchoolActivities";
import { useSchoolIdForCurrentUser } from "@/hooks/useSchoolIdForCurrentUser";
import { PageShell, PageHeader, HairlineCard, BlurOrb } from "@/components/primrose-night";

const sectionVariants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.2, 0.6, 0.2, 1] as const },
  },
};

const categoryTone: Record<string, string> = {
  Performance: "var(--pn-pink)",
  Social:      "var(--pn-pink)",
  Academic:    "var(--pn-sage)",
  Ceremony:    "var(--pn-pink)",
  Sports:      "var(--pn-gold)",
  Community:   "var(--pn-sage)",
  General:     "rgba(255,255,255,0.5)",
};

const categoryPill: Record<string, string> = {
  Performance: "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline",
  Social:      "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline",
  Academic:    "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline",
  Ceremony:    "bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] hairline",
  Sports:      "bg-[color:var(--pn-gold)]/15 text-[color:var(--pn-gold)] hairline",
  Community:   "bg-[color:var(--pn-sage)]/15 text-[color:var(--pn-sage)] hairline",
  General:     "bg-white/[0.03] text-muted-foreground hairline",
};

const categoryIcons: Record<string, React.ElementType> = {
  Performance: Music,
  Social:      Sparkles,
  Academic:    BookOpen,
  Ceremony:    Heart,
  Sports:      Trophy,
  Community:   Utensils,
  General:     Star,
};

const UpcomingCard = ({ activity }: { activity: SchoolActivity }) => {
  const Icon = categoryIcons[activity.category] ?? Star;
  const tone = categoryTone[activity.category] ?? "rgba(255,255,255,0.5)";
  const pill = categoryPill[activity.category] ?? "bg-white/[0.03] text-muted-foreground hairline";

  return (
    <HairlineCard className="p-0 overflow-hidden hover:bg-white/[0.02] transition-colors">
      <div className="h-1.5 w-full" style={{ background: tone }} />
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl hairline flex items-center justify-center shrink-0"
            style={{ background: `${tone}20` }}
          >
            <Icon className="h-5 w-5" style={{ color: tone }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-xl text-foreground leading-tight">{activity.title}</h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] ${pill}`}>
                {activity.category}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-[color:var(--pn-gold)]" />
            <span className="text-foreground">{activity.date}</span>
          </div>
          {activity.time && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[color:var(--pn-sage)]" />
              <span>{activity.time}</span>
            </div>
          )}
          {activity.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[color:var(--pn-pink)]" />
              <span>{activity.location}</span>
            </div>
          )}
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground leading-relaxed hairline-t pt-3 font-serif italic">
            {activity.description}
          </p>
        )}
      </div>
    </HairlineCard>
  );
};

const PastCard = ({ activity }: { activity: SchoolActivity }) => {
  const Icon = categoryIcons[activity.category] ?? Star;
  return (
    <HairlineCard className="p-0 overflow-hidden opacity-70 hover:opacity-90 transition-opacity">
      <div className="h-1.5 w-full bg-white/[0.08]" />
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl hairline bg-white/[0.03] flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg text-foreground leading-tight">{activity.title}</h3>
            <div className="flex gap-1.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] bg-white/[0.03] text-muted-foreground hairline">
                {activity.category}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.14em] bg-white/[0.03] text-muted-foreground hairline">
                Completed
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{activity.date}</span>
          </div>
          {activity.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{activity.location}</span>
            </div>
          )}
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground leading-relaxed hairline-t pt-3 font-serif italic">
            {activity.description}
          </p>
        )}
      </div>
    </HairlineCard>
  );
};

const SchoolActivities = () => {
  const { data: schoolId } = useSchoolIdForCurrentUser();
  const { data: activities = [], isLoading } = useSchoolActivities(schoolId ?? undefined);

  const upcoming = activities.filter(a => a.status === "Upcoming");
  const past      = activities.filter(a => a.status === "Past" || a.status === "Cancelled");

  return (
    <PageShell>
      <BlurOrb tone="pink" className="top-[-100px] right-[-100px] w-[500px] h-[500px]" />

      <PageHeader
        eyebrow="School"
        title={<>What's happening on campus.</>}
        subtitle={<>Upcoming events and recent moments from your child's school.</>}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="space-y-8 max-w-5xl mx-auto"
      >
        {isLoading ? (
          <motion.div variants={sectionVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
          </motion.div>
        ) : activities.length === 0 ? (
          <motion.div variants={sectionVariants}>
            <HairlineCard variant="pink" className="p-12 text-center">
              <PartyPopper className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="font-serif text-xl text-foreground mb-2">Nothing on the horizon — yet.</h3>
              <p className="font-serif italic text-muted-foreground">
                Once the school posts events, they'll appear here.
              </p>
            </HairlineCard>
          </motion.div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <motion.section variants={sectionVariants}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full bg-[color:var(--pn-pink)]" />
                  <h2 className="font-serif text-2xl text-foreground leading-tight">Coming up.</h2>
                  <span className="hairline rounded-full px-2.5 py-0.5 text-xs bg-[color:var(--pn-pink)]/15 text-[color:var(--pn-pink)] num-display">
                    {upcoming.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map(a => <UpcomingCard key={a.id} activity={a} />)}
                </div>
              </motion.section>
            )}

            {past.length > 0 && (
              <motion.section variants={sectionVariants}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-6 rounded-full bg-white/[0.15]" />
                  <h2 className="font-serif text-2xl text-foreground leading-tight">Already happened.</h2>
                  <span className="hairline rounded-full px-2.5 py-0.5 text-xs bg-white/[0.03] text-muted-foreground num-display">
                    {past.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {past.map(a => <PastCard key={a.id} activity={a} />)}
                </div>
              </motion.section>
            )}
          </>
        )}
      </motion.div>
    </PageShell>
  );
};

export default SchoolActivities;
