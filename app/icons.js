// Reclaim — custom picture set for words with no accurate standard emoji.
// Simple single-stroke line icons, consistent style, so the target word is
// never taught against the wrong picture (SFA requires tight word/image fidelity).
const S = 'stroke="currentColor" fill="none" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"';

export const ICONS = {
  kettle: `<svg viewBox="0 0 64 64" ${S}>
    <path d="M14 32 h32 a4 4 0 0 1 4 4 v10 a10 10 0 0 1-10 10 H20 a10 10 0 0 1-10-10 V36 a4 4 0 0 1 4-4 Z"/>
    <path d="M20 32 V22 a12 12 0 0 1 24 0 v10"/>
    <path d="M44 34 l10 -4"/>
    <path d="M28 12 q3 -4 0 -8 M36 12 q3 -4 0 -8"/>
  </svg>`,

  fridge: `<svg viewBox="0 0 64 64" ${S}>
    <rect x="16" y="6" width="32" height="52" rx="4"/>
    <line x1="16" y1="24" x2="48" y2="24"/>
    <line x1="22" y1="12" x2="22" y2="18"/>
    <line x1="22" y1="30" x2="22" y2="38"/>
  </svg>`,

  pillow: `<svg viewBox="0 0 64 64" ${S}>
    <path d="M10 24 q0 -8 8 -8 h28 q8 0 8 8 v16 q0 8 -8 8 H18 q-8 0 -8 -8 Z"/>
    <path d="M24 22 q4 4 0 8 M40 22 q-4 4 0 8"/>
  </svg>`,

  stairs: `<svg viewBox="0 0 64 64" ${S}>
    <path d="M8 52 h12 V40 h12 V28 h12 V16 h12"/>
    <line x1="8" y1="52" x2="8" y2="58"/>
    <line x1="56" y1="16" x2="56" y2="10"/>
  </svg>`,

  library: `<svg viewBox="0 0 64 64" ${S}>
    <path d="M8 22 L32 8 L56 22"/>
    <line x1="10" y1="22" x2="10" y2="50"/>
    <line x1="54" y1="22" x2="54" y2="50"/>
    <line x1="20" y1="26" x2="20" y2="50"/>
    <line x1="32" y1="26" x2="32" y2="50"/>
    <line x1="44" y1="26" x2="44" y2="50"/>
    <line x1="6" y1="50" x2="58" y2="50"/>
    <line x1="6" y1="56" x2="58" y2="56"/>
  </svg>`,

  towel: `<svg viewBox="0 0 64 64" ${S}>
    <line x1="8" y1="12" x2="56" y2="12"/>
    <path d="M18 12 v34 q0 6 6 6 h4 q6 0 6 -6 V12"/>
    <line x1="24" y1="22" x2="34" y2="22"/>
    <line x1="24" y1="30" x2="34" y2="30"/>
  </svg>`,
};

import { PHOTOS } from "./photos.js";

// Real photo when one exists for this word; if it fails to load for any
// reason (offline, blocked, broken link), onerror swaps to the icon/emoji
// fallback in place — a card can never render blank.
export function pictureHtml(w) {
  const photo = PHOTOS[w.word];
  const fallbackInner = ICONS[w.icon] ?? w.emoji;
  if (!photo) return ICONS[w.icon] ? `<span class="icon-pic">${fallbackInner}</span>` : fallbackInner;
  const fallbackId = `pic-fallback-${w.id}`;
  return `<span class="pic-wrap">
    <img class="real-photo" src="${photo.url}" alt="${w.word}"
      onerror="this.style.display='none';document.getElementById('${fallbackId}').style.display='inline-block'">
    <span class="icon-pic" id="${fallbackId}" style="display:none">${fallbackInner}</span>
  </span>`;
}
