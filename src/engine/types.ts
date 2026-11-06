export type Major = 'cs' | 'medicine';
export type AppId =
  | 'campus'
  | 'chat'
  | 'forum'
  | 'browser'
  | 'schedule'
  | 'study'
  | 'games'
  | 'files'
  | 'diary'
  | 'grades'
  | 'rankings'
  | 'settings'
  | 'qzone'
  | 'gamebox'
  | 'recycle';
export type Activity = 'study' | 'gaming' | 'social' | 'work' | 'rest';
export type RelationshipStage = '初识' | '朋友' | '暧昧' | '交往' | '分手';

export interface Profile {
  name: string;
  gender: string;
  major: Major;
}
export interface CourseDef {
  id: string;
  name: string;
  credits: number;
  difficulty: number;
  teacher: string;
  style: string;
  color: string;
  weekday: number;
  start: number;
}
export interface CourseState {
  id: string;
  knowledge: number;
  attended: number;
  scheduled: number;
  homework: number;
  assignments: number;
  lastStudy: number;
  lastHomework: number;
  lastClass: number;
  exam: number | null;
  makeup: number | null;
}
export interface Memory {
  day: number;
  text: string;
  weight: number;
}
export interface NPCDef {
  id: string;
  name: string;
  age: number;
  role: string;
  gender: string;
  avatar: string;
  color: string;
  personality: 'warm' | 'competitive' | 'quiet' | 'dutiful';
  interests: string[];
  goal: string;
  habit: string;
  romance: boolean;
  schedule: string[];
}
export interface NPCState {
  id: string;
  mood: number;
  energy: number;
  need: string;
  activity: string;
  familiar: number;
  trust: number;
  compatibility: number;
  shared: number;
  promisesKept: number;
  conflicts: number;
  stage: RelationshipStage;
  lastTalk: number;
  lastSocial: number;
  lastGift: number;
  lastConfess: number;
  memories: Memory[];
  longMemories: Memory[];
  bonds: Record<string, number>;
  skill: number;
}
export interface Message {
  id: number;
  npc: string;
  from: 'npc' | 'player' | 'system';
  text: string;
  day: number;
  minute: number;
  read: boolean;
  expires?: number;
  intent?: 'study' | 'game' | 'social';
}
export interface PromiseRecord {
  npc: string;
  activity: Activity;
  due: number;
  fulfilled: boolean;
}
export interface Post {
  id: number;
  author: string;
  category: string;
  text: string;
  day: number;
  likes: number;
  liked: boolean;
  comments: { author: string; text: string }[];
  audience?: string[];
}
export interface Trajectory {
  id: number;
  day: number;
  minute: number;
  kind: string;
  text: string;
}
export interface Notice {
  id: number;
  title: string;
  text: string;
  app: AppId;
}
export interface MatchState {
  champion?: string;
  phase: 'queue' | 'ready' | 'lane' | 'objective' | 'fight';
  readyAt: number;
  role: string;
  hero: string;
  party: boolean;
  advantage: number;
  choices: string[];
}
export interface MatchRecord {
  champion?: string;
  day: number;
  win: boolean;
  change: number;
  decisions: string[];
  reason: string;
}
export interface Plan {
  study: number;
  gaming: number;
  social: number;
  work: number;
  rest: number;
}
export interface Stats {
  study: number;
  gaming: number;
  social: number;
  work: number;
  rest: number;
  lateNights: number;
  classesMissed: number;
  matches: number;
  wins: number;
  jobs: number;
  earned: number;
  dates: number;
  events: number;
  challenges: number;
  challengeCorrect: number;
  clubs: number;
  tournament: boolean;
}
export interface DailyState {
  studied: Record<string, number>;
  chatted: Record<string, number>;
  worked: number;
  challenges: number;
  rested: number;
  social: Record<string, number>;
  background: boolean;
}
export interface EventEffect {
  money?: number;
  energy?: number;
  professional?: number;
  gaming?: number;
  influence?: number;
  knowledge?: number;
  trust?: number;
  shared?: number;
  mood?: number;
  flag?: string;
  item?: string;
}
export interface EventChoice {
  id: string;
  text: string;
  description: string;
  minutes: number;
  cost: number;
  energy: number;
  effect: EventEffect;
  needs?: { professional?: number; gaming?: number; trust?: number };
}
export interface EventDef {
  id: string;
  name: string;
  description: string;
  category: string;
  npc: string;
  earliest: number;
  latest: number;
  hour: number;
  window: number;
  cooldown: number;
  major?: Major;
  minInfluence?: number;
  minTrust?: number;
  requires?: string;
  chain?: string;
  stage?: number;
  previous?: string;
  choices: EventChoice[];
}
export interface ActiveEvent {
  id: string;
  opened: number;
  expires: number;
}
export interface EventRecord {
  day: number;
  choice: string;
  outcome: string;
}
export interface SemesterResult {
  id: string;
  name: string;
  major: Major;
  seed: string;
  semester: number;
  scores: {
    id: string;
    name: string;
    score: number;
    exam: number;
    attendance: number;
    homework: number;
    credits: number;
    makeup: number | null;
  }[];
  average: number;
  gpa: number;
  credits: number;
  failed: number;
  titles: string[];
  ranking: Record<string, number>;
  money: number;
  rating: number;
  influence: number;
  romance: string[];
  memories: Trajectory[];
  stats: Stats;
  scholarship: number;
}
export interface GameState {
  /** 每局存档的归档标识，不参与世界随机性；旧存档可缺省。 */
  runId?: string;
  version: 1;
  seed: string;
  rng: number;
  profile: Profile;
  semester: number;
  day: number;
  minute: number;
  phase: 'playing' | 'ended';
  energy: number;
  money: number;
  professional: number;
  gaming: number;
  influence: number;
  rating: number;
  courses: CourseState[];
  npcs: NPCState[];
  messages: Message[];
  posts: Post[];
  history: Trajectory[];
  notices: Notice[];
  plan: Plan;
  stats: Stats;
  daily: DailyState;
  match: MatchState | null;
  matches: MatchRecord[];
  activeEvents: ActiveEvent[];
  eventHistory: Record<string, EventRecord>;
  flags: string[];
  inventory: string[];
  promises: PromiseRecord[];
  diary: { day: number; text: string }[];
  challengeCursor: number;
  result: SemesterResult | null;
  nextId: number;
  lastReport: string[];
  lastAction: string;
  criticalDay: boolean;
  lastTournamentDay: number;
}

export type Command =
  | { type: 'study'; course: string; mode: 'review' | 'homework' | 'class' }
  | { type: 'challenge'; question: string; answer: number }
  | {
      type: 'chat';
      npc: string;
      reply: 'support' | 'invite' | 'decline' | 'promise' | 'custom';
      text?: string;
    }
  | { type: 'social'; npc: string; kind: 'walk' | 'coffee' | 'date' | 'confess' | 'breakup' }
  | { type: 'work'; job: string }
  | { type: 'rest'; kind: 'nap' | 'meal' | 'walk' }
  | { type: 'queue'; role: string; hero: string; party: boolean; champion?: string }
  | { type: 'match'; choice: string }
  | { type: 'cancelMatch' }
  | { type: 'event'; id: string; choice: string }
  | { type: 'plan'; plan: Plan }
  | { type: 'endDay' }
  | { type: 'wait'; minutes: number }
  | { type: 'read'; npc: string }
  | { type: 'post'; text: string; category: string }
  | { type: 'like'; post: number }
  | { type: 'comment'; post: number; text: string }
  | { type: 'diary'; text: string }
  | { type: 'makeup'; course: string }
  | { type: 'dismiss'; id: number };
