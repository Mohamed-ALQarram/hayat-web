import { Bell, Settings } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Topbar = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-white border-b border-[var(--border)] h-14 flex items-center justify-between px-6 mr-60 sticky top-0 z-20">
      {/* Page context - left empty for page-specific breadcrumbs */}
      <div />

      {/* Right side: Actions & Profile */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[var(--text-tertiary)] border-l border-[var(--border)] pl-3 ml-3">
          <button className="p-2 rounded-lg hover:bg-gray-50 hover:text-[var(--text-secondary)] transition-colors duration-200">
            <Bell size={18} strokeWidth={1.8} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-50 hover:text-[var(--text-secondary)] transition-colors duration-200">
            <Settings size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{user?.displayName || 'مستخدم'}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{user?.role === 'Doctor' ? 'طبيب' : 'موظف استقبال'}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[var(--brand)] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user?.displayName ? user.displayName.charAt(0) : 'م'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
