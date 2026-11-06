import { create } from 'zustand';
import type { AppId } from '../engine/types';

export interface WindowState {
  key: string;
  app: AppId;
  x: number;
  y: number;
  width: number;
  height: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  npc?: string;
}
interface DesktopStore {
  windows: WindowState[];
  topZ: number;
  startMenu: boolean;
  open: (app: AppId, npc?: string) => void;
  close: (key: string) => void;
  focus: (key: string) => void;
  minimize: (key: string) => void;
  maximize: (key: string) => void;
  move: (key: string, x: number, y: number) => void;
  resize: (key: string, width: number, height: number) => void;
  toggleStart: () => void;
}

const dimensions: Partial<Record<AppId, [number, number]>> = {
  chat: [285, 580],
  campus: [980, 690],
  games: [1050, 690],
  schedule: [860, 580],
  forum: [1020, 690],
  qzone: [1000, 690],
  gamebox: [900, 630],
  recycle: [720, 510],
  study: [880, 630],
  settings: [690, 550],
  grades: [850, 620],
};
export const useDesktop = create<DesktopStore>((set, get) => ({
  windows: [],
  topZ: 10,
  startMenu: false,
  open: (app, npc) => {
    const key = npc ? `${app}-${npc}` : app;
    const existing = get().windows.find((w) => w.key === key);
    const z = get().topZ + 1;
    if (existing) {
      set({
        windows: get().windows.map((w) => (w.key === key ? { ...w, minimized: false, z } : w)),
        topZ: z,
        startMenu: false,
      });
      return;
    }
    const [width, height] = app === 'chat' && npc ? [700, 550] : (dimensions[app] ?? [820, 580]);
    const vw = typeof window === 'undefined' ? 1440 : window.innerWidth;
    const vh = typeof window === 'undefined' ? 900 : window.innerHeight;
    const offset = (get().windows.length % 4) * 22;
    set({
      windows: [
        ...get().windows,
        {
          key,
          app,
          npc,
          x:
            app === 'chat' && !npc
              ? Math.max(12, vw - width - 25)
              : Math.max(12, (vw - width) / 2 + offset - 40),
          y:
            app === 'chat' && !npc
              ? Math.max(20, Math.min(190, vh - height - 65))
              : Math.max(16, (vh - height - 65) / 2 + offset),
          width: Math.min(width, vw - 24),
          height: Math.min(height, vh - 100),
          z,
          minimized: false,
          maximized: false,
        },
      ],
      topZ: z,
      startMenu: false,
    });
  },
  close: (key) => set({ windows: get().windows.filter((w) => w.key !== key) }),
  focus: (key) => {
    const z = get().topZ + 1;
    set({ windows: get().windows.map((w) => (w.key === key ? { ...w, z, minimized: false } : w)), topZ: z });
  },
  minimize: (key) =>
    set({ windows: get().windows.map((w) => (w.key === key ? { ...w, minimized: true } : w)) }),
  maximize: (key) =>
    set({
      windows: get().windows.map((w) =>
        w.key === key ? { ...w, maximized: !w.maximized, minimized: false } : w,
      ),
    }),
  move: (key, x, y) => set({ windows: get().windows.map((w) => (w.key === key ? { ...w, x, y } : w)) }),
  resize: (key, width, height) =>
    set({ windows: get().windows.map((w) => (w.key === key ? { ...w, width, height } : w)) }),
  toggleStart: () => set({ startMenu: !get().startMenu }),
}));
