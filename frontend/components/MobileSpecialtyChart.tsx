import { cn } from "@/lib/utils";

interface MobileSpecialtyChartProps {
  specialtyBreakdown: Record<string, number>;
  className?: string;
}

export function MobileSpecialtyChart({
  specialtyBreakdown,
  className
}: MobileSpecialtyChartProps) {
  const maxSpecialtyCount = Math.max(...Object.values(specialtyBreakdown), 1);
  const sortedSpecialties = Object.entries(specialtyBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Limit to top 6 for mobile

  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', bar: 'bg-emerald-500' },
    { bg: 'bg-violet-100', text: 'text-violet-700', bar: 'bg-violet-500' },
    { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500' },
    { bg: 'bg-rose-100', text: 'text-rose-700', bar: 'bg-rose-500' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', bar: 'bg-cyan-500' },
  ];

  if (sortedSpecialties.length === 0) {
    return null;
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <h2 className="font-semibold text-slate-800 mb-4 text-lg">Patients by Specialty</h2>

      {/* Mobile-optimized horizontal bar chart */}
      <div className="space-y-3">
        {sortedSpecialties.map(([specialty, count], index) => {
          const percentage = (count / maxSpecialtyCount) * 100;
          const color = colors[index % colors.length];

          return (
            <div key={specialty} className="space-y-2">
              {/* Specialty header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full flex-shrink-0",
                    color.bar
                  )} />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {specialty.length > 20 ? `${specialty.substring(0, 20)}...` : specialty}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full font-medium",
                    color.bg,
                    color.text
                  )}>
                    {count}
                  </span>
                  <span className="text-xs text-slate-400">
                    {((count / Object.values(specialtyBreakdown).reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-1000 ease-out rounded-full",
                    color.bar
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total Specialties</span>
          <span className="font-medium text-slate-700">
            {Object.keys(specialtyBreakdown).length}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mt-1">
          <span className="text-slate-500">Total Patients</span>
          <span className="font-medium text-slate-700">
            {Object.values(specialtyBreakdown).reduce((a, b) => a + b, 0)}
          </span>
        </div>
      </div>
    </div>
  );
}