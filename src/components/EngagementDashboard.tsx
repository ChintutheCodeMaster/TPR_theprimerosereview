import { useState } from 'react';
import { useEngagementAnalytics, DateRange } from '@/hooks/useEngagementAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  Users, Clock, TrendingUp, RotateCcw, AlertTriangle, Activity,
  GraduationCap, Zap,
} from 'lucide-react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12a' : i < 12 ? `${i}a` : i === 12 ? '12p' : `${i - 12}p`
);

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className={`inline-flex p-2 rounded-lg ${bg} mb-3`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-600 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Heatmap({ data }: { data: { day: number; hour: number; count: number }[] }) {
  const max = Math.max(1, ...data.map(d => d.count));
  const grid: Record<string, number> = {};
  for (const d of data) grid[`${d.day}-${d.hour}`] = d.count;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[560px]">
        {/* Hour labels */}
        <div className="flex ml-10 mb-1">
          {HOUR_LABELS.filter((_, i) => i % 3 === 0).map((h, idx) => (
            <div key={idx} className="flex-1 text-[10px] text-gray-400 text-center">{h}</div>
          ))}
        </div>
        {DAY_LABELS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-0.5 mb-0.5">
            <span className="w-9 text-[10px] text-gray-400 text-right pr-2 shrink-0">{day}</span>
            {HOUR_LABELS.map((_, hourIdx) => {
              const count = grid[`${dayIdx}-${hourIdx}`] ?? 0;
              const intensity = count === 0 ? 0 : Math.ceil((count / max) * 4);
              const bg = [
                'bg-gray-100',
                'bg-indigo-100',
                'bg-indigo-200',
                'bg-indigo-400',
                'bg-indigo-600',
              ][intensity];
              return (
                <div
                  key={hourIdx}
                  title={`${day} ${HOUR_LABELS[hourIdx]}: ${count} page views`}
                  className={`flex-1 h-4 rounded-sm ${bg} cursor-default transition-colors`}
                />
              );
            })}
          </div>
        ))}
        <div className="flex items-center gap-2 mt-3 ml-10">
          <span className="text-[10px] text-gray-400">Less</span>
          {['bg-gray-100', 'bg-indigo-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600'].map((c, i) => (
            <div key={i} className={`w-4 h-4 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}

export function EngagementDashboard() {
  const [range, setRange] = useState<DateRange>(7);
  const { data, isLoading } = useEngagementAnalytics(range);

  const rangeLabel = range === 7 ? 'last 7 days' : range === 30 ? 'last 30 days' : 'last 90 days';

  return (
    <div className="space-y-6">
      {/* Header + range picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            Student Engagement Analytics
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Session-level tracking across all student activity</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {([7, 30, 90] as DateRange[]).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Top-line stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Weekly Active Students"
            value={`${data?.weeklyActivePct ?? 0}%`}
            sub={`${data?.activeStudents ?? 0} of ${data?.totalStudents ?? 0} students`}
            icon={Users}
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
          <StatCard
            label="Avg Sessions / Student"
            value={data?.avgSessionsPerStudent ?? 0}
            sub={rangeLabel}
            icon={TrendingUp}
            color="text-green-600"
            bg="bg-green-50"
          />
          <StatCard
            label="Avg Time / Week"
            value={`${data?.avgMinutesPerWeek ?? 0} min`}
            sub="per active student"
            icon={Clock}
            color="text-amber-600"
            bg="bg-amber-50"
          />
          <StatCard
            label="Return Rate"
            value={`${data?.returnRate ?? 0}%`}
            sub="came back after first login"
            icon={RotateCcw}
            color="text-purple-600"
            bg="bg-purple-50"
          />
        </div>
      )}

      {/* Activity heatmap + Feature usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Most Active Hours &amp; Days
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Page views by time of day</p>
          </div>
          <div className="p-5">
            {isLoading ? (
              <Skeleton className="h-36 w-full" />
            ) : (data?.heatmap.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No activity data yet</p>
            ) : (
              <Heatmap data={data!.heatmap} />
            )}
          </div>
        </div>

        {/* Feature usage */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              Feature Usage
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Page views per feature area</p>
          </div>
          <div className="p-5">
            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : (data?.featureUsage.length ?? 0) === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No feature data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data!.featureUsage} layout="vertical" margin={{ left: 8, right: 20, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="feature" type="category" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(v: number) => [`${v} views`, 'Page views']}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* By grade */}
      {(data?.byGrade.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-blue-500" />
              Engagement by Grade
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Grade</th>
                  <th className="px-5 py-3 text-center">Active</th>
                  <th className="px-5 py-3 text-center">Total</th>
                  <th className="px-5 py-3 text-left">Participation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data!.byGrade.map(row => {
                  const pct = row.totalCount > 0 ? Math.round((row.activeCount / row.totalCount) * 100) : 0;
                  return (
                    <tr key={row.grade} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">Year {row.grade}</td>
                      <td className="px-5 py-3 text-center text-indigo-700 font-medium">{row.activeCount}</td>
                      <td className="px-5 py-3 text-center text-gray-500">{row.totalCount}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[120px]">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* By counselor */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            Engagement by Counselor
          </h3>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (data?.byCounselor.length ?? 0) === 0 ? (
          <p className="p-5 text-sm text-gray-400">No counselor assignment data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Counselor</th>
                  <th className="px-5 py-3 text-center">Students</th>
                  <th className="px-5 py-3 text-center">Active</th>
                  <th className="px-5 py-3 text-center">Avg Sessions</th>
                  <th className="px-5 py-3 text-left">Participation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data!.byCounselor.map(row => {
                  const pct = row.studentCount > 0 ? Math.round((row.activeCount / row.studentCount) * 100) : 0;
                  return (
                    <tr key={row.counselorId} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{row.counselorName}</td>
                      <td className="px-5 py-3 text-center text-gray-600">{row.studentCount}</td>
                      <td className="px-5 py-3 text-center text-indigo-700 font-medium">{row.activeCount}</td>
                      <td className="px-5 py-3 text-center text-gray-600">{row.avgSessions}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[120px]">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inactive students */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Inactive Students (7+ days)
          </h3>
          {!isLoading && (
            <Badge variant="outline" className="text-amber-700 border-amber-200 bg-amber-50">
              {data?.inactiveStudents.length ?? 0} students
            </Badge>
          )}
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : (data?.inactiveStudents.length ?? 0) === 0 ? (
          <p className="p-5 text-sm text-gray-400">All students active in the last 7 days</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Grade</th>
                  <th className="px-5 py-3 text-left">Counselor</th>
                  <th className="px-5 py-3 text-left">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data!.inactiveStudents.map(s => (
                  <tr key={s.userId} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{s.name}</td>
                    <td className="px-5 py-3 text-gray-500">{s.email}</td>
                    <td className="px-5 py-3 text-gray-500">{s.grade ? `Year ${s.grade}` : '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{s.counselorName ?? '—'}</td>
                    <td className="px-5 py-3">
                      {s.lastSeen ? (
                        <span className="text-amber-700 font-medium">
                          {Math.floor((Date.now() - new Date(s.lastSeen).getTime()) / 86400000)}d ago
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">Never logged in</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
