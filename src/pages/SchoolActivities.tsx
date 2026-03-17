import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
} from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Annual Spring Showcase",
    date: "May 10, 2025",
    time: "6:00 PM – 9:00 PM",
    location: "Lincoln High School Auditorium",
    category: "Performance",
    status: "Upcoming",
    description:
      "A celebration of student talent featuring musical performances, dance routines, theater acts, and fine art exhibitions. Families are encouraged to attend and celebrate the creative work of Lincoln's students.",
    icon: Music,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 border-pink-200",
    badgeColor: "bg-pink-100 text-pink-700 border-pink-200",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 2,
    title: "Junior-Senior Prom Night",
    date: "April 25, 2025",
    time: "7:00 PM – 11:00 PM",
    location: "The Grand Ballroom, Downtown Chicago",
    category: "Social",
    status: "Upcoming",
    description:
      "The annual formal dance for juniors and seniors. This year's theme is 'A Night Under the Stars.' Students may purchase tickets through the student council office. Dress code is formal attire.",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 border-violet-200",
    badgeColor: "bg-violet-100 text-violet-700 border-violet-200",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 3,
    title: "Spring College & Career Fair",
    date: "March 15, 2025",
    time: "10:00 AM – 2:00 PM",
    location: "Main Gymnasium",
    category: "Academic",
    status: "Upcoming",
    description:
      "Over 40 college admissions representatives and local employers will be on campus. Seniors and juniors are strongly encouraged to attend. Parents are welcome. Bring questions about admissions, financial aid, and majors.",
    icon: BookOpen,
    color: "from-sky-500 to-blue-600",
    bg: "bg-sky-50 border-sky-200",
    badgeColor: "bg-sky-100 text-sky-700 border-sky-200",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 4,
    title: "AP Exam Week",
    date: "May 5 – 9, 2025",
    time: "8:00 AM – 12:00 PM (varies by exam)",
    location: "Testing Rooms A–D",
    category: "Academic",
    status: "Upcoming",
    description:
      "Advanced Placement exams for all enrolled AP students. Students should confirm their exam schedule with their teacher by April 15. No late arrivals permitted. Arrive 15 minutes early with a valid ID and two pencils.",
    icon: FlaskConical,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 border-emerald-200",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 5,
    title: "Annual Science & Innovation Fair",
    date: "March 8, 2025",
    time: "9:00 AM – 3:00 PM",
    location: "Science Wing & East Hallway",
    category: "Academic",
    status: "Upcoming",
    description:
      "Students from grades 9–12 present original research and science experiments. Top projects compete for district-level representation. Judges include faculty and invited professionals from local universities.",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 6,
    title: "Senior Sendoff Breakfast",
    date: "June 2, 2025",
    time: "8:30 AM – 10:30 AM",
    location: "School Courtyard",
    category: "Ceremony",
    status: "Upcoming",
    description:
      "A warm farewell celebration for the graduating class of 2025, hosted by faculty and staff. Families of seniors are invited. Light breakfast provided. Remarks from the principal and senior class president.",
    icon: Heart,
    color: "from-red-400 to-pink-500",
    bg: "bg-red-50 border-red-200",
    badgeColor: "bg-red-100 text-red-700 border-red-200",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 7,
    title: "Track & Field Day",
    date: "April 18, 2025",
    time: "9:00 AM – 4:00 PM",
    location: "Lincoln High Athletic Track",
    category: "Sports",
    status: "Upcoming",
    description:
      "The school's annual inter-grade athletics competition. Events include sprints, relay races, shot put, and long jump. All students are invited to participate or cheer on their classmates. Refreshments available.",
    icon: Trophy,
    color: "from-orange-500 to-yellow-500",
    bg: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-700 border-orange-200",
    statusColor: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    id: 8,
    title: "Homecoming Dance",
    date: "Oct 5, 2024",
    time: "7:00 PM – 10:00 PM",
    location: "School Gymnasium",
    category: "Social",
    status: "Past",
    description:
      "This year's homecoming celebration brought together students, alumni, and families for an evening of music, dancing, and school spirit. The homecoming court was announced during halftime of the football game.",
    icon: Star,
    color: "from-gray-400 to-slate-500",
    bg: "bg-gray-50 border-gray-200",
    badgeColor: "bg-gray-100 text-gray-600 border-gray-200",
    statusColor: "bg-gray-100 text-gray-500 border-gray-200",
  },
  {
    id: 9,
    title: "Holiday Bake Sale & Food Drive",
    date: "Dec 13, 2024",
    time: "11:00 AM – 2:00 PM",
    location: "Main Lobby",
    category: "Community",
    status: "Past",
    description:
      "Student council organized a bake sale and canned food drive in support of the local Lincoln Park Food Pantry. Over 300 canned goods were collected. Thank you to all families who participated.",
    icon: Utensils,
    color: "from-gray-400 to-slate-500",
    bg: "bg-gray-50 border-gray-200",
    badgeColor: "bg-gray-100 text-gray-600 border-gray-200",
    statusColor: "bg-gray-100 text-gray-500 border-gray-200",
  },
];

const categoryColors: Record<string, string> = {
  Performance: "bg-pink-100 text-pink-700 border-pink-200",
  Social:      "bg-violet-100 text-violet-700 border-violet-200",
  Academic:    "bg-sky-100 text-sky-700 border-sky-200",
  Ceremony:    "bg-red-100 text-red-700 border-red-200",
  Sports:      "bg-orange-100 text-orange-700 border-orange-200",
  Community:   "bg-teal-100 text-teal-700 border-teal-200",
};

const SchoolActivities = () => {
  const upcoming = activities.filter((a) => a.status === "Upcoming");
  const past = activities.filter((a) => a.status === "Past");

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">School Activities</h1>
        <p className="text-base text-muted-foreground mt-1">
          Upcoming and recent events at Lincoln High School
        </p>
      </div>

      {/* Upcoming */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full bg-gradient-to-b from-violet-500 to-pink-500" />
          <h2 className="text-xl font-bold text-foreground">Upcoming Events</h2>
          <span className="ml-1 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200">
            {upcoming.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcoming.map((activity) => {
            const Icon = activity.icon;
            return (
              <Card
                key={activity.id}
                className={`border-2 ${activity.bg} overflow-hidden hover:shadow-md transition-shadow`}
              >
                {/* Gradient top bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${activity.color}`} />

                <div className="p-5 space-y-3">
                  {/* Title row */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground leading-tight">{activity.title}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge className={`text-xs font-medium border ${categoryColors[activity.category] ?? "bg-gray-100 text-gray-600"}`}>
                          {activity.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-medium text-foreground">{activity.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{activity.time}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{activity.location}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed border-t border-inherit pt-3">
                    {activity.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Past */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 rounded-full bg-gray-300" />
          <h2 className="text-xl font-bold text-foreground">Past Events</h2>
          <span className="ml-1 text-sm font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            {past.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {past.map((activity) => {
            const Icon = activity.icon;
            return (
              <Card
                key={activity.id}
                className="border bg-gray-50 overflow-hidden opacity-80"
              >
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
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{activity.location}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed border-t border-gray-200 pt-3">
                    {activity.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SchoolActivities;
