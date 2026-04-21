import { Search, Bell, Settings, HelpCircle, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from './Button';
import Input from './Input';
import Logo from '../assets/al_hayat_hospital_logo1.png'

const Topbar = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 mr-64">
      <div className="flex items-center gap-4">
        <img src={Logo} alt="logo" className='w-20' />
      </div>

      {/* Left side of Topbar (Icons & Profile) */}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-gray-500 border-l pl-4">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <HelpCircle size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.displayName || 'Mona Reception'}</p>
            <p className="text-xs text-gray-500">{user?.role || 'Receptionist'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#1b6b5d] text-white flex items-center justify-center font-bold text-sm">
            {user?.displayName ? user.displayName.charAt(0) : 'M'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
