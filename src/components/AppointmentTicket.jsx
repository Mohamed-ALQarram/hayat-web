import React from 'react';
import { X, Printer, Calendar, Clock, User, HeartPulse, FileText } from 'lucide-react';

const AppointmentTicket = ({ ticket, onClose }) => {
  if (!ticket) return null;

  // Format date and time safely
  const dateObj = new Date(ticket.appointmentDate);
  const formattedDate = dateObj.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const timeHours = dateObj.getHours();
  const timeString = `${(timeHours % 12) || 12}:${dateObj.getMinutes().toString().padStart(2, '0')} ${timeHours >= 12 ? 'م' : 'ص'}`;

  const formattedCreatedAt = new Date(ticket.createdAt).toLocaleString('ar-EG');

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Ticket Container */}
      <div className="relative z-[130] w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden" dir="rtl">
        {/* Ticket Header */}
        <div className="bg-blue-600 text-white p-5 flex justify-between items-center relative overflow-hidden">
          <div className="absolute opacity-10 -right-4 -top-4">
            <HeartPulse size={100} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-1">تذكرة موعد</h3>
            <p className="text-blue-100 text-xs">رقم الحجز: {ticket.appointmentId}</p>
          </div>
          <button onClick={onClose} className="hover:bg-blue-700 p-2 rounded-full transition relative z-10">
            <X size={20} />
          </button>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
            {/* Cutout effect holes */}
            <div className="absolute -left-2 top-1/2 -mt-2 w-4 h-4 bg-gray-50 rounded-full border-r border-gray-100"></div>
            <div className="absolute -right-2 top-1/2 -mt-2 w-4 h-4 bg-gray-50 rounded-full border-l border-gray-100"></div>

            <div className="flex items-start gap-3 border-b border-dashed border-gray-200 pb-3 mb-3">
              <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                <User size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">اسم المريض</p>
                <p className="font-bold text-gray-900">{ticket.patientName}</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{ticket.patientId?.split('-')[0]}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400">التاريخ</p>
                  <p className="font-semibold text-gray-800 text-sm">{formattedDate.split('،')[1] || formattedDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-[10px] text-gray-400">الوقت</p>
                  <p className="font-semibold text-gray-800 text-sm" dir="ltr">{timeString}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-50 p-2 rounded-lg text-green-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-400">العيادة</p>
                <p className="font-bold text-gray-900">{ticket.clinicName}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md border border-gray-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              {ticket.doctorName}
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400 px-2 mt-2">
            <span>تاريخ الإنشاء: <span dir="ltr">{formattedCreatedAt}</span></span>
            <span className="bg-blue-50 px-2 py-1 rounded-full text-blue-600 font-medium">{ticket.status}</span>
          </div>
        </div>

        {/* Ticket Footer / Action */}
        <div className="p-4 border-t-2 border-dashed border-gray-200 bg-gray-50 flex justify-center pb-6">
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md w-full justify-center group">
            <Printer size={18} className="group-hover:scale-110 transition-transform" />
            طباعة التذكرة
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTicket;
