import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, canEditContent, redirectToAdminLogin } from '@/lib/adminAuth';
import {
  validateMeetingTitle,
  validateMeetingDate,
  validateMeetingTime,
  validateLocation,
} from '@/lib/meetingForms';
import type { AdminMember } from '@/types/cms';

interface NewMeetingPageProps {
  member: AdminMember;
}

const inputClass =
  'w-full rounded border border-deep-ocean/15 px-3 py-2 text-sm focus:border-jeju-ocean focus:outline-none focus:ring-2 focus:ring-jeju-ocean/20';
const labelClass = 'mb-1 block text-sm font-semibold text-deep-ocean';

export default function NewMeetingPage({ member }: NewMeetingPageProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const titleResult = validateMeetingTitle(title);
    if (!titleResult.ok) {
      setError(titleResult.reason);
      return;
    }
    const dateResult = validateMeetingDate(meetingDate);
    if (!dateResult.ok) {
      setError(dateResult.reason);
      return;
    }
    const timeResult = validateMeetingTime(meetingTime);
    if (!timeResult.ok) {
      setError(timeResult.reason);
      return;
    }
    const locationResult = validateLocation(location);
    if (!locationResult.ok) {
      setError(locationResult.reason);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: titleResult.value,
          meeting_date: dateResult.value ?? '',
          meeting_time: timeResult.value,
          location: locationResult.value,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.meeting) {
        setError(payload.error || '회의 생성에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }
      router.push(`/admin/meetings/${payload.meeting.id}`);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="새 회의" member={member}>
      <Link
        href="/admin/meetings"
        className="mb-4 inline-block text-sm text-jeju-ocean hover:text-deep-ocean"
      >
        ← 회의 목록
      </Link>

      {error && (
        <p className="mb-4 whitespace-pre-wrap rounded bg-sunset-coral/10 px-3 py-2 text-sm text-sunset-coral">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
        <div>
          <label className={labelClass} htmlFor="title">
            제목 *
          </label>
          <input
            id="title"
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 6월 정기 기획회의"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="meeting_date">
            회의 날짜
          </label>
          <input
            id="meeting_date"
            type="date"
            className={inputClass}
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="meeting_time">
            시간
          </label>
          <input
            id="meeting_time"
            className={inputClass}
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            placeholder="예: 19:00"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="location">
            장소
          </label>
          <input
            id="location"
            className={inputClass}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="예: 강정 평화센터"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-deep-ocean px-4 py-2 font-semibold text-white transition hover:bg-jeju-ocean disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
        >
          {isSubmitting ? '생성 중…' : '회의 만들기'}
        </button>
      </form>
    </AdminLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);
  if (!canEditContent(session.member)) {
    return { redirect: { destination: '/admin/meetings', permanent: false } };
  }
  return { props: { member: session.member } };
};
