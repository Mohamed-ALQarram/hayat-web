import React from 'react';
import { useDoctorVisitStore } from '../../store/doctorVisitStore';
import { useSubmitMedicalHistory, useUpdateAppointmentStatus } from '../../Hooks/useDoctor';
import { Plus, Trash2, Send, FileText, Pill, Save, Stethoscope, MessageSquare } from 'lucide-react';
import Button from '../../components/Button';

const ActiveVisitForm = ({ activePatient }) => {
  const { drafts, activeAppointmentId, updateDraft, addPrescription, removePrescription, clearDraft, setActiveAppointment } = useDoctorVisitStore();
  const submitHistory = useSubmitMedicalHistory();
  const updateStatus = useUpdateAppointmentStatus();

  const currentDraft = drafts[activeAppointmentId] || { patientComplaint: '', diagnosis: '', notes: '', prescriptions: [] };

  const handleFieldChange = (field, value) => {
    updateDraft(activeAppointmentId, { [field]: value });
  };

  const handleAddDrug = () => {
    addPrescription(activeAppointmentId, { drugName: '', dosage: '', frequency: '', duration: '' });
  };

  const handlePrescriptionChange = (index, field, value) => {
    const updated = [...currentDraft.prescriptions];
    updated[index] = { ...updated[index], [field]: value };
    updateDraft(activeAppointmentId, { prescriptions: updated });
  };

  const handleFinishVisit = async () => {
    try {
      await submitHistory.mutateAsync({
        patientId: activePatient.patientId,
        payload: {
          patientComplaint: currentDraft.patientComplaint,
          diagnosis: currentDraft.diagnosis,
          notes: currentDraft.notes,
          prescriptions: currentDraft.prescriptions.filter(p => p.drugName.trim()),
        }
      });

      await updateStatus.mutateAsync({
        appointmentId: activeAppointmentId,
        payload: { status: 'Completed' }
      });

      clearDraft(activeAppointmentId);
      setActiveAppointment(null);
    } catch (error) {
      console.error('Visit submission failed:', error);
    }
  };

  const isSubmitting = submitHistory.isPending || updateStatus.isPending;

  if (activePatient.status === 'Completed') {
    return (
      <div className="card p-8 text-center animate-fadeIn">
        <div className="w-12 h-12 bg-[var(--status-done-bg)] rounded-full flex items-center justify-center mx-auto mb-3">
          <Stethoscope className="w-6 h-6 text-[var(--status-done-text)]" />
        </div>
        <h3 className="font-bold text-[var(--text-primary)] text-sm">تم الانتهاء من الزيارة</h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">يمكنك عرض التاريخ الطبي من تاب "التاريخ الطبي"</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slideUp">
      {/* Auto-save indicator */}
      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] text-[11px]">
        <Save size={12} />
        <span>الحفظ التلقائي مفعل</span>
      </div>

      {/* Complaint */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-50)] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--brand)]" />
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">الشكوى الرئيسية</h4>
        </div>
        <textarea
          value={currentDraft.patientComplaint}
          onChange={(e) => handleFieldChange('patientComplaint', e.target.value)}
          placeholder="اكتب شكوى المريض الرئيسية..."
          rows="3"
          className="input-base resize-none"
        />
      </div>

      {/* Diagnosis */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-50)] flex items-center justify-center">
            <Stethoscope className="w-3.5 h-3.5 text-[var(--brand)]" />
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">التشخيص</h4>
        </div>
        <textarea
          value={currentDraft.diagnosis}
          onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
          placeholder="اكتب التشخيص المبدئي أو النهائي..."
          rows="2"
          className="input-base resize-none"
        />
      </div>

      {/* Notes */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-50)] flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-[var(--brand)]" />
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">ملاحظات سريرية</h4>
        </div>
        <textarea
          value={currentDraft.notes}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          placeholder="ملاحظات إضافية..."
          rows="2"
          className="input-base resize-none"
        />
      </div>

      {/* Prescriptions */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand-50)] flex items-center justify-center">
              <Pill className="w-3.5 h-3.5 text-[var(--brand)]" />
            </div>
            <h4 className="text-sm font-bold text-[var(--text-primary)]">الوصفة الطبية</h4>
          </div>
          <button
            onClick={handleAddDrug}
            className="flex items-center gap-1 text-[var(--brand)] hover:bg-[var(--brand-50)] px-2 py-1 rounded-md text-xs font-semibold transition-colors"
          >
            <Plus size={14} />
            إضافة دواء
          </button>
        </div>

        {currentDraft.prescriptions.length === 0 ? (
          <div className="border border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--text-tertiary)]">
            <Pill className="w-6 h-6 mx-auto mb-2 opacity-30" />
            <p className="text-xs">لا توجد أدوية. اضغط "إضافة دواء" لإضافة وصفة.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDraft.prescriptions.map((pres, index) => (
              <div key={index} className="bg-[var(--surface)] p-3 rounded-lg border border-[var(--border-light)] animate-slideUp">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[var(--text-tertiary)]">دواء #{index + 1}</span>
                  <button
                    onClick={() => removePrescription(activeAppointmentId, index)}
                    className="text-[var(--text-tertiary)] hover:text-[var(--status-error-text)] transition-colors p-1 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="اسم الدواء"
                    className="input-base text-xs"
                    value={pres.drugName}
                    onChange={(e) => handlePrescriptionChange(index, 'drugName', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="الجرعة"
                    className="input-base text-xs"
                    value={pres.dosage}
                    onChange={(e) => handlePrescriptionChange(index, 'dosage', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="التكرار"
                    className="input-base text-xs"
                    value={pres.frequency}
                    onChange={(e) => handlePrescriptionChange(index, 'frequency', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="المدة"
                    className="input-base text-xs"
                    value={pres.duration}
                    onChange={(e) => handlePrescriptionChange(index, 'duration', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-start pt-2 pb-4">
        <Button
          onClick={handleFinishVisit}
          disabled={isSubmitting || !currentDraft.patientComplaint.trim()}
          className="gap-2"
        >
          <Send size={16} />
          {isSubmitting ? 'جاري الحفظ...' : 'إنهاء الزيارة واستدعاء التالي'}
        </Button>
      </div>
    </div>
  );
};

export default ActiveVisitForm;
