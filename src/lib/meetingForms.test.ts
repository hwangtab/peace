import {
  validateMeetingTitle,
  validateMeetingDate,
  validateMeetingTime,
  validateLocation,
  validateMinutes,
  validateAgendaTitle,
  validateAgendaContent,
  validateAttendeeName,
  validateAttendeeNote,
  isMeetingStatus,
  isAgendaStatus,
  MEETING_STATUS_LABELS,
  AGENDA_STATUS_LABELS,
} from './meetingForms';

describe('validateMeetingTitle', () => {
  it('trims and accepts 1-200 chars', () => {
    expect(validateMeetingTitle('  6월 정기회의  ')).toEqual({ ok: true, value: '6월 정기회의' });
  });
  it('rejects empty', () => {
    expect(validateMeetingTitle('   ').ok).toBe(false);
  });
  it('rejects >200', () => {
    expect(validateMeetingTitle('a'.repeat(201)).ok).toBe(false);
  });
});

describe('validateMeetingDate', () => {
  it('accepts empty as null', () => {
    expect(validateMeetingDate('')).toEqual({ ok: true, value: null });
    expect(validateMeetingDate('   ')).toEqual({ ok: true, value: null });
  });
  it('accepts YYYY-MM-DD', () => {
    expect(validateMeetingDate('2026-06-20')).toEqual({ ok: true, value: '2026-06-20' });
  });
  it('rejects bad format', () => {
    expect(validateMeetingDate('2026/06/20').ok).toBe(false);
    expect(validateMeetingDate('20-06-2026').ok).toBe(false);
  });
  it('rejects impossible date', () => {
    expect(validateMeetingDate('2026-13-01').ok).toBe(false);
    expect(validateMeetingDate('2026-02-30').ok).toBe(false);
  });
});

describe('validateMeetingTime', () => {
  it('accepts empty', () => {
    expect(validateMeetingTime('')).toEqual({ ok: true, value: '' });
  });
  it('trims and accepts free text up to 20', () => {
    expect(validateMeetingTime('  19:00  ')).toEqual({ ok: true, value: '19:00' });
  });
  it('rejects >20', () => {
    expect(validateMeetingTime('a'.repeat(21)).ok).toBe(false);
  });
});

describe('validateLocation', () => {
  it('accepts empty and trims', () => {
    expect(validateLocation('')).toEqual({ ok: true, value: '' });
    expect(validateLocation('  강정 평화센터  ')).toEqual({ ok: true, value: '강정 평화센터' });
  });
  it('rejects >200', () => {
    expect(validateLocation('a'.repeat(201)).ok).toBe(false);
  });
});

describe('validateMinutes', () => {
  it('accepts empty', () => {
    expect(validateMinutes('')).toEqual({ ok: true, value: '' });
  });
  it('does not trim leading/trailing newlines content but accepts large markdown', () => {
    expect(validateMinutes('# 회의록\n내용').ok).toBe(true);
  });
  it('rejects >100000', () => {
    expect(validateMinutes('a'.repeat(100001)).ok).toBe(false);
  });
});

describe('validateAgendaTitle', () => {
  it('accepts 1-200 trimmed', () => {
    expect(validateAgendaTitle('  예산 승인  ')).toEqual({ ok: true, value: '예산 승인' });
  });
  it('rejects empty and >200', () => {
    expect(validateAgendaTitle('  ').ok).toBe(false);
    expect(validateAgendaTitle('a'.repeat(201)).ok).toBe(false);
  });
});

describe('validateAgendaContent', () => {
  it('accepts empty and trims', () => {
    expect(validateAgendaContent('')).toEqual({ ok: true, value: '' });
  });
  it('rejects >10000', () => {
    expect(validateAgendaContent('a'.repeat(10001)).ok).toBe(false);
  });
});

describe('validateAttendeeName', () => {
  it('accepts 1-50 trimmed', () => {
    expect(validateAttendeeName('  홍길동  ')).toEqual({ ok: true, value: '홍길동' });
  });
  it('rejects empty and >50', () => {
    expect(validateAttendeeName('   ').ok).toBe(false);
    expect(validateAttendeeName('a'.repeat(51)).ok).toBe(false);
  });
});

describe('validateAttendeeNote', () => {
  it('accepts empty and trims', () => {
    expect(validateAttendeeNote('')).toEqual({ ok: true, value: '' });
    expect(validateAttendeeNote('  진행  ')).toEqual({ ok: true, value: '진행' });
  });
  it('rejects >200', () => {
    expect(validateAttendeeNote('a'.repeat(201)).ok).toBe(false);
  });
});

describe('status helpers', () => {
  it('isMeetingStatus', () => {
    expect(isMeetingStatus('scheduled')).toBe(true);
    expect(isMeetingStatus('completed')).toBe(true);
    expect(isMeetingStatus('done')).toBe(false);
  });
  it('isAgendaStatus', () => {
    expect(isAgendaStatus('proposed')).toBe(true);
    expect(isAgendaStatus('resolved')).toBe(true);
    expect(isAgendaStatus('open')).toBe(false);
  });
  it('label maps cover all statuses (Korean)', () => {
    expect(MEETING_STATUS_LABELS.scheduled).toBe('예정');
    expect(MEETING_STATUS_LABELS.completed).toBe('완료');
    expect(AGENDA_STATUS_LABELS.proposed).toBe('제안');
    expect(AGENDA_STATUS_LABELS.discussed).toBe('논의');
    expect(AGENDA_STATUS_LABELS.resolved).toBe('의결');
  });
});
