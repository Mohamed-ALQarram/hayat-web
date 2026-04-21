import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus, CheckCircle, CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRegisterPatient } from '../Hooks/useReception';

const patientSchema = yup.object().shape({
  fullName: yup.string().required('الاسم بالكامل مطلوب'),
  nationalId: yup.string().required('رقم الهوية / الإقامة مطلوب'),
  gender: yup.string().required('يرجى اختيار الجنس'),
  dateOfBirth: yup.string().required('تاريخ الميلاد مطلوب'),
  phone: yup.string().required('رقم الهاتف مطلوب'),
  address: yup.string().required('العنوان مطلوب'),
});

const NewPatientModal = ({ isOpen, onClose }) => {
  const registerMutation = useRegisterPatient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(patientSchema),
    defaultValues: {
      gender: 'Male',
      fullName: '',
      nationalId: '',
      dateOfBirth: '',
      phone: '',
      address: ''
    }
  });

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      reset(); // ensure clean state
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, reset]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    const dateObj = new Date(data.dateOfBirth);
    const payload = {
      ...data,
      dateOfBirth: dateObj.toISOString()
    };

    registerMutation.mutate(payload, {
      onSuccess: (res) => {
        alert(`تم تسجيل المريض بنجاح!\nاسم المريض: ${res.fullName}\nرقم الهاتف: ${res.phone}\nرقم الملف: ${res.patientId}`);
        reset();
        onClose();
      },
      onError: (err) => {
        alert(err.customMessage || 'حدث خطأ أثناء تسجيل المريض. الأرجاء المحاولة مجدداً');
        console.error(err);
      }
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-[110] w-full max-w-3xl mx-auto" dir="rtl">
        <div className="bg-white rounded-xl shadow-[0_12px_32px_rgba(42,52,55,0.06)] border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-white px-8 py-6 border-b border-gray-200 flex justify-between items-center relative">
            <div className="absolute right-0 top-0 w-32 h-full bg-blue-50/50 rounded-l-full -mr-16"></div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 relative z-10">
                <UserPlus className="text-blue-600 w-8 h-8" />
                تسجيل مريض جديد
              </h2>
              <p className="text-gray-500 text-sm mt-1 mr-10 relative z-10">قم بإدخال بيانات المريض للتسجيل في النظام.</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100 z-10 relative">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-semibold px-1 block">الاسم بالكامل</label>
                <input
                  type="text"
                  {...register('fullName')}
                  className={`w-full bg-gray-50 border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'} rounded-lg py-3 px-4 text-gray-900 text-sm transition-colors outline-none`}
                  placeholder="الاسم الرباعي"
                />
                {errors.fullName && <p className="text-red-500 text-xs px-1">{errors.fullName.message}</p>}
              </div>

              {/* National ID */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-semibold px-1 block">رقم الهوية / الإقامة</label>
                <input
                  type="text"
                  {...register('nationalId')}
                  className={`w-full bg-gray-50 border ${errors.nationalId ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'} rounded-lg py-3 px-4 text-gray-900 text-sm transition-colors outline-none`}
                  placeholder="أدخل 14 رقماً"
                />
                {errors.nationalId && <p className="text-red-500 text-xs px-1">{errors.nationalId.message}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-semibold px-1 block">رقم الهاتف</label>
                <input
                  type="text"
                  {...register('phone')}
                  className={`w-full bg-gray-50 border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'} rounded-lg py-3 px-4 text-gray-900 text-sm transition-colors outline-none`}
                  placeholder="01xxxxxxxxx"
                  dir="ltr"
                />
                {errors.phone && <p className="text-red-500 text-xs px-1 text-right">{errors.phone.message}</p>}
              </div>

              {/* Date of Birth */}
              <div className="space-y-2 relative">
                <label className="text-xs text-gray-500 font-semibold px-1 block">تاريخ الميلاد</label>
                <input
                  type="date"
                  {...register('dateOfBirth')}
                  onClick={(e) => {
                    try { e.target.showPicker(); } catch (err) { }
                  }}
                  className={`w-full bg-gray-50 border ${errors.dateOfBirth ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'} rounded-lg py-3 px-4 text-gray-900 text-sm transition-colors outline-none cursor-pointer`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-xs px-1">{errors.dateOfBirth.message}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs text-gray-500 font-semibold px-1 block">الجنس</label>
                <select
                  {...register('gender')}
                  className={`w-full bg-gray-50 border ${errors.gender ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'} rounded-lg py-3 px-4 text-gray-900 text-sm transition-colors outline-none cursor-pointer`}
                >
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs px-1">{errors.gender.message}</p>}
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-gray-500 font-semibold px-1 block">العنوان</label>
                <input
                  type="text"
                  {...register('address')}
                  className={`w-full bg-gray-50 border ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'} rounded-lg py-3 px-4 text-gray-900 text-sm transition-colors outline-none`}
                  placeholder="المحافظة، المدينة، الشارع"
                />
                {errors.address && <p className="text-red-500 text-xs px-1">{errors.address.message}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-5 flex justify-end gap-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-md font-bold text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                disabled={isSubmitting || registerMutation.isPending}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isSubmitting || registerMutation.isPending}
                className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? 'جاري التسجيل...' : 'حفظ بيانات المريض'}
                {!registerMutation.isPending && <CheckCircle className="w-4 h-4" />}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default NewPatientModal;
