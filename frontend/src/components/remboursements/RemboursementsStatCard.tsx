import {
  Wallet,
  Banknote,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

interface RemboursementsStatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: "wallet" | "money" | "dollar" | "warning";
  color: "blue" | "green" | "red";
}

const iconMap = {
  wallet: Wallet,
  money: Banknote,
  dollar: DollarSign,
  warning: AlertTriangle,
};

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-primary",
    trendBg: "bg-green-50 dark:bg-green-900/30",
    trendText: "text-green-600 dark:text-green-400",
  },
  green: {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    trendBg: "bg-green-50 dark:bg-green-900/30",
    trendText: "text-green-600 dark:text-green-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
    trendBg: "bg-red-50 dark:bg-red-900/30",
    trendText: "text-red-600 dark:text-red-400",
  },
};

export default function RemboursementsStatCard({
  title,
  value,
  trend,
  icon,
  color,
}: RemboursementsStatCardProps) {
  const Icon = iconMap[icon];
  const colors = colorClasses[color];
  const isRed = color === "red";

  return (
    <div
      className={`${isRed ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/50" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"} p-5 rounded-xl border shadow-sm flex flex-col justify-between h-32 relative overflow-hidden`}
    >
      {!isRed && (
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {value}
            </h3>
          </div>
          <div className={`p-2 ${colors.bg} rounded-lg ${colors.text}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      )}
      {isRed && (
        <>
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <AlertTriangle className="w-20 h-20 text-red-600" />
          </div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {title}
              </p>
              <h3 className="text-2xl font-bold text-red-700 dark:text-red-400 mt-1">
                {value}
              </h3>
            </div>
            <div className="p-2 bg-white/50 dark:bg-red-950/30 rounded-lg text-red-600 dark:text-red-400">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </>
      )}
      <div
        className={`flex items-center gap-1 text-xs font-medium ${colors.trendText} ${!isRed ? colors.trendBg : ""} rounded-full px-2 py-1 w-fit`}
      >
        {isRed ? null : <TrendingUp className="w-3 h-3" />}
        <span>{trend}</span>
      </div>
    </div>
  );
}
