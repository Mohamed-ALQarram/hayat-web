import { useState, useEffect } from 'react';
import { Search, CalendarDays } from 'lucide-react';
import { useTodayAppointments, useQuickBook, useClinicsWithSchedules, useUpdateAppointmentStatus } from '../Hooks/useReception';
import Button from '../components/Button';
import AppointmentTicket from '../components/AppointmentTicket';

const ReceptionDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterClinic, setFilterClinic] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [cursor, setCursor] = useState('');
  const [ticketData, setTicketData] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCursor('');
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const currentFilters = {
    Search: debouncedSearch || undefined,
    ClinicId: filterClinic ? parseInt(filterClinic, 10) : undefined,
    Status: filterStatus || undefined,
    Limit: 20,
    ...(cursor && { Cursor: cursor }),
  };

  const { data: appointmentsData, isLoading, isError } = useTodayAppointments(currentFilters);
  const { data: clinicsData } = useClinicsWithSchedules();
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

  const appointments = appointmentsData?.items || [];
  const pageInfo = appointmentsData?.pageInfo || {};
  const clinics = clinicsData || [];

  const statusBadge = {
    'Waiting': 'badge-waiting',
    'Scheduled': 'badge-scheduled',
    'InProgress': 'badge-active',
    'Completed': 'badge-done',
    'Cancelled': 'badge-error'
  };

  const statusText = {
    'Waiting': 'في الانتظار',
    'Scheduled': 'مجدول',
    'InProgress': 'جاري الكشف',
    'Completed': 'مكتمل',
    'Cancelled': 'ملغي'
  };

  const handleLoadMore = () => {
    if (pageInfo.hasMore && pageInfo.nextCursor) {
      setCursor(pageInfo.nextCursor);
    }
  };

  const handleFilterChange = (setter, value) => {
    setter(value);
    setCursor('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[var(--text-primary)]">مواعيد اليوم</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">إدارة ومتابعة جميع مواعيد اليوم</p>
        </div>
        <div className="bg-[var(--brand-light)] text-[var(--brand)] px-3 py-1.5 rounded-lg text-xs font-semibold">
          {appointments.length} موعد
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
              placeholder="بحث باسم المريض أو الـ ID..."
              className="input-base pr-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="input-base w-full md:w-44 appearance-none cursor-pointer"
            value={filterClinic}
            onChange={(e) => handleFilterChange(setFilterClinic, e.target.value)}
          >
            <option value="">جميع العيادات</option>
            {clinics.map(c => (
              <option key={c.clinicId} value={c.clinicId}>{c.clinicName}</option>
            ))}
          </select>

          <select
            className="input-base w-full md:w-40 appearance-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => handleFilterChange(setFilterStatus, e.target.value)}
          >
            <option value="">جميع الحالات</option>
            <option value="Scheduled">مجدول</option>
            <option value="Waiting">في الانتظار</option>
            <option value="InProgress">جاري الكشف</option>
            <option value="Completed">مكتمل</option>
            <option value="Cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">#</th>
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">المريض</th>
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">العيادة / الطبيب</th>
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-center">الحالة</th>
              <th className="py-3 px-5 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-light)]">
            {isLoading ? (
              <tr><td colSpan="5" className="text-center py-12 text-[var(--text-tertiary)]">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">جاري تحميل المواعيد...</span>
                </div>
              </td></tr>
            ) : isError ? (
              <tr><td colSpan="5" className="text-center py-12 text-[var(--status-error-text)] text-sm">حدث خطأ أثناء تحميل المواعيد.</td></tr>
            ) : appointments.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-12 text-[var(--text-tertiary)]">
                <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">لا توجد مواعيد تطابق بحثك</p>
              </td></tr>
            ) : (
              appointments.map((appointment, index) => (
                <tr key={appointment.appointmentId} className="hover:bg-[var(--brand-50)] transition-colors duration-150">
                  <td className="py-3.5 px-5 font-bold text-[var(--brand)] text-xs w-16">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-semibold text-[var(--text-primary)] text-sm">{appointment.patientName}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-mono">ID: {appointment.patientId?.split('-')[0]}</p>
                  </td>
                  <td className="py-3.5 px-5">
                    <p className="font-medium text-[var(--text-primary)] text-sm">{appointment.clinicName}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{appointment.doctorName}</p>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${statusBadge[appointment.status] || 'badge-scheduled'}`}>
                      {statusText[appointment.status] || appointment.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    {appointment.status === 'Scheduled' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCheckIn(appointment.appointmentId)}
                        disabled={updateStatusMutation.isPending}
                      >
                        تسجيل وصول
                      </Button>
                    ) : (
                      <span className="text-[var(--text-tertiary)]">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {pageInfo.hasMore && (
          <div className="p-4 border-t border-[var(--border-light)] flex justify-center">
            <Button variant="ghost" size="sm" onClick={handleLoadMore}>
              تحميل المزيد
            </Button>
          </div>
        )}
      </div>

      <AppointmentTicket
        ticket={ticketData}
        onClose={() => setTicketData(null)}
      />
    </div>
  );
};

export default ReceptionDashboard;
