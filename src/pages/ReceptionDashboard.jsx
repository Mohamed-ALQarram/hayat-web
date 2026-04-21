import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Search, PenSquare, CalendarDays, Clock, Heart } from 'lucide-react';
import { useTodayAppointments, useQuickBook, useClinicsWithSchedules, useUpdateAppointmentStatus } from '../Hooks/useReception';
import Select from '../components/Select';
import Input from '../components/Input';
import Button from '../components/Button';
import AppointmentTicket from '../components/AppointmentTicket';
import { useForm } from 'react-hook-form';

const quickBookSchema = yup.object().shape({
  clinicId: yup.string().required('يرجى اختيار العيادة'),
  appointmentDate: yup.string().required('يرجى تحديد التاريخ'),
  appointmentTime: yup.string().required('يرجى تحديد الوقت'),
});

const ReceptionDashboard = () => {
  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterClinic, setFilterClinic] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [cursor, setCursor] = useState('');
  const [ticketData, setTicketData] = useState(null);

  // Debounce search term to prevent rapid API calls while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      // Reset cursor when search changes
      setCursor('');
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const currentFilters = {
    Search: debouncedSearch || undefined,
    ClinicId: filterClinic ? parseInt(filterClinic, 10) : undefined,
    Status: filterStatus || undefined,
    Limit: 20, // requested default pagination limit
    ...(cursor && { Cursor: cursor }), // Add cursor only if it has a value
  };

  // --- API Hooks ---
  const { data: appointmentsData, isLoading, isError } = useTodayAppointments(currentFilters);
  const { data: clinicsData } = useClinicsWithSchedules();
  const quickBookMutation = useQuickBook();
  const updateStatusMutation = useUpdateAppointmentStatus();

  const handleCheckIn = (appointmentId) => {
    updateStatusMutation.mutate(
      { appointmentId, payload: { status: 'Waiting' } },
      {
        onSuccess: (resData) => {
          setTicketData(resData);
        }
      }
    );
  };

  // Extract from standardized response
  const appointments = appointmentsData?.items || [];
  const pageInfo = appointmentsData?.pageInfo || {};
  const clinics = clinicsData || [];

  // Used for status mapping
  const statusColors = {
    'Waiting': 'bg-yellow-100 text-yellow-800',
    'Scheduled': 'bg-gray-200 text-gray-800',
    'InProgress': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800'
  };

  const statusText = {
    'Waiting': 'في الانتظار',
    'Scheduled': 'تمت الجدولة',
    'InProgress': 'جاري الكشف',
    'Completed': 'مكتمل',
    'Cancelled': 'ملغي'
  };

  // Load More Handler for pagination
  const handleLoadMore = () => {
    if (pageInfo.hasMore && pageInfo.nextCursor) {
      setCursor(pageInfo.nextCursor);
    }
  };

  // Reset pagination when other filters change
  const handleFilterChange = (setter, value) => {
    setter(value);
    setCursor('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Today's Appointments Section */}
      <section>
        <div className="flex items-center gap-4 mb-4">
          <div className="flexItems-center gap-2 flex">
            <div className="w-1 h-6 bg-[#0052b4] rounded"></div>
            <h2 className="text-xl font-bold text-gray-900">مواعيد اليوم</h2>
          </div>
          <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
            إجمالي المعروض: {appointments.length}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Filter */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="بحث باسم المريض أو الـ ID"
              className="bg-white border text-sm rounded-lg block w-full py-2 pl-3 pr-10 outline-none focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Clinics Filter */}
          <div className="w-48">
            <select
              className="bg-white border text-sm rounded-lg block w-full outline-none focus:ring-blue-500 focus:border-blue-500 p-2 text-gray-600 appearance-none cursor-pointer"
              value={filterClinic}
              onChange={(e) => handleFilterChange(setFilterClinic, e.target.value)}
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

          {/* Status Filter */}
          <div className="w-48">
            <select
              className="bg-white border text-sm rounded-lg block w-full outline-none focus:ring-blue-500 focus:border-blue-500 p-2 text-gray-600 appearance-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'left 0.5rem center',
                backgroundSize: '1.2em 1.2em'
              }}
            >
              <option value="">جميع الحالات</option>
              <option value="Scheduled">تمت الجدولة</option>
              <option value="Waiting">في الانتظار</option>
              <option value="InProgress">جاري الكشف</option>
              <option value="Completed">مكتمل</option>
              <option value="Cancelled">ملغي</option>
            </select>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden text-sm">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-6 text-gray-500 font-medium">رقم الدور</th>
                <th className="py-3 px-6 text-gray-500 font-medium">اسم المريض</th>
                <th className="py-3 px-6 text-gray-500 font-medium">العيادة والطبيب</th>
                <th className="py-3 px-6 text-gray-500 font-medium text-center">الحالة</th>
                <th className="py-3 px-6 text-gray-500 font-medium text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">جاري تحميل المواعيد...</td></tr>
              ) : isError ? (
                <tr><td colSpan="5" className="text-center py-8 text-red-500">حدث خطأ أثناء تحميل المواعيد. يرجى المحاولة مرة أخرى.</td></tr>
              ) : appointments.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">لا توجد نتائج تطابق بحثك</td></tr>
              ) : (
                appointments.map((appointment, index) => (
                  <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-bold text-blue-700 w-24">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                      <p className="text-xs text-gray-500">ID: {appointment.patientId?.split('-')[0]}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      <p className="font-medium text-gray-800">{appointment.clinicName}</p>
                      <p className="text-xs text-gray-500">{appointment.doctorName}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${statusColors[appointment.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusText[appointment.status] || appointment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        {appointment.status === 'Scheduled' ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="px-4 py-1.5 text-xs h-auto w-auto"
                              onClick={() => handleCheckIn(appointment.appointmentId)}
                              disabled={updateStatusMutation.isPending}
                            >
                              وصل
                            </Button>
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Load More */}
          {pageInfo.hasMore && (
            <div className="p-4 bg-gray-50 border-t flex justify-center">
              <Button
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 px-8 py-2 text-sm"
                onClick={handleLoadMore}
              >
                تحميل المزيد
              </Button>
            </div>
          )}
        </div>
      </section>

      <AppointmentTicket
        ticket={ticketData}
        onClose={() => setTicketData(null)}
      />
    </div>
  );
};

export default ReceptionDashboard;
