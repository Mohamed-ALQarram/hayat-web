import { useState, useEffect, useMemo } from 'react';
import { X, Search, Calendar, Clock, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useSearchPatients, useClinicsWithSchedules, useQuickBook } from '../Hooks/useReception';
import Button from './Button';

const AppointmentModal = ({ isOpen, onClose, onTicketReady }) => {
  const [step, setStep] = useState(1);
  const [patientSearch, setPatientSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: patientsData } = useSearchPatients(debouncedSearch);
  const { data: clinicsData } = useClinicsWithSchedules();
  const bookMutation = useQuickBook();

  const patients = patientsData || [];
  const clinics = clinicsData || [];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(patientSearch), 400);
    return () => clearTimeout(timer);
  }, [patientSearch]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedPatient(null);
      setSelectedClinic(null);
      setSelectedDate(null);
      setSelectedTime(null);
      setPatientSearch('');
    }
  }, [isOpen]);

  const selectedClinicData = clinics.find(c => c.clinicId === selectedClinic);

  const allowedDays = useMemo(() => {
    if (!selectedClinicData?.schedules) return new Set();
    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
    return new Set(selectedClinicData.schedules.map(s => dayMap[s.dayOfWeek]).filter(d => d !== undefined));
  }, [selectedClinicData]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const isPast = date < today;
      const isAllowed = allowedDays.has(date.getDay());
      days.push({ day: d, date, isPast, isAllowed: isAllowed && !isPast });
    }
    return days;
  }, [currentMonth, allowedDays]);

  const timeSlots = useMemo(() => {
    if (!selectedClinicData?.schedules || !selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const schedule = selectedClinicData.schedules.find(s => s.dayOfWeek === dayNames[dayOfWeek]);
    if (!schedule) return [];

    const slots = [];
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    for (let m = startMin; m < endMin; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
    }
    return slots;
  }, [selectedClinicData, selectedDate]);

  const handleClinicSelect = (clinicId) => {
    setSelectedClinic(clinicId);
    setSelectedDate(null);
    setSelectedTime(null);

    const clinic = clinics.find(c => c.clinicId === clinicId);
    if (clinic?.schedules) {
      const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
      const days = new Set(clinic.schedules.map(s => dayMap[s.dayOfWeek]).filter(d => d !== undefined));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        if (days.has(date.getDay())) {
          setSelectedDate(date);
          setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
          break;
        }
      }
    }
  };

  const handleBook = () => {
    if (!selectedPatient || !selectedClinic || !selectedDate || !selectedTime) return;

    // Get date parts directly to construct local datetime string
    // This prevents toISOString() from shifting the time to UTC
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const localDateTime = `${year}-${month}-${day}T${selectedTime}:00`;

    bookMutation.mutate(
      {
        patientId: selectedPatient.patientId,
        clinicId: selectedClinic,
        appointmentDate: localDateTime,
      },
      {
        onSuccess: (data) => {
          if (onTicketReady) onTicketReady(data);
          setStep(5);
        },
      }
    );
  };

  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const dayLabels = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[110] w-full max-w-2xl bg-white rounded-xl shadow-[var(--shadow-modal)] overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col" dir="rtl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">حجز موعد جديد</h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              الخطوة {step} من 4
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 py-3 border-b border-[var(--border-light)] flex gap-1 shrink-0">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300
                ${s <= step ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`}
            />
          ))}
        </div>

        {/* Body */}
        <div className={`p-6 flex-1 ${step === 1 ? 'overflow-visible min-h-[350px]' : 'overflow-y-auto'}`}>

          {/* Step 1: Select Patient */}
          {step === 1 && (
            <div className="animate-slideUp">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">اختر المريض</h3>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search size={16} className="text-[var(--text-tertiary)]" />
                </div>
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو رقم الهوية..."
                  className="input-base pr-9"
                  value={patientSearch}
                  onChange={(e) => { setPatientSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                />

                {showDropdown && debouncedSearch && patients.length > 0 && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-white border border-[var(--border)] rounded-lg shadow-[var(--shadow-lg)] max-h-48 overflow-y-auto">
                    {patients.map(p => (
                      <button
                        key={p.patientId}
                        className="w-full text-right px-4 py-3 hover:bg-[var(--brand-50)] transition-colors flex items-center gap-3 border-b border-[var(--border-light)] last:border-0"
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientSearch(p.fullName);
                          setShowDropdown(false);
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[var(--brand-light)] flex items-center justify-center text-[var(--brand)] font-bold text-xs">
                          {p.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-primary)]">{p.fullName}</p>
                          <p className="text-[11px] text-[var(--text-tertiary)] font-mono">{p.nationalId}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-4 bg-[var(--brand-50)] border border-[var(--brand-light)] p-3 rounded-lg flex items-center gap-3 animate-slideUp">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand)] text-white flex items-center justify-center font-bold">
                    {selectedPatient.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{selectedPatient.fullName}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{selectedPatient.phone} · {selectedPatient.nationalId}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Clinic */}
          {step === 2 && (
            <div className="animate-slideUp">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">اختر العيادة</h3>
              <div className="grid grid-cols-2 gap-2">
                {clinics.map(c => (
                  <button
                    key={c.clinicId}
                    onClick={() => handleClinicSelect(c.clinicId)}
                    className={`p-3 rounded-xl text-right transition-all duration-200 border
                      ${selectedClinic === c.clinicId
                        ? 'bg-[var(--brand-50)] border-[var(--brand)] text-[var(--brand)]'
                        : 'border-[var(--border)] hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <p className="text-sm font-semibold">{c.clinicName}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-1">
                      {c.schedules?.length || 0} أيام عمل
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Date */}
          {step === 3 && (
            <div className="animate-slideUp">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">اختر التاريخ</h3>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-tertiary)] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-[var(--text-tertiary)] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayLabels.map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-[var(--text-tertiary)] py-1">{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((d, i) => {
                  if (!d) return <div key={`empty-${i}`} />;

                  const isSelected = selectedDate && d.date.toDateString() === selectedDate.toDateString();

                  return (
                    <button
                      key={d.day}
                      disabled={!d.isAllowed}
                      onClick={() => setSelectedDate(d.date)}
                      className={`aspect-square rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center
                        ${isSelected
                          ? 'bg-[var(--brand)] text-white shadow-sm'
                          : d.isAllowed
                            ? 'hover:bg-[var(--brand-50)] text-[var(--text-primary)]'
                            : 'text-[var(--text-tertiary)] opacity-30 cursor-not-allowed'
                        }`}
                    >
                      {d.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Select Time */}
          {step === 4 && (
            <div className="animate-slideUp">
              <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">اختر الوقت</h3>
              <p className="text-xs text-[var(--text-tertiary)] mb-4">
                {selectedDate?.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2.5 rounded-lg text-xs font-medium transition-all duration-200 border
                        ${selectedTime === slot
                          ? 'bg-[var(--brand)] text-white border-[var(--brand)] shadow-sm'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
                        }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  لا توجد أوقات متاحة لهذا اليوم
                </div>
              )}

              {bookMutation.isError && (
                <div className="mt-6 bg-[var(--status-error-bg)] border border-[var(--status-error-border)] text-[var(--status-error-text)] p-3 rounded-lg text-sm text-center animate-fadeIn">
                  <p className="font-bold mb-1">حدث خطأ أثناء الحجز</p>
                  <p>{bookMutation.error?.customMessage || 'يرجى المحاولة مرة أخرى.'}</p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="animate-scaleIn flex flex-col items-center justify-center py-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-5 relative">
                <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-20" />
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">تم الحجز بنجاح!</h3>
              <p className="text-sm text-[var(--text-tertiary)] max-w-sm mx-auto">
                تم تأكيد الموعد بنجاح للمريض <span className="font-bold text-[var(--text-secondary)]">{selectedPatient?.fullName}</span>.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex justify-between items-center shrink-0">
          {step > 1 && step < 5 ? (
            <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>السابق</Button>
          ) : (
            <div />
          )}

          {step === 5 ? (
            <Button size="sm" onClick={onClose}>إغلاق نافذة الحجز</Button>
          ) : step < 4 ? (
            <Button
              size="sm"
              disabled={
                (step === 1 && !selectedPatient) ||
                (step === 2 && !selectedClinic) ||
                (step === 3 && !selectedDate)
              }
              onClick={() => setStep(step + 1)}
            >
              التالي
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={!selectedTime || bookMutation.isPending}
              onClick={handleBook}
            >
              {bookMutation.isPending ? 'جاري الحجز...' : 'تأكيد الحجز'}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AppointmentModal;
