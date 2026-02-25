import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Fingerprint,
  Lock,
  CheckCircle,
  Eye,
  EyeOff,
  Search,
  ArrowRight,
  Info,
  Printer,
  Star,
  Loader2,
} from "lucide-react";

import { repaymentSchema, RepaymentInput } from "@/lib/validations";

interface CreateRepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RepaymentInput) => void | Promise<void>;
}

// Mock member data
const mockMember = {
  name: "Jean-Claude K.",
  initials: "JK",
  id: "#MW-8821",
  role: "Farmer",
  memberSince: 2019,
  creditScore: 4.8,
  status: "Active",
};

// Mock loan data
const mockLoan = {
  id: "LN-2023-004",
  initialAmount: 2500000,
  interestAmount: 375000,
  paidToDate: 1150000,
  remaining: 1725000,
  interestRate: 15,
  nextDue: "Nov 15, 2023",
};

export default function CreateRepaymentModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateRepaymentModalProps) {
  const step = 3; // Start at step 3 (payment) as shown in HTML
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RepaymentInput>({
    resolver: zodResolver(repaymentSchema),
    defaultValues: {
      numeroCompte: "ACC-2023-8821",
      pretId: "LN-2023-004",
      montant: 250000,
      devise: "FC",
      date: new Date(),
      biometricValidated: true,
      adminPassword: "",
    },
  });

  const watchAll = watch();
  const { montant, devise } = watchAll;

  // Calculations for the split rule
  const calculations = useMemo(() => {
    const currentMontant = montant || 0;
    const systemOpsAmount = currentMontant * 0.1; // 10% to System Ops
    const savingsAmount = currentMontant * 0.05; // 5% to Savings
    const principalAmount = currentMontant - systemOpsAmount - savingsAmount;

    return {
      systemOpsAmount,
      savingsAmount,
      principalAmount,
    };
  }, [montant]);

  if (!isOpen) return null;

  const onFormSubmit = () => {
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onSubmit(watchAll);
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            {/* Success Header */}
            <div className="bg-emerald-500 p-6 text-center relative overflow-hidden">
              <div className="absolute top-[-20px] left-[-20px] w-20 h-20 rounded-full bg-white/20" />
              <div className="absolute bottom-[-10px] right-[-10px] w-16 h-16 rounded-full bg-white/20" />
              <div className="mx-auto bg-white rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-lg">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Payment Successful
              </h2>
              <p className="text-emerald-100 text-sm">
                Transaction #TXN-998243 has been processed.
              </p>
            </div>
            {/* Receipt Content */}
            <div className="p-6">
              <div className="border-b border-dashed border-slate-300 dark:border-slate-700 pb-6 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Date</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Oct 24, 2023, 10:42 AM
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Member</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {mockMember.name}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Loan ID</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    #{mockLoan.id}
                  </span>
                </div>
                <div className="flex justify-between mt-4 items-center">
                  <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                    Total Paid
                  </span>
                  <span className="text-xl font-bold text-primary font-mono">
                    ₣ {new Intl.NumberFormat("fr-FR").format(montant)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <button
                  type="button"
                  className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </button>
                <button
                  type="button"
                  onClick={handleCloseSuccess}
                  className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close & Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {!showSuccess && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
              {/* Top Navigation */}
              <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-6 py-3 z-20 shrink-0">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <div className="w-8 h-8 text-primary">
                      <svg
                        className="w-full h-full"
                        fill="none"
                        viewBox="0 0 48 48"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                          fill="currentColor"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
                      Mwangaza Wetu
                    </h2>
                  </div>
                  <nav className="hidden md:flex items-center gap-9">
                    <a
                      className="text-slate-900 dark:text-slate-100 text-sm font-medium hover:text-primary transition-colors"
                      href="#"
                    >
                      Dashboard
                    </a>
                    <a
                      className="text-slate-900 dark:text-slate-100 text-sm font-medium hover:text-primary transition-colors"
                      href="#"
                    >
                      Members
                    </a>
                    <span className="text-primary text-sm font-bold">
                      Loans
                    </span>
                    <a
                      className="text-slate-900 dark:text-slate-100 text-sm font-medium hover:text-primary transition-colors"
                      href="#"
                    >
                      Reports
                    </a>
                  </nav>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Teller: Jane Doe
                  </span>
                  <div className="h-10 w-10 rounded-full bg-slate-200" />
                </div>
              </header>

              {/* Main Content Area */}
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex flex-col gap-2 p-4">
                    <a
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      href="#"
                    >
                      <span className="text-slate-500">Overview</span>
                    </a>
                    <a
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      href="#"
                    >
                      <span className="text-slate-500">Transactions</span>
                    </a>
                    <a
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      href="#"
                    >
                      <span className="text-slate-500">Members</span>
                    </a>
                    <a
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
                      href="#"
                    >
                      <span className="text-sm font-medium">Loans</span>
                    </a>
                    <a
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      href="#"
                    >
                      <span className="text-slate-500">Settings</span>
                    </a>
                  </div>
                  <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-indigo-50 dark:bg-slate-800 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-400">
                        <Info className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">
                          System Status
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Bio-scanner online. Network stable.
                      </p>
                    </div>
                  </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-4 md:p-8 relative">
                  {/* Background Pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(#134dec 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Page Header */}
                  <div className="max-w-5xl mx-auto mb-8 relative z-10">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                          Repayment Processing
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                          Initiate and validate member loan repayments securely.
                        </p>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="text-slate-500">
                          Recent Transactions
                        </span>
                      </button>
                    </div>

                    {/* Layout: Left Panel / Right Panel */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left Column: The Main Repayment Card */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                          {/* Stepper Header */}
                          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  Step {step} of 4
                                </span>
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                  Validation & Payment
                                </span>
                              </div>
                              {/* Progress Bar */}
                              <div className="flex gap-1 w-32">
                                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                                <div className="h-1.5 flex-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                              </div>
                            </div>
                          </div>

                          <div className="p-6 md:p-8 space-y-8">
                            {/* Biometric Verification Status */}
                            <div className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg">
                              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                <Fingerprint className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-sm font-bold text-green-800 dark:text-green-300">
                                  Biometric Identity Verified
                                </h3>
                                <p className="text-xs text-green-700 dark:text-green-400">
                                  Member: {mockMember.name} (ID: {mockMember.id}
                                  ) matched with 99.8% accuracy.
                                </p>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            </div>

                            <form
                              onSubmit={handleSubmit(onFormSubmit)}
                              className="space-y-6"
                            >
                              {/* Account & Loan Selection */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    Account
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Search className="w-4 h-4 text-slate-400" />
                                    </div>
                                    <input
                                      {...register("numeroCompte")}
                                      readOnly
                                      type="text"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                      <button
                                        type="button"
                                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400"
                                      >
                                        <span className="text-sm">✎</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                    Select Loan ID
                                  </label>
                                  <div className="relative">
                                    <select
                                      className="block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                      {...register("pretId")}
                                    >
                                      <option value="LN-2023-004">
                                        LN-2023-004 (Active)
                                      </option>
                                      <option value="LN-2022-112">
                                        LN-2022-112 (Closed)
                                      </option>
                                    </select>
                                    {errors.pretId && (
                                      <p className="text-red-500 text-[10px] mt-1">
                                        {errors.pretId.message}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Financial Breakdown Card */}
                              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                      Initial Amount
                                    </p>
                                    <p className="text-base font-semibold font-mono text-slate-900 dark:text-white">
                                      ₣{" "}
                                      {new Intl.NumberFormat("fr-FR").format(
                                        mockLoan.initialAmount,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                      Interest (15%)
                                    </p>
                                    <p className="text-base font-semibold font-mono text-slate-900 dark:text-white">
                                      ₣{" "}
                                      {new Intl.NumberFormat("fr-FR").format(
                                        mockLoan.interestAmount,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                      Paid to Date
                                    </p>
                                    <p className="text-base font-semibold font-mono text-emerald-600">
                                      ₣{" "}
                                      {new Intl.NumberFormat("fr-FR").format(
                                        mockLoan.paidToDate,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">
                                      Remaining
                                    </p>
                                    <p className="text-lg font-bold font-mono text-primary">
                                      ₣{" "}
                                      {new Intl.NumberFormat("fr-FR").format(
                                        mockLoan.remaining,
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Interactive Payment Input */}
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
                                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                                    Payment Amount
                                  </label>
                                  <div className="flex gap-4 items-center">
                                    <div className="relative flex-1">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-slate-500 font-bold">
                                          ₣
                                        </span>
                                      </div>
                                      <input
                                        className="block w-full pl-8 pr-12 py-3 border-2 border-primary rounded-lg text-lg font-mono font-bold text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/50 focus:border-primary"
                                        type="number"
                                        {...register("montant", {
                                          valueAsNumber: true,
                                        })}
                                      />
                                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <span className="text-slate-400 text-sm">
                                          {devise}
                                        </span>
                                      </div>
                                    </div>
                                    {errors.montant && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {errors.montant.message}
                                      </p>
                                    )}
                                    <button
                                      type="submit"
                                      disabled={isSubmitting || !isValid}
                                      className="bg-primary hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium shadow-md transition-colors flex items-center gap-2"
                                    >
                                      <span>
                                        {isSubmitting
                                          ? "Traitement..."
                                          : "Process"}
                                      </span>
                                      {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <ArrowRight className="w-4 h-4" />
                                      )}
                                    </button>
                                  </div>

                                  {/* Interest Rule Info Box */}
                                  <div className="mt-4 flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <div className="text-xs text-blue-800 dark:text-blue-200">
                                      <span className="font-bold">
                                        Automated Split Rule:
                                      </span>{" "}
                                      Based on the 15% interest policy,{" "}
                                      <span className="font-mono bg-white dark:bg-slate-800 px-1 rounded border border-blue-200 dark:border-blue-800">
                                        10%
                                      </span>{" "}
                                      goes to System Ops (
                                      {"₣ " +
                                        new Intl.NumberFormat("fr-FR").format(
                                          calculations.systemOpsAmount,
                                        )}
                                      ) and{" "}
                                      <span className="font-mono bg-white dark:bg-slate-800 px-1 rounded border border-blue-200 dark:border-blue-800">
                                        5%
                                      </span>{" "}
                                      is locked in the member&apos;s Savings
                                      Account (
                                      {"₣ " +
                                        new Intl.NumberFormat("fr-FR").format(
                                          calculations.savingsAmount,
                                        )}
                                      ).
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Security & Admin */}
                      <div className="space-y-6">
                        {/* Admin Validation */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-md text-amber-600 dark:text-amber-400">
                                <Lock className="w-5 h-5" />
                              </div>
                              <h3 className="font-bold text-slate-900 dark:text-white">
                                Admin Approval
                              </h3>
                            </div>
                            <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                              Required
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Amounts exceeding{" "}
                            <span className="font-mono font-medium text-slate-700 dark:text-slate-200">
                              ₣ 200,000
                            </span>{" "}
                            require manager authorization password.
                          </p>
                          <div className="space-y-3">
                            <div className="relative">
                              <input
                                className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 focus:ring-amber-500 focus:border-amber-500 text-slate-900 dark:text-slate-100"
                                placeholder="••••••••"
                                type={showPassword ? "text" : "password"}
                                {...register("adminPassword")}
                              />
                              {errors.adminPassword && (
                                <p className="text-red-500 text-[10px] mt-1">
                                  {errors.adminPassword.message}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                              >
                                {showPassword ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Authorize
                              </button>
                              <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Member Quick Profile */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow border border-slate-200 dark:border-slate-700 p-6">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">
                            Member Snapshot
                          </h3>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold">
                              {mockMember.initials}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {mockMember.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {mockMember.role} • Member since{" "}
                                {mockMember.memberSince}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                  {mockMember.creditScore} Credit Score
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Status</span>
                              <span className="text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-xs">
                                {mockMember.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-500">Next Due</span>
                              <span className="text-slate-900 dark:text-slate-200 font-medium">
                                {mockLoan.nextDue}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translate3d(0, 20px, 0);
              }
              to {
                opacity: 1;
                transform: translate3d(0, 0, 0);
              }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.4s ease-out forwards;
            }
          `}</style>
        </>
      )}
    </>
  );
}
