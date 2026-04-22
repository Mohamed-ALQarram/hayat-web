import React from 'react';
import { useDoctorVisitStore } from '../../store/doctorVisitStore';
import { useUpdateAppointmentStatus } from '../../Hooks/useDoctor';
import { Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

const QueueSidebar = ({ queue }) => {
  const { activeAppointmentId, setActiveAppointment, clearDraft } = useDoctorVisitStore();
  const updateStatus = useUpdateAppointmentStatus();

  const handleAttend = (appointmentId) => {
    updateStatus.mutate({ appointmentId, payload: { status: 'InProgress' } });
  };

  const handleAbsent = (appointmentId) => {
    updateStatus.mutate(
      { appointmentId, payload: { status: 'Cancelled' } },
      { onSuccess: () => { clearDraft(appointmentId); } }
    );
  };

  const statusConfig = {
    'Waiting': { badge: 'badge-waiting', label: 'في الانتظار', icon: Clock },
    'Scheduled': { badge: 'badge-scheduled', label: 'مجدول', icon: Clock },
    'InProgress': { badge: 'badge-active', label: 'جاري الكشف', icon: CheckCircle },
    'Completed': { badge: 'badge-done', label: 'مكتمل', icon: CheckCircle },
    'Cancelled': { badge: 'badge-error', label: 'ملغي', icon: XCircle },
  };

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[var(--text-tertiary)]">
        <Clock className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm font-medium text-[var(--text-secondary)]">لا يوجد مرضى</p>
        <p className="text-xs mt-0.5">قائمة الانتظار فارغة حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {queue.map((patient) => {
        const isActive = patient.appointmentId === activeAppointmentId;
        const config = statusConfig[patient.status] || statusConfig.Scheduled;
        const appointmentTime = patient.appointmentDate
          ? new Date(patient.appointmentDate).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          : null;

        return (
          <div key={patient.appointmentId}>
            <button
              onClick={() => setActiveAppointment(patient.appointmentId)}
              className={`w-full text-right p-3 rounded-xl transition-all duration-200 border
                ${isActive
                  ? 'bg-[var(--brand-50)] border-[var(--brand)] shadow-sm'
                  : 'border-transparent hover:bg-gray-50 hover:border-[var(--border)]'
                }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isActive ? 'text-[var(--brand)]' : 'text-[var(--text-primary)]'}`}>
                    {patient.patientName}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.badge}`}>
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[var(--text-tertiary)]">
                {appointmentTime && <span>{appointmentTime}</span>}
                <span>·</span>
                <span className="font-mono">{patient.patientId.split('-')[0]}</span>
              </div>
            </button>

            {/* Action Buttons - only for active */}
            {isActive && (patient.status === 'Waiting' || patient.status === 'Scheduled') && (
              <div className="flex items-center gap-2 mt-1.5 mr-3 animate-slideUp">
                <button
                  onClick={() => {}}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--text-tertiary)] hover:bg-gray-100 transition-colors"
                >
                  <Phone size={12} />
                  استدعاء
                </button>
                <button
                  onClick={() => handleAttend(patient.appointmentId)}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--status-active-text)] bg-[var(--status-active-bg)] hover:bg-green-100 transition-colors border border-[var(--status-active-border)]"
                >
                  <CheckCircle size={12} />
                  حضر
                </button>
                <button
                  onClick={() => handleAbsent(patient.appointmentId)}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-[var(--status-error-text)] bg-[var(--status-error-bg)] hover:bg-red-100 transition-colors border border-[var(--status-error-border)]"
                >
                  <XCircle size={12} />
                  تغيب
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QueueSidebar;
