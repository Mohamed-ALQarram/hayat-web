import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Lock, PlusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useForm } from 'react-hook-form';

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

      // Assuming response contains user details and accessToken
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
      setErrorMsg(err.response?.data?.title || 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#e8ecef] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-md p-8">

        {/* Header/Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mb-4">
            <PlusSquare size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">سيرينيتي هيلث</h1>
          <p className="text-sm text-gray-500">نظام إدارة المستشفى</p>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">تسجيل الدخول إلى حسابك</h2>
          <p className="text-xs text-gray-500 mt-1">أدخل بياناتك للوصول إلى بوابة المستشفى</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="text-right">
            <label className="block text-xs text-gray-500 mb-1">اسم المستخدم أو البريد الإلكتروني</label>
            <Input
              {...register('userNameOrEmail')}
              type="text"
              placeholder="e.g. dr.ahmed@hospital.com"
              icon={User}
              error={errors.userNameOrEmail?.message}
            />
          </div>

          <div className="text-right mt-4">
            <label className="block text-xs text-gray-500 mb-1">كلمة المرور</label>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.password?.message}
            />
          </div>

          <div className="flex items-center justify-between mt-4 mb-6">
            <a href="#" className="text-xs text-[#0052b4] hover:underline">
              نسيت كلمة المرور؟
            </a>
            <div className="flex items-center">
              <label htmlFor="remember" className="mr-2 text-xs text-gray-600 cursor-pointer">
                تذكرني
              </label>
              <input
                id="remember"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            هل تواجه مشكلة في تسجيل الدخول؟ <a href="#" className="text-[#0052b4] hover:underline">اتصل بالدعم الفني</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
