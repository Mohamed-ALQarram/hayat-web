import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Settings, Bell } from 'lucide-react';
import HayatLogo from './HayatLogo';

const DoctorLayout = () => {
  const { user, accessToken, logout } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'Doctor') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface)] flex flex-col">
      {/* Doctor Topbar */}
      <header className="bg-[var(--brand)] px-6 py-2.5 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 text-white flex items-center justify-center font-bold text-sm">
              {user?.displayName ? user.displayName.charAt(0) : 'د'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-white leading-tight">{user?.displayName || 'طبيب'}</p>
              <p className="text-[11px] text-blue-200/60">عيادة الطبيب</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-white/40 border-l border-white/10 pl-3">
            <button className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors duration-200">
              <Settings size={18} strokeWidth={1.8} />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition-colors duration-200">
              <Bell size={18} strokeWidth={1.8} />
            </button>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-colors duration-200">
              <LogOut size={18} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        <HayatLogo variant="light" size="xs" showText={false} />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;
