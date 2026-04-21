import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Users, FileText, Banknote, Activity, HelpCircle, LogOut, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AppointmentModal from './AppointmentModal';
import NewPatientModal from './NewPatientModal';
import Button from './Button';
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
      <div className="w-64 bg-white border-l h-screen flex flex-col fixed right-0 top-0">
        <div className="p-6 border-b flex flex-col items-center">
          <p className="text-sm font-semibold text-gray-800">مكتب الاستقبال</p>
          <p className="text-xs text-gray-500 text-center">الجناح الرئيسي - الطابق الأول</p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#0052b4] hover:bg-[#004294] text-white rounded-lg py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Calendar size={18} />
              موعد جديد
            </button>
          </div>
          {/* Right side of Topbar (Search & New Patient) */}
          <div className="px-4 mb-4">
            <Button 
              variant="primary" 
              onClick={() => setIsPatientModalOpen(true)}
              className="w-full bg-[#0052b4] hover:bg-[#004294] text-white rounded-lg py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors" 
              style={{ margin: 0 }}
            >
              <UserPlus size={18} />
              <span>تسجيل مريض جديد</span>
            </Button>
          </div>


          <nav className="space-y-1 px-3">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={index}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                    ? 'text-blue-700 bg-blue-50 font-medium border-r-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg text-sm transition-colors">
            <HelpCircle size={18} />
            الدعم
          </a>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg text-sm transition-colors"
          >
            <LogOut size={18} />
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
