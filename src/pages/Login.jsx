import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';
import HayatLogo from '../components/HayatLogo';

const schema = yup.object().shape({
  userNameOrEmail: yup.string().required('اسم المستخدم أو البريد الإلكتروني مطلوب'),
  password: yup.string().required('كلمة المرور مطلوبة'),
  rememberMe: yup.boolean(),
});

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [errorMsg, setErrorMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      userNameOrEmail: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data) => {
    try {
      setErrorMsg('');
      const response = await authService.login({
        userNameOrEmail: data.userNameOrEmail,
        password: data.password,
      });

      setAuth(
        {
          userId: response.userId,
          displayName: response.displayName,
          role: response.role,
          userNameOrEmail: response.userNameOrEmail,
          email: response.email,
          branchId: response.branchId,
        },
        response.accessToken
      );
      
      if (response.role === 'Doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.title || 'بيانات الدخول غير صحيحة. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="min-h-screen flex" dir="rtl">
      {/* Right Panel - Brand Hero */}
      <div className="hidden lg:flex lg:w-[45%] bg-[var(--brand)] relative items-center justify-center overflow-hidden">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
        
        <div className="relative z-10 flex flex-col items-center text-center px-12 animate-fadeIn">
          <HayatLogo variant="light" size="xl" />
          <p className="text-blue-200/50 text-sm leading-relaxed max-w-xs mt-4">
            منصة حياة الطبية لإدارة المستشفيات
            <br />
            <span className="text-blue-200/30 text-xs">Hospital Information System</span>
          </p>
          
          <div className="mt-12 flex items-center gap-3 text-blue-200/30 text-xs">
            <div className="w-8 h-[1px] bg-blue-200/20" />
            نظام متكامل وآمن
            <div className="w-8 h-[1px] bg-blue-200/20" />
          </div>
        </div>
      </div>

      {/* Left Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-[var(--surface)] px-6 py-12">
        <div className="w-full max-w-sm animate-slideUp">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <HayatLogo variant="dark" size="sm" />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">تسجيل الدخول</h2>
            <p className="text-sm text-[var(--text-tertiary)]">أدخل بياناتك للوصول إلى لوحة التحكم</p>
          </div>

          {errorMsg && (
            <div className="bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-text)] p-3 rounded-lg text-sm mb-5 text-center animate-fadeIn">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">اسم المستخدم أو البريد الإلكتروني</label>
              <Input
                {...register('userNameOrEmail')}
                type="text"
                placeholder="e.g. reception.alqudah"
                icon={User}
                error={errors.userNameOrEmail?.message}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">كلمة المرور</label>
              <Input
                {...register('password')}
                type="password"
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
              />
            </div>

            <div className="flex items-center justify-between pt-1 pb-2">
              <a href="#" className="text-xs text-[var(--brand)] hover:underline font-medium">
                نسيت كلمة المرور؟
              </a>
              <div className="flex items-center gap-2">
                <label htmlFor="remember" className="text-xs text-[var(--text-tertiary)] cursor-pointer">
                  تذكرني
                </label>
                <input
                  id="remember"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-3.5 h-3.5 text-[var(--brand)] bg-gray-100 border-gray-300 rounded focus:ring-[var(--brand)] cursor-pointer"
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
            <p className="text-xs text-[var(--text-tertiary)]">
              هل تحتاج مساعدة؟{' '}
              <a href="#" className="text-[var(--brand)] hover:underline font-medium">تواصل مع الدعم الفني</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
