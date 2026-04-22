import React from 'react';
import { usePatientMedicalHistory } from '../../Hooks/useDoctor';
import { Calendar, User, Pill, Clock, FileText, Stethoscope, MessageSquare } from 'lucide-react';

const HistoryTimeline = ({ patientId }) => {
  const { data: history, isLoading, isError } = usePatientMedicalHistory(patientId);
  const visits = history || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--text-tertiary)]">
        <div className="w-5 h-5 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin ml-3" />
        <span className="text-sm">جاري تحميل التاريخ الطبي...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-[var(--status-error-text)] text-sm">
        حدث خطأ أثناء تحميل التاريخ الطبي.
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="card p-8 text-center animate-fadeIn">
        <FileText className="w-10 h-10 mx-auto mb-3 text-[var(--text-tertiary)] opacity-30" />
        <h3 className="font-bold text-[var(--text-secondary)] text-sm">لا يوجد تاريخ طبي</h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">لم يتم تسجيل أي زيارات سابقة لهذا المريض.</p>
      </div>
    );
  }

  return (
    <div className="relative animate-fadeIn">
      {/* Vertical timeline line */}
      <div className="absolute top-0 bottom-0 right-[15px] w-[2px] bg-[var(--border-light)]" />

      <div className="space-y-4">
        {visits.map((visit, index) => {
          const visitDate = visit.createdAt ? new Date(visit.createdAt) : null;
          const dateStr = visitDate ? visitDate.toLocaleDateString('ar-EG', {
            year: 'numeric', month: 'long', day: 'numeric'
          }) : '';
          const timeStr = visitDate ? visitDate.toLocaleTimeString('ar-EG', {
            hour: '2-digit', minute: '2-digit'
          }) : '';

          return (
            <div key={visit.id || index} className="relative pr-10 animate-slideUp" style={{ animationDelay: `${index * 60}ms` }}>
              {/* Timeline dot */}
              <div className="absolute right-[10px] top-4 z-10">
                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm
                  ${index === 0 ? 'bg-[var(--brand)]' : 'bg-[var(--text-tertiary)]'}`}
                />
              </div>

              <div className={`card p-4 hover:shadow-[var(--shadow-md)] transition-shadow duration-200
                ${index === 0 ? 'border-[var(--brand)]/20' : ''}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[var(--border-light)]">
                  <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs">
                    <Calendar size={13} className="text-[var(--text-tertiary)]" />
                    <span className="font-medium">{dateStr}</span>
                    <span className="text-[var(--text-tertiary)]">|</span>
                    <Clock size={12} className="text-[var(--text-tertiary)]" />
                    <span>{timeStr}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
                    <User size={12} />
                    <span>{visit.doctorName || 'غير محدد'}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2.5">
                  {visit.patientComplaint && (
                    <div className="flex gap-2">
                      <MessageSquare size={14} className="text-[var(--brand)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] mb-0.5">الشكوى</p>
                        <p className="text-sm text-[var(--text-primary)]">{visit.patientComplaint}</p>
                      </div>
                    </div>
                  )}

                  {visit.diagnosis && (
                    <div className="flex gap-2">
                      <Stethoscope size={14} className="text-[var(--brand)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] mb-0.5">التشخيص</p>
                        <p className="text-sm text-[var(--text-primary)]">{visit.diagnosis}</p>
                      </div>
                    </div>
                  )}

                  {visit.notes && (
                    <div className="flex gap-2">
                      <FileText size={14} className="text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] mb-0.5">ملاحظات</p>
                        <p className="text-sm text-[var(--text-secondary)]">{visit.notes}</p>
                      </div>
                    </div>
                  )}

                  {visit.prescriptions && visit.prescriptions.length > 0 && (
                    <div className="flex gap-2">
                      <Pill size={14} className="text-[var(--brand)] mt-0.5 shrink-0" />
                      <div className="w-full">
                        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] mb-1.5">الأدوية</p>
                        <div className="bg-[var(--surface)] rounded-lg p-2.5 border border-[var(--border-light)]">
                          {visit.prescriptions.map((pres, pIndex) => (
                            <div key={pIndex} className={`flex items-center gap-3 py-1.5 text-sm ${pIndex > 0 ? 'border-t border-[var(--border-light)]' : ''}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] shrink-0" />
                              <span className="font-medium text-[var(--text-primary)]">{pres.drugName}</span>
                              <span className="text-[var(--text-tertiary)]">·</span>
                              <span className="text-[var(--text-secondary)] text-xs">{pres.dosage}</span>
                              <span className="text-[var(--text-tertiary)]">·</span>
                              <span className="text-[var(--text-secondary)] text-xs">{pres.frequency}</span>
                              {pres.duration && (
                                <>
                                  <span className="text-[var(--text-tertiary)]">·</span>
                                  <span className="text-[var(--text-secondary)] text-xs">{pres.duration}</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HistoryTimeline;
