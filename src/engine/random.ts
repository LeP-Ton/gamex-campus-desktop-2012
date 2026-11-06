import type { GameState } from './types';

export function hashSeed(seed: string): number {
  let hash = 2166136261;
  for (const c of seed) {
    hash ^= c.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

/** 世界中唯一的随机数入口，状态随存档一起持久化。 */
export function random(state: Pick<GameState, 'rng'>): number {
  state.rng = (state.rng + 0x6d2b79f5) >>> 0;
  let t = state.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
export const round = (value: number) => Math.round(value * 10) / 10;
