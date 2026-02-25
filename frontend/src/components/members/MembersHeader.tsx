'use client'

interface MembersHeaderProps {
  onCreateClick: () => void;
}

export default function MembersHeader({ onCreateClick }: MembersHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Member Directory</h2>
        <p className="text-slate-500 text-xs sm:text-sm">Manage cooperative membership and activity.</p>
      </div>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-primary/20 active:scale-95 min-h-[44px]"
      >
        <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10-4.5-10-10-10zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
        <span className="hidden sm:inline">Create Member</span>
        <span className="sm:hidden">Add</span>
      </button>
    </div>
  );
}
