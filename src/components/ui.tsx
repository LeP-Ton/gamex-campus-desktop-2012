import type { CSSProperties, ReactNode } from 'react';
import {
  BookOpen,
  CalendarDays,
  MessageCircle,
  Globe2,
  Gamepad2,
  FolderOpen,
  NotebookPen,
  GraduationCap,
  Trophy,
  Settings,
  Monitor,
  Coffee,
  Heart,
  Code2,
  Users,
  Sun,
  Moon,
  Bell,
  BriefcaseBusiness,
  Leaf,
  ChevronRight,
  Clock3,
  BatteryMedium,
  Wallet,
  Sparkles,
  Radio,
  Target,
  Flag,
  Mail,
  FileText,
  ArrowUpRight,
  CircleHelp,
  Home,
  Search,
  Music,
  Camera,
  Shield,
  Check,
  CircleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { AppId } from '../engine/types';
import { useGame } from '../stores/gameStore';
import { useDesktop } from '../stores/desktopStore';
import { clockText, npcDef } from '../engine/helpers';
import { PeriodIcon } from './desktop/PeriodIcon';

export const ICONS: Record<string, LucideIcon> = {
  book: BookOpen,
  calendar: CalendarDays,
  chat: MessageCircle,
  globe: Globe2,
  game: Gamepad2,
  folder: FolderOpen,
  diary: NotebookPen,
  graduation: GraduationCap,
  trophy: Trophy,
  settings: Settings,
  monitor: Monitor,
  coffee: Coffee,
  heart: Heart,
  code: Code2,
  users: Users,
  sun: Sun,
  moon: Moon,
  bell: Bell,
  work: BriefcaseBusiness,
  leaf: Leaf,
  arrow: ChevronRight,
  clock: Clock3,
  energy: BatteryMedium,
  money: Wallet,
  sparkles: Sparkles,
  radio: Radio,
  target: Target,
  flag: Flag,
  mail: Mail,
  file: FileText,
  external: ArrowUpRight,
  help: CircleHelp,
  home: Home,
  search: Search,
  music: Music,
  camera: Camera,
  shield: Shield,
  check: Check,
  alert: CircleAlert,
};
export function Icon({
  name,
  size = 18,
  ...props
}: {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const Component = ICONS[name] ?? Monitor;
  return <Component size={size} strokeWidth={1.7} {...props} />;
}

export const APPS: Record<
  AppId,
  { name: string; short: string; icon: string; color: string; subtitle: string }
> = {
  campus: {
    name: '我的校园',
    short: '我的校园',
    icon: 'home',
    color: 'teal',
    subtitle: '南川大学 · 个人主页',
  },
  chat: {
    name: 'QQ2012',
    short: '腾讯QQ',
    icon: 'chat',
    color: 'blue',
    subtitle: '总有一个人，等你上线',
  },
  forum: {
    name: '人人网 - Windows Internet Explorer',
    short: '人人网',
    icon: 'users',
    color: 'orange',
    subtitle: '有温度的校园，正在发生的故事',
  },
  browser: {
    name: '校园导航 - Windows Internet Explorer',
    short: 'Internet Explorer',
    icon: 'globe',
    color: 'blue',
    subtitle: '校园导航 · 勤工助学',
  },
  schedule: {
    name: '我的课程表',
    short: '课程表',
    icon: 'calendar',
    color: 'green',
    subtitle: '2012—2013 学年 · 第一学期',
  },
  study: {
    name: '学习中心',
    short: '学习中心',
    icon: 'book',
    color: 'blue',
    subtitle: '每天一点积累，未来无限可能',
  },
  games: {
    name: 'League of Legends',
    short: '英雄联盟',
    icon: 'game',
    color: 'purple',
    subtitle: '属于我们的征途，现在开始',
  },
  files: {
    name: '计算机 · 我的文件',
    short: '计算机',
    icon: 'monitor',
    color: 'blue',
    subtitle: '我的大学，我的收藏',
  },
  diary: {
    name: '我的大学日记',
    short: '大学日记',
    icon: 'diary',
    color: 'brown',
    subtitle: '把平凡日子，写成独家记忆',
  },
  grades: {
    name: '教务系统 · 学期档案',
    short: '教务系统',
    icon: 'graduation',
    color: 'green',
    subtitle: '南川大学本科生教务管理系统',
  },
  rankings: {
    name: '校园风云榜',
    short: '风云榜',
    icon: 'trophy',
    color: 'gold',
    subtitle: '每一种大学生活，都值得被记录',
  },
  settings: {
    name: '控制面板',
    short: '控制面板',
    icon: 'settings',
    color: 'gray',
    subtitle: '存档、种子与游戏帮助',
  },
  qzone: {
    name: 'QQ空间 - Windows Internet Explorer',
    short: 'QQ空间',
    icon: 'sparkles',
    color: 'gold',
    subtitle: '分享生活，留住感动',
  },
  gamebox: {
    name: '多玩英雄联盟盒子',
    short: '英雄联盟盒子',
    icon: 'game',
    color: 'orange',
    subtitle: '战绩查询 · 英雄攻略',
  },
  recycle: { name: '回收站', short: '回收站', icon: 'folder', color: 'gray', subtitle: '回收站为空' },
};

export function AppIcon({ app, size = 'medium' }: { app: AppId; size?: 'small' | 'medium' | 'large' }) {
  const a = APPS[app];
  return (
    <span className={`app-icon ${a.color} ${size}`}>
      <PeriodIcon app={app} />
    </span>
  );
}
export function Avatar({ id, size = 38, name }: { id: string; size?: number; name?: string }) {
  const def = npcDef(id);
  const text = name?.slice(0, 1) ?? def?.avatar ?? '我';
  return (
    <span
      className="avatar"
      title={name ?? def?.name ?? text}
      style={{ width: size, height: size, fontSize: size * 0.39, background: def?.color ?? '#5a8ba5' }}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <rect width="48" height="48" fill={def?.color ?? '#78a6c8'} />
        <circle cx="37" cy="10" r="9" fill="#ffffff33" />
        <path
          d="M4 48q2-19 20-18 18-1 20 18"
          fill={['muwan', 'xiaoyu'].includes(id) ? '#e3a1ae' : '#507796'}
        />
        <path d="M19 28h10v9q-5 6-10 0" fill="#e2b68d" />
        <ellipse cx="24" cy="21" rx="12" ry="15" fill="#f7d7ae" />
        <path d="M12 23Q4 2 22 3q21-4 15 25l-6-15-5 5-9-7z" fill={id === 'wei' ? '#6c4727' : '#343b43'} />
        {['muwan', 'xiaoyu'].includes(id) && (
          <path d="M13 17 9 41l7-2 1-13m17-11 5 27-8-3 1-15" fill="#343b43" />
        )}
        <path d="M17 23h3m8 0h3" stroke="#423b36" strokeWidth="2" strokeLinecap="round" />
        <path d="M21 29q3 3 6 0" stroke="#ba7b62" strokeWidth="1.4" fill="none" />
        {id === 'zhou' && <path d="M14 21h9v6h-9zm12 0h9v6h-9zm-3 2h3" stroke="#4e5861" fill="none" />}
      </svg>
    </span>
  );
}
export function Button({
  children,
  icon,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode; icon?: string }) {
  return (
    <button className={`button ${className}`} {...props}>
      {icon && <Icon name={icon} size={15} />}
      {children}
    </button>
  );
}
export function Tag({ children, color = '' }: { children: ReactNode; color?: string }) {
  return <span className={`tag ${color}`}>{children}</span>;
}
export function Progress({
  value,
  color = '#559b87',
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      aria-label={label}
    >
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
    </div>
  );
}
export function Empty({ icon = 'leaf', title, text }: { icon?: string; title: string; text: string }) {
  return (
    <div className="empty">
      <Icon name={icon} size={38} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function ActionFeedback() {
  const text = useGame((s) => s.game?.lastAction);
  return (
    <div className="action-feedback" role="status">
      <Icon name="radio" size={14} />
      <span>{text}</span>
    </div>
  );
}
export function ResourceBar() {
  const s = useGame((x) => x.game)!;
  return (
    <div className="resource-bar">
      <span>
        <Icon name="clock" size={14} />
        {clockText(s.minute)}
      </span>
      <span>
        <Icon name="energy" size={14} />
        精力 {Math.round(s.energy)}
      </span>
      <span>
        <Icon name="money" size={14} />¥{s.money}
      </span>
      <span className="push-right">每个选择，都有自己的分量</span>
    </div>
  );
}
export function AppLink({ app, children }: { app: AppId; children?: ReactNode }) {
  const open = useDesktop((x) => x.open);
  return (
    <button className="text-link" onClick={() => open(app)}>
      {children ?? APPS[app].short}
      <Icon name="arrow" size={14} />
    </button>
  );
}
