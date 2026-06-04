// 관리자 검사 결과 → 엑셀(.xlsx) export (ExcelJS — 테두리/굵게 스타일)
// 색은 최소화: 헤더만 연한 회색(엑셀 기본 음영색), 나머지는 테두리·굵게로만 구분.
// 검사 종류 단위로 시트 1개. 시트 구성:
//   검사 종류 / 질문 종류(번호↔내용) / 질문 그룹 종류(번호↔명) / 답변 종류(번호↔내용)
//   → 데이터 표: 답변시각 | 문항1..N(선택한 답변 번호) | 총점 | 그룹1..M(그룹 점수)
// '전체'(selectedTestId 없음)면 데이터에 존재하는 검사마다 시트를 생성.

import { tests } from '../data/tests';
import { calcTotalPct, calcGroupScores } from './scoring';
// ExcelJS 는 무거워서 export 클릭 시점에만 동적 로드 (메인 번들에서 분리)

// ── 색상(ARGB) — 연한 회색만 사용 ───────────────────────────
const C = {
  band: 'FFD9D9D9',   // 섹션 배너 (연한 회색)
  head: 'FFF2F2F2',   // 표 헤더 (더 연한 회색)
  border: 'FFBFBFBF', // 테두리 (연한 회색)
};
const THIN = { style: 'thin', color: { argb: C.border } };
const BORDER_ALL = { top: THIN, left: THIN, bottom: THIN, right: THIN };

const range = (n) => Array.from({ length: n }, (_, i) => i);

function fmtDateTime(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Excel 시트명: 31자 이내, : \ / ? * [ ] 불가
function sanitizeSheetName(name) {
  return name.replace(/[:\\/?*[\]]/g, ' ').slice(0, 31);
}

function setBorder(ws, r, c1, c2) {
  for (let c = c1; c <= c2; c++) ws.getCell(r, c).border = BORDER_ALL;
}

function fill(cell, argb) {
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } };
}

