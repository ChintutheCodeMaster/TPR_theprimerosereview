import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Music,
  Star,
  FlaskConical,
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

// ── Category styling maps (same look as before) ───────────────────────────────
const categoryColors: Record<string, string> = {
  Performance: "bg-pink-100 text-pink-700 border-pink-200",
  Social:      "bg-violet-100 text-violet-700 border-violet-200",
  Academic:    "bg-sky-100 text-sky-700 border-sky-200",
  Ceremony:    "bg-red-100 text-red-700 border-red-200",
  Sports:      "bg-orange-100 text-orange-700 border-orange-200",
  Community:   "bg-teal-100 text-teal-700 border-teal-200",
  General:     "bg-gray-100 text-gray-600 border-gray-200",
};

const categoryGradients: Record<string, string> = {
  Performance: "from-pink-500 to-rose-500",
  Social:      "from-violet-500 to-purple-600",
  Academic:    "from-sky-500 to-blue-600",
  Ceremony:    "from-red-400 to-pink-500",
  Sports:      "from-orange-500 to-yellow-500",
  Community:   "from-teal-500 to-emerald-600",
  General:     "from-gray-400 to-slate-500",
};

const categoryBg: Record<string, string> = {
  Performance: "bg-pink-50 border-pink-200",
  Social:      "bg-violet-50 border-violet-200",
  Academic:    "bg-sky-50 border-sky-200",
  Ceremony:    "bg-red-50 border-red-200",
  Sports:      "bg-orange-50 border-orange-200",
  Community:   "bg-teal-50 border-teal-200",
  General:     "bg-gray-50 border-gray-200",
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

// ── Sub-components ────────────────────────────────────────────────────────────
const UpcomingCard = ({ activity }: { activity: SchoolActivity }) => {
  const Icon = categoryIcons[activity.category] ?? Star;
  const gradient = categoryGradients[activity.category] ?? "from-gray-400 to-slate-500";
  const bg = categoryBg[activity.category] ?? "bg-gray-50 border-gray-200";
  const badgeColor = categoryColors[activity.category] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <Card className={`border-2 ${bg} overflow-hidden hover:shadow-md transition-shadow`}>
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-sm`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground leading-tight">{activity.title}</h3>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge className={`text-xs font-medium border ${badgeColor}`}>
                {activity.category}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium text-foreground">{activity.date}</span>
          </div>
          {activity.time && (
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{activity.time}</span>
            </div>
          )}
          {activity.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{activity.location}</span>
            </div>
          )}
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground leading-relaxed border-t border-inherit pt-3">
            {activity.description}
          </p>
        )}
      </div>
    </Card>
  );
};

const PastCard = ({ activity }: { activity: SchoolActivity }) => {
  const Icon = categoryIcons[activity.category] ?? Star;
  return (
    <Card className="border bg-gray-50 overflow-hidden opacity-80">
      <div className="h-1.5 w-full bg-gray-300" />
      <div className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground leading-tight">{activity.title}</h3>
            <div className="flex gap-1.5 mt-1.5">
              <Badge className="text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">
                {activity.category}
              </Badge>
              <Badge className="text-xs font-medium border bg-gray-100 text-gray-500 border-gray-200">
                Completed
              </Badge>
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
          <p className="text-sm text-muted-foreground leading-relaxed border-t border-gray-200 pt-3">
            {activity.description}
          </p>
        )}
      </div>
    </Card>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────
const SchoolActivities = () => {
  const { data: schoolId } = useSchoolIdForCurrentUser();
  const { data: activities = [], isLoading } = useSchoolActivities(schoolId ?? undefined);

  const upcoming = activities.filter(a => a.status === "Upcoming");
  const past      = activities.filter(a => a.status === "Past" || a.status === "Cancelled");

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">School Activities</h1>
        <p className="text-base text-muted-foreground mt-1">
          Upcoming and recent events at your school
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
        </div>
      ) : activities.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <PartyPopper className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">No activities posted yet.</p>
        </Card>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-pink-500" />
                <h2 className="text-xl font-bold text-foreground">Upcoming Events</h2>
                <span className="ml-1 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
                  {upcoming.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map(a => <UpcomingCard key={a.id} activity={a} />)}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 rounded-full bg-gray-300" />
                <h2 className="text-xl font-bold text-foreground">Past Events</h2>
                <span className="ml-1 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                  {past.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.map(a => <PastCard key={a.id} activity={a} />)}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default SchoolActivities;
