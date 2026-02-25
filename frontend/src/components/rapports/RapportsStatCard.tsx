import {
  FileText,
  CheckCircle,
  Clock,
  Download,
  TrendingUp,
} from "lucide-react";

interface RapportsStatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: "file" | "check" | "clock" | "download";
  color: "blue" | "green" | "amber" | "indigo";
}

const iconMap = {
  file: FileText,
  check: CheckCircle,
  clock: Clock,
  download: Download,
};

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    text: "text-primary",
    border: "hover:border-blue-200 dark:hover:border-blue-800",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/30",
    text: "text-green-600 dark:text-green-400",
    border: "hover:border-green-200 dark:hover:border-green-800",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-600 dark:text-amber-400",
    border: "hover:border-amber-200 dark:hover:border-amber-800",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/30",
    text: "text-indigo-600 dark:text-indigo-400",
    border: "hover:border-indigo-200 dark:hover:border-indigo-800",
  },
};

export default function RapportsStatCard({
  title,
  value,
  trend,
  icon,
  color,
}: RapportsStatCardProps) {
  const Icon = iconMap[icon];
  const colors = colorClasses[color];
  const isAmber = color === "amber";

  return (
    <div
      className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full group ${colors.border} transition-all`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        {!isAmber && (
          <span
            className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${color === "green" ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
        {isAmber && (
          <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
          {title}
        </p>
        <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </h3>
      </div>
    </div>
  );
}
