#!/usr/bin/env ts-node
import { Scale, TimetableAct } from '../src/components/camp/timetable/types';

const SCALE_MAP: Record<string, Scale> = {
  '솔로/듀오': 'solo',
  '밴드(1인)': 'solo',
  '밴드(2인)': 'solo',
  '밴드(3-4인)': 'band',
  '밴드(5인+)': 'big-band',
  '밴드(다수)': 'ensemble',
};

export function mapScale(raw: string): Scale | undefined {
  return SCALE_MAP[raw.trim()];
}

export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function parseTransitionMinutes(raw: string): number | null {
  const match = raw.match(/⟶\s*(\d+)\s*분/);
  return match ? Number(match[1]) : null;
}

function parseNextActName(raw: string): string | undefined {
  const match = raw.match(/다음:\s*([^-()]+)\s*-/);
  return match ? match[1].trim() : undefined;
}

type RawRow = (string | number | null | undefined)[];

export function parseRow(row: RawRow, nameToId: Map<string, number>): TimetableAct | null {
  const [, orderRaw, start, end, kind, name, , scaleRaw] = row;

  if (!start || !end || !kind || !name) return null;

  if (kind === '전환') {
    return {
      order: null,
      start: String(start),
      end: String(end),
      type: 'transition',
      name: String(name),
      transitionMinutes: parseTransitionMinutes(String(name)) ?? undefined,
      nextActName: parseNextActName(String(name)),
    };
  }

  if (kind === '공연') {
    const normalized = normalizeName(String(name));
    const id = nameToId.get(normalized);
    const scale = scaleRaw ? mapScale(String(scaleRaw)) : undefined;

    const act: TimetableAct = {
      order: typeof orderRaw === 'number' ? orderRaw : Number(orderRaw),
      start: String(start),
      end: String(end),
      type: 'performance',
      name: normalized,
    };

    if (scale) act.scale = scale;
    if (id !== undefined) act.musicianIds = [id];

    return act;
  }

  return null;
}
