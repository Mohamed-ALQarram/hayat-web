import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, User, Hash, Briefcase, Calendar, Clock, X, Info } from 'lucide-react';
import { useDoctors, useDoctorSpecializations, useClinicsWithSchedules } from '../Hooks/useReception';
import Button from '../components/Button';
import { createPortal } from 'react-dom';

const DoctorDetailsModal = ({ doctor, onClose }) => {
  if (!doctor) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative z-[130] w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden shadow-[0_12px_32px_rgba(42,52,55,0.1)]" dir="rtl">
        {/* Header */}
        <div className="bg-white px-6 py-5 border-b border-gray-100 flex justify-between items-center relative">
          <div className="absolute left-0 top-0 w-32 h-full bg-blue-50/50 rounded-r-full -ml-16"></div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 relative z-10">
              <Info className="text-blue-600 w-6 h-6" />
              تفاصيل الطبيب
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-100 z-10 relative">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Quick Lookup Card */}
          <div className="flex items-center gap-5 bg-gray-50 border border-gray-100 p-5 rounded-xl mb-6 shadow-sm">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.fullName)}&background=0052b4&color=fff&size=100&font-size=0.33&rounded=true`}
              alt={doctor.fullName}
              className="w-20 h-20 rounded-full border-4 border-white shadow-md shadow-blue-100"
            />
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-gray-900">{doctor.fullName}</h3>

              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span>{doctor.specialization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-400" />
                  <span className="font-mono text-xs">{doctor.id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clinics Schedule Table */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              جدول العيادات والمواعيد
            </h4>

            {doctor.workingClinics && doctor.workingClinics.length > 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-right text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-gray-600">العيادة (ID)</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">يوم العمل</th>
                      <th className="py-3 px-4 font-semibold text-gray-600">ساعات العمل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {doctor.workingClinics.map((clinic, idx) => (
                      <tr key={`${clinic.clinicId}-${clinic.workingDay}-${idx}`} className="hover:bg-blue-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-semibold text-gray-800">{clinic.clinicName}</p>
                          <p className="text-xs text-gray-400">ID: {clinic.clinicId}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {clinic.workingDay}
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span dir="ltr">{clinic.workingHours}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm">
                لا توجد مواعيد عمل مسجلة لهذا الطبيب
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

  // Debouncing the search payload specifically mapped for the API call
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Hook Calls
  const { data: doctorsData, isLoading, isError } = useDoctors(debouncedSearch);
  const { data: specializationsData } = useDoctorSpecializations();
  const { data: clinicsData } = useClinicsWithSchedules();

  const specializations = specializationsData || [];
  const clinics = clinicsData || [];

  // Implement local filtering array logic
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-[#0052b4] rounded"></div>
            <h2 className="text-xl font-bold text-gray-900">سجل الأطباء</h2>
          </div>
          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
            إجمالي المعروض: {displayedDoctors.length}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Term Filter (Backend Query) */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="البحث بالاسم أو الـ ID..."
              className="bg-white border text-sm h-full rounded-lg block w-full py-2.5 pl-3 pr-10 outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Client-Side Specialization Filter Dropdown */}
          <div className="w-48">
            <select
              className="bg-white border text-sm rounded-lg block w-full py-2.5 outline-none focus:ring-blue-500 focus:border-blue-500 p-2 text-gray-600 appearance-none cursor-pointer"
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 0.5rem center',
                backgroundSize: '1.2em 1.2em'
              }}
            >
              <option value="">جميع التخصصات</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          {/* Client-Side Clinic Filter Dropdown */}
          <div className="w-48">
            <select
              className="bg-white border text-sm rounded-lg block w-full py-2.5 outline-none focus:ring-blue-500 focus:border-blue-500 p-2 text-gray-600 appearance-none cursor-pointer"
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 0.5rem center',
                backgroundSize: '1.2em 1.2em'
              }}
            >
              <option value="">جميع العيادات</option>
              {clinics.map(c => (
                <option key={c.clinicId} value={c.clinicId}>{c.clinicName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden text-sm">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-4 px-6 text-gray-500 font-medium">الطبيب</th>
                <th className="py-4 px-6 text-gray-500 font-medium">التخصص</th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">العيادات المرتبطة</th>
                <th className="py-4 px-6 text-gray-500 font-medium text-center">تفاصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium">جاري تحميل البيانات...</td></tr>
              ) : isError ? (
                <tr><td colSpan="4" className="text-center py-10 text-red-500 font-medium">حدث خطأ أثناء تحميل السجل.</td></tr>
              ) : displayedDoctors.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium">لا يوجد أطباء يطابقون معايير البحث</td></tr>
              ) : (
                displayedDoctors.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(doc.fullName)}&background=0052b4&color=fff&rounded=true&font-size=0.4`}
                          alt={doc.fullName}
                          className="w-10 h-10 rounded-full shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-gray-900">{doc.fullName}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {doc.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-middle">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                        {doc.specialization}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <p className="text-gray-600 font-medium">
                        {doc.workingClinics ? new Set(doc.workingClinics.map(c => c.clinicName)).size : 0} عيادة
                      </p>
                    </td>
                    <td className="py-4 px-6 text-center align-middle">
                      <Button
                        variant="secondary"
                        className="h-auto py-1.5 px-4 text-xs font-medium"
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
      </section>

      {/* Renders details modal if a doctor is selected */}
      <DoctorDetailsModal doctor={selectedDoctor} onClose={() => setSelectedDoctor(null)} />
    </div>
  );
};

export default ReceptionDoctors;
