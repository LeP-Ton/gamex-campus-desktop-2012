import type { AppId } from '../../engine/types';
import { Campus } from './Campus';
import { Schedule, Study, Grades } from './AcademicApps';
import { QQ, Renren, Qzone } from './PeriodSocial';
import { League, LeagueBox } from './PeriodGames';
import { Browser } from './LeisureApps';
import { Files, Diary, Rankings, SettingsApp } from './UtilityApps';
import { ActionFeedback, Icon } from '../ui';

export function Apps({ app, npc }: { app: AppId; npc?: string }) {
  const content = {
    campus: <Campus />,
    chat: <QQ npc={npc} />,
    forum: <Renren />,
    browser: <Browser />,
    schedule: <Schedule />,
    study: <Study />,
    games: <League />,
    files: <Files />,
    diary: <Diary />,
    grades: <Grades />,
    rankings: <Rankings />,
    settings: <SettingsApp />,
    qzone: <Qzone npc={npc} />,
    gamebox: <LeagueBox />,
    recycle: (
      <div className="recycle-empty">
        <Icon name="folder" size={48} />
        <h3>回收站为空</h3>
        <p>删除的文档会显示在这里。</p>
      </div>
    ),
  }[app];
  return (
    <div className={`app app-${app}`}>
      {content}
      <ActionFeedback />
    </div>
  );
}
