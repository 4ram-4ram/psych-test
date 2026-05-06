// 캔버스 기반 방사형(레이더) 그래프
// ResultPage 와 AdminPage(상세 모달) 에서 동일한 시각화를 사용하기 위해 분리.

// ── 라벨 자동 줄바꿈 (공백 기준, 글자 수 기반) ─────────────────
function wrapLabel(text, maxChars = 5) {
  if (text.length <= maxChars) return [text];
  const words = text.split(' ');
  if (words.length === 1) return [text];
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');
  return [line1, line2];
}

// ── 방사형 그래프 그리기 ──────────────────────────────────────
export function drawRadar(canvas, groupScores, groupLabels) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R = Math.min(cx, cy) * 0.62;
  const n = groupLabels.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;

  ctx.clearRect(0, 0, W, H);

  // 배경 그리드 (5단계)
  for (let step = 1; step <= 5; step++) {
    const r = (R * step) / 5;
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = cx + r * Math.cos(angle(i));
      const y = cy + r * Math.sin(angle(i));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = step === 5 ? 'rgba(26,51,32,0.15)' : 'rgba(26,51,32,0.08)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = step % 2 === 0 ? 'rgba(245,248,208,0.25)' : 'transparent';
    ctx.fill();
  }

  // 축선
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + R * Math.cos(angle(i)), cy + R * Math.sin(angle(i)));
    ctx.strokeStyle = 'rgba(26,51,32,0.12)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  // 데이터 영역
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const r = (R * groupScores[i]) / 100;
    const x = cx + r * Math.cos(angle(i));
    const y = cy + r * Math.sin(angle(i));
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(26,51,32,0.18)';
  ctx.fill();
  ctx.strokeStyle = '#1A3320';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 데이터 점
  for (let i = 0; i < n; i++) {
    const r = (R * groupScores[i]) / 100;
    const x = cx + r * Math.cos(angle(i));
    const y = cy + r * Math.sin(angle(i));
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1A3320';
    ctx.fill();
    ctx.strokeStyle = '#F5F8D0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // 레이블
  const LABEL_PAD = 20;
  const fontSize = Math.round(W * 0.035);
  ctx.font = `500 ${fontSize}px 'Noto Sans KR', sans-serif`;
  ctx.fillStyle = '#1A3320';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const x = cx + (R + LABEL_PAD) * Math.cos(angle(i));
    const y = cy + (R + LABEL_PAD) * Math.sin(angle(i));
    ctx.textAlign =
      Math.abs(Math.cos(angle(i))) < 0.1 ? 'center'
        : Math.cos(angle(i)) > 0 ? 'left' : 'right';

    const lines = wrapLabel(groupLabels[i], 5);
    const lineHeight = fontSize * 1.25;

    lines.forEach((line, li) => {
      const yOffset = (li - (lines.length - 1) / 2) * lineHeight;
      ctx.fillText(line, x, y + yOffset);
    });
  }
}
