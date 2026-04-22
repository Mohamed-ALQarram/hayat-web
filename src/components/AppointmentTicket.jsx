import { createPortal } from 'react-dom';
import { X, Printer, Calendar, Clock, User, MapPin } from 'lucide-react';
import HayatLogo from './HayatLogo';

const AppointmentTicket = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const appointmentDate = ticket.appointmentDate ? new Date(ticket.appointmentDate) : null;
  const dateStr = appointmentDate?.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const timeStr = appointmentDate?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
      <div className="absolute inset-0 bg-[var(--surface-overlay)] backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[130] w-full max-w-sm animate-scaleIn">
        {/* Ticket */}
        <div className="bg-white rounded-xl shadow-[var(--shadow-modal)] overflow-hidden print:shadow-none" id="print-ticket">
          {/* Header */}
          <div className="bg-[var(--brand)] px-6 py-5 text-center">
            <HayatLogo variant="light" size="sm" />
            <p className="text-blue-200/30 text-[10px] tracking-wider mt-1">HOSPITAL INFORMATION SYSTEM</p>
          </div>

          {/* Dashed separator */}
          <div className="relative">
            <div className="absolute -right-3 -top-3 w-6 h-6 bg-[var(--surface)] rounded-full" />
            <div className="absolute -left-3 -top-3 w-6 h-6 bg-[var(--surface)] rounded-full" />
            <div className="border-t-2 border-dashed border-[var(--border)] mx-6" />
          </div>

          {/* Ticket Body */}
          <div className="p-6 space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">تذكرة موعد</h3>
              <p className="text-[11px] text-[var(--text-tertiary)]">Appointment Ticket</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={14} className="text-[var(--brand)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)]">المريض</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{ticket.patientName || 'غير محدد'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-[var(--brand)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)]">العيادة / الطبيب</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{ticket.clinicName || 'غير محدد'}</p>
                  {ticket.doctorName && <p className="text-xs text-[var(--text-secondary)]">{ticket.doctorName}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={14} className="text-[var(--brand)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)]">التاريخ</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{dateStr || 'غير محدد'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={14} className="text-[var(--brand)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] text-[var(--text-tertiary)]">الوقت</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{timeStr || 'غير محدد'}</p>
                </div>
              </div>
            </div>

            {ticket.appointmentId && (
              <div className="bg-[var(--surface)] border border-[var(--border-light)] rounded-lg p-2 text-center">
                <p className="text-[10px] text-[var(--text-tertiary)] mb-0.5">رقم الموعد</p>
                <p className="text-xs font-mono font-bold text-[var(--brand)]">{String(ticket.appointmentId).split('-')[0]?.toUpperCase()}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 border-t border-[var(--border-light)] pt-4 text-center text-[10px] text-[var(--text-tertiary)]">
            يرجى الحضور قبل الموعد بـ 15 دقيقة
          </div>
        </div>

        {/* Action Buttons (outside ticket for print) */}
        <div className="flex gap-2 mt-4 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-[var(--border)] text-[var(--text-secondary)] py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Printer size={16} />
            طباعة التذكرة
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[var(--brand)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--brand-dark)] transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AppointmentTicket;
