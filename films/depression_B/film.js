/* 《关不掉》开头 · 寓言 · 约 34 秒 · 八句字幕，只讲一件事：同样的警报，一只狗能关掉，一只关不掉；第二天，一只跳了过去，一只趴下了。
 * 分镜表见同目录 storyboard.md。
 * 事实（2026-10-21 联网核对原文）：Seligman & Maier, "Failure to escape traumatic shock", J. Exp. Psychol. 74 (1967)。
 *   三组狗，每组 8 只。第一组在吊带里用鼻子顶面板可以关掉电击；第二组受到完全相同的电击，面板不起作用；第三组不受电击。
 *   24 小时后都放进穿梭箱，跳过矮墙即可躲开。10 次里 9 次以上没逃开的：能关掉 0/8，关不掉 6/8（对照组 1/8）。
 * 示意：真实实验里的"警报"是脚底的电击，这里画成头顶的警报灯，屏上写明；吊带、小屋、控制盒是画的；警报累计秒数是示意，两边一样是设计保证的。
 * 颜色：红 = 警报；金 = 掌控（接通的线、"能关掉"）；灰蓝 = 没有用的（断线、"关不掉"）。 */
(function () {
'use strict';
const { W, H, clamp, lerp, seg, ss, E } = VK;
const K = VKit;

const GOLD = '#EEC672', RED = '#FC593F', BLUE = '#9FB4C8', CREAM = '#FFFAEB';
const T = { s2: 4.2, s3: 8.8, s4: 13.2, s5: 18.4, s6: 23.0, s7: 27.4, s8: 31.4, end: 34.6 };
const SUBS = [
  { a: .4,   b: 3.9,  zh: '1967 年，两只狗，各关进一间小屋' },
  { a: 4.5,  b: 8.5,  zh: '头顶各有一盏灯，亮，就是警报' },
  { a: 9.0,  b: 12.9, zh: '左边的狗，用鼻子顶一下面板，灯就灭了' },
  { a: 13.5, b: 17.7, zh: '右边的面板，没有接线。顶多少下都没用' },
  { a: 18.6, b: 22.3, zh: '警报的时间，两边完全一样' },
  { a: 23.2, b: 26.9, zh: '第二天，新房间里，跳过矮墙就能躲开' },
  { a: 27.6, b: 31.0, zh: '左边的狗跳过去了。右边的狗，趴下了' },
  { a: 31.6, b: 34.4, zh: '同样的警报，只差一件事：{关不关得掉}' },
];

const TOP = 168, FLOOR = 690, LX = 490, RX = 1430;
const IL = [150, 830], IR = [1090, 1770];
const PULSE = .55;
const ALARMS = [{ on: 4.6, press: 10.6 }, { on: 13.3, press: 16.05 }, { on: 18.6, press: 19.85 }].map(a => Object.assign(a, { off: a.press + PULSE }));
const PRESS_L = ALARMS.map(a => a.press), PRESS_R = [9.9, 14.05, 14.55, 15.05, 15.55, 19.05, 19.55];
const alarmK = t => ALARMS.reduce((m, a) => Math.max(m, ss(t, a.on, a.on + .14) * (1 - ss(t, a.off - .05, a.off))), 0);
const alarmSec = t => ALARMS.reduce((s, a) => s + clamp(t - a.on, 0, a.off - a.on), 0);
const bump = (t, list) => list.reduce((m, p) => { const u = (t - p) / .42; return u < 0 || u > 1 ? m : Math.max(m, Math.pow(Math.sin(Math.PI * u), .7)); }, 0);

const MAIN = [[830, 456], [905, 456], [960, 456], [960, 148]];
const BL = [[960, 148], [LX, 148], [LX, 188]], BR = [[960, 148], [RX, 148], [RX, 188]];
const WIRE_LEN = 450 + 505;
function sub(pts, d0, d1) {
  const out = []; let acc = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p = pts[i], q = pts[i + 1], L = Math.hypot(q[0] - p[0], q[1] - p[1]), a = acc, b = acc + L;
    if (b > d0 && a < d1) {
      const u0 = clamp((d0 - a) / L), u1 = clamp((d1 - a) / L);
      if (!out.length) out.push([lerp(p[0], q[0], u0), lerp(p[1], q[1], u0)]);
      out.push([lerp(p[0], q[0], u1), lerp(p[1], q[1], u1)]);
    }
    acc = b;
  }
  return out;
}

/* 一只狗：色块拼的，朝右。原点在前爪着地处。lie 趴下，tense 绷紧，nose 顶面板，ext 腾空伸展 */
function dog(fr, x, y, s, o = {}) {
  const dir = o.dir || 1, lie = o.lie || 0, tense = o.tense || 0, ext = o.ext || 0;
  const nose = o.nose || 0, wag = o.wag || 0, a = o.a == null ? 1 : o.a;
  const BODY = '#C9925A', DARK = '#8A5A32', LIGHT = '#E8C69A', SNOUT = '#DDB07A';
  fr.g({ at: [x, y], s: [dir * s, s], rot: o.rot || 0, a }, () => {
    if (o.harness == null) fr.ellipse(lerp(4, 40, lie), 8, lerp(86, 118, lie), 11, { fill: '#000000', a: .2 });
    const by = lerp(-86, -30, lie);
    if (lie < .82) {
      fr.rect(-62, by + 18, 16, lerp(60, 18, lie) - ext * 22, { r: 8, fill: DARK });
      fr.rect(-38, by + 22, 14, lerp(54, 16, lie) - ext * 10, { r: 7, fill: '#A8703F' });
      fr.rect(22, by + 16, 16, lerp(64, 18, lie) + ext * 36, { r: 8, fill: BODY });
      fr.rect(46, by + 20, 14, lerp(58, 16, lie) + ext * 22, { r: 7, fill: LIGHT });
    } else {
      fr.ellipse(70, -6, 36, 13, { fill: '#B67C45' }); fr.ellipse(-36, -8, 48, 15, { fill: '#B67C45' });
    }
    fr.path(`M -70,${by - 2} Q ${-108 + wag * 18},${by - 36} ${-86 + wag * 26},${lerp(by - 72, by - 8, lie)}`, { color: BODY, w: 14 });
    fr.ellipse(0, by, 78, lerp(40, 26, lie), { fill: BODY });
    fr.ellipse(10, by + 12, 48, 16, { fill: LIGHT, a: .9 });
    if (o.harness != null) {
      fr.rect(-48, by - 6, 96, 14, { r: 6, fill: '#6C7A88' });
      fr.line(-34, by - 6, -34, o.harness, { w: 7, color: '#4E5964' });
      fr.line(34, by - 6, 34, o.harness, { w: 7, color: '#4E5964' });
    }
    const hx = lerp(68, 86, lie) + nose * 20, hy = lerp(by - 36, by - 6, lie);
    fr.ellipse(hx - 16, hy + 14, 20, 14, { fill: BODY });
    fr.circle(hx, hy, 26, { fill: BODY });
    fr.ellipse(hx + 26, hy + 8, 24, 13, { fill: SNOUT });
    fr.circle(hx + 48, hy + 6, 6, { fill: '#2A2020' });
    fr.g({ at: [hx - 6, hy - 14], rot: lerp(.25, -.55, tense) + lie * .5 }, () => fr.ellipse(-4, 18, 13, 24, { fill: DARK }));
    if (lie > .55) fr.line(hx - 2, hy - 2, hx + 12, hy - 2, { w: 3, color: '#2A2020' });
    else { fr.circle(hx + 8, hy - 4, 5 + tense, { fill: '#2A2020' }); fr.circle(hx + 9.5, hy - 5.6, 1.7, { fill: '#FFFFFF' }); }
  });
}

function lab(fr, sky0, sky1, desk) {
  const g = fr.x.createLinearGradient(0, 0, 0, 760); g.addColorStop(0, sky0); g.addColorStop(1, sky1);
  fr.rect(0, 0, W, 760, { fill: g });
  fr.glow(960, 90, 720, '#FFD9A0', .1);
  fr.rect(0, 760, W, 320, { fill: desk }); fr.rect(0, 752, W, 12, { fill: '#7A5846' });
}
function cabinet(fr, x0, x1, inner, floorCol) {
  fr.rect(x0, TOP, x1 - x0, FLOOR - TOP, { fill: inner });
  fr.rect(x0, FLOOR, x1 - x0, 40, { fill: floorCol });
  fr.rect(x0, FLOOR, x1 - x0, 4, { fill: '#FFFFFF', a: .22 });
  const F = '#4A5560';
  fr.rect(x0 - 22, TOP - 22, 22, FLOOR - TOP + 62, { fill: F });
  fr.rect(x1, TOP - 22, 22, FLOOR - TOP + 62, { fill: F });
  fr.rect(x0 - 22, TOP - 22, x1 - x0 + 44, 22, { fill: F });
  fr.rect(x0 - 22, FLOOR + 40, x1 - x0 + 44, 16, { fill: F });
}
function plaque(fr, x, str, col, a) {
  if (a <= 0) return;
  fr.g({ a }, () => {
    fr.rect(x - 92, TOP - 18, 184, 48, { r: 10, fill: '#16121C' });
    fr.rect(x - 92, TOP - 18, 184, 48, { r: 10, color: col, w: 3 });
    fr.text(str, x, TOP + 16, { font: 'sansh', size: 32, color: col, track: 3 });
  });
}
function lamp(fr, cx, k, t) {
  fr.rect(cx - 5, TOP, 10, 22, { fill: '#2B2420' });
  fr.path(`M ${cx - 20},${TOP + 22} L ${cx + 20},${TOP + 22} L ${cx + 28},${TOP + 44} L ${cx - 28},${TOP + 44} Z`, { fill: '#2E2826' });
  const pulse = .72 + .28 * Math.sin(t * 10);
  fr.ellipse(cx, TOP + 68, 28, 26, { fill: k > 0 ? RED : '#5C4548' });
  if (k > 0) {
    fr.ellipse(cx, TOP + 68, 28, 26, { fill: '#FFD2C4', a: .55 * pulse });
    fr.glow(cx, TOP + 68, 210, RED, .85 * k * pulse);
  }
}
function panel(fr, faceX, dirn, b) {
  const wall = dirn > 0 ? 830 : 1090, padW = 32, off = b * 9 * dirn;
  const px = dirn > 0 ? faceX + off : faceX - padW + off;
  const mid = px + padW / 2;
  fr.rect(Math.min(mid, wall), 448, Math.abs(wall - mid), 10, { fill: '#58606B' });
  fr.rect(px, 372, padW, 112, { r: 8, fill: '#E9E2D0' });
  fr.rect(px, 372, padW, 112, { r: 8, color: '#6B6252', w: 3 });
  if (b > .15) fr.glow(mid, 428, 70, GOLD, b * .55);
}

function harnessRoom(fr, t) {
  lab(fr, '#3B3440', '#241F28', '#5A4034');
  cabinet(fr, IL[0], IL[1], '#C8D0D6', '#8C979F');
  cabinet(fr, IR[0], IR[1], '#C8D0D6', '#8C979F');
  const k = alarmK(t), pulse = .8 + .2 * Math.sin(t * 10);
  [IL, IR].forEach(r => fr.rect(r[0], TOP, r[1] - r[0], FLOOR - TOP, { fill: RED, a: .18 * k * pulse }));
  const WIRE = '#8E8A96';
  fr.poly(MAIN, { color: WIRE, w: 8 });
  fr.poly(BL, { color: WIRE, w: 8 });
  fr.poly(BR, { color: WIRE, w: 8 });
  /* 右屋的线在墙边断开 */
  fr.line(1090, 456, 1054, 456, { w: 8, color: WIRE });
  fr.line(1054, 456, 1040, 442, { w: 6, color: BLUE });
  fr.line(1054, 456, 1038, 470, { w: 6, color: BLUE });
  const stubA = ss(t, 13.5, 14.1);
  if (stubA > 0) fr.text('没接', 1028, 510, { font: 'sansh', size: 36, color: BLUE, a: stubA, shadow: .6 });
  ALARMS.forEach(al => {
    const d = seg(t, al.press, al.press + PULSE) * WIRE_LEN, tail = Math.max(0, d - 280);
    const fade = 1 - ss(t, al.press + PULSE, al.press + PULSE + .5);
    if (t < al.press || fade <= 0) return;
    const m = sub(MAIN, tail, Math.min(d, 450));
    const bl = d > 450 ? sub(BL, Math.max(0, tail - 450), d - 450) : [];
    const br = d > 450 ? sub(BR, Math.max(0, tail - 450), d - 450) : [];
    fr.g({ a: fade }, () => {
      [m, bl, br].forEach(p => { if (p.length > 1) fr.poly(p, { color: GOLD, w: 12, add: true, glow: 16 }); });
      [[m, d <= 450], [bl, d > 450], [br, d > 450]].forEach(([p, on]) => {
        if (on && p.length > 1) { const h = p[p.length - 1]; fr.spark(h[0], h[1], 15, GOLD, 1); }
      });
    });
  });
  fr.rect(908, 372, 104, 168, { r: 12, fill: '#39414A' });
  fr.rect(908, 372, 104, 168, { r: 12, color: '#6B7480', w: 3 });
  fr.text('控制盒', 960, 430, { font: 'sans', size: 26, color: '#C9D1D8' });
  fr.circle(960, 492, 10, { fill: k > 0 ? RED : '#4A5058' });
  if (k > 0) fr.glow(960, 492, 36, RED, .55);
  lamp(fr, LX, k, t); lamp(fr, RX, k, t);
  const bl_ = bump(t, PRESS_L), br_ = bump(t, PRESS_R);
  panel(fr, 714, 1, bl_); panel(fr, 1206, -1, br_);
  const tense = k, sway = Math.sin(t * 1.6) * 2, shake = tense * Math.sin(t * 32) * 2.2;
  const ceilL = (TOP - 648) / 1.05, ceilR = (TOP - 648) / 1.05;
  dog(fr, 430 + shake, 648 + sway, 1.05, { harness: ceilL, nose: bl_, tense, dir: 1 });
  dog(fr, 1490 - shake, 648 - sway, 1.05, { harness: ceilR, nose: br_, tense, dir: -1 });
  plaque(fr, LX, '能关掉', GOLD, ss(t, 9.1, 9.7) * (1 - ss(t, 22.5, 22.95)));
  plaque(fr, RX, '关不掉', BLUE, ss(t, 13.7, 14.3) * (1 - ss(t, 22.5, 22.95)));
  const c = ss(t, 18.05, 18.6) * (1 - ss(t, 22.5, 22.95));
  if (c > 0) {
    const v = alarmSec(t).toFixed(1);
    [LX, RX].forEach(x => {
      fr.rect(x - 150, 708, 300, 46, { r: 8, fill: '#16121C', a: .82 * c });
      fr.text(`警报累计 ${v} 秒`, x, 742, { font: 'sansh', size: 32, color: CREAM, a: c });
    });
    fr.text('＝', 960, 742, { font: 'sansh', size: 56, color: GOLD, a: c * ss(t, 20.3, 20.85), glow: 10, glowColor: GOLD });
    fr.text('累计秒数为示意', 960, 788, { font: 'sans', size: 22, color: '#B9AFA0', a: c * .85 });
  }
}

const JUMP = [24.35, 25.25];
function shuttleRoom(fr, t) {
  lab(fr, '#31403F', '#1C2625', '#3E3A34');
  cabinet(fr, IL[0], IL[1], '#DDD6C4', '#7B7566');
  cabinet(fr, IR[0], IR[1], '#DDD6C4', '#7B7566');
  const on = ss(t, 23.35, 23.9), pulse = .85 + .15 * Math.sin(t * 9);
  const rl = on * (1 - ss(t, 25.05, 25.7)), rr = on;
  const redHalf = (x0, x1, kk) => {
    if (kk <= 0) return;
    const g = fr.x.createLinearGradient(0, 500, 0, FLOOR);
    g.addColorStop(0, 'rgba(252,89,63,0)'); g.addColorStop(1, `rgba(252,89,63,${.52 * kk * pulse})`);
    fr.rect(x0, 500, x1 - x0, FLOOR - 500, { fill: g });
    fr.rect(x0, FLOOR, x1 - x0, 40, { fill: RED, a: .92 * kk * pulse });
  };
  redHalf(IL[0], 490, rl); redHalf(1430, IR[1], rr);
  fr.rect(472, 586, 28, 104, { fill: '#6F7B84' }); fr.rect(472, 586, 28, 8, { fill: '#B8C2C8' });
  fr.rect(1420, 586, 28, 104, { fill: '#6F7B84' }); fr.rect(1420, 586, 28, 8, { fill: '#B8C2C8' });
  const u = seg(t, JUMP[0], JUMP[1]), landed = t >= JUMP[1];
  const lx = lerp(310, 640, E.io3(u)), ly = FLOOR - 230 * 4 * u * (1 - u);
  const tenseL = ss(t, 23.5, 23.95) * (1 - ss(t, JUMP[1], JUMP[1] + .7));
  dog(fr, lx + tenseL * Math.sin(t * 32) * (u > 0 && u < 1 ? 0 : 1.4), ly, 1.12, {
    tense: Math.max(tenseL, u > 0 && u < 1 ? 1 : 0),
    ext: Math.sin(Math.PI * u),
    rot: (u > 0 && u < 1 ? lerp(-.28, .24, u) : 0),
    wag: landed ? Math.sin((t - JUMP[1]) * 8) : 0, dir: 1
  });
  const lie = E.io3(seg(t, 27.85, 29.55)), tenseR = ss(t, 23.5, 23.95) * (1 - lie);
  dog(fr, 1605 - tenseR * Math.sin(t * 32) * 1.4, FLOOR, 1.12, { tense: tenseR, lie, dir: -1 });
  plaque(fr, LX, '能关掉', GOLD, ss(t, 23.15, 23.7));
  plaque(fr, RX, '关不掉', BLUE, ss(t, 23.15, 23.7));
  const n = ss(t, 29.85, 30.4);
  if (n > 0) {
    fr.text('8 只里，0 只放弃', LX, 748, { font: 'sansh', size: 36, color: GOLD, a: n, shadow: .7 });
    fr.text('8 只里，6 只放弃', RX, 748, { font: 'sansh', size: 36, color: BLUE, a: n, shadow: .7 });
    fr.text('放弃 = 10 次测试里，9 次以上没有逃开', 960, 792, { font: 'sans', size: 22, color: '#C9C0B0', a: n * .85 });
  }
}

const cam = (fr, fx, fy, sx, sy, z, fn) => fr.g({ at: [sx, sy], s: z }, () => fr.g({ at: [-fx, -fy] }, fn));
const SHOTS = [
  [0,     T.s2, (fr, t) => cam(fr, 960, 430, 960, 440, lerp(1.00, 1.06, seg(t, 0, T.s2)), () => harnessRoom(fr, t))],
  [T.s2,  T.s3, (fr, t) => cam(fr, 960, 360, 960, 400, lerp(1.10, 1.16, seg(t, T.s2, T.s3)), () => harnessRoom(fr, t))],
  [T.s3,  T.s4, (fr, t) => cam(fr, 460, 420, 960, 450, lerp(1.18, 1.24, seg(t, T.s3, T.s4)), () => harnessRoom(fr, t))],
  [T.s4,  T.s5, (fr, t) => cam(fr, 960, 420, 960, 440, lerp(1.16, 1.22, seg(t, T.s4, T.s5)), () => harnessRoom(fr, t))],
  [T.s5,  T.s6, (fr, t) => cam(fr, 960, 430, 960, 430, lerp(1.00, 1.03, seg(t, T.s5, T.s6)), () => harnessRoom(fr, t))],
  [T.s6,  T.s7, (fr, t) => cam(fr, 960, 460, 960, 470, lerp(1.06, 1.12, seg(t, T.s6, T.s7)), () => shuttleRoom(fr, t))],
  [T.s7,  T.s8, (fr, t) => cam(fr, 960, 500, 960, 480, lerp(1.14, 1.20, seg(t, T.s7, T.s8)), () => shuttleRoom(fr, t))],
  [T.s8,  T.end,(fr, t) => cam(fr, 960, 430, 960, 430, lerp(1.00, 1.02, seg(t, T.s8, T.end)), () => shuttleRoom(fr, t))],
];

function overlay(fr, t) {
  const a1 = ss(t, .55, 1.05) * (1 - ss(t, 3.55, 4.05));
  fr.text('1967', 110, 88, { font: 'sansh', size: 40, color: GOLD, align: 'l', a: a1, shadow: .6 });
  fr.text('塞利格曼 · 梅尔', 240, 90, { font: 'sans', size: 28, color: '#B9AFA0', align: 'l', a: a1 * ss(t, .75, 1.2), shadow: .6 });
  const a2 = ss(t, 4.9, 5.5) * (1 - ss(t, 8.2, 8.65));
  fr.text('示意：真实实验里，警报是脚底的电击', 110, 88, { font: 'sans', size: 28, color: '#E4D9C4', align: 'l', a: a2, shadow: .7 });
  const a3 = ss(t, 23.25, 23.75) * (1 - ss(t, 26.5, 26.95));
  fr.text('第二天', 110, 88, { font: 'sansh', size: 40, color: GOLD, align: 'l', a: a3, shadow: .6 });
  fr.text('新房间', 250, 90, { font: 'sans', size: 28, color: '#B9AFA0', align: 'l', a: a3, shadow: .6 });
  const a8 = ss(t, 31.75, 32.3);
  fr.text('Seligman & Maier, 1967', 110, 88, { font: 'latini', size: 28, color: '#C9C0B0', align: 'l', a: a8, shadow: .6 });
}

VK.film({
  dur: T.end, theme: 'flat', meta: { title: '关不掉', root: 0 },
  draw(fr, t) {
    fr.look.bgo = { color: '#17121E' };
    const sh = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
    const cut = Math.min(ss(t, sh[0], sh[0] + (sh[0] ? .22 : .5)), 1 - ss(t, sh[1] - (sh[1] >= T.end ? .6 : .22), sh[1]));
    fr.g({ a: cut }, () => {
      sh[2](fr, t);
      const x = fr.x, g = x.createRadialGradient(W / 2, 520, H * .55, W / 2, 520, W * .72);
      g.addColorStop(0, 'rgba(20,10,10,0)'); g.addColorStop(1, 'rgba(20,10,10,.5)');
      fr.rect(0, 0, W, H, { fill: g });
      const b = x.createLinearGradient(0, 820, 0, H);
      b.addColorStop(0, 'rgba(18,12,20,0)'); b.addColorStop(.5, 'rgba(18,12,20,.78)'); b.addColorStop(1, 'rgba(18,12,20,.92)');
      fr.rect(0, 820, W, 260, { fill: b });
      overlay(fr, t);
    });
    fr.sfx(.3, 'chord', { root: 0, gain: .6 });
    ALARMS.forEach(al => { fr.sfx(al.on, 'rise', { dur: .6, gain: .4 }); fr.sfx(al.press, 'tock', { pitch: 1 }); fr.sfx(al.off, 'thud', { gain: .4 }); });
    PRESS_R.forEach(p => fr.sfx(p, 'tock', { pitch: -3, gain: .25 }));
    fr.sfx(23.5, 'rise', { dur: .6, gain: .4 }); fr.sfx(JUMP[1], 'thud', { gain: .5 }); fr.sfx(29.4, 'thud', { gain: .7 });
    fr.sfx(31.6, 'chord', { root: -5, gain: .7 });
    K.subs(fr, t, SUBS, 'flat');
  },
});
})();
