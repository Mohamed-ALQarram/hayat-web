import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRegisterPatient } from '../Hooks/useReception';
import Input from './Input';
import Button from './Button';

const schema = yup.object().shape({
  fullName: yup.string().required('الاسم الكامل مطلوب'),
  nationalId: yup.string().required('رقم الهوية مطلوب').min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل'),
  gender: yup.string().required('الجنس مطلوب').oneOf(['Male', 'Female'], 'اختر الجنس'),
  dateOfBirth: yup.string().required('تاريخ الميلاد مطلوب'),
  phone: yup.string().required('رقم الهاتف مطلوب'),
  address: yup.string().required('العنوان مطلوب'),
});

const NewPatientModal = ({ isOpen, onClose }) => {
  const createPatientMutation = useRegisterPatient();
  const [successData, setSuccessData] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: '', nationalId: '', gender: '', dateOfBirth: '', phone: '', address: '',
    },
  });

  const handleClose = () => {
    reset();
    setSuccessData(null);
    onClose();
  };

  const onSubmit = (data) => {
    createPatientMutation.mutate(data, {
      onSuccess: (resData) => {
        setSuccessData(resData || data);
      },
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-[110] w-full max-w-lg bg-white rounded-xl shadow-[var(--shadow-modal)] overflow-hidden animate-scaleIn" dir="rtl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <UserPlus className="text-[var(--brand)] w-5 h-5" />
            تسجيل مريض جديد
          </h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {successData ? (
          <div className="p-8 flex flex-col items-center justify-center text-center animate-scaleIn">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-5 relative">
              <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-20" />
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">تم تسجيل المريض بنجاح!</h3>

            <div className="bg-[var(--surface)] border border-[var(--border-light)] rounded-xl p-4 w-full text-right mt-4 space-y-2">
              <p className="text-sm text-[var(--text-secondary)]">الاسم: <span className="font-bold text-[var(--text-primary)]">{successData.fullName}</span></p>
              <p className="text-sm text-[var(--text-secondary)]">رقم الهوية: <span className="font-mono font-bold text-[var(--text-primary)]">{successData.nationalId}</span></p>
              {successData.patientId && (
                <p className="text-sm text-[var(--text-secondary)]">
                  رقم الملف الطبي (ID): <span className="font-mono font-bold text-[var(--brand)]">{String(successData.patientId).split('-')[0].toUpperCase()}</span>
                </p>
              )}
            </div>

            <Button className="mt-8 w-full justify-center" onClick={handleClose}>
              إغلاق النافذة
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="الاسم الكامل"
                  placeholder="مثال: أحمد محمد العلي"
                  {...register('fullName')}
                  error={errors.fullName?.message}
                />
              </div>

              <Input
                label="رقم الهوية"
                placeholder="رقم الهوية الوطنية"
                {...register('nationalId')}
                error={errors.nationalId?.message}
              />

              <Input
                label="رقم الهاتف"
                placeholder="07XXXXXXXX"
                {...register('phone')}
                error={errors.phone?.message}
              />

              <div className="w-full">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">الجنس</label>
                <select {...register('gender')} className={`input-base appearance-none cursor-pointer ${errors.gender ? 'input-error' : ''}`}>
                  <option value="" disabled>اختر الجنس</option>
                  <option value="Male">ذكر</option>
                  <option value="Female">أنثى</option>
                </select>
                {errors.gender && <p className="mt-1.5 text-xs text-[var(--status-error-text)]">{errors.gender.message}</p>}
              </div>

              <Input
                label="تاريخ الميلاد"
                type="date"
                {...register('dateOfBirth')}
                error={errors.dateOfBirth?.message}
              />

              <div className="md:col-span-2">
                <Input
                  label="العنوان"
                  placeholder="المدينة أو العنوان"
                  {...register('address')}
                  error={errors.address?.message}
                />
              </div>
            </div>

            {createPatientMutation.isError && (
              <div className="bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-text)] p-3 rounded-lg text-sm text-center animate-fadeIn">
                <p className="font-bold mb-1">حدث خطأ أثناء تسجيل المريض</p>
                <p>{createPatientMutation.error?.customMessage || 'يرجى المحاولة مرة أخرى.'}</p>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-[var(--border-light)]">
              <Button type="button" variant="ghost" size="sm" onClick={handleClose}>إلغاء</Button>
              <Button type="submit" size="sm" disabled={createPatientMutation.isPending}>
                {createPatientMutation.isPending ? 'جاري التسجيل...' : 'تسجيل المريض'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

export default NewPatientModal;
