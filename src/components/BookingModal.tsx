import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Dialog, DialogBody } from './ui/Dialog';
import { SHOW_FDE } from '../lib/features';

const MEETING_TYPES = [
  { id: 'quick', title: '快速诊断', duration: '30 分钟', desc: '线上 · 解读自评分数', target: '外贸总监' },
  { id: 'deep', title: '深度诊断', duration: '60 分钟', desc: '线上或上门 · 立项与方案定制', target: '老板 + 总监' },
  { id: 'tech', title: '技术对接评估', duration: '60 分钟', desc: SHOW_FDE ? '线上 · 系统对接与 FDE' : '线上 · 系统对接与数据打通', target: 'IT 负责人 + 业务' },
] as const;

const TIME_SLOTS = [
  { value: '10:00 ~ 11:00', label: '上午 10:00 ~ 11:00' },
  { value: '14:30 ~ 15:30', label: '下午 14:30 ~ 15:30' },
  { value: '16:00 ~ 17:00', label: '下午 16:00 ~ 17:00' },
  { value: '19:30 ~ 20:30', label: '晚间 19:30 ~ 20:30' },
];

export const BookingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, latestDiagnosis, activeProposal, logLeadActivity, showToast } = useApp();

  const [meetingType, setMeetingType] = useState<'quick' | 'deep' | 'tech'>('deep');
  const [selectedDate, setSelectedDate] = useState('2026-10-12');
  const [selectedSlot, setSelectedSlot] = useState('14:30 ~ 15:30');
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [isBooked, setIsBooked] = useState(false);

  const handleClose = () => {
    onClose();
    setIsBooked(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    logLeadActivity(`预约出海闭门诊断会 (${selectedDate} ${selectedSlot})`, 30, {
      meetingType,
      contactName,
      companyName,
    });
    showToast('预约成功，会前简报已同步给售前团队');
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      size="lg"
      title="预约 1 对 1 出海诊断会"
      description="带着体检报告进会议，直奔实质方案。"
    >
      <DialogBody>
        {!isBooked ? (
          <form onSubmit={handleBookingSubmit} className="space-y-8">
            <fieldset>
              <legend className="field-label">诊断形式</legend>
              <div role="radiogroup" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {MEETING_TYPES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={meetingType === m.id}
                    onClick={() => setMeetingType(m.id)}
                    className="choice flex-col items-start justify-start gap-1"
                  >
                    <span className="text-body font-semibold">{m.title}</span>
                    <span className="text-caption text-label-secondary">
                      {m.duration} · {m.desc}
                    </span>
                    <span className="text-caption text-label-secondary">建议参会：{m.target}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="booking-date" className="field-label">日期</label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="booking-slot" className="field-label">时段</label>
                <select
                  id="booking-slot"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="field"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="booking-name" className="field-label">您的称呼</label>
                <input
                  id="booking-name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="如 张总 / 李总监"
                  autoComplete="name"
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="booking-phone" className="field-label">手机号</label>
                <input
                  id="booking-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="如 13800000000"
                  autoComplete="tel"
                  className="field"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="booking-company" className="field-label">企业全称</label>
                <input
                  id="booking-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="如 某医疗科技股份有限公司"
                  autoComplete="organization"
                  className="field"
                  required
                />
              </div>
            </div>

            {(latestDiagnosis || activeProposal) && (
              <div className="well">
                <p className="text-body font-semibold">会前将同步给架构师</p>
                <ul className="mt-2 space-y-1 text-caption text-label-secondary">
                  {latestDiagnosis && (
                    <li>
                      最近一次体检：{latestDiagnosis.toolName} · {latestDiagnosis.score} 分
                    </li>
                  )}
                  {activeProposal && (
                    <li>
                      方案草案：{activeProposal.title} · {activeProposal.timeline}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              确认预约
            </button>
          </form>
        ) : (
          <div className="py-12 text-center animate-fade-in">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h3 className="mt-5 text-title-2">预约已确认</h3>
            <p className="mx-auto mt-3 max-w-md text-body text-label-secondary">
              {selectedDate} {selectedSlot}。会议链接已发送至 {contactPhone}。
            </p>
            <button type="button" onClick={handleClose} className="btn btn-secondary mt-8">
              完成
            </button>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
};
