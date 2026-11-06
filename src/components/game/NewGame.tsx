import { useState } from 'react';
import { useGame } from '../../stores/gameStore';
import { useDesktop } from '../../stores/desktopStore';
import { MAJORS } from '../../content/world';
import type { Major } from '../../engine/types';
import { AppIcon, Button, Icon } from '../ui';

export function NewGame({ close, retrySeed }: { close: () => void; retrySeed?: string }) {
  const game = useGame((s) => s.game);
  const start = useGame((s) => s.start);
  const [name, setName] = useState(game?.profile.name ?? '林一');
  const [gender, setGender] = useState(game?.profile.gender ?? '男');
  const [major, setMajor] = useState<Major>(game?.profile.major ?? 'cs');
  const [seed, setSeed] = useState(retrySeed ?? '我们的2012');
  return (
    <div className="modal-backdrop win-setup-backdrop">
      <section
        className="enrollment win-enrollment"
        role="dialog"
        aria-modal="true"
        aria-label="新生入学登记"
      >
        <div className="setup-title">
          <AppIcon app="files" size="small" />
          设置您的大学生活
          {game && (
            <button onClick={close} aria-label="关闭入学登记">
              ×
            </button>
          )}
        </div>
        <div className="setup-body">
          <aside>
            <AppIcon app="files" size="large" />
            <h2>
              欢迎使用
              <br />
              Windows 7
            </h2>
            <p>
              2012 年 9 月<br />
              南川大学 · 302 寝室
            </p>
            <hr />
            <span>第一步：创建新生档案</span>
            <span>第二步：登录您的桌面</span>
            <div className="setup-version">
              Windows 7<br />
              <small>旗舰版 · 2012</small>
            </div>
          </aside>
          <form
            className="enrollment-form"
            onSubmit={(e) => {
              e.preventDefault();
              start({ name, gender, major }, seed);
              useDesktop.setState({ windows: [] });
              useDesktop.getState().open('chat');
              close();
            }}
          >
            <h2>请选择您的专业，并输入姓名</h2>
            <p className="muted">这是你在南川大学的第一个学期。桌面上的软件将陪伴你的大学生活。</p>
            {game && <div className="info-box">新游戏会替换当前进度，原存档将自动备份。</div>}
            <div className="form-row">
              <label>
                你的姓名
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={16} required />
              </label>
              <label className="gender-label">
                性别
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option>男</option>
                  <option>女</option>
                  <option>其他</option>
                </select>
              </label>
            </div>
            <label className="field-label">专业</label>
            <div className="major-options">
              {(Object.keys(MAJORS) as Major[]).map((id) => (
                <button
                  type="button"
                  className={`major-option ${major === id ? 'selected' : ''}`}
                  key={id}
                  onClick={() => setMajor(id)}
                >
                  <Icon name={MAJORS[id].icon} size={24} />
                  <span>
                    <strong>{MAJORS[id].name}</strong>
                    <small>
                      {id === 'cs' ? '程序设计 / 高等数学 / 计算机导论' : '人体解剖 / 医用化学 / 医学导论'}
                    </small>
                  </span>
                  <span className="radio-circle">{major === id && <i />}</span>
                </button>
              ))}
            </div>
            <label className="seed-label">
              故事种子<span>相同种子可以重新挑战</span>
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                maxLength={60}
                placeholder="留空则随机生成"
              />
            </label>
            <div className="setup-form-footer">
              <small>游戏进度自动保存在此计算机上</small>
              <Button type="submit" className="primary enroll-button" disabled={!name.trim()}>
                开启我的大学生活
                <Icon name="arrow" size={15} />
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
