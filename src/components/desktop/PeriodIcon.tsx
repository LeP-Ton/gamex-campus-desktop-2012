import type { AppId } from '../../engine/types';
import { assetUrl } from '../../lib/assets';

type IconSize = 'small' | 'medium' | 'large';

// 软件与系统图标直接使用原始资源；具体来源和原生分辨率见图标目录的 sources.json。
const APP_ASSETS: Record<AppId, string> = {
  campus: 'folder',
  chat: 'qq',
  forum: 'renren',
  browser: 'ie',
  schedule: 'schedule',
  study: 'study',
  games: 'league',
  files: 'computer',
  diary: 'diary',
  grades: 'documents',
  rankings: 'favorites',
  settings: 'control-panel',
  qzone: 'qzone',
  gamebox: 'lolbox',
  recycle: 'recycle',
};
const FILES: Record<string, Record<number, string>> = {
  computer: {
    '16': 'computer-16.png',
    '24': 'computer-24.png',
    '32': 'computer-32.png',
    '48': 'computer-48.png',
    '64': 'computer-64.png',
    '256': 'computer-256.png',
  },
  recycle: {
    '16': 'recycle-16.png',
    '24': 'recycle-24.png',
    '32': 'recycle-32.png',
    '48': 'recycle-48.png',
    '256': 'recycle-256.png',
  },
  folder: {
    '16': 'folder-16.png',
    '32': 'folder-32.png',
    '48': 'folder-48.png',
    '256': 'folder-256.png',
  },
  schedule: {
    '16': 'schedule-16.png',
    '32': 'schedule-32.png',
    '48': 'schedule-48.png',
  },
  study: {
    '16': 'study-16.png',
    '32': 'study-32.png',
    '48': 'study-48.png',
    '256': 'study-256.png',
  },
  diary: {
    '16': 'diary-16.png',
    '32': 'diary-32.png',
    '48': 'diary-48.png',
    '256': 'diary-256.png',
  },
  documents: {
    '16': 'documents-16.png',
    '24': 'documents-24.png',
    '32': 'documents-32.png',
    '48': 'documents-48.png',
    '256': 'documents-256.png',
  },
  favorites: {
    '16': 'favorites-16.png',
    '24': 'favorites-24.png',
    '32': 'favorites-32.png',
    '48': 'favorites-48.png',
    '256': 'favorites-256.png',
  },
  'control-panel': {
    '16': 'control-panel-16.png',
    '24': 'control-panel-24.png',
    '32': 'control-panel-32.png',
    '48': 'control-panel-48.png',
    '64': 'control-panel-64.png',
    '256': 'control-panel-256.png',
  },
  ie: {
    '16': 'ie-16.png',
    '24': 'ie-24.png',
    '32': 'ie-32.png',
    '48': 'ie-48.png',
    '256': 'ie-256.png',
  },
  shortcut: {
    '16': 'shortcut-16.png',
    '24': 'shortcut-24.png',
    '32': 'shortcut-32.png',
    '48': 'shortcut-48.png',
  },
  qq: {
    '375': 'qq.png',
  },
  renren: {
    '84': 'renren.png',
  },
  qzone: {
    '140': 'qzone.png',
  },
  lolbox: {
    '48': 'lolbox.png',
  },
  league: {
    '16': 'league-16.png',
    '240': 'league.png',
  },
};

export function PeriodIcon({ app, size = 'medium' }: { app: AppId; size?: IconSize }) {
  const variants = FILES[APP_ASSETS[app]];
  const pixels = { small: 16, medium: 32, large: 48 }[size];
  const available = Object.keys(variants)
    .map(Number)
    .sort((a, b) => a - b);
  const choose = (target: number) => variants[available.find((n) => n >= target) ?? available.at(-1)!];
  const src = assetUrl(`period-assets/icons/${choose(pixels)}`);
  const retina = assetUrl(`period-assets/icons/${choose(pixels * 2)}`);
  return (
    <img
      className="period-icon"
      src={src}
      srcSet={retina === src ? undefined : `${src} 1x, ${retina} 2x`}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
