import { create } from 'zustand';
import { createGame, dispatch } from '../engine/game';
import { BACKUP_KEY, deserialize, HISTORY_KEY, readHistory, SAVE_KEY, serialize } from '../engine/save';
import type { Command, GameState, Profile, SemesterResult } from '../engine/types';

interface GameStore {
  game: GameState | null;
  history: SemesterResult[];
  error: string | null;
  savedAt: string | null;
  start: (profile: Profile, seed: string) => void;
  send: (command: Command) => void;
  save: () => void;
  load: () => void;
  importSave: (raw: string) => void;
  clearError: () => void;
}

function readInitial() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return { game: raw ? deserialize(raw) : null, error: null };
  } catch {
    return { game: null, error: '已有存档无法读取，原始数据已保留。可在设置中导入备份。' };
  }
}

const initial = readInitial();
const initialHistory = (() => {
  try {
    return readHistory(localStorage);
  } catch {
    return [];
  }
})();

export const useGame = create<GameStore>((set, get) => ({
  ...initial,
  history: initialHistory,
  savedAt: null,
  start: (profile, seed) => {
    const actualSeed =
      seed.trim() || `NCU-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase()}`;
    const game = createGame(profile, actualSeed);
    game.runId = Array.from(crypto.getRandomValues(new Uint32Array(4)), (n) => n.toString(16)).join('-');
    try {
      const prior = localStorage.getItem(SAVE_KEY);
      if (prior) localStorage.setItem(BACKUP_KEY, prior);
    } catch {
      /* 自动保存时统一提示持久化错误。 */
    }
    set({ game, error: null });
    get().save();
  },
  send: (command) => {
    const current = get().game;
    if (!current) return;
    const game = dispatch(current, command);
    const history = game.result
      ? [
          ...get().history.filter((h) => h.id !== game.result!.id && h.id !== current.result?.id),
          game.result,
        ].slice(-100)
      : get().history;
    set({ game, history });
    get().save();
  },
  save: () => {
    const game = get().game;
    if (!game) return;
    try {
      const now = new Date().toISOString();
      localStorage.setItem(SAVE_KEY, serialize(game, now));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(get().history));
      set({ savedAt: now });
    } catch {
      set({ error: '浏览器无法保存数据（可能空间不足或禁用了本地存储）。请到设置导出存档。' });
    }
  },
  load: () => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) throw new Error('还没有本地存档。');
      set({ game: deserialize(raw), error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '读取失败，当前游戏已保留。' });
    }
  },
  importSave: (raw) => {
    try {
      const game = deserialize(raw);
      const prior = localStorage.getItem(SAVE_KEY);
      if (prior) localStorage.setItem(BACKUP_KEY, prior);
      const history = game.result
        ? [...get().history.filter((h) => h.id !== game.result!.id), game.result].slice(-100)
        : get().history;
      set({ game, history, error: null });
      get().save();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '存档无效，当前游戏已保留。' });
    }
  },
  clearError: () => set({ error: null }),
}));
