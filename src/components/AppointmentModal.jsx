import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, ChevronDown, ChevronRight, ChevronLeft, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useSearchPatients, useClinicsWithSchedules, useQuickBook } from '../Hooks/useReception';
import AppointmentTicket from './AppointmentTicket';

const DAYS_OF_WEEK_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const AR_DAY_INITIALS = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج']; // Sat, Sun, Mon, Tue, Wed, Thu, Fri

const AppointmentModal = ({ isOpen, onClose }) => {
  // 1. Patient Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // If the user selected a patient, and the search term hasn't changed from their name, do not search again.
  const queryTerm = (selectedPatient && selectedPatient.fullName === debouncedSearchTerm) ? '' : debouncedSearchTerm;
  const { data: searchResults, isFetching: isSearching, isSuccess } = useSearchPatients(queryTerm);
  const patients = searchResults || [];

  useEffect(() => {
    if ((isSuccess || isSearching) && debouncedSearchTerm.trim().length > 2 && !selectedPatient) {
      setShowPatientDropdown(true);
    }
  }, [isSuccess, isSearching, debouncedSearchTerm, selectedPatient]);

  // 2. Clinic State & Fetching
  const { data: clinicsData } = useClinicsWithSchedules();
  const clinics = clinicsData || [];
  const [selectedClinicId, setSelectedClinicId] = useState('');

  // 3. Date & Time State
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Controls the calendar view
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  // 4. Booking Mutation & Ticket State
  const quickBookMutation = useQuickBook();
  const [ticketData, setTicketData] = useState(null);

  // Handlers & Effects
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      // Reset state on close
      setSearchTerm('');
      setDebouncedSearchTerm('');
      setSelectedPatient(null);
      setSelectedClinicId('');
      setSelectedDate(null);
      setSelectedTime('');
      setCurrentMonth(new Date());
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto'; // ensure it resets
    };
  }, [isOpen, onClose]);

  // Auto-select nearest available appointment when clinic changes
  useEffect(() => {
    if (!selectedClinicId) return;

    const clinic = clinics.find(c => c.clinicId.toString() === selectedClinicId.toString());
    if (!clinic || !clinic.schedules) return;

    let dateObj = new Date();
    dateObj.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(dateObj.getTime() + i * 24 * 60 * 60 * 1000);
      const dayName = DAYS_OF_WEEK_NAMES[checkDate.getDay()];
      const schedule = clinic.schedules.find(s => s.dayOfWeek === dayName);

      if (schedule) {
        let startTimeSplit = schedule.startTime.split(':');
        let endTimeSplit = schedule.endTime.split(':');

        let current = new Date(checkDate);
        current.setHours(parseInt(startTimeSplit[0]), parseInt(startTimeSplit[1]), 0);

        let end = new Date(checkDate);
        end.setHours(parseInt(endTimeSplit[0]), parseInt(endTimeSplit[1]), 0);

        const now = new Date();
        let foundTime = null;

        while (current < end) {
          if (current > now) {
            const hours = current.getHours();
            const m = current.getMinutes().toString().padStart(2, '0');
            foundTime = `${hours.toString().padStart(2, '0')}:${m}:00`;
            break;
          }
          current = new Date(current.getTime() + 30 * 60000);
        }

        if (foundTime) {
          setSelectedDate(checkDate);
          setSelectedTime(foundTime);
          setCurrentMonth(new Date(checkDate.getFullYear(), checkDate.getMonth(), 1));
          break;
        }
      }
    }
  }, [selectedClinicId, clinics]);

  const handlePatientSelect = (p) => {
    setSelectedPatient(p);
    setSearchTerm(p.fullName);
    setShowPatientDropdown(false);
  };

  // Calendar Helpers
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week for first day (0 = Sunday, 1 = Monday, ...)
    // If we want SATURDAY to be the first column (index 0)
    // Map JS logic: Sunday=0 -> 1, Monday=1 -> 2 ... Saturday=6 -> 0
    const shiftSat = (jsDay) => (jsDay === 6 ? 0 : jsDay + 1);

    const startingBlankDays = shiftSat(firstDayOfMonth.getDay());

    const days = [];

    // Add blanks
    for (let i = 0; i < startingBlankDays; i++) {
      days.push(null);
    }

    // Add real days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDayValidForClinic = (dateObj) => {
    if (!selectedClinicId || !dateObj) return false;
    const clinic = clinics.find(c => c.clinicId.toString() === selectedClinicId.toString());
    if (!clinic || !clinic.schedules) return false;

    const dayName = DAYS_OF_WEEK_NAMES[dateObj.getDay()];
    return clinic.schedules.some(s => s.dayOfWeek === dayName);
  };

  const isPastDay = (dateObj) => {
    if (!dateObj) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateObj < today;
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handlePrevMonth = () => {
    const today = new Date();
    if (currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth()) {
      return; // Block past months
    }
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const selectedClinic = clinics.find(c => c.clinicId.toString() === selectedClinicId.toString());

  // Time Slot Helpers
  const generateTimeSlots = () => {
    if (!selectedDate || !selectedClinic) return [];

    const dayName = DAYS_OF_WEEK_NAMES[selectedDate.getDay()];
    const schedule = selectedClinic.schedules?.find(s => s.dayOfWeek === dayName);

    if (!schedule) return [];

    let startTimeSplit = schedule.startTime.split(':');
    let endTimeSplit = schedule.endTime.split(':');

    let current = new Date(selectedDate);
    current.setHours(parseInt(startTimeSplit[0]), parseInt(startTimeSplit[1]), 0);

    let end = new Date(selectedDate);
    end.setHours(parseInt(endTimeSplit[0]), parseInt(endTimeSplit[1]), 0);

    const slots = [];
    const now = new Date();

    while (current < end) {
      const hours = current.getHours();
      const h12 = hours % 12 || 12;
      const ampm = hours >= 12 ? 'م' : 'ص';
      const m = current.getMinutes().toString().padStart(2, '0');

      const timeString24 = `${hours.toString().padStart(2, '0')}:${m}:00`;
      const timeLabel = `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;

      const isPast = current < now;

      slots.push({
        value: timeString24,
        label: timeLabel,
        disabled: isPast
      });

      current = new Date(current.getTime() + 30 * 60000); // add 30 mins
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = () => {
    if (!selectedPatient || !selectedClinicId || !selectedDate || !selectedTime) {
      alert('يرجى استكمال جميع البيانات قبل الحجز');
      return;
    }

    const dateString = selectedDate.toLocaleDateString('en-CA');
    const dateTime = new Date(`${dateString}T${selectedTime}`);

    const payload = {
      patientId: selectedPatient.patientId,
      clinicId: parseInt(selectedClinicId),
      appointmentDate: dateTime.toISOString()
    };

    quickBookMutation.mutate(payload, {
      onSuccess: (data) => {
        setTicketData(data); // show the ticket
      },
      onError: (err) => {
        alert(err.customMessage || 'حدث خطأ أثناء حجز الموعد. الرجاء المحاولة مجدداً');
        console.error(err);
      }
    });
  };

  const handleTicketClose = () => {
    setTicketData(null);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative z-[110] w-full max-w-4xl mx-auto" dir="rtl">
          <div className="bg-white rounded-xl shadow-[0_12px_32px_rgba(42,52,55,0.06)] border border-gray-200 overflow-hidden">

            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-gray-200 flex justify-between items-center relative">
              <div className="absolute right-0 top-0 w-32 h-full bg-blue-50/50 rounded-l-full -mr-16"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 relative z-10">
                  <CalendarIcon className="text-blue-600 w-8 h-8" />
                  حجز موعد جديد
                </h2>
                <p className="text-gray-500 text-sm mt-1 mr-10 relative z-10">أدخل بيانات المريض والعيادة المطلوبة لإتمام الحجز.</p>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-100 z-10 relative">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              {/* Left Column: Patient & Clinic */}
              <div className="space-y-8">
                {/* Patient Search */}
                <div className="space-y-2 relative">
                  <label className="text-xs text-gray-500 font-semibold px-1 block">البحث عن مريض</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pr-10 pl-4 text-gray-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors outline-none placeholder:text-gray-400"
                      placeholder="الاسم، رقم الهوية، أو رقم الملف"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (selectedPatient && e.target.value !== selectedPatient.fullName) {
                          setSelectedPatient(null);
                        }
                      }}
                      onFocus={() => { if (patients.length > 0) setShowPatientDropdown(true); }}
                      onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)}
                    />

                    {showPatientDropdown && (
                      <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-lg z-20 max-h-60 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-3 text-sm text-gray-500 text-center">جاري البحث...</div>
                        ) : patients.length > 0 ? (
                          patients.map(p => (
                            <div
                              key={p.patientId}
                              onClick={() => handlePatientSelect(p)}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                            >
                              <div className="font-semibold text-gray-900 text-sm">{p.fullName}</div>
                              <div className="text-xs text-gray-500 flex gap-3 mt-1">
                                <span>id: {p.nationalId}</span>
                                <span>هاتف: {p.phone}</span>
                              </div>
                            </div>
                          ))
                        ) : debouncedSearchTerm.trim().length > 2 ? (
                          <div className="p-3 text-sm text-gray-500 text-center">لا توجد نتائج</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clinic Selection */}
                <div className="space-y-2 relative">
                  <label className="text-xs text-gray-500 font-semibold px-1 block">العيادة</label>
                  <div className="relative">
                    <select
                      value={selectedClinicId}
                      onChange={(e) => {
                        setSelectedClinicId(e.target.value);
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pr-4 pl-10 text-gray-900 text-sm focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors outline-none appearance-none cursor-pointer"
                    >
                      <option disabled value="">اختر العيادة...</option>
                      {clinics.map(c => (
                        <option key={c.clinicId} value={c.clinicId}>{c.clinicName}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Date & Time */}
              <div className="space-y-8">
                {/* Calendar Grid */}
                <div className="space-y-2 relative">
                  <label className="text-xs text-gray-500 font-semibold px-1 block">تاريخ الموعد</label>

                  {/* Overlay if clinic not selected */}
                  {!selectedClinicId && (
                    <div className="absolute inset-0 top-6 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg border border-gray-100">
                      <span className="text-sm font-semibold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">يرجى اختيار العيادة أولاً</span>
                    </div>
                  )}

                  <div className="bg-white rounded-lg border border-gray-200 p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={handleNextMonth}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm text-gray-900">
                        {currentMonth.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                      </span>
                      <button
                        onClick={handlePrevMonth}
                        disabled={currentMonth.getFullYear() === new Date().getFullYear() && currentMonth.getMonth() === new Date().getMonth()}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {AR_DAY_INITIALS.map((dayLabel, idx) => (
                        <span key={idx} className="text-[10px] font-semibold text-gray-400">{dayLabel}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {generateCalendarDays().map((d, i) => {
                        if (!d) return <div key={`blank-${i}`} className="p-1"></div>;

                        const isValid = isDayValidForClinic(d);
                        const isPast = isPastDay(d);
                        const isSelectable = isValid && !isPast;

                        const isSelectedDate = selectedDate && d.getTime() === selectedDate.getTime();

                        return (
                          <button
                            key={d.toString()}
                            disabled={!isSelectable}
                            onClick={() => {
                              setSelectedDate(d);
                              setSelectedTime('');
                            }}
                            className={`p-1 rounded-md transition-colors ${isSelectedDate
                              ? 'bg-blue-600 text-white font-bold shadow-md'
                              : isSelectable
                                ? 'hover:bg-gray-100 cursor-pointer text-gray-900'
                                : 'text-gray-300 cursor-not-allowed line-through decoration-gray-200'
                              }`}
                          >
                            {d.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-semibold px-1 flex justify-between">
                    <span>الوقت المتاح</span>
                    {selectedDate && <span className="text-blue-600 font-normal">{selectedDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
                  </label>

                  <div className="grid grid-cols-3 gap-3">
                    {!selectedDate ? (
                      <div className="col-span-3 text-center py-4 text-sm text-gray-400 border border-dashed border-gray-200 rounded-md">
                        اختر تاريخ الموعد لعرض الأوقات المتاحة
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="col-span-3 text-center py-4 text-sm text-gray-400 border border-dashed border-gray-200 rounded-md">
                        لا توجد أوقات متاحة في هذا اليوم
                      </div>
                    ) : timeSlots.map((slot) => {
                      const isSelected = selectedTime === slot.value;
                      return (
                        <button
                          key={slot.value}
                          disabled={slot.disabled}
                          onClick={() => setSelectedTime(slot.value)}
                          className={`rounded-md py-2 text-sm transition-colors border ${slot.disabled
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed line-through'
                            : isSelected
                              ? 'bg-blue-50 border-blue-600 text-blue-600 font-bold shadow-sm'
                              : 'bg-white border-gray-200 text-gray-900 hover:border-blue-600 hover:text-blue-600'
                            }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-8 py-5 flex justify-end gap-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-md font-bold text-sm text-gray-900 hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedPatient || !selectedClinicId || !selectedDate || !selectedTime}
                className="bg-blue-600 text-white px-8 py-2 rounded-md font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                حجز الموعد
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Renders the ticket overlay when booking is successful */}
      {ticketData && (
        <AppointmentTicket
          ticket={ticketData}
          onClose={handleTicketClose}
        />
      )}
    </>,
    document.body
  );
};

export default AppointmentModal;
