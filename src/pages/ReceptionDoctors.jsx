import React, { useState, useEffect } from 'react';
import { Search, X, Info, Briefcase, Hash, Calendar, Clock } from 'lucide-react';
import { useDoctors, useDoctorSpecializations, useClinicsWithSchedules } from '../Hooks/useReception';
import Button from '../components/Button';
import { createPortal } from 'react-dom';

const DoctorDetailsModal = ({ doctor, onClose }) => {
  if (!doctor) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[130] w-full max-w-2xl bg-white rounded-xl shadow-[var(--shadow-modal)] overflow-hidden animate-scaleIn" dir="rtl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Info className="text-[var(--brand)] w-5 h-5" />
            تفاصيل الطبيب
          </h2>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Doctor Card */}
          <div className="flex items-center gap-4 bg-[var(--brand-50)] border border-[var(--brand-light)] p-4 rounded-xl mb-6">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0F3460&color=fff&size=100&font-size=0.33&rounded=true`}
              alt={doctor.fullName}
              className="w-16 h-16 rounded-full border-3 border-white shadow-md"
            />
            <div className="flex-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">{doctor.fullName}</h3>
              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mt-1.5">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span>{doctor.specialization}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="font-mono text-xs">{doctor.id?.split('-')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div>
            <h4 className="font-bold text-[var(--text-primary)] text-sm mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
              جدول المواعيد
            </h4>

            {doctor.workingClinics && doctor.workingClinics.length > 0 ? (
              <div className="card overflow-hidden">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)]">العيادة</th>
                      <th className="py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)]">اليوم</th>
                      <th className="py-2.5 px-4 text-xs font-semibold text-[var(--text-tertiary)]">الساعات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light)]">
                    {doctor.workingClinics.map((clinic, idx) => (
                      <tr key={`${clinic.clinicId}-${clinic.workingDay}-${idx}`} className="hover:bg-[var(--brand-50)] transition-colors">
                        <td className="py-2.5 px-4">
                          <p className="font-medium text-[var(--text-primary)] text-sm">{clinic.clinicName}</p>
                        </td>
                        <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm">{clinic.workingDay}</td>
                        <td className="py-2.5 px-4 text-[var(--text-secondary)] text-sm flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                          <span dir="ltr">{clinic.workingHours}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-[var(--border)] rounded-xl text-[var(--text-tertiary)] text-sm">
                لا توجد مواعيد عمل مسجلة
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};


const ReceptionDoctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterClinic, setFilterClinic] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: doctorsData, isLoading, isError } = useDoctors(debouncedSearch);
  const { data: specializationsData } = useDoctorSpecializations();
  const { data: clinicsData } = useClinicsWithSchedules();

  const specializations = specializationsData || [];
  const clinics = clinicsData || [];

  let displayedDoctors = doctorsData || [];

  if (filterSpecialization) {
    displayedDoctors = displayedDoctors.filter(doc => doc.specialization === filterSpecialization);
  }

  if (filterClinic) {
    displayedDoctors = displayedDoctors.filter(doc =>
      doc.workingClinics && doc.workingClinics.some(c => c.clinicId.toString() === filterClinic)
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">سجل الأطباء</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">دليل الأطباء ومواعيد العمل</p>
        </div>
        <div className="bg-[var(--brand-light)] text-[var(--brand)] px-3 py-1.5 rounded-lg text-xs font-semibold">
          {displayedDoctors.length} طبيب
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search size={16} className="text-[var(--text-tertiary)]" />
            </div>
            <input
              type="text"
              placeholder="البحث بالاسم أو الـ ID..."
              className="input-base pr-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-base w-full md:w-44 appearance-none cursor-pointer"
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
          >
            <option value="">جميع التخصصات</option>
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          <select
            className="input-base w-full md:w-44 appearance-none cursor-pointer"
            value={filterClinic}
            onChange={(e) => setFilterClinic(e.target.value)}
          >
            <option value="">جميع العيادات</option>
            {clinics.map(c => (
              <option key={c.clinicId} value={c.clinicId}>{c.clinicName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">الطبيب</th>
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">التخصص</th>
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-center">العيادات</th>
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-center">تفاصيل</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? (
              <tr><td colSpan="4" className="text-center py-12 text-[var(--text-tertiary)]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">جاري التحميل...</span>
                </div>
              </td></tr>
            ) : isError ? (
              <tr><td colSpan="4" className="text-center py-12 text-[var(--status-error-text)] text-sm">حدث خطأ أثناء التحميل.</td></tr>
            ) : displayedDoctors.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-12 text-[var(--text-tertiary)] text-sm">لا يوجد أطباء يطابقون معايير البحث</td></tr>
            ) : (
              displayedDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-[var(--brand-50)] transition-colors duration-150">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.fullName)}&background=0F3460&color=fff&rounded=true&font-size=0.4&size=36`}
                        alt={doc.fullName}
                        className="w-9 h-9 rounded-full shadow-sm"
                      />
                      <div>
                        <p className="font-semibold text-[var(--text-primary)] text-sm">{doc.fullName}</p>
                        <p className="text-[11px] text-[var(--text-tertiary)] font-mono mt-0.5">{doc.id?.split('-')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <span className="bg-[var(--brand-50)] text-[var(--brand)] px-2.5 py-1 rounded-md text-xs font-semibold border border-[var(--brand-light)]">
                      {doc.specialization}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-center text-[var(--text-secondary)] text-sm font-medium">
                    {doc.workingClinics ? new Set(doc.workingClinics.map(c => c.clinicName)).size : 0} عيادة
                  </td>
                  <td className="py-3 px-5 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDoctor(doc)}
                    >
                      التفاصيل
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DoctorDetailsModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
    </div>
  );
};

export default ReceptionDoctors;
