import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Bi, useLang } from '../context/LanguageContext';
import { Dialog, DialogBody } from './ui/Dialog';
import { SHOW_FDE } from '../lib/features';

const MEETING_TYPES: { id: 'quick' | 'deep' | 'tech'; title: Bi; duration: Bi; desc: Bi; target: Bi }[] = [
  {
    id: 'quick',
    title: { zh: '快速诊断', en: 'Quick diagnosis' },
    duration: { zh: '30 分钟', en: '30 minutes' },
    desc: { zh: '线上 · 解读测评分数', en: 'Online · reviews your audit score' },
    target: { zh: '外贸总监', en: 'Export director' },
  },
  {
    id: 'deep',
    title: { zh: '深度诊断', en: 'Deep diagnosis' },
    duration: { zh: '60 分钟', en: '60 minutes' },
    desc: { zh: '线上或上门 · 立项与方案定制', en: 'Online or on site · project scoping and a tailored plan' },
    target: { zh: '老板 + 总监', en: 'Owner + director' },
  },
  {
    id: 'tech',
    title: { zh: '技术对接评估', en: 'Technical integration review' },
    duration: { zh: '60 分钟', en: '60 minutes' },
    desc: SHOW_FDE
      ? { zh: '线上 · 系统对接与 FDE', en: 'Online · system integration and FDE' }
      : { zh: '线上 · 系统对接与数据打通', en: 'Online · system integration and data connection' },
    target: { zh: 'IT 负责人 + 业务', en: 'IT lead + business' },
  },
];

const TIME_SLOTS: { value: string; label: Bi }[] = [
  { value: '10:00 ~ 11:00', label: { zh: '上午 10:00 ~ 11:00', en: 'Morning, 10:00 – 11:00' } },
  { value: '14:30 ~ 15:30', label: { zh: '下午 14:30 ~ 15:30', en: 'Afternoon, 14:30 – 15:30' } },
  { value: '16:00 ~ 17:00', label: { zh: '下午 16:00 ~ 17:00', en: 'Afternoon, 16:00 – 17:00' } },
  { value: '19:30 ~ 20:30', label: { zh: '晚间 19:30 ~ 20:30', en: 'Evening, 19:30 – 20:30' } },
];

export const BookingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, latestDiagnosis, activeProposal, logLeadActivity, showToast } = useApp();
  const { t, tb } = useLang();

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

  // 线索的留言：记下预约的诊断形式与时段，销售看线索时能直接知道约的是什么
  const leadMessage = `预约${MEETING_TYPES.find((m) => m.id === meetingType)?.title.zh ?? ''} · ${selectedDate} ${selectedSlot}`;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    logLeadActivity(`预约出海诊断会 (${selectedDate} ${selectedSlot})`, 30, {
      meetingType,
      contactName,
      companyName,
    });
    showToast(t('预约成功，会前简报已同步给售前团队', 'Booked. The pre-meeting brief has been shared with the pre-sales team'));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      size="lg"
      title={t('预约 1 对 1 出海诊断会', 'Book a one-to-one export diagnosis call')}
      description={t('带着测评报告进会议，直奔实质方案。', 'Bring your audit report to the call and go straight to a real plan.')}
    >
      <DialogBody>
        {!isBooked ? (
          <form onSubmit={handleBookingSubmit} className="space-y-8" data-cw-lead data-cw-keep>
            {/* 访问统计脚本（data-cw-lead）读取的字段；蜜罐用于挡住机器人，真人看不见 */}
            <input type="hidden" name="message" value={leadMessage} />
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
            <fieldset>
              <legend className="field-label">{t('诊断形式', 'Session type')}</legend>
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
                    <span className="text-body font-semibold">{tb(m.title)}</span>
                    <span className="text-caption text-label-secondary">
                      {tb(m.duration)} · {tb(m.desc)}
                    </span>
                    <span className="text-caption text-label-secondary">
                      {t('建议参会：', 'Suggested attendees: ')}
                      {tb(m.target)}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="booking-date" className="field-label">{t('日期', 'Date')}</label>
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
                <label htmlFor="booking-slot" className="field-label">{t('时段', 'Time slot')}</label>
                <select
                  id="booking-slot"
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="field"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {tb(slot.label)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="booking-name" className="field-label">{t('您的称呼', 'Your name')}</label>
                <input
                  id="booking-name"
                  name="name"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={t('如 张总 / 李总监', 'e.g. Mr. Zhang / Director Li')}
                  autoComplete="name"
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="booking-phone" className="field-label">{t('手机号', 'Mobile number')}</label>
                <input
                  id="booking-phone"
                  name="phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder={t('如 13800000000', 'e.g. 13800000000')}
                  autoComplete="tel"
                  className="field"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="booking-company" className="field-label">{t('企业全称', 'Company name')}</label>
                <input
                  id="booking-company"
                  name="company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('如 某医疗科技股份有限公司', 'e.g. Example Medical Technology Co., Ltd.')}
                  autoComplete="organization"
                  className="field"
                  required
                />
              </div>
            </div>

            {(latestDiagnosis || activeProposal) && (
              <div className="well">
                <p className="text-body font-semibold">{t('会前将同步给架构师', 'Shared with the architect before the call')}</p>
                <ul className="mt-2 space-y-1 text-caption text-label-secondary">
                  {latestDiagnosis && (
                    <li>
                      {t('最近一次测评：', 'Latest audit: ')}
                      {latestDiagnosis.toolName} · {latestDiagnosis.score} {t('分', 'pts')}
                    </li>
                  )}
                  {activeProposal && (
                    <li>
                      {t('方案草案：', 'Draft plan: ')}
                      {activeProposal.title} · {activeProposal.timeline}
                    </li>
                  )}
                </ul>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              {t('确认预约', 'Confirm booking')}
            </button>
          </form>
        ) : (
          <div className="py-12 text-center animate-fade-in">
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h3 className="mt-5 text-title-2">{t('预约已确认', 'Booking confirmed')}</h3>
            <p className="mx-auto mt-3 max-w-md text-body text-label-secondary">
              {t(
                `${selectedDate} ${selectedSlot}。会议链接已发送至 ${contactPhone}。`,
                `${selectedDate}, ${selectedSlot}. The meeting link has been sent to ${contactPhone}.`
              )}
            </p>
            <button type="button" onClick={handleClose} className="btn btn-secondary mt-8">
              {t('完成', 'Done')}
            </button>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
};
