import {
  Wallet,
  Users,
  TrendingUp,
  PiggyBank,
  CreditCard,
  ArrowDownCircle,
} from "lucide-react";

interface BalanceStatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: "wallet" | "users" | "trending" | "savings" | "credit" | "withdrawal";
  color: "blue" | "green" | "amber" | "purple" | "red";
}

const iconMap = {
  wallet: Wallet,
  users: Users,
  trending: TrendingUp,
  savings: PiggyBank,
  credit: CreditCard,
  withdrawal: ArrowDownCircle,
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
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/30",
    text: "text-purple-600 dark:text-purple-400",
    border: "hover:border-purple-200 dark:hover:border-purple-800",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/30",
    text: "text-red-600 dark:text-red-400",
    border: "hover:border-red-200 dark:hover:border-red-800",
  },
};

export default function BalanceStatCard({
  title,
  value,
  trend,
  icon,
  color,
}: BalanceStatCardProps) {
  const Icon = iconMap[icon];
  const colors = colorClasses[color];

  return (
    <div
      className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full group ${colors.border} transition-all`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="flex items-center text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend}
        </span>
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
