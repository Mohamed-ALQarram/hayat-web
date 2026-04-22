import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Users, FileText, Banknote, Activity, HelpCircle, LogOut, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AppointmentModal from './AppointmentModal';
import NewPatientModal from './NewPatientModal';
import HayatLogo from './HayatLogo';

const Sidebar = () => {
  const logout = useAuthStore((state) => state.logout);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

  const location = useLocation();

  const navItems = [
    { icon: Calendar, label: 'المواعيد', path: '/' },
    { icon: Users, label: 'الأطباء', path: '/doctors' },
    { icon: FileText, label: 'سجلات المرضى', path: '/patients' },
    { icon: Banknote, label: 'الفواتير', path: '/billing' },
    { icon: Activity, label: 'التحليلات', path: '/analytics' },
  ];

  return (
    <>
      <div className="w-60 bg-[var(--brand)] h-screen flex flex-col fixed right-0 top-0 z-30">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 flex flex-col items-center border-b border-white/10">
          <HayatLogo variant="light" size="md" />
          <p className="text-[10px] text-blue-200/40 tracking-wide mt-2">نظام إدارة المستشفى</p>
        </div>

        {/* Quick Actions */}
        <div className="px-3 pt-4 space-y-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-white/10 hover:bg-white/15 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 border border-white/10"
          >
            <Calendar size={16} />
            موعد جديد
          </button>
          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="w-full bg-white/[0.06] hover:bg-white/10 text-blue-100/80 rounded-lg py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 border border-white/[0.06]"
          >
            <UserPlus size={16} />
            تسجيل مريض جديد
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200
                  ${isActive
                    ? 'text-white bg-white/15 font-semibold'
                    : 'text-blue-100/60 hover:text-white hover:bg-white/[0.06]'
                  }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 border-t border-white/10 space-y-0.5">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 text-blue-100/50 hover:text-white hover:bg-white/[0.06] rounded-lg text-sm transition-all duration-200">
            <HelpCircle size={18} strokeWidth={1.8} />
            الدعم الفني
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-100/50 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm transition-all duration-200"
          >
            <LogOut size={18} strokeWidth={1.8} />
            تسجيل الخروج
          </button>
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <NewPatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
      />
    </>
  );
};

export default Sidebar;
