import React, { useState } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BookingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, latestDiagnosis, activeProposal, logLeadActivity, showToast } = useApp();

  const [meetingType, setMeetingType] = useState<'quick' | 'deep' | 'tech'>('deep');
  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  const [selectedSlot, setSelectedSlot] = useState('14:30 ~ 15:30');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [attendeeRoles, setAttendeeRoles] = useState('董事长/总经理 + 外贸总监');
  const [isBooked, setIsBooked] = useState(false);

  if (!isOpen) return null;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    logLeadActivity(`预约出海闭门诊断会 (${selectedDate} ${selectedSlot})`, 30, {
      meetingType,
      contactName,
      companyName,
    });
    showToast('诊断会预约成功！会前简报已自动同步至售前团队工作台。');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="apple-glass rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden text-[#f5f5f7] border border-white/[0.12]">
        {/* Header */}
        <div className="px-8 py-5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2997ff]/15 text-[#2997ff] border border-[#2997ff]/25 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">预约 1 对 1 出海闭门诊断会</h2>
              <p className="text-xs text-[#86868b]">带着报告进会议，直奔实质性解决方案</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-[#86868b] hover:text-white rounded-full hover:bg-white/[0.06] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {!isBooked ? (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-semibold text-white block">选择诊断形式与深度：</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'quick', title: '快速诊断 (30分钟)', desc: '线上 · 解读自评分数', target: '外贸总监' },
                    { id: 'deep', title: '深度诊断 (60分钟)', desc: '线上/上门 · 立项与方案定制', target: '老板 + 总监' },
                    { id: 'tech', title: '技术对接评估 (60分钟)', desc: '线上 · 系统对接与 FDE', target: 'IT 负责人 + 业务' },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setMeetingType(m.id as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        meetingType === m.id
                          ? 'bg-white/15 border-white/30 text-white font-medium shadow-sm'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#86868b] hover:border-white/15'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-white mb-1">{m.title}</h4>
                      <p className="text-[11px] text-[#86868b] leading-normal">{m.desc}</p>
                      <span className="text-[10px] text-[#2997ff] font-mono mt-1 block">建议参会：{m.target}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#a1a1a6] block mb-1.5">选择预约日期</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#a1a1a6] block mb-1.5">选择时间时段</label>
                  <select
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white"
                  >
                    <option value="10:00 ~ 11:00">上午 10:00 ~ 11:00</option>
                    <option value="14:30 ~ 15:30">下午 14:30 ~ 15:30</option>
                    <option value="16:00 ~ 17:00">下午 16:00 ~ 17:00</option>
                    <option value="19:30 ~ 20:30">晚间 19:30 ~ 20:30</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#a1a1a6] block mb-1.5">您的称呼</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="如：张总 / 李总监"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#a1a1a6] block mb-1.5">联系手机号</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="如：13800000000"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-[#a1a1a6] block mb-1.5">企业全称</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="如：某医疗科技股份有限公司"
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/[0.1] rounded-xl text-xs text-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="apple-blue-btn w-full py-3.5 text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/25"
              >
                确认预约诊断会并生成会前简报
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#30d158]/15 text-[#30d158] border border-[#30d158]/30 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">诊断会预约已确认！</h3>
              <p className="text-xs sm:text-sm text-[#a1a1a6] max-w-md mx-auto leading-relaxed font-normal">
                会议时间：{selectedDate} {selectedSlot}。会议链接已发送至您的手机号 {contactPhone}。
              </p>
              <button
                onClick={onClose}
                className="apple-secondary-btn px-8 py-2.5 text-xs font-medium"
              >
                完成并返回
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
