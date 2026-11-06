import { COURSES, NPCS } from '../content/world';
import { hashSeed, clamp } from './random';
import type { AppId, GameState, NPCState } from './types';

export const absoluteTime = (s: GameState) => s.day * 1440 + s.minute;
export const weekOf = (day: number) => Math.floor(day / 7) + 1;
export const clockText = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;
export function dateOf(day: number, short = false) {
  const date = new Date(Date.UTC(2012, 8, 3 + day));
  return short
    ? `${date.getUTCMonth() + 1}月${date.getUTCDate()}日`
    : `2012年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}
export const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
export function courseDefs(s: Pick<GameState, 'profile' | 'seed'>) {
  const shift = hashSeed(s.seed) % 2;
  return COURSES[s.profile.major].map((c) => ({ ...c, weekday: (c.weekday + shift) % 5 }));
}
export const npcDef = (id: string) => NPCS.find((n) => n.id === id)!;
export function log(s: GameState, text: string, kind = '生活') {
  s.history.push({ id: s.nextId++, day: s.day, minute: s.minute, kind, text });
}
export function notice(s: GameState, title: string, text: string, app: AppId = 'campus') {
  s.notices.push({ id: s.nextId++, title, text, app });
  s.notices = s.notices.slice(-8);
}
export function remember(s: GameState, npc: NPCState, text: string, weight = 1) {
  const memory = { day: s.day, text, weight };
  npc.memories.push(memory);
  npc.memories = npc.memories.slice(-8);
  if (weight >= 3) {
    npc.longMemories.push(memory);
    npc.longMemories = npc.longMemories.slice(-20);
  }
}
export function message(
  s: GameState,
  npc: string,
  text: string,
  from: 'npc' | 'player' | 'system' = 'npc',
  intent?: 'study' | 'game' | 'social',
) {
  s.messages.push({
    id: s.nextId++,
    npc,
    from,
    text,
    day: s.day,
    minute: s.minute,
    read: from !== 'npc',
    expires: intent ? absoluteTime(s) + 360 : undefined,
    intent,
  });
  if (from === 'npc' && !s.daily.background)
    notice(s, `${npcDef(npc)?.name ?? '班级群'}发来消息`, text, 'chat');
  s.messages = s.messages.slice(-500);
}
export function relationValue(n: NPCState) {
  return clamp(n.familiar * 0.2 + n.trust * 0.45 + n.shared * 0.25 + n.compatibility * 0.1 - n.conflicts * 2);
}
export function normalize(s: GameState) {
  s.energy = clamp(s.energy);
  s.money = Math.max(-200, Math.round(s.money));
  for (const field of ['professional', 'gaming', 'influence'] as const) s[field] = clamp(s[field]);
  s.rating = Math.max(0, Math.round(s.rating));
  for (const n of s.npcs)
    for (const field of ['familiar', 'trust', 'shared', 'mood', 'energy'] as const)
      n[field] = clamp(n[field]);
  s.courses.forEach((c) => {
    c.knowledge = clamp(c.knowledge);
  });
}
