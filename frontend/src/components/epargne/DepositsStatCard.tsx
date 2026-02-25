interface DepositsStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  isSkeleton?: boolean;
}

export default function DepositsStatCard({ title, value, subtitle, isSkeleton }: DepositsStatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <p className="text-slate-500 text-xs sm:text-sm font-medium mb-1 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        {isSkeleton ? <span className="inline-block w-32 h-8 rounded bg-slate-100 dark:bg-slate-800" /> : value}
      </h3>
      {subtitle && <p className="mt-2 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
