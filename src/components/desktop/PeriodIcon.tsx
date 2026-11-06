import { useId } from 'react';
import type { AppId } from '../../engine/types';

/** 用矢量重绘软件的时代轮廓，避免把现代线框图标放进 2012 年桌面。 */
export function PeriodIcon({ app }: { app: AppId }) {
  const id = useId().replace(/:/g, '');
  const blue = `${id}-blue`;
  const gold = `${id}-gold`;
  const glass = `${id}-glass`;
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={blue} x2="0" y2="1">
          <stop stopColor="#92dbff" />
          <stop offset=".48" stopColor="#238fd1" />
          <stop offset="1" stopColor="#06467f" />
        </linearGradient>
        <linearGradient id={gold} x2="0" y2="1">
          <stop stopColor="#fff5b0" />
          <stop offset=".5" stopColor="#eab946" />
          <stop offset="1" stopColor="#92701c" />
        </linearGradient>
        <linearGradient id={glass} x2="0" y2="1">
          <stop stopColor="#fff" />
          <stop offset="1" stopColor="#b2c4d1" />
        </linearGradient>
      </defs>
      {app === 'chat' ? (
        <g>
          <ellipse cx="31" cy="34" rx="19" ry="25" fill="#151515" />
          <ellipse cx="32" cy="40" rx="14" ry="19" fill="white" />
          <ellipse cx="25" cy="18" rx="6" ry="9" fill="white" />
          <ellipse cx="37" cy="18" rx="6" ry="9" fill="white" />
          <ellipse cx="27" cy="18" rx="2" ry="4" fill="#101010" />
          <ellipse cx="35" cy="18" rx="2" ry="4" fill="#101010" />
          <path d="M24 27Q31 21 41 27Q33 34 24 27" fill="#ffb632" />
          <path d="M13 31Q30 40 49 29L50 37Q30 46 14 38Z" fill="#e52e20" />
          <path d="m44 36 9 12-9 3-6-12" fill="#e92a1b" />
          <path d="M13 32 4 43q-2 9 9 4l6-10m28-6 12 14q2 9-10 2l-8-10" fill="#171717" />
          <ellipse cx="23" cy="59" rx="11" ry="5" fill="#f6aa1b" />
          <ellipse cx="43" cy="59" rx="11" ry="5" fill="#f6aa1b" />
        </g>
      ) : app === 'qzone' ? (
        <g>
          <path
            d="m32 3 9 18 20 3-14 15 4 21-19-10-19 10 4-21L3 24l21-3z"
            fill={`url(#${gold})`}
            stroke="#aa7b09"
            strokeWidth="1.5"
          />
          <path d="M20 24h24l-15 17h14v6H18v-5l16-12H20z" fill="white" stroke="#c49531" strokeWidth=".5" />
        </g>
      ) : app === 'browser' ? (
        <g>
          <path
            d="M54 35H20q1 12 13 12 8 0 15-6l5 9q-9 10-23 8C-3 55 3 9 31 8q25-1 23 27M20 27h22q-3-10-12-9-8 0-10 9"
            fill={`url(#${blue})`}
            stroke="#52b6ea"
          />
          <ellipse
            cx="31"
            cy="33"
            rx="32"
            ry="12"
            transform="rotate(-32 31 33)"
            stroke="#edc65a"
            strokeWidth="5"
          />
          <path d="M54 35H20q1 12 13 12 8 0 15-6" fill={`url(#${blue})`} />
        </g>
      ) : app === 'forum' ? (
        <g>
          <circle cx="32" cy="13" r="8" fill="#237ac3" />
          <circle cx="13" cy="27" r="6" fill="#35a148" />
          <circle cx="51" cy="27" r="6" fill="#35a148" />
          <path d="M17 43q0-22 15-22t15 22" stroke="#237ac3" strokeWidth="11" />
          <path d="M4 48q0-15 9-15m47 15q0-15-9-15" stroke="#35a148" strokeWidth="8" />
          <text x="32" y="62" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#286fa8">
            人人
          </text>
        </g>
      ) : app === 'games' ? (
        <g>
          <path d="m32 2 23 9-4 35-19 16L12 46 8 11z" fill="#173b5d" stroke="#c4a45c" strokeWidth="3" />
          <path
            d="M19 10h20v5h-5v30h12l-3 9H19v-6h5V16h-5z"
            fill={`url(#${gold})`}
            stroke="#42351a"
            strokeWidth="1"
          />
          <path d="m18 10 30-2-3 5H20" fill="#ffdfa0" />
        </g>
      ) : app === 'gamebox' ? (
        <g>
          <path d="M4 18 31 7l28 11-3 34L30 62 7 50z" fill="#e3a529" stroke="#7c531a" strokeWidth="2" />
          <path d="m4 18 27 12 28-12M31 30l-1 32" stroke="#ffe39a" strokeWidth="2" />
          <path d="m8 28 18 8v13L8 42zm28 8 18-8v14l-18 7z" fill="#332c2a" />
          <path d="m12 32 9 4v6l-9-4zm29 4 9-4v6l-9 4z" fill="white" />
          <path d="M19 5h27l4 8-10 4-7-6-12 5-9-3z" fill="#8d5d2b" />
        </g>
      ) : app === 'files' ? (
        <g>
          <path d="M5 10h46v34H5z" fill="#8b9ba9" stroke="#3c5363" strokeWidth="2" />
          <path d="M8 13h40v27H8z" fill={`url(#${blue})`} stroke="#dcecf7" />
          <path d="m10 35 17-17 19 5v15H10" fill="#d5f1ff" opacity=".4" />
          <path d="M24 45h11v8h10v4H14v-4h10z" fill={`url(#${glass})`} stroke="#728a99" />
          <path d="M50 20h10v37H48V20z" fill={`url(#${glass})`} stroke="#667786" />
          <path d="M51 25h6m-6 4h6" stroke="#607888" />
          <circle cx="54" cy="50" r="2" fill="#6fc65e" />
        </g>
      ) : app === 'recycle' ? (
        <g>
          <path d="m13 13 5 44q15 8 30 0l5-44z" fill={`url(#${glass})`} fillOpacity=".85" stroke="#8399a9" />
          <ellipse cx="33" cy="13" rx="21" ry="6" fill="#dce7ee" stroke="#7b8f9b" />
          <ellipse cx="33" cy="13" rx="16" ry="3" fill="#a6bbc8" />
          <path
            d="m28 26 7-4 7 8-5 3-4-5-5 4m13 1 5 7-4 6-9-1 1-6 6 1 1-7m-12 9-8-1-2-8 7-4 3 5-5 3 6 5"
            fill="#3985b8"
          />
          <path d="m19 20 4 34m24-34-4 34" stroke="white" opacity=".7" />
        </g>
      ) : app === 'schedule' ? (
        <g>
          <path d="M8 8h47v48H8z" fill={`url(#${glass})`} stroke="#8299a7" />
          <path d="M8 8h47v14H8z" fill="#ce342d" />
          <path d="M19 4v11M44 4v11" stroke="#9babb5" strokeWidth="4" />
          <text x="32" y="46" textAnchor="middle" fontFamily="Arial" fontSize="25" fill="#333">
            3
          </text>
        </g>
      ) : app === 'settings' ? (
        <g>
          <path d="M5 14h54v40H5z" fill={`url(#${glass})`} stroke="#6e8696" />
          <path d="M9 18h46v8H9z" fill={`url(#${blue})`} />
          <path d="M15 32h8v8h-8m17-8h16m-16 7h16m-33 7h33" stroke="#587c98" strokeWidth="3" />
          <circle cx="51" cy="48" r="10" fill="#98b6cc" stroke="#587b9b" strokeWidth="4" />
          <circle cx="51" cy="48" r="3" fill="#426681" />
        </g>
      ) : ['study', 'diary', 'grades'].includes(app) ? (
        <g>
          <path
            d="m12 7 35-4 9 48-37 9L9 51z"
            fill={app === 'diary' ? '#995c32' : app === 'study' ? '#2673a6' : '#28826a'}
            stroke="#5a605a"
            strokeWidth="1.5"
          />
          <path d="m18 9 30-3 5 40-31 7z" fill="#fffce9" />
          <path d="m22 17 21-3m-20 10 21-3m-19 10 21-3m-20 10 20-3" stroke="#9babad" strokeWidth="2" />
          <path d="m20 57 33-9v5l-32 8" fill="#e5e2c8" />
          <path d="m39 10 8-2-1 44-8 2z" fill="#d9a252" />
        </g>
      ) : app === 'rankings' ? (
        <g>
          <path d="M19 7h27v22q-1 17-13 17T19 29z" fill={`url(#${gold})`} stroke="#aa842e" />
          <path d="M18 13H7q-1 18 15 19m23-19h12q1 18-16 19" stroke="#d5a844" strokeWidth="5" />
          <path d="M30 45h7v11H23v5h29v-5H37" fill="#bc912c" />
        </g>
      ) : (
        <g>
          <path d="M5 19h54v36H5z" fill={`url(#${gold})`} stroke="#b69440" />
          <path d="M5 19V10h22l5 7h27v8" fill="#f5d780" stroke="#b69440" />
          <path d="m5 27 7-6h48l-6 34H5z" fill="#f7d97a" stroke="#ceac51" />
          <path d="M16 34h24v16H16z" fill={`url(#${blue})`} stroke="#7ca4ba" />
        </g>
      )}
    </svg>
  );
}
