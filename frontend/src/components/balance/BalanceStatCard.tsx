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
      className={`relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
    >
      {/* Decorative background gradient */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${colors.bg}`} />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className={`p-3 rounded-xl ${colors.bg} ${colors.text} shadow-inner transition-transform group-hover:scale-110 duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {trend}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-500 transition-colors">
          {title}
        </p>
        <div className="flex items-baseline gap-1">
          <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
          <div className={`w-1.5 h-1.5 rounded-full ${colors.bg.replace('bg-', 'bg-').split(' ')[0]} animate-pulse`} />
        </div>
      </div>
    </div>
  );
}
