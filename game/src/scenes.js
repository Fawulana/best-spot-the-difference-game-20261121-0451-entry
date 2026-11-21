// Five hand-painted scenes, each drawn twice — plain on the left, with
// its ten differences on the right — by the same painter, so the pictures
// agree on everything except the differences. The hunt gets harder as it
// goes: the harbour at dawn is gentle, the kite festival hides small
// changes in a busy sky. Nothing here copies any existing game: the
// harbour, the market, the garden, the village and the festival are all
// original scenes painted by this file's own code.

function fillCircle(ctx, x, y, radius, fill) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function fillEllipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function fillBox(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function fillStar(ctx, x, y, radius, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const angle = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? radius : radius * 0.45;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function scatterDots(ctx, random, count, w, maxY, colour) {
  for (let i = 0; i < count; i += 1) {
    const x = 10 + random() * (w - 20);
    const y = 8 + random() * (maxY - 16);
    const r = 1 + random() * 1.8;
    fillCircle(ctx, x, y, r, colour);
  }
}

/* ------------------------------------------------------------------ */
/* Scene 1: Dawn Harbour — a lighthouse, two boats and a fisherman     */
/* on the pier as the sun comes up over the water. Easy.               */
/* ------------------------------------------------------------------ */

function paintDawnHarbour(ctx, W, H, diffs, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#1d2a52');
  sky.addColorStop(0.55, '#c96a5e');
  sky.addColorStop(1, '#f7c873');
  fillBox(ctx, 0, 0, W, 300, sky);
  scatterDots(ctx, random, 30, W, 110, 'rgba(255, 244, 200, 0.7)');

  // The rising sun, with rays in the left picture and bare in the right.
  fillCircle(ctx, 90, 70, 26, '#ffe9a8');
  if (!diffs.has('sun-rays')) {
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(90 + Math.cos(a) * 34, 70 + Math.sin(a) * 34);
      ctx.lineTo(90 + Math.cos(a) * 46, 70 + Math.sin(a) * 46);
      ctx.stroke();
    }
  }

  // Gulls: three in the left picture, two in the right one.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const gulls = [
    [340, 52],
    [390, 78],
    [430, 60],
  ];
  for (let i = 0; i < gulls.length; i += 1) {
    if (diffs.has('gull') && i === 2) continue;
    const [gx, gy] = gulls[i];
    ctx.beginPath();
    ctx.moveTo(gx - 10, gy);
    ctx.quadraticCurveTo(gx - 4, gy - 7, gx, gy);
    ctx.quadraticCurveTo(gx + 4, gy - 7, gx + 10, gy);
    ctx.stroke();
  }

  // Lighthouse on the point, striped red and white, with a beam that
  // shines in the left picture and is dark in the right one.
  fillBox(ctx, 48, 120, 64, 180, '#f7ead0');
  fillBox(ctx, 48, 150, 64, 26, '#c94f43');
  fillBox(ctx, 48, 210, 64, 26, '#c94f43');
  fillBox(ctx, 48, 270, 64, 26, '#c94f43');
  fillBox(ctx, 40, 104, 80, 16, '#3a2f52');
  fillBox(ctx, 68, 112, 24, 10, '#ffd97a');
  if (!diffs.has('lighthouse-beam')) {
    ctx.fillStyle = 'rgba(255, 233, 168, 0.35)';
    ctx.beginPath();
    ctx.moveTo(112, 112);
    ctx.lineTo(260, 84);
    ctx.lineTo(260, 140);
    ctx.lineTo(112, 124);
    ctx.closePath();
    ctx.fill();
  }

  // The harbour office: a little building with a lit window in the left
  // picture and a dark one in the right.
  fillBox(ctx, 380, 200, 180, 100, '#e8d5a3');
  fillBox(ctx, 372, 192, 196, 12, '#8a5a33');
  fillBox(ctx, 420, 224, 52, 52, '#5a4632');
  fillBox(ctx, 426, 230, 40, 40, diffs.has('office-window') ? '#3a2f52' : '#ffd97a');
  if (!diffs.has('office-window')) {
    fillCircle(ctx, 446, 250, 9, '#e2604d');
    fillBox(ctx, 444, 256, 4, 12, '#4a7a3a');
  }
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(446, 230);
  ctx.lineTo(446, 270);
  ctx.moveTo(426, 250);
  ctx.lineTo(466, 250);
  ctx.stroke();
  fillBox(ctx, 500, 230, 36, 70, '#7a4a2b');
  fillCircle(ctx, 530, 266, 3, '#f5b942');

  // The sea.
  const sea = ctx.createLinearGradient(0, 300, 0, H);
  sea.addColorStop(0, '#2f8fb0');
  sea.addColorStop(1, '#0a3a5c');
  fillBox(ctx, 0, 300, W, 140, sea);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const wy = 312 + i * 24;
    ctx.beginPath();
    ctx.moveTo(20 + i * 30, wy);
    ctx.quadraticCurveTo(80 + i * 40, wy - 5, 150 + i * 30, wy);
    ctx.stroke();
  }

  // A red buoy — teal in the right picture — bobbing on the water.
  fillEllipse(ctx, 500, 335, 16, 10, diffs.has('buoy-colour') ? '#2e8b8b' : '#e2604d');
  fillBox(ctx, 494, 318, 12, 10, '#3a2f52');
  fillCircle(ctx, 500, 314, 4, '#f5b942');

  // Boat one, with a flag on its mast in the left picture only.
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(190, 330);
  ctx.lineTo(300, 330);
  ctx.lineTo(280, 356);
  ctx.lineTo(210, 356);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(245, 330);
  ctx.lineTo(245, 250);
  ctx.stroke();
  if (!diffs.has('boat-flag')) {
    ctx.fillStyle = '#e2604d';
    ctx.beginPath();
    ctx.moveTo(245, 250);
    ctx.lineTo(273, 257);
    ctx.lineTo(245, 265);
    ctx.closePath();
    ctx.fill();
  }
  // Boat two, smaller, further out.
  ctx.fillStyle = '#5a7a8a';
  ctx.beginPath();
  ctx.moveTo(400, 350);
  ctx.lineTo(470, 350);
  ctx.lineTo(458, 370);
  ctx.lineTo(412, 370);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(435, 350);
  ctx.lineTo(435, 300);
  ctx.stroke();
  ctx.fillStyle = '#f7ead0';
  ctx.beginPath();
  ctx.moveTo(435, 300);
  ctx.lineTo(435, 348);
  ctx.lineTo(465, 348);
  ctx.closePath();
  ctx.fill();

  // The pier along the bottom, with the fisherman, his net, the crates,
  // the anchor and a coil of rope.
  fillBox(ctx, 0, 372, W, 68, '#6b5a7a');
  fillBox(ctx, 0, 372, W, 8, '#8a7a9a');

  // The fisherman: his hat is straw-yellow in the left picture, teal in
  // the right one.
  fillEllipse(ctx, 205, 356, 14, 20, '#3a5a8a');
  fillCircle(ctx, 205, 330, 11, '#e8c39a');
  fillEllipse(ctx, 205, 322, 16, 5, diffs.has('fisherman-hat') ? '#2e8b8b' : '#f5b942');
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(218, 348);
  ctx.lineTo(240, 320);
  ctx.stroke();

  // The net, drying on the pier: one float is missing in the right one.
  ctx.strokeStyle = '#e8dcc8';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(330 + i * 12, 384);
    ctx.lineTo(330 + i * 12, 404);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(330, 384);
  ctx.lineTo(378, 384);
  ctx.moveTo(330, 404);
  ctx.lineTo(378, 404);
  ctx.stroke();
  if (!diffs.has('net-float')) fillCircle(ctx, 354, 380, 5, '#f5b942');

  // A stack of crates: three high in the left picture, two in the right.
  fillBox(ctx, 508, 396, 28, 24, '#8a5a33');
  fillBox(ctx, 512, 372, 28, 24, '#8a5a33');
  if (!diffs.has('crate')) fillBox(ctx, 516, 348, 28, 24, '#8a5a33');
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 2;
  ctx.strokeRect(508, 396, 28, 24);
  ctx.strokeRect(512, 372, 28, 24);
  if (!diffs.has('crate')) ctx.strokeRect(516, 348, 28, 24);

  // An anchor leaning on the pier wall, gone in the right picture.
  if (!diffs.has('anchor')) {
    ctx.strokeStyle = '#3a2f52';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(60, 318);
    ctx.lineTo(60, 348);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(60, 348, 12, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(48, 322);
    ctx.lineTo(72, 322);
    ctx.stroke();
  }

  // A coil of rope by the fisherman's feet.
  ctx.strokeStyle = '#e8dcc8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 408, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(300, 408, 6, 0, Math.PI * 2);
  ctx.stroke();
}

