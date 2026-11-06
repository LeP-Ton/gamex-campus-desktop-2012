import type { GameState, SemesterResult } from './types';
import { COURSES, NPCS } from '../content/world';
import { EVENTS } from '../content/events';

export const SAVE_KEY = 'gamex-campus-save-v1';
export const HISTORY_KEY = 'gamex-campus-history-v1';
export const BACKUP_KEY = 'gamex-campus-backup-v1';
export interface SaveEnvelope {
  format: 'gamex-campus';
  version: 1;
  savedAt: string;
  state: GameState;
}

export function serialize(s: GameState, savedAt = new Date().toISOString()) {
  return JSON.stringify({ format: 'gamex-campus', version: 1, savedAt, state: s } satisfies SaveEnvelope);
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((item) => typeof item === 'string');
const numericRecord = (v: unknown) => isObject(v) && Object.values(v).every(finite);
const validMemory = (m: unknown) =>
  isObject(m) && finite(m.day) && typeof m.text === 'string' && finite(m.weight);
const validAuthor = (id: unknown) => id === 'player' || NPCS.some((n) => n.id === id);
const validApps = [
  'campus',
  'chat',
  'forum',
  'browser',
  'schedule',
  'study',
  'games',
  'files',
  'diary',
  'grades',
  'rankings',
  'settings',
];

/** 外部导入和本地读取共用校验，不用损坏的文件覆盖当前游戏。 */
export function deserialize(raw: string): GameState {
  if (raw.length > 5_000_000) throw new Error('存档文件过大，请选择本游戏导出的 JSON 文件。');
  const envelope: unknown = JSON.parse(raw);
  if (
    !isObject(envelope) ||
    envelope.format !== 'gamex-campus' ||
    envelope.version !== 1 ||
    !isObject(envelope.state)
  )
    throw new Error('存档格式或版本不受支持。');
  const s = envelope.state;
  if (s.runId !== undefined && typeof s.runId !== 'string') throw new Error('存档归档标识无效。');
  if (
    !isObject(s.profile) ||
    !['cs', 'medicine'].includes(String(s.profile.major)) ||
    typeof s.profile.name !== 'string' ||
    !s.profile.name.trim() ||
    typeof s.profile.gender !== 'string'
  )
    throw new Error('角色信息不完整。');
  if (
    s.version !== 1 ||
    typeof s.seed !== 'string' ||
    !s.seed ||
    !['playing', 'ended'].includes(String(s.phase))
  )
    throw new Error('世界信息无效。');
  for (const key of [
    'rng',
    'day',
    'minute',
    'energy',
    'money',
    'professional',
    'gaming',
    'influence',
    'rating',
    'semester',
    'nextId',
    'challengeCursor',
  ])
    if (!finite(s[key])) throw new Error(`存档数值 ${key} 无效。`);
  if (
    !Number.isInteger(s.rng) ||
    Number(s.rng) < 0 ||
    Number(s.rng) > 0xffffffff ||
    Number(s.day) < 0 ||
    Number(s.day) > 111 ||
    !Number.isInteger(s.day) ||
    Number(s.minute) < 480 ||
    Number(s.minute) > 1440
  )
    throw new Error('游戏时间或随机数状态无效。');
  for (const key of ['energy', 'professional', 'gaming', 'influence'])
    if (Number(s[key]) < 0 || Number(s[key]) > 100) throw new Error('角色属性超出范围。');
  const courses = COURSES[s.profile.major as 'cs' | 'medicine'];
  if (
    !Array.isArray(s.courses) ||
    s.courses.length !== courses.length ||
    !s.courses.every(
      (c, i) =>
        isObject(c) &&
        c.id === courses[i].id &&
        [
          'knowledge',
          'attended',
          'scheduled',
          'homework',
          'assignments',
          'lastStudy',
          'lastHomework',
          'lastClass',
        ].every((k) => finite(c[k])) &&
        (c.exam === null || finite(c.exam)) &&
        (c.makeup === null || finite(c.makeup)),
    )
  )
    throw new Error('课程记录不完整。');
  if (
    !Array.isArray(s.npcs) ||
    s.npcs.length !== NPCS.length ||
    !s.npcs.every(
      (n, i) =>
        isObject(n) &&
        n.id === NPCS[i].id &&
        [
          'familiar',
          'trust',
          'shared',
          'mood',
          'energy',
          'compatibility',
          'lastTalk',
          'lastSocial',
          'lastConfess',
          'conflicts',
          'promisesKept',
          'skill',
        ].every((k) => finite(n[k])) &&
        ['初识', '朋友', '暧昧', '交往', '分手'].includes(String(n.stage)) &&
        Array.isArray(n.memories) &&
        n.memories.every(validMemory) &&
        Array.isArray(n.longMemories) &&
        n.longMemories.every(validMemory) &&
        numericRecord(n.bonds) &&
        typeof n.activity === 'string' &&
        typeof n.need === 'string',
    )
  )
    throw new Error('人物关系记录不完整。');
  for (const key of [
    'messages',
    'posts',
    'history',
    'notices',
    'matches',
    'activeEvents',
    'flags',
    'inventory',
    'promises',
    'diary',
    'lastReport',
  ])
    if (!Array.isArray(s[key])) throw new Error(`记录 ${key} 不完整。`);
  for (const key of ['flags', 'inventory', 'lastReport'])
    if (!strings(s[key])) throw new Error('存档文本记录无效。');
  if (
    !isObject(s.plan) ||
    !['study', 'gaming', 'social', 'work', 'rest'].every(
      (k) =>
        finite(s.plan && (s.plan as Record<string, unknown>)[k]) &&
        Number((s.plan as Record<string, unknown>)[k]) >= 0,
    ) ||
    Object.values(s.plan).reduce<number>((sum, v) => sum + Number(v), 0) > 8
  )
    throw new Error('生活计划无效。');
  if (
    !isObject(s.stats) ||
    ![
      'study',
      'gaming',
      'social',
      'work',
      'rest',
      'lateNights',
      'classesMissed',
      'matches',
      'wins',
      'jobs',
      'earned',
      'dates',
      'events',
      'challenges',
      'challengeCorrect',
      'clubs',
    ].every((k) => finite((s.stats as Record<string, unknown>)[k]))
  )
    throw new Error('累计数据无效。');
  if (
    !isObject(s.daily) ||
    !numericRecord(s.daily.studied) ||
    !numericRecord(s.daily.chatted) ||
    !numericRecord(s.daily.social) ||
    !['worked', 'challenges', 'rested'].every((k) => finite((s.daily as Record<string, unknown>)[k]))
  )
    throw new Error('当日记录无效。');
  if (
    !isObject(s.eventHistory) ||
    !(s.activeEvents as unknown[]).every(
      (e) => isObject(e) && EVENTS.some((d) => d.id === e.id) && finite(e.opened) && finite(e.expires),
    )
  )
    throw new Error('事件记录无效。');
  if (
    s.match !== null &&
    (!isObject(s.match) ||
      !['queue', 'ready', 'lane', 'objective', 'fight'].includes(String(s.match.phase)) ||
      !finite(s.match.readyAt) ||
      !finite(s.match.advantage) ||
      !strings(s.match.choices) ||
      !['上路', '打野', '中路', '射手', '辅助'].includes(String(s.match.role)) ||
      !['战士', '法师', '射手', '坦克', '辅助'].includes(String(s.match.hero)) ||
      typeof s.match.party !== 'boolean')
  )
    throw new Error('对局状态无效。');
  if (
    s.phase === 'ended' &&
    (!isObject(s.result) ||
      !Array.isArray(s.result.scores) ||
      !Array.isArray(s.result.titles) ||
      !isObject(s.result.ranking))
  )
    throw new Error('学期档案不完整。');
  for (const m of s.messages as unknown[])
    if (
      !isObject(m) ||
      typeof m.text !== 'string' ||
      !NPCS.some((n) => n.id === m.npc) ||
      !['npc', 'player', 'system'].includes(String(m.from)) ||
      !finite(m.id) ||
      !finite(m.day) ||
      !finite(m.minute)
    )
      throw new Error('消息记录无效。');
  for (const p of s.posts as unknown[])
    if (
      !isObject(p) ||
      typeof p.text !== 'string' ||
      !finite(p.id) ||
      !finite(p.day) ||
      !finite(p.likes) ||
      !Array.isArray(p.comments) ||
      !p.comments.every((c) => isObject(c) && typeof c.author === 'string' && typeof c.text === 'string')
    )
      throw new Error('论坛记录无效。');
  for (const p of s.posts as unknown[])
    if (!isObject(p) || !validAuthor(p.author) || typeof p.category !== 'string')
      throw new Error('动态作者无效。');
  for (const h of s.history as unknown[])
    if (
      !isObject(h) ||
      !finite(h.id) ||
      !finite(h.day) ||
      !finite(h.minute) ||
      typeof h.text !== 'string' ||
      typeof h.kind !== 'string'
    )
      throw new Error('人生轨迹无效。');
  for (const n of s.notices as unknown[])
    if (
      !isObject(n) ||
      !finite(n.id) ||
      typeof n.title !== 'string' ||
      typeof n.text !== 'string' ||
      !validApps.includes(String(n.app))
    )
      throw new Error('通知记录无效。');
  for (const d of s.diary as unknown[])
    if (!isObject(d) || !finite(d.day) || typeof d.text !== 'string') throw new Error('日记记录无效。');
  for (const m of s.matches as unknown[])
    if (
      !isObject(m) ||
      !finite(m.day) ||
      typeof m.win !== 'boolean' ||
      !finite(m.change) ||
      !strings(m.decisions) ||
      typeof m.reason !== 'string'
    )
      throw new Error('对战记录无效。');
  for (const p of s.promises as unknown[])
    if (
      !isObject(p) ||
      !validAuthor(p.npc) ||
      !['study', 'gaming', 'social'].includes(String(p.activity)) ||
      !finite(p.due) ||
      typeof p.fulfilled !== 'boolean'
    )
      throw new Error('承诺记录无效。');
  if (typeof s.lastAction !== 'string' || !finite(s.lastTournamentDay)) throw new Error('当前进展记录无效。');
  return s as unknown as GameState;
}

export function readHistory(storage: Pick<Storage, 'getItem'>): SemesterResult[] {
  try {
    const data: unknown = JSON.parse(storage.getItem(HISTORY_KEY) ?? '[]');
    return Array.isArray(data)
      ? data.filter(
          (r): r is SemesterResult =>
            isObject(r) &&
            typeof r.id === 'string' &&
            typeof r.name === 'string' &&
            typeof r.seed === 'string' &&
            ['cs', 'medicine'].includes(String(r.major)) &&
            isObject(r.ranking) &&
            ['academic', 'gaming', 'wealth', 'social', 'romance', 'balanced'].every((k) =>
              finite((r.ranking as Record<string, unknown>)[k]),
            ) &&
            strings(r.titles) &&
            Array.isArray(r.scores),
        )
      : [];
  } catch {
    return [];
  }
}
