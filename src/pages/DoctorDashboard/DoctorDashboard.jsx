import React, { useEffect, useState } from 'react';
import QueueSidebar from './QueueSidebar';
import ActiveVisitForm from './ActiveVisitForm';
import HistoryTimeline from './HistoryTimeline';
import { useDoctorQueue } from '../../Hooks/useDoctor';
import { useDoctorVisitStore } from '../../store/doctorVisitStore';
import { useAuthStore } from '../../store/authStore';
import { FileText, User, Stethoscope, History } from 'lucide-react';

const DoctorDashboard = () => {
  const { data: queueData, isLoading } = useDoctorQueue();
  const { activeAppointmentId, setActiveAppointment } = useDoctorVisitStore();
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('current');

  const queue = queueData || [];
  const activePatient = queue.find(p => p.appointmentId === activeAppointmentId);

  useEffect(() => {
    if (!activePatient && queue.length > 0) {
      const nextP = queue.find(p => p.status === 'InProgress' || p.status === 'Waiting' || p.status === 'Scheduled');
      if (nextP) {
        setActiveAppointment(nextP.appointmentId);
      }
    }
  }, [queue, activePatient, setActiveAppointment]);

  return (
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-52px)] overflow-hidden bg-[var(--surface)] relative" dir="rtl">

      {/* Right Sidebar: Queue */}
      <div className="md:w-[380px] bg-white border-l border-[var(--border)] flex flex-col md:h-[calc(100vh-52px)] overflow-hidden shrink-0 z-10">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-[var(--text-primary)] text-sm">قائمة الانتظار</h3>
            <span className="bg-[var(--brand-light)] text-[var(--brand)] px-2 py-0.5 rounded-md text-[11px] font-semibold">
              {queue.length} مريض
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            {user?.displayName || 'طبيب'} · ID: {user?.userId?.split('-')[0] || '-'}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">
              <div className="w-5 h-5 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              جاري التحميل...
            </div>
          ) : (
            <QueueSidebar queue={queue} />
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">

        {activePatient ? (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Patient Header */}
            <div className="card p-4 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--brand-light)] p-2.5 rounded-xl">
                  <User className="text-[var(--brand)] w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">{activePatient.patientName}</h2>
                  <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    <span className="font-mono">ID: {activePatient.patientId.split('-')[0]}</span>
                    <span>•</span>
                    <span>{activePatient.gender === 'Female' ? 'أنثى' : 'ذكر'}</span>
                    <span>•</span>
                    <span>العمر: {activePatient.age || 'غير مدرج'}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-[var(--surface)] p-1 rounded-lg border border-[var(--border-light)]">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200
                    ${activeTab === 'current'
                      ? 'bg-white text-[var(--brand)] shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                >
                  <Stethoscope size={14} />
                  الزيارة الحالية
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200
                    ${activeTab === 'history'
                      ? 'bg-white text-[var(--brand)] shadow-sm border border-[var(--border)]'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                >
                  <History size={14} />
                  التاريخ الطبي
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === 'current' ? (
                <ActiveVisitForm activePatient={activePatient} />
              ) : (
                <HistoryTimeline patientId={activePatient.patientId} />
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-[var(--text-tertiary)] animate-fadeIn">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">العيادة فارغة حالياً</h3>
            <p className="text-xs mt-1">لا يوجد مرضى في قائمة الانتظار</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