/* ------------------------------------------------------------------ */
/* Scene 2: Night Market — dumpling and tea stalls under strings of   */
/* bulbs, with a cat asleep on a crate. Easy-medium.                   */
/* ------------------------------------------------------------------ */

function paintNightMarket(ctx, W, H, diffs, random) {
  const night = ctx.createLinearGradient(0, 0, 0, 260);
  night.addColorStop(0, '#1a1426');
  night.addColorStop(1, '#4a2a52');
  fillBox(ctx, 0, 0, W, 260, night);
  scatterDots(ctx, random, 36, W, 100, 'rgba(255, 244, 200, 0.6)');

  // Strings of bulbs across the market; one bulb is out in the right
  // picture.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 46);
  ctx.quadraticCurveTo(300, 84, 600, 40);
  ctx.stroke();
  const bulbXs = [50, 130, 210, 300, 390, 470, 550];
  for (let i = 0; i < bulbXs.length; i += 1) {
    const bx = bulbXs[i];
    const by = 58 + Math.sin((bx / 600) * Math.PI) * 14;
    ctx.beginPath();
    ctx.moveTo(bx, by - 10);
    ctx.lineTo(bx, by);
    ctx.stroke();
    const out = diffs.has('bulb-out') && i === 4;
    fillCircle(ctx, bx, by + 6, 8, out ? '#4a4066' : '#ffd97a');
    if (!out) {
      ctx.fillStyle = 'rgba(255, 217, 122, 0.25)';
      ctx.beginPath();
      ctx.arc(bx, by + 6, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // A paper lantern hangs in the middle of the string; it is missing
  // from the right picture.
  if (!diffs.has('lantern-missing')) {
    ctx.strokeStyle = '#241d33';
    ctx.beginPath();
    ctx.moveTo(300, 66);
    ctx.lineTo(300, 78);
    ctx.stroke();
    fillEllipse(ctx, 300, 96, 14, 18, '#e2604d');
    fillEllipse(ctx, 300, 96, 7, 18, 'rgba(255,255,255,0.25)');
    fillBox(ctx, 296, 76, 8, 5, '#f5b942');
  }

  // The dumpling stall on the left: cream wall, striped awning, a sign
  // that gains a word in the right picture.
  fillBox(ctx, 30, 150, 230, 170, '#f2dfba');
  fillBox(ctx, 30, 150, 230, 8, '#8a5a33');
  for (let i = 0; i < 6; i += 1) {
    const stripe = i % 2 === 0 ? '#c94f43' : '#f7ead0';
    fillBox(ctx, 30 + i * 40, 158, 40, 26, diffs.has('awning-stripe') && i === 1 ? '#2e8b8b' : stripe);
  }
  fillBox(ctx, 30, 184, 230, 6, '#8a5a33');
  // The sign above the stall.
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(145, 150);
  ctx.lineTo(145, 128);
  ctx.stroke();
  fillBox(ctx, 88, 102, 116, 28, '#f7ead0');
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  ctx.strokeRect(88, 102, 116, 28);
  ctx.fillStyle = '#5a2e1a';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(diffs.has('sign-word') ? 'DUMPLINGS & TEA' : 'DUMPLINGS', 146, 117);

  // A plate of dumplings on the counter: three in the left picture,
  // two in the right one.
  fillEllipse(ctx, 120, 300, 42, 10, '#fff7e6');
  fillEllipse(ctx, 102, 292, 10, 8, '#f7ead0');
  fillEllipse(ctx, 122, 290, 10, 8, '#f7ead0');
  if (!diffs.has('dumpling-count')) fillEllipse(ctx, 140, 292, 10, 8, '#f7ead0');
  fillBox(ctx, 180, 284, 40, 36, '#c94f43');
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  ctx.strokeRect(180, 284, 40, 36);

  // The tea stall on the right: teapot with steam, jars, a fan.
  fillBox(ctx, 360, 150, 210, 170, '#d9e8d0');
  fillBox(ctx, 360, 150, 210, 8, '#5a7a4a');
  for (let i = 0; i < 5; i += 1) {
    const stripe = i % 2 === 0 ? '#2e8b8b' : '#f7ead0';
    fillBox(ctx, 360 + i * 42, 158, 42, 26, stripe);
  }
  fillBox(ctx, 360, 184, 210, 6, '#5a7a4a');
  // The teapot: steam curls from it in the left picture only.
  fillEllipse(ctx, 420, 250, 26, 18, '#3a2f52');
  fillCircle(ctx, 420, 228, 6, '#3a2f52');
  ctx.strokeStyle = '#3a2f52';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(444, 244);
  ctx.quadraticCurveTo(462, 236, 456, 224);
  ctx.stroke();
  if (!diffs.has('teapot-steam')) {
    ctx.strokeStyle = 'rgba(230, 220, 240, 0.8)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(420, 220);
    ctx.bezierCurveTo(410, 206, 430, 198, 420, 184);
    ctx.stroke();
  }
  // Jars on the shelf: the middle jar is red in the left picture,
  // green in the right one.
  const jarCols = ['#c94f43', '#c94f43', '#2e8b8b'];
  for (let i = 0; i < 3; i += 1) {
    const jx = 470 + i * 30;
    fillBox(ctx, jx, 240, 22, 34, diffs.has('jar-colour') && i === 1 ? '#2e8b8b' : jarCols[i]);
    fillBox(ctx, jx + 3, 234, 16, 8, '#8a5a33');
  }
  // A paper fan pinned to the stall, open in the left picture and
  // folded shut in the right one.
  if (diffs.has('fan')) {
    ctx.strokeStyle = '#c94f43';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(520, 210);
    ctx.lineTo(520, 180);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#e2604d';
    ctx.beginPath();
    ctx.moveTo(520, 212);
    ctx.lineTo(498, 176);
    ctx.lineTo(520, 168);
    ctx.lineTo(542, 176);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(520, 212);
    ctx.lineTo(520, 168);
    ctx.moveTo(520, 212);
    ctx.lineTo(506, 174);
    ctx.moveTo(520, 212);
    ctx.lineTo(534, 174);
    ctx.stroke();
  }

  // The cobbled ground.
  fillBox(ctx, 0, 320, W, 120, '#5a4a6a');
  ctx.fillStyle = '#4a3a5a';
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const x = col * 52 + (row % 2) * 26;
      const y = 326 + row * 28;
      ctx.beginPath();
      ctx.ellipse(x + 22, y + 10, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // A coin on the ground by the dumpling stall, gone in the right one.
  if (!diffs.has('coin')) {
    fillCircle(ctx, 250, 332, 7, '#f5b942');
    ctx.strokeStyle = '#c77f1a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 332, 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  // The market cat asleep on a crate: tail up in the left picture,
  // curled down in the right one.
  fillBox(ctx, 450, 340, 90, 44, '#8a5a33');
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 2;
  ctx.strokeRect(450, 340, 90, 44);
  fillEllipse(ctx, 490, 332, 26, 14, '#3a3348');
  fillCircle(ctx, 512, 316, 12, '#3a3348');
  ctx.fillStyle = '#3a3348';
  ctx.beginPath();
  ctx.moveTo(503, 306);
  ctx.lineTo(506, 294);
  ctx.lineTo(512, 305);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(516, 306);
  ctx.lineTo(521, 294);
  ctx.lineTo(523, 306);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a3348';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (diffs.has('cat-tail')) {
    ctx.moveTo(466, 332);
    ctx.quadraticCurveTo(454, 340, 462, 348);
  } else {
    ctx.moveTo(466, 330);
    ctx.quadraticCurveTo(450, 320, 456, 306);
  }
  ctx.stroke();
  fillCircle(ctx, 516, 314, 2, '#f5b942');
}

/* ------------------------------------------------------------------ */
/* Scene 3: Bamboo Tea Garden — a koi pond, a stone lantern and a     */
/* teahouse under bamboo and maple. Medium.                            */
/* ------------------------------------------------------------------ */

function paintTeaGarden(ctx, W, H, diffs, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, 240);
  sky.addColorStop(0, '#bfe3c8');
  sky.addColorStop(1, '#e8f2d8');
  fillBox(ctx, 0, 0, W, 240, sky);
  fillCircle(ctx, 520, 60, 24, '#fff2b8');
  ctx.strokeStyle = '#fff2b8';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i += 1) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(520 + Math.cos(a) * 30, 60 + Math.sin(a) * 30);
    ctx.lineTo(520 + Math.cos(a) * 38, 60 + Math.sin(a) * 38);
    ctx.stroke();
  }

  // Bamboo on the right: tall stalks with leaves, and a young shoot
  // at the base that is missing from the right picture.
  ctx.strokeStyle = '#3a7a3a';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  const stalks = [
    [540, 240, 30],
    [566, 240, 60],
    [520, 240, 90],
  ];
  for (const [sx, , lean] of stalks) {
    ctx.beginPath();
    ctx.moveTo(sx, 320);
    ctx.quadraticCurveTo(sx + lean * 0.3, 200, sx + lean * 0.5, 60);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a9a4a';
  for (let i = 0; i < 10; i += 1) {
    const lx = 520 + random() * 60;
    const ly = 70 + random() * 160;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 14, 4, 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!diffs.has('bamboo-shoot')) {
    ctx.strokeStyle = '#5aaa5a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(500, 320);
    ctx.lineTo(500, 292);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(500, 292);
    ctx.lineTo(488, 300);
    ctx.moveTo(500, 292);
    ctx.lineTo(512, 300);
    ctx.stroke();
  }

  // The maple on the left: its crown holds one extra red leaf cluster
  // in the left picture.
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(70, 320);
  ctx.lineTo(70, 180);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(70, 240);
  ctx.lineTo(40, 200);
  ctx.moveTo(70, 220);
  ctx.lineTo(100, 190);
  ctx.stroke();
  fillCircle(ctx, 70, 160, 34, '#c94f43');
  fillCircle(ctx, 40, 180, 22, '#d96a4a');
  fillCircle(ctx, 100, 178, 22, '#e2604d');
  if (!diffs.has('maple-leaf')) fillCircle(ctx, 96, 140, 14, '#c94f43');

  // The teahouse on the left, with a window lit gold in the left
  // picture and dark in the right one.
  fillBox(ctx, 130, 170, 150, 130, '#f2dfba');
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(120, 172);
  ctx.lineTo(205, 118);
  ctx.lineTo(290, 172);
  ctx.closePath();
  ctx.fill();
  fillBox(ctx, 160, 200, 52, 52, '#5a4632');
  fillBox(ctx, 166, 206, 40, 40, diffs.has('teahouse-window') ? '#3a2f52' : '#ffd97a');
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(186, 206);
  ctx.lineTo(186, 246);
  ctx.moveTo(166, 226);
  ctx.lineTo(206, 226);
  ctx.stroke();
  fillBox(ctx, 226, 216, 32, 84, '#7a4a2b');
  fillCircle(ctx, 252, 260, 3, '#f5b942');
  // A cup of tea steaming on the veranda: the steam is gone in the
  // right picture.
  fillEllipse(ctx, 200, 296, 14, 6, '#fff7e6');
  fillBox(ctx, 190, 288, 20, 8, '#c94f43');
  if (!diffs.has('teacup-steam')) {
    ctx.strokeStyle = 'rgba(120, 110, 130, 0.7)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(200, 284);
    ctx.bezierCurveTo(194, 274, 206, 268, 200, 258);
    ctx.stroke();
  }

  // The lawn.
  fillBox(ctx, 0, 300, W, 140, '#6aaa5a');
  ctx.fillStyle = '#5a9a4a';
  for (let i = 0; i < 18; i += 1) {
    fillEllipse(ctx, random() * W, 306 + random() * 30, 8 + random() * 12, 3 + random() * 3, '#5a9a4a');
  }

  // The koi pond at the bottom, with a bridge over it.
  const pond = ctx.createLinearGradient(0, 330, 0, H);
  pond.addColorStop(0, '#4a9ab0');
  pond.addColorStop(1, '#14607f');
  fillEllipse(ctx, 300, 392, 260, 48, pond);
  // The big koi: orange in the left picture, white in the right one.
  ctx.fillStyle = diffs.has('koi-colour') ? '#f7ead0' : '#f08a24';
  ctx.beginPath();
  ctx.ellipse(300, 386, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(276, 386);
  ctx.lineTo(262, 376);
  ctx.lineTo(262, 396);
  ctx.closePath();
  ctx.fill();
  fillCircle(ctx, 318, 382, 3, '#10222e');
  // A second, smaller koi.
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.ellipse(420, 402, 16, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(406, 402);
  ctx.lineTo(396, 396);
  ctx.lineTo(396, 408);
  ctx.closePath();
  ctx.fill();
  // The frog on its lily pad, gone in the right picture.
  fillEllipse(ctx, 150, 388, 22, 8, '#3a7a3a');
  if (!diffs.has('frog')) {
    fillEllipse(ctx, 150, 380, 12, 9, '#4a9a4a');
    fillCircle(ctx, 145, 372, 4, '#4a9a4a');
    fillCircle(ctx, 155, 372, 4, '#4a9a4a');
    fillCircle(ctx, 145, 371, 2, '#10222e');
    fillCircle(ctx, 155, 371, 2, '#10222e');
  }
  // The dragonfly over the pond: wings down in the left picture,
  // wings up in the right one.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(420, 118);
  ctx.lineTo(420, 132);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  if (diffs.has('dragonfly')) {
    fillEllipse(ctx, 410, 112, 12, 4, 'rgba(255, 255, 255, 0.75)');
    fillEllipse(ctx, 430, 112, 12, 4, 'rgba(255, 255, 255, 0.75)');
  } else {
    fillEllipse(ctx, 410, 126, 12, 4, 'rgba(255, 255, 255, 0.75)');
    fillEllipse(ctx, 430, 126, 12, 4, 'rgba(255, 255, 255, 0.75)');
  }
  fillCircle(ctx, 420, 124, 3, '#2e8b8b');

  // Stepping stones across the lawn: three in the left picture, two
  // in the right one.
  fillEllipse(ctx, 230, 322, 20, 8, '#c9b8a8');
  fillEllipse(ctx, 280, 332, 20, 8, '#c9b8a8');
  if (!diffs.has('stepping-stone')) fillEllipse(ctx, 330, 322, 20, 8, '#c9b8a8');

  // The little arched bridge: one plank is teal in the right picture.
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(330, 380);
  ctx.quadraticCurveTo(380, 344, 430, 380);
  ctx.stroke();
  ctx.strokeStyle = diffs.has('bridge-plank') ? '#2e8b8b' : '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(380, 356);
  ctx.lineTo(380, 372);
  ctx.stroke();

  // The stone lantern by the pond: its flame burns in the left
  // picture and is out in the right one.
  fillBox(ctx, 508, 300, 34, 10, '#8a8a8a');
  fillBox(ctx, 520, 272, 10, 28, '#8a8a8a');
  fillBox(ctx, 502, 252, 46, 20, '#9a9a9a');
  fillBox(ctx, 512, 240, 26, 12, '#8a8a8a');
  if (!diffs.has('lantern-flame')) {
    fillCircle(ctx, 525, 262, 7, '#ffd97a');
    ctx.fillStyle = 'rgba(255, 217, 122, 0.2)';
    ctx.beginPath();
    ctx.arc(525, 262, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Scene 4: Snow Village — a snowman, a sled and a skating pond       */
/* under falling snow. Hard.                                           */
/* ------------------------------------------------------------------ */

function paintSnowVillage(ctx, W, H, diffs, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#2c4a7a');
  sky.addColorStop(1, '#8ab0d0');
  fillBox(ctx, 0, 0, W, 300, sky);
  scatterDots(ctx, random, 60, W, 280, 'rgba(255, 255, 255, 0.85)');
  fillCircle(ctx, 480, 60, 24, '#f7f2e8');

  // Mountains.
  ctx.fillStyle = '#5a7a9a';
  ctx.beginPath();
  ctx.moveTo(0, 280);
  ctx.lineTo(140, 170);
  ctx.lineTo(280, 280);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(300, 280);
  ctx.lineTo(450, 160);
  ctx.lineTo(600, 280);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7f2e8';
  ctx.beginPath();
  ctx.moveTo(126, 184);
  ctx.lineTo(140, 170);
  ctx.lineTo(154, 184);
  ctx.lineTo(140, 190);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(436, 174);
  ctx.lineTo(450, 160);
  ctx.lineTo(464, 174);
  ctx.lineTo(450, 180);
  ctx.closePath();
  ctx.fill();

  // Pine trees with snow; the left tree carries a gold star in the
  // left picture and none in the right one.
  function pine(x, baseY, height) {
    ctx.fillStyle = '#1d4a2e';
    for (let i = 0; i < 3; i += 1) {
      const w = 46 - i * 11;
      const y = baseY - height + i * (height / 3.4);
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y + height / 3);
      ctx.lineTo(x, y);
      ctx.lineTo(x + w / 2, y + height / 3);
      ctx.closePath();
      ctx.fill();
    }
    fillBox(ctx, x - 4, baseY - 8, 8, 10, '#5a3a22');
    ctx.fillStyle = '#f7f2e8';
    ctx.beginPath();
    ctx.moveTo(x - 14, baseY - height + 8);
    ctx.lineTo(x, baseY - height - 4);
    ctx.lineTo(x + 14, baseY - height + 8);
    ctx.closePath();
    ctx.fill();
  }
  pine(90, 330, 130);
  pine(560, 330, 140);
  if (!diffs.has('pine-star')) fillStar(ctx, 90, 186, 10, '#f5b942');

  // The cottage on the right: a window lit warm in the left picture,
  // dark in the right one, and a chimney whose smoke is gone in the
  // right one.
  fillBox(ctx, 340, 200, 170, 120, '#c9a88a');
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(330, 204);
  ctx.lineTo(425, 140);
  ctx.lineTo(520, 204);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7f2e8';
  ctx.beginPath();
  ctx.moveTo(330, 204);
  ctx.lineTo(425, 140);
  ctx.lineTo(520, 204);
  ctx.lineTo(520, 196);
  ctx.lineTo(425, 132);
  ctx.lineTo(330, 196);
  ctx.closePath();
  ctx.fill();
  fillBox(ctx, 470, 150, 26, 44, '#6b4a3a');
  if (!diffs.has('chimney-smoke')) {
    ctx.strokeStyle = 'rgba(240, 240, 245, 0.8)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(483, 146);
    ctx.bezierCurveTo(472, 130, 494, 120, 486, 104);
    ctx.stroke();
  }
  fillBox(ctx, 372, 236, 44, 44, '#5a4632');
  fillBox(ctx, 378, 242, 32, 32, diffs.has('window-lit') ? '#3a2f52' : '#ffd97a');
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(394, 242);
  ctx.lineTo(394, 274);
  ctx.moveTo(378, 258);
  ctx.lineTo(410, 258);
  ctx.stroke();
  fillBox(ctx, 448, 246, 30, 74, '#7a4a2b');
  // An icicle hangs from the cottage eaves in the left picture only.
  if (!diffs.has('icicle')) {
    ctx.fillStyle = '#cfe8f2';
    ctx.beginPath();
    ctx.moveTo(452, 204);
    ctx.lineTo(460, 204);
    ctx.lineTo(456, 226);
    ctx.closePath();
    ctx.fill();
  }

  // The snowy ground and the frozen pond.
  fillBox(ctx, 0, 320, W, 120, '#e8f0f8');
  fillEllipse(ctx, 460, 392, 130, 34, '#a8d0e8');
  ctx.strokeStyle = '#7ab0d0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(460, 392, 110, 26, 0, 0, Math.PI * 2);
  ctx.stroke();
  // The skater on the pond, gone in the right picture.
  if (!diffs.has('skater')) {
    fillCircle(ctx, 480, 372, 9, '#e2604d');
    fillEllipse(ctx, 480, 388, 8, 12, '#3a2f52');
    ctx.strokeStyle = '#3a2f52';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(474, 398);
    ctx.lineTo(466, 408);
    ctx.moveTo(486, 398);
    ctx.lineTo(494, 408);
    ctx.stroke();
    ctx.strokeStyle = '#8a8a8a';
    ctx.beginPath();
    ctx.moveTo(466, 408);
    ctx.lineTo(458, 410);
    ctx.moveTo(494, 408);
    ctx.lineTo(502, 410);
    ctx.stroke();
  }

  // The snowman: carrot nose in the left picture, none in the right;
  // and a scarf that is red on the left, blue on the right.
  fillCircle(ctx, 300, 380, 26, '#f7f2e8');
  fillCircle(ctx, 300, 336, 20, '#f7f2e8');
  fillCircle(ctx, 300, 300, 15, '#f7f2e8');
  // The snowman: a top hat in the left picture, none in the right one.
  if (!diffs.has('top-hat')) {
    fillBox(ctx, 288, 282, 24, 6, '#3a2f52');
    fillBox(ctx, 292, 268, 16, 16, '#3a2f52');
  }
  fillCircle(ctx, 294, 296, 2, '#241d33');
  fillCircle(ctx, 306, 296, 2, '#241d33');
  ctx.strokeStyle = diffs.has('scarf-colour') ? '#2e6ab0' : '#c94f43';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(284, 320);
  ctx.lineTo(316, 320);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(308, 320);
  ctx.lineTo(312, 344);
  ctx.stroke();
  ctx.fillStyle = '#241d33';
  fillCircle(ctx, 300, 336, 2, '#241d33');
  fillCircle(ctx, 300, 350, 2, '#241d33');
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(280, 340);
  ctx.lineTo(258, 326);
  ctx.moveTo(320, 340);
  ctx.lineTo(342, 326);
  ctx.stroke();

  // The sled by the fence: its pull-rope is missing in the right one.
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(200, 396);
  ctx.lineTo(244, 396);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(200, 396);
  ctx.quadraticCurveTo(196, 410, 208, 412);
  ctx.moveTo(244, 396);
  ctx.quadraticCurveTo(248, 410, 236, 412);
  ctx.stroke();
  if (!diffs.has('sled-rope')) {
    ctx.strokeStyle = '#c9a88a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(200, 396);
    ctx.lineTo(176, 380);
    ctx.stroke();
  }

  // A red mitten hangs on the fence post, gone in the right picture.
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(120, 340);
  ctx.lineTo(120, 372);
  ctx.stroke();
  if (!diffs.has('mitten')) {
    fillEllipse(ctx, 120, 356, 10, 13, '#c94f43');
    fillBox(ctx, 112, 364, 16, 6, '#f7ead0');
  }

  // The snow lantern by the pond: its candle burns in the left
  // picture and is out in the right one.
  fillBox(ctx, 528, 330, 30, 34, '#9a9a9a');
  fillBox(ctx, 522, 322, 42, 10, '#8a8a8a');
  if (!diffs.has('snow-lantern')) {
    fillCircle(ctx, 543, 348, 6, '#ffd97a');
    ctx.fillStyle = 'rgba(255, 217, 122, 0.25)';
    ctx.beginPath();
    ctx.arc(543, 348, 15, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ------------------------------------------------------------------ */
/* Scene 5: Kite Festival — kites, a windmill and a picnic under a    */
/* busy spring sky. Master: the differences are small and the sky is   */
/* crowded.                                                            */
/* ------------------------------------------------------------------ */

function paintKiteFestival(ctx, W, H, diffs, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, 320);
  sky.addColorStop(0, '#7ec8e8');
  sky.addColorStop(1, '#e8f6ff');
  fillBox(ctx, 0, 0, W, 320, sky);

  // The sun, with rays in the left picture and bare in the right one.
  fillCircle(ctx, 90, 64, 24, '#ffe9a8');
  if (!diffs.has('sunburst')) {
    ctx.strokeStyle = '#ffe9a8';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(90 + Math.cos(a) * 31, 64 + Math.sin(a) * 31);
      ctx.lineTo(90 + Math.cos(a) * 42, 64 + Math.sin(a) * 42);
      ctx.stroke();
    }
  }

  // Clouds: three in the left picture, two in the right one.
  const clouds = [
    [200, 60],
    [350, 52],
    [480, 84],
  ];
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < clouds.length; i += 1) {
    if (diffs.has('cloud') && i === 1) continue;
    const [cx, cy] = clouds[i];
    fillEllipse(ctx, cx, cy, 34, 14, '#ffffff');
    fillCircle(ctx, cx - 18, cy + 2, 11, '#ffffff');
    fillCircle(ctx, cx + 16, cy + 2, 12, '#ffffff');
  }

  // A balloon drifts by: red in the left picture, yellow in the right.
  fillEllipse(ctx, 150, 120, 16, 20, diffs.has('balloon-colour') ? '#f5b942' : '#e2604d');
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 140);
  ctx.lineTo(150, 162);
  ctx.stroke();
  fillBox(ctx, 146, 140, 8, 5, '#8a5a33');

  // Birds: two in the left picture, one in the right one.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  const birds = [
    [420, 90],
    [460, 70],
  ];
  for (let i = 0; i < birds.length; i += 1) {
    if (diffs.has('bird') && i === 1) continue;
    const [bx, by] = birds[i];
    ctx.beginPath();
    ctx.moveTo(bx - 9, by);
    ctx.quadraticCurveTo(bx - 4, by - 6, bx, by);
    ctx.quadraticCurveTo(bx + 4, by - 6, bx + 9, by);
    ctx.stroke();
  }

  // Bunting strung between two poles: one flag is teal in the right
  // picture.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(60, 200);
  ctx.lineTo(60, 150);
  ctx.moveTo(540, 200);
  ctx.lineTo(540, 150);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 152);
  ctx.quadraticCurveTo(300, 190, 540, 152);
  ctx.stroke();
  const flagCols = ['#e2604d', '#f5b942', '#e2604d', '#f5b942', '#e2604d', '#f5b942'];
  for (let i = 0; i < 6; i += 1) {
    const fx = 100 + i * 80;
    const fy = 158 + Math.sin((fx / 600) * Math.PI) * 14;
    ctx.fillStyle = diffs.has('bunting-flag') && i === 2 ? '#2e8b8b' : flagCols[i];
    ctx.beginPath();
    ctx.moveTo(fx - 12, fy);
    ctx.lineTo(fx + 12, fy);
    ctx.lineTo(fx, fy + 20);
    ctx.closePath();
    ctx.fill();
  }

  // The big diamond kite: its tail carries three bows in the left
  // picture and two in the right one.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(250, 230);
  ctx.lineTo(330, 330);
  ctx.stroke();
  ctx.fillStyle = '#e2604d';
  ctx.beginPath();
  ctx.moveTo(250, 190);
  ctx.lineTo(290, 230);
  ctx.lineTo(250, 270);
  ctx.lineTo(210, 230);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c94f43';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(210, 230);
  ctx.lineTo(290, 230);
  ctx.moveTo(250, 190);
  ctx.lineTo(250, 270);
  ctx.stroke();
  ctx.strokeStyle = '#241d33';
  ctx.beginPath();
  ctx.moveTo(250, 270);
  ctx.quadraticCurveTo(260, 300, 252, 330);
  ctx.stroke();
  const bows = [
    [256, 292],
    [254, 310],
    [252, 326],
  ];
  ctx.fillStyle = '#f5b942';
  for (let i = 0; i < bows.length; i += 1) {
    if (diffs.has('kite-tail') && i === 2) continue;
    const [bx, by] = bows[i];
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 8, by - 5);
    ctx.lineTo(bx - 8, by + 5);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + 8, by - 5);
    ctx.lineTo(bx + 8, by + 5);
    ctx.closePath();
    ctx.fill();
  }

  // The bird kite, high on the right.
  ctx.fillStyle = '#2e8b8b';
  ctx.beginPath();
  ctx.moveTo(440, 170);
  ctx.quadraticCurveTo(470, 150, 500, 172);
  ctx.quadraticCurveTo(470, 168, 440, 170);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(470, 168);
  ctx.lineTo(486, 150);
  ctx.lineTo(492, 168);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(470, 168);
  ctx.quadraticCurveTo(480, 220, 460, 260);
  ctx.stroke();
  // The kite string runs down to the picnic: it is missing from the
  // right picture.
  if (!diffs.has('kite-string')) {
    ctx.strokeStyle = '#241d33';
    ctx.beginPath();
    ctx.moveTo(460, 260);
    ctx.lineTo(430, 330);
    ctx.stroke();
  }

  // The windmill on the hill: four blades in the left picture, three
  // in the right one.
  fillBox(ctx, 500, 240, 34, 80, '#f2dfba');
  ctx.fillStyle = '#8a5a33';
  ctx.beginPath();
  ctx.moveTo(496, 244);
  ctx.lineTo(538, 244);
  ctx.lineTo(530, 224);
  ctx.lineTo(504, 224);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7ead0';
  const blades = [0, 1, 2, 3];
  for (const b of blades) {
    if (diffs.has('windmill-blade') && b === 3) continue;
    const a = (b * Math.PI) / 2 + 0.4;
    ctx.save();
    ctx.translate(517, 218);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(34, -12);
    ctx.lineTo(34, 4);
    ctx.lineTo(0, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  fillCircle(ctx, 517, 218, 6, '#8a5a33');

  // The green hill and the picnic blanket.
  fillBox(ctx, 0, 320, W, 120, '#6aaa5a');
  ctx.fillStyle = '#5a9a4a';
  for (let i = 0; i < 14; i += 1) {
    fillEllipse(ctx, random() * W, 326 + random() * 20, 8 + random() * 12, 3 + random() * 3, '#5a9a4a');
  }
  ctx.fillStyle = '#f7ead0';
  ctx.beginPath();
  ctx.moveTo(240, 360);
  ctx.lineTo(400, 360);
  ctx.lineTo(410, 420);
  ctx.lineTo(230, 420);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e2604d';
  for (let r = 0; r < 2; r += 1) {
    for (let c = 0; c < 4; c += 1) {
      if ((r + c) % 2 === 0) fillBox(ctx, 240 + c * 42 + r * 4, 360 + r * 30, 42, 30, '#e2604d');
    }
  }
  // The picnic basket: an apple sits on it in the left picture only.
  fillBox(ctx, 340, 372, 44, 26, '#8a5a33');
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(348, 372);
  ctx.quadraticCurveTo(362, 358, 376, 372);
  ctx.stroke();
  if (!diffs.has('basket-apple')) {
    fillCircle(ctx, 362, 366, 7, '#e2604d');
    ctx.strokeStyle = '#4a7a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(362, 360);
    ctx.lineTo(366, 352);
    ctx.stroke();
  }
  // A cup on the blanket, gone in the right picture.
  if (!diffs.has('picnic-cup')) {
    fillBox(ctx, 272, 384, 16, 16, '#2e8b8b');
    fillBox(ctx, 270, 382, 20, 4, '#fff7e6');
  }
}

/* ------------------------------------------------------------------ */
/* The catalogue the hunt plays through, easiest first.                */
/* ------------------------------------------------------------------ */

export const SCENES = [
  {
    id: 'dawn-harbour',
    name: 'Dawn Harbour',
    tagline: 'A lighthouse, two boats and a fisherman at sunrise.',
    difficulty: 'Easy',
    seed: 501,
    paint: paintDawnHarbour,
    differences: [
      { id: 'sun-rays', x: 90, y: 70, r: 36, label: 'The sun lost its rays' },
      { id: 'lighthouse-beam', x: 180, y: 112, r: 28, label: "The lighthouse beam went dark" },
      { id: 'boat-flag', x: 259, y: 257, r: 16, label: 'The boat lost its flag' },
      { id: 'gull', x: 430, y: 60, r: 14, label: 'A gull flew away' },
      { id: 'buoy-colour', x: 500, y: 335, r: 18, label: 'The buoy changed colour' },
      { id: 'fisherman-hat', x: 205, y: 322, r: 16, label: "The fisherman's hat changed colour" },
      { id: 'net-float', x: 354, y: 380, r: 16, label: 'A net float is missing' },
      { id: 'crate', x: 530, y: 360, r: 18, label: 'A crate vanished from the stack' },
      { id: 'office-window', x: 446, y: 250, r: 24, label: 'The office window went dark' },
      { id: 'anchor', x: 60, y: 334, r: 18, label: 'The anchor is gone' },
    ],
  },
  {
    id: 'night-market',
    name: 'Night Market',
    tagline: 'Dumplings, tea and a cat asleep on a crate.',
    difficulty: 'Easy+',
    seed: 602,
    paint: paintNightMarket,
    differences: [
      { id: 'bulb-out', x: 390, y: 70, r: 16, label: 'A bulb went out' },
      { id: 'lantern-missing', x: 300, y: 96, r: 20, label: 'A lantern is missing' },
      { id: 'sign-word', x: 146, y: 117, r: 30, label: 'The sign gained a word' },
      { id: 'cat-tail', x: 458, y: 322, r: 18, label: "The cat's tail moved" },
      { id: 'dumpling-count', x: 140, y: 292, r: 16, label: 'A dumpling vanished' },
      { id: 'jar-colour', x: 511, y: 257, r: 18, label: 'A tea jar changed colour' },
      { id: 'awning-stripe', x: 90, y: 171, r: 18, label: 'An awning stripe changed colour' },
      { id: 'teapot-steam', x: 420, y: 200, r: 18, label: 'The teapot stopped steaming' },
      { id: 'fan', x: 520, y: 190, r: 20, label: 'The paper fan folded shut' },
      { id: 'coin', x: 250, y: 332, r: 14, label: 'A coin vanished from the ground' },
    ],
  },
  {
    id: 'tea-garden',
    name: 'Bamboo Tea Garden',
    tagline: 'Koi, bamboo and a cup of tea by the pond.',
    difficulty: 'Medium',
    seed: 703,
    paint: paintTeaGarden,
    differences: [
      { id: 'koi-colour', x: 300, y: 386, r: 30, label: 'The big koi changed colour' },
      { id: 'frog', x: 150, y: 378, r: 18, label: 'The frog hopped away' },
      { id: 'dragonfly', x: 420, y: 120, r: 16, label: "The dragonfly's wings moved" },
      { id: 'lantern-flame', x: 525, y: 262, r: 18, label: 'The stone lantern went out' },
      { id: 'bamboo-shoot', x: 500, y: 302, r: 16, label: 'A bamboo shoot is missing' },
      { id: 'maple-leaf', x: 96, y: 140, r: 16, label: 'A maple leaf cluster vanished' },
      { id: 'stepping-stone', x: 330, y: 322, r: 18, label: 'A stepping stone is missing' },
      { id: 'bridge-plank', x: 380, y: 364, r: 16, label: 'A bridge plank changed colour' },
      { id: 'teahouse-window', x: 186, y: 226, r: 26, label: 'The teahouse window went dark' },
      { id: 'teacup-steam', x: 200, y: 272, r: 16, label: 'The tea stopped steaming' },
    ],
  },
  {
    id: 'snow-village',
    name: 'Snow Village',
    tagline: 'A snowman, a sled and skates on the frozen pond.',
    difficulty: 'Hard',
    seed: 804,
    paint: paintSnowVillage,
    differences: [
      { id: 'top-hat', x: 300, y: 276, r: 16, label: "The snowman lost its hat" },
      { id: 'scarf-colour', x: 300, y: 320, r: 18, label: "The snowman's scarf changed colour" },
      { id: 'mitten', x: 120, y: 356, r: 16, label: 'A mitten vanished from the fence' },
      { id: 'icicle', x: 456, y: 214, r: 14, label: 'An icicle melted away' },
      { id: 'chimney-smoke', x: 486, y: 122, r: 18, label: 'The chimney stopped smoking' },
      { id: 'window-lit', x: 394, y: 258, r: 22, label: 'The cottage window went dark' },
      { id: 'skater', x: 480, y: 388, r: 20, label: 'The skater left the pond' },
      { id: 'pine-star', x: 90, y: 186, r: 16, label: 'The pine lost its star' },
      { id: 'sled-rope', x: 188, y: 388, r: 16, label: "The sled's rope is missing" },
      { id: 'snow-lantern', x: 543, y: 348, r: 16, label: 'The snow lantern went out' },
    ],
  },
  {
    id: 'kite-festival',
    name: 'Kite Festival',
    tagline: 'Kites, a windmill and a picnic under a busy sky.',
    difficulty: 'Master',
    seed: 905,
    paint: paintKiteFestival,
    differences: [
      { id: 'kite-tail', x: 252, y: 326, r: 16, label: 'A kite lost a tail bow' },
      { id: 'windmill-blade', x: 523, y: 202, r: 18, label: 'The windmill lost a blade' },
      { id: 'balloon-colour', x: 150, y: 120, r: 18, label: 'The balloon changed colour' },
      { id: 'cloud', x: 350, y: 52, r: 22, label: 'A cloud drifted away' },
      { id: 'bird', x: 460, y: 70, r: 14, label: 'A bird flew away' },
      { id: 'picnic-cup', x: 280, y: 392, r: 14, label: 'A cup vanished from the blanket' },
      { id: 'bunting-flag', x: 260, y: 172, r: 16, label: 'A bunting flag changed colour' },
      { id: 'sunburst', x: 90, y: 64, r: 32, label: 'The sun lost its rays' },
      { id: 'kite-string', x: 445, y: 296, r: 16, label: "The kite's string vanished" },
      { id: 'basket-apple', x: 362, y: 366, r: 14, label: 'An apple vanished from the basket' },
    ],
  },
];