// 검사 1개 → 시트 생성
function addTestSheet(workbook, test, rows) {
  const ws = workbook.addWorksheet(sanitizeSheetName(test.name), {
    views: [{ showGridLines: false }],
  });

  const hasGroups = (test.groups?.length ?? 0) > 0;
  const N = test.questions.length;
  const M = hasGroups ? test.groups.length : 0;
  const dataCols = 1 + N + 1 + M; // 답변시각 + 문항N + 총점 + 그룹M
  const last = Math.max(dataCols, 2);

  let r = 1;

  // 섹션 타이틀 (연회색 배너, 전체 폭 병합)
  const sectionTitle = (text) => {
    ws.mergeCells(r, 1, r, last);
    const cell = ws.getCell(r, 1);
    cell.value = text;
    cell.font = { bold: true, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
    fill(cell, C.band);
    setBorder(ws, r, 1, last);
    ws.getRow(r).height = 20;
    r += 1;
  };

  // 범례 헤더 (연회색): 번호 | 내용
  const legendHeader = (numLabel, textLabel) => {
    const a = ws.getCell(r, 1);
    a.value = numLabel;
    ws.mergeCells(r, 2, r, last);
    const b = ws.getCell(r, 2);
    b.value = textLabel;
    [a, b].forEach((cell) => {
      cell.font = { bold: true };
      fill(cell, C.head);
    });
    a.alignment = { horizontal: 'center', vertical: 'middle' };
    b.alignment = { horizontal: 'left', vertical: 'middle' };
    setBorder(ws, r, 1, last);
    r += 1;
  };

  // 범례 행: 번호 | 텍스트(병합), 채움 없음
  const legendRow = (num, text) => {
    ws.getCell(r, 1).value = num;
    ws.getCell(r, 1).alignment = { horizontal: 'center', vertical: 'middle' };
    ws.mergeCells(r, 2, r, last);
    const b = ws.getCell(r, 2);
    b.value = text;
    b.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    setBorder(ws, r, 1, last);
    r += 1;
  };

  const blank = () => { r += 1; };

  // ── 1) 검사 종류 ──
  {
    const a = ws.getCell(r, 1);
    a.value = '검사 종류';
    a.font = { bold: true };
    a.alignment = { horizontal: 'center', vertical: 'middle' };
    fill(a, C.band);
    ws.mergeCells(r, 2, r, last);
    const b = ws.getCell(r, 2);
    b.value = test.name;
    b.font = { bold: true };
    b.alignment = { horizontal: 'left', vertical: 'middle' };
    setBorder(ws, r, 1, last);
    ws.getRow(r).height = 22;
    r += 1;
  }
  blank();

  // ── 2) 질문 종류 ──
  sectionTitle('질문 종류');
  legendHeader('질문 번호', '질문 내용');
  test.questions.forEach((q, i) => legendRow(i + 1, q.text));
  blank();

  // ── 3) 질문 그룹 종류 ──
  if (hasGroups) {
    sectionTitle('질문 그룹 종류');
    legendHeader('그룹 번호', '그룹 명');
    test.groups.forEach((g, i) => legendRow(i + 1, g.label));
    blank();
  }

  // ── 4) 답변 종류 ──
  sectionTitle('답변 종류');
  legendHeader('답변 번호', '답변 내용');
  test.options.forEach((o, i) => legendRow(i + 1, o.label));
  blank();

  // ── 5) 검사 결과 데이터 ──
  sectionTitle('검사 결과 데이터');

  // 헤더 행
  const headers = [
    '답변시각',
    ...range(N).map((i) => `문항${i + 1}`),
    '총점',
    ...range(M).map((i) => `그룹${i + 1}`),
  ];
  headers.forEach((h, c) => {
    const cell = ws.getCell(r, c + 1);
    cell.value = h;
    cell.font = { bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    fill(cell, C.head);
  });
  setBorder(ws, r, 1, dataCols);
  ws.getRow(r).height = 18;
  r += 1;

  // 데이터 행 (채움 없음, 테두리만)
  rows.forEach((row) => {
    const ans = row.answers || [];
    let c = 1;

    const tcell = ws.getCell(r, c++);
    tcell.value = fmtDateTime(row.created_at);
    tcell.alignment = { horizontal: 'left', vertical: 'middle' };

    range(N).forEach((i) => {
      const a = ans[i];
      const cell = ws.getCell(r, c++);
      cell.value = a === null || a === undefined ? '' : a + 1;
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const totCell = ws.getCell(r, c++);
    totCell.value = calcTotalPct(test, ans);
    totCell.font = { bold: true };
    totCell.alignment = { horizontal: 'center', vertical: 'middle' };

    if (hasGroups) {
      calcGroupScores(test, ans).forEach((s) => {
        const cell = ws.getCell(r, c++);
        cell.value = s;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    }

    setBorder(ws, r, 1, dataCols);
    r += 1;
  });

  // 열 너비
  ws.getColumn(1).width = 18; // 답변시각 / 번호
  for (let c = 2; c <= dataCols; c++) ws.getColumn(c).width = 8;
}

/**
 * 결과를 엑셀로 다운로드.
 * @param {Array} rows - 조회된 결과 (현재 필터/시간범위 적용)
 * @param {string} selectedTestId - 선택 검사 id ('' 이면 전체 → 검사별 시트)
 * @returns {Promise<boolean>} 데이터가 있어 파일을 생성했으면 true
 */
export async function exportResultsToExcel(rows, selectedTestId) {
  const ExcelJS = (await import('exceljs')).default;
  const testMap = new Map(tests.map((t) => [t.id, t]));
  const workbook = new ExcelJS.Workbook();

  let testIds;
  if (selectedTestId) {
    testIds = [selectedTestId];
  } else {
    const present = new Set(rows.map((r) => r.test_id));
    testIds = tests.filter((t) => present.has(t.id)).map((t) => t.id);
  }

  let sheetCount = 0;
  testIds.forEach((tid) => {
    const test = testMap.get(tid);
    if (!test) return;
    const testRows = selectedTestId ? rows : rows.filter((r) => r.test_id === tid);
    if (testRows.length === 0) return;
    addTestSheet(workbook, test, testRows);
    sheetCount++;
  });

  if (sheetCount === 0) return false;

  const now = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const datestr = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  const base = selectedTestId ? (testMap.get(selectedTestId)?.name ?? '검사결과') : '검사결과_전체';

  const buf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${base}_${datestr}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return true;
}
