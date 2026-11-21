// The three scenes. Each scene is drawn twice — once plain (left panel) and
// once with its differences applied (right panel) — by the same painter, so the
// two pictures agree on everything except the differences. A difference is a
// small, fair change: a missing lantern, a dark window, a fish that changed
// colour. Nothing here copies any existing game: the lane, the reef and the
// camp are original scenes drawn by this file's own code.

function circle(ctx, x, y, radius, fill) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, width, height, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
}

function star(ctx, x, y, radius, fill) {
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

function scatterStars(ctx, random, count, width, height, maxY) {
  for (let i = 0; i < count; i += 1) {
    const x = 10 + random() * (width - 20);
    const y = 8 + random() * (maxY - 16);
    const r = 1 + random() * 1.8;
    circle(ctx, x, y, r, `rgba(255, 244, 200, ${0.5 + random() * 0.5})`);
  }
}

/* ------------------------------------------------------------------ */
/* Scene 1: Lantern Lane — a dusk street with a tea shop, a cat and   */
/* a string of paper lanterns.                                         */
/* ------------------------------------------------------------------ */

function drawLanternLane(ctx, W, H, diffs, random) {
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, '#2b2350');
  sky.addColorStop(0.55, '#7a4a72');
  sky.addColorStop(1, '#e8845a');
  rect(ctx, 0, 0, W, 300, sky);
  scatterStars(ctx, random, 42, W, H, 120);

  // Moon: full in the left picture, a crescent in the right one.
  if (diffs.has('moon')) {
    circle(ctx, 500, 55, 27, '#f7e8b0');
    circle(ctx, 512, 48, 24, '#2b2350');
  } else {
    circle(ctx, 500, 55, 27, '#f7e8b0');
    circle(ctx, 488, 48, 5, '#e8d28a');
    circle(ctx, 508, 62, 4, '#e8d28a');
  }

  // Rooftops and chimney, with a curl of smoke above it.
  rect(ctx, 0, 205, W, 95, '#3a2f52');
  rect(ctx, 470, 130, 34, 75, '#2e2540');
  rect(ctx, 464, 122, 46, 10, '#2e2540');
  ctx.strokeStyle = 'rgba(230, 220, 240, 0.75)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(487, 118);
  ctx.bezierCurveTo(470, 100, 500, 88, 488, 70);
  ctx.bezierCurveTo(480, 58, 495, 52, 490, 44);
  ctx.stroke();

  // Tea shop: cream wall, striped awning, warm window, wooden door.
  rect(ctx, 30, 150, 230, 170, '#f2dfba');
  rect(ctx, 30, 150, 230, 8, '#8a5a33');
  // The awning's first stripe is red in the left picture, teal in the right one.
  for (let i = 0; i < 6; i += 1) {
    const stripe = i % 2 === 0 ? '#c94f43' : '#f7ead0';
    rect(ctx, 30 + i * 40, 158, 40, 26, diffs.has('awning') && i === 0 ? '#2e8b8b' : stripe);
  }
  rect(ctx, 30, 184, 230, 6, '#8a5a33');
  // Window: lit gold in the left picture, dark in the right one.
  rect(ctx, 88, 208, 72, 72, '#5a4632');
  rect(ctx, 94, 214, 60, 60, diffs.has('window') ? '#3a2f52' : '#ffd97a');
  if (!diffs.has('window')) {
    circle(ctx, 124, 244, 12, '#e2604d');
    rect(ctx, 122, 256, 4, 18, '#4a7a3a');
  }
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(124, 214);
  ctx.lineTo(124, 274);
  ctx.moveTo(94, 244);
  ctx.lineTo(154, 244);
  ctx.stroke();
  // Door.
  rect(ctx, 190, 220, 52, 100, '#7a4a2b');
  circle(ctx, 234, 272, 4, '#f5b942');
  // Hanging sign: "TEA" in the left picture, "TEA & CAKE" in the right one.
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(205, 150);
  ctx.lineTo(205, 128);
  ctx.stroke();
  rect(ctx, 168, 104, 74, 26, '#f7ead0');
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 2;
  ctx.strokeRect(168, 104, 74, 26);
  ctx.fillStyle = '#5a2e1a';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(diffs.has('sign') ? 'TEA & CAKE' : 'TEA', 205, 118);
  ctx.font = 'bold 11px Georgia, serif';
  if (diffs.has('sign')) ctx.fillText('', 0, 0);

  // String of paper lanterns across the street; the middle one is missing
  // from the right picture.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 88);
  ctx.quadraticCurveTo(300, 122, 590, 78);
  ctx.stroke();
  const lanternXs = [70, 170, 300, 430, 540];
  const lanternYs = [98, 108, 112, 104, 92];
  const lanternColours = ['#e2604d', '#f5b942', '#e2604d', '#2e8b8b', '#f5b942'];
  for (let i = 0; i < lanternXs.length; i += 1) {
    if (diffs.has('lantern') && i === 2) continue;
    ctx.strokeStyle = '#241d33';
    ctx.beginPath();
    ctx.moveTo(lanternXs[i], lanternYs[i] - 12);
    ctx.lineTo(lanternXs[i], lanternYs[i]);
    ctx.stroke();
    ellipse(ctx, lanternXs[i], lanternYs[i] + 12, 13, 16, lanternColours[i]);
    ellipse(ctx, lanternXs[i], lanternYs[i] + 12, 7, 16, 'rgba(255,255,255,0.25)');
    rect(ctx, lanternXs[i] - 4, lanternYs[i] - 6, 8, 5, '#f5b942');
  }

  // Low wall with the lane's cat: tail up in the left picture, tail curled
  // down in the right one.
  rect(ctx, 300, 300, 150, 20, '#6b5a7a');
  rect(ctx, 296, 296, 158, 8, '#8a7a9a');
  ellipse(ctx, 350, 292, 26, 15, '#3a3348');
  circle(ctx, 372, 274, 13, '#3a3348');
  ctx.fillStyle = '#3a3348';
  ctx.beginPath();
  ctx.moveTo(362, 264);
  ctx.lineTo(366, 250);
  ctx.lineTo(372, 263);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(376, 264);
  ctx.lineTo(382, 251);
  ctx.lineTo(384, 265);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a3348';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (diffs.has('cat-tail')) {
    ctx.moveTo(326, 292);
    ctx.quadraticCurveTo(312, 300, 320, 308);
  } else {
    ctx.moveTo(326, 290);
    ctx.quadraticCurveTo(308, 278, 314, 262);
  }
  ctx.stroke();
  circle(ctx, 376, 272, 2, '#f5b942');
  circle(ctx, 380, 272, 2, '#f5b942');

  // Cobblestone street.
  rect(ctx, 0, 320, W, 120, '#7a6a8a');
  ctx.fillStyle = '#6b5a7a';
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 12; col += 1) {
      const x = col * 52 + (row % 2) * 26;
      const y = 326 + row * 28;
      ctx.beginPath();
      ctx.ellipse(x + 22, y + 10, 22, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Bicycle leaning by the wall; its basket holds flowers in the left
  // picture and stands empty in the right one.
  ctx.strokeStyle = '#241d33';
  ctx.lineWidth = 4;
  circle(ctx, 448, 356, 22, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(448, 356, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(522, 356, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(448, 356);
  ctx.lineTo(482, 322);
  ctx.lineTo(522, 356);
  ctx.moveTo(482, 322);
  ctx.lineTo(470, 306);
  ctx.moveTo(482, 322);
  ctx.lineTo(500, 308);
  ctx.moveTo(500, 308);
  ctx.lineTo(522, 312);
  ctx.stroke();
  rect(ctx, 498, 312, 26, 18, '#8a5a33');
  if (!diffs.has('basket')) {
    circle(ctx, 506, 306, 6, '#e2604d');
    circle(ctx, 514, 304, 6, '#f5b942');
    circle(ctx, 519, 310, 5, '#e2604d');
    ellipse(ctx, 511, 312, 10, 3, '#4a7a3a');
  }

  // Potted plant by the shop door: three blooms in the left picture, two
  // in the right one.
  rect(ctx, 246, 344, 30, 26, '#c94f43');
  ctx.strokeStyle = '#4a7a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 344);
  ctx.lineTo(252, 322);
  ctx.moveTo(261, 344);
  ctx.lineTo(261, 318);
  ctx.moveTo(266, 344);
  ctx.lineTo(272, 324);
  ctx.stroke();
  circle(ctx, 252, 318, 6, '#f5b942');
  circle(ctx, 261, 312, 6, '#e2604d');
  if (!diffs.has('flower')) circle(ctx, 272, 320, 6, '#f5b942');
}

/* ------------------------------------------------------------------ */
/* Scene 2: Coral Reef — a bright reef with fish, corals, a starfish  */
/* and a treasure chest on the sand.                                   */
/* ------------------------------------------------------------------ */

function drawFish(ctx, x, y, size, colour, facing) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - facing * size * 0.8, y);
  ctx.lineTo(x - facing * size * 1.5, y - size * 0.6);
  ctx.lineTo(x - facing * size * 1.5, y + size * 0.6);
  ctx.closePath();
  ctx.fill();
  circle(ctx, x + facing * size * 0.5, y - size * 0.12, size * 0.14, '#10222e');
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.55, -0.6, 0.9);
  ctx.stroke();
}

function drawCoralReef(ctx, W, H, diffs, random) {
  const water = ctx.createLinearGradient(0, 0, 0, H);
  water.addColorStop(0, '#2f8fb0');
  water.addColorStop(0.5, '#14607f');
  water.addColorStop(1, '#0a3a5c');
  rect(ctx, 0, 0, W, H, water);
  // Sunbeams from the surface.
  ctx.fillStyle = 'rgba(255, 244, 190, 0.10)';
  for (let i = 0; i < 4; i += 1) {
    const x = 60 + i * 150;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 50, 0);
    ctx.lineTo(x + 110, 340);
    ctx.lineTo(x + 30, 340);
    ctx.closePath();
    ctx.fill();
  }
  // Bubbles rising from the reef.
  ctx.strokeStyle = 'rgba(220, 245, 255, 0.7)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 9; i += 1) {
    const bx = 60 + random() * 480;
    const by = 120 + random() * 220;
    ctx.beginPath();
    ctx.arc(bx, by, 3 + random() * 5, 0, Math.PI * 2);
    ctx.stroke();
  }
  // One extra bubble floats above the chest in the left picture only.
  if (!diffs.has('bubble')) {
    ctx.beginPath();
    ctx.arc(480, 300, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // A tiny fish near the surface: there in the left picture, gone in the
  // right one.
  if (!diffs.has('tiny-fish')) drawFish(ctx, 520, 60, 12, '#ffd94d', -1);

  // The big orange fish: orange in the left picture, blue in the right one.
  drawFish(ctx, 200, 150, 26, diffs.has('fish-colour') ? '#4d8fd1' : '#f08a24', 1);
  drawFish(ctx, 420, 110, 20, '#7ac74f', -1);
  drawFish(ctx, 300, 220, 15, '#ffd94d', 1);
  drawFish(ctx, 120, 90, 13, '#e2604d', 1);

  // Branching pink coral on the left; one branch is missing in the right
  // picture.
  ctx.strokeStyle = '#e77a9a';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(80, 360);
  ctx.lineTo(80, 300);
  ctx.moveTo(80, 330);
  ctx.lineTo(55, 300);
  ctx.moveTo(80, 320);
  ctx.lineTo(105, 292);
  ctx.stroke();
  if (!diffs.has('coral-branch')) {
    ctx.beginPath();
    ctx.moveTo(80, 312);
    ctx.lineTo(62, 272);
    ctx.stroke();
  }
  // Fan coral on the right.
  ctx.fillStyle = '#b06ac9';
  ctx.beginPath();
  ctx.moveTo(520, 360);
  ctx.quadraticCurveTo(470, 300, 500, 250);
  ctx.quadraticCurveTo(530, 290, 560, 250);
  ctx.quadraticCurveTo(570, 310, 540, 360);
  ctx.closePath();
  ctx.fill();
  // Purple tube coral in the middle.
  ctx.fillStyle = '#8a5fc9';
  for (let i = 0; i < 4; i += 1) {
    const x = 330 + i * 16;
    rect(ctx, x, 330 - i * 4, 12, 30 + i * 4, '#8a5fc9');
    circle(ctx, x + 6, 328 - i * 4, 6, '#a87ed9');
  }

  // Seaweed: the middle strand is tall in the left picture, short in the
  // right one.
  ctx.strokeStyle = '#3fae6a';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  const weeds = [
    { x: 220, top: 290 },
    { x: 250, top: diffs.has('seaweed') ? 330 : 270 },
    { x: 278, top: 300 },
  ];
  for (const weed of weeds) {
    ctx.beginPath();
    ctx.moveTo(weed.x, 360);
    ctx.quadraticCurveTo(weed.x + 14, 330, weed.x, weed.top);
    ctx.stroke();
  }

  // Sandy floor with pebbles.
  rect(ctx, 0, 360, W, 80, '#e8d5a3');
  ctx.fillStyle = '#d9c48a';
  for (let i = 0; i < 26; i += 1) {
    ellipse(ctx, random() * W, 366 + random() * 66, 3 + random() * 5, 2 + random() * 3, '#d9c48a');
  }

  // Starfish on the sand: five arms in the left picture, four in the right.
  const arms = diffs.has('starfish-arms') ? 4 : 5;
  ctx.fillStyle = '#f08a24';
  ctx.beginPath();
  for (let i = 0; i < arms * 2; i += 1) {
    const angle = (i * Math.PI) / arms - Math.PI / 2;
    const r = i % 2 === 0 ? 22 : 9;
    const px = 150 + Math.cos(angle) * r;
    const py = 395 + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  circle(ctx, 150, 395, 5, '#d96f16');

  // Clam shell: open in the left picture, shut in the right one.
  if (diffs.has('shell')) {
    ellipse(ctx, 320, 402, 20, 8, '#d9a0c9');
  } else {
    ellipse(ctx, 320, 404, 20, 10, '#d9a0c9');
    ellipse(ctx, 320, 392, 20, 9, '#e8b8d9');
    circle(ctx, 320, 396, 5, '#fff2f8');
  }

  // Treasure chest with gold coins spilling out in the left picture only.
  rect(ctx, 440, 368, 64, 34, '#7a4a2b');
  ctx.beginPath();
  ctx.moveTo(440, 368);
  ctx.quadraticCurveTo(472, 336, 504, 368);
  ctx.closePath();
  ctx.fillStyle = '#8a5a33';
  ctx.fill();
  rect(ctx, 468, 362, 8, 44, '#f5b942');
  if (!diffs.has('coins')) {
    circle(ctx, 452, 404, 6, '#f5b942');
    circle(ctx, 460, 410, 6, '#ffd94d');
    circle(ctx, 445, 412, 5, '#f5b942');
    circle(ctx, 470, 406, 5, '#ffd94d');
  }
}

/* ------------------------------------------------------------------ */
/* Scene 3: Starlight Camp — a tent, a campfire and an owl under a    */
/* sky full of stars.                                                  */
/* ------------------------------------------------------------------ */

function drawPine(ctx, x, baseY, height, colour) {
  ctx.fillStyle = colour;
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
  rect(ctx, x - 4, baseY - 8, 8, 10, '#5a3a22');
}

function drawStarlightCamp(ctx, W, H, diffs, random) {
  const night = ctx.createLinearGradient(0, 0, 0, 320);
  night.addColorStop(0, '#101736');
  night.addColorStop(1, '#2c4a7a');
  rect(ctx, 0, 0, W, 320, night);
  scatterStars(ctx, random, 55, W, H, 200);

  // The moon, with a crater in the left picture and none in the right one.
  circle(ctx, 90, 58, 26, '#f7e8b0');
  if (!diffs.has('crater')) {
    circle(ctx, 82, 52, 5, '#e0cc8e');
    circle(ctx, 98, 64, 4, '#e0cc8e');
  }
  // One bright star is missing from the right picture.
  if (!diffs.has('star')) star(ctx, 300, 50, 9, '#fff4c8');

  // Mountains.
  ctx.fillStyle = '#1d2f52';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(120, 210);
  ctx.lineTo(230, 300);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(330, 300);
  ctx.lineTo(470, 195);
  ctx.lineTo(600, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7f2e8';
  ctx.beginPath();
  ctx.moveTo(108, 222);
  ctx.lineTo(120, 210);
  ctx.lineTo(132, 222);
  ctx.lineTo(120, 228);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(456, 208);
  ctx.lineTo(470, 195);
  ctx.lineTo(484, 208);
  ctx.lineTo(470, 215);
  ctx.closePath();
  ctx.fill();

  // Pine trees; the right-hand tree loses a branch in the right picture.
  drawPine(ctx, 40, 330, 120, '#1d4a2e');
  drawPine(ctx, 560, 330, 130, '#1d4a2e');
  if (diffs.has('pine-branch')) {
    ctx.fillStyle = '#2c4a7a';
    ctx.beginPath();
    ctx.moveTo(560, 262);
    ctx.lineTo(536, 290);
    ctx.lineTo(560, 290);
    ctx.closePath();
    ctx.fill();
  }

  // Ground.
  rect(ctx, 0, 300, W, 140, '#2e4a2e');
  ctx.fillStyle = '#274026';
  for (let i = 0; i < 20; i += 1) {
    ellipse(ctx, random() * W, 310 + random() * 120, 8 + random() * 14, 3 + random() * 3, '#274026');
  }

  // The tent, with a little flag on its peak in the left picture only.
  ctx.fillStyle = '#e2604d';
  ctx.beginPath();
  ctx.moveTo(110, 400);
  ctx.lineTo(185, 296);
  ctx.lineTo(260, 400);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c94f43';
  ctx.beginPath();
  ctx.moveTo(185, 296);
  ctx.lineTo(260, 400);
  ctx.lineTo(220, 400);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3a2f52';
  ctx.beginPath();
  ctx.moveTo(168, 400);
  ctx.lineTo(185, 350);
  ctx.lineTo(202, 400);
  ctx.closePath();
  ctx.fill();
  if (!diffs.has('tent-flag')) {
    ctx.strokeStyle = '#241d33';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(185, 296);
    ctx.lineTo(185, 272);
    ctx.stroke();
    ctx.fillStyle = '#f5b942';
    ctx.beginPath();
    ctx.moveTo(185, 272);
    ctx.lineTo(203, 277);
    ctx.lineTo(185, 283);
    ctx.closePath();
    ctx.fill();
  }

  // Sleeping bag beside the tent.
  ellipse(ctx, 292, 408, 34, 12, '#2e8b8b');
  ellipse(ctx, 292, 404, 26, 8, '#3fae9a');

  // Backpack: a yellow patch sits on it in the left picture only.
  rect(ctx, 318, 372, 34, 34, '#7a4a2b');
  rect(ctx, 318, 372, 34, 10, '#5a3a22');
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(326, 372);
  ctx.quadraticCurveTo(335, 360, 344, 372);
  ctx.stroke();
  if (!diffs.has('backpack-patch')) {
    rect(ctx, 330, 386, 12, 10, '#f5b942');
  }

  // Campfire: one log is missing in the right picture.
  ctx.fillStyle = '#8a8a8a';
  for (let i = 0; i < 7; i += 1) {
    const angle = (i * Math.PI) / 3.5;
    circle(ctx, 415 + Math.cos(angle) * 26, 398 + Math.sin(angle) * 8, 6, '#8a8a8a');
  }
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(392, 388);
  ctx.lineTo(436, 374);
  ctx.stroke();
  if (!diffs.has('fire-log')) {
    ctx.beginPath();
    ctx.moveTo(436, 388);
    ctx.lineTo(394, 374);
    ctx.stroke();
  }
  ctx.fillStyle = '#f08a24';
  ctx.beginPath();
  ctx.moveTo(414, 388);
  ctx.quadraticCurveTo(396, 356, 414, 336);
  ctx.quadraticCurveTo(432, 356, 414, 388);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd94d';
  ctx.beginPath();
  ctx.moveTo(414, 388);
  ctx.quadraticCurveTo(404, 366, 414, 352);
  ctx.quadraticCurveTo(424, 366, 414, 388);
  ctx.closePath();
  ctx.fill();

  // Marshmallow stick: a marshmallow sits on it in the left picture only.
  ctx.strokeStyle = '#8a6a4a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(352, 400);
  ctx.lineTo(368, 336);
  ctx.stroke();
  if (!diffs.has('marshmallow')) {
    rect(ctx, 362, 322, 12, 14, '#fff7e6');
    rect(ctx, 362, 322, 12, 4, '#e8dcc8');
  }

  // Lantern on a stump, glowing.
  rect(ctx, 66, 386, 44, 20, '#5a3a22');
  rect(ctx, 82, 356, 12, 30, '#3a2f52');
  circle(ctx, 88, 372, 12, '#ffd97a');
  ctx.fillStyle = 'rgba(255, 217, 122, 0.18)';
  ctx.beginPath();
  ctx.arc(88, 372, 34, 0, Math.PI * 2);
  ctx.fill();

  // The owl on its branch: eyes open in the left picture, shut in the
  // right one.
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(480, 200);
  ctx.lineTo(560, 186);
  ctx.stroke();
  ellipse(ctx, 522, 168, 16, 22, '#6b4a2e');
  circle(ctx, 522, 142, 14, '#6b4a2e');
  ctx.fillStyle = '#6b4a2e';
  ctx.beginPath();
  ctx.moveTo(510, 132);
  ctx.lineTo(514, 120);
  ctx.lineTo(519, 131);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(526, 131);
  ctx.lineTo(531, 120);
  ctx.lineTo(535, 132);
  ctx.closePath();
  ctx.fill();
  if (diffs.has('owl-eyes')) {
    ctx.strokeStyle = '#241d33';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(513, 140);
    ctx.lineTo(519, 140);
    ctx.moveTo(525, 140);
    ctx.lineTo(531, 140);
    ctx.stroke();
  } else {
    circle(ctx, 516, 140, 4, '#fff7e6');
    circle(ctx, 528, 140, 4, '#fff7e6');
    circle(ctx, 516, 140, 2, '#241d33');
    circle(ctx, 528, 140, 2, '#241d33');
  }
}

/* ------------------------------------------------------------------ */
/* The catalogue the world plays through.                              */
/* ------------------------------------------------------------------ */

export const SCENES = [
  {
    id: 'lantern-lane',
    name: 'Lantern Lane',
    tagline: 'A dusk street, a tea shop and one very smug cat.',
    seed: 101,
    draw: drawLanternLane,
    differences: [
      { id: 'moon', x: 500, y: 55, r: 34, label: 'The moon changed shape' },
      { id: 'lantern', x: 300, y: 112, r: 20, label: 'A lantern went missing' },
      { id: 'cat-tail', x: 318, y: 276, r: 18, label: "The cat's tail moved" },
      { id: 'window', x: 124, y: 244, r: 40, label: 'The shop window went dark' },
      { id: 'basket', x: 511, y: 310, r: 18, label: 'Flowers left the basket' },
      { id: 'sign', x: 205, y: 117, r: 30, label: 'The sign gained a word' },
      { id: 'flower', x: 272, y: 320, r: 16, label: 'A bloom vanished' },
      { id: 'awning', x: 50, y: 171, r: 18, label: 'An awning stripe changed colour' },
    ],
  },
  {
    id: 'coral-reef',
    name: 'Coral Reef',
    tagline: 'Fish, corals and a chest of gold under the waves.',
    seed: 202,
    draw: drawCoralReef,
    differences: [
      { id: 'fish-colour', x: 200, y: 150, r: 30, label: 'A fish changed colour' },
      { id: 'starfish-arms', x: 150, y: 395, r: 24, label: 'The starfish lost an arm' },
      { id: 'coral-branch', x: 68, y: 282, r: 22, label: 'A coral branch broke off' },
      { id: 'bubble', x: 480, y: 300, r: 16, label: 'A bubble popped' },
      { id: 'shell', x: 320, y: 398, r: 22, label: 'The clam shut' },
      { id: 'seaweed', x: 250, y: 292, r: 20, label: 'A seaweed strand shrank' },
      { id: 'coins', x: 456, y: 406, r: 20, label: 'The gold coins vanished' },
      { id: 'tiny-fish', x: 520, y: 60, r: 18, label: 'A tiny fish swam away' },
    ],
  },
  {
    id: 'starlight-camp',
    name: 'Starlight Camp',
    tagline: 'A tent, a fire and an owl that never blinks. Almost.',
    seed: 303,
    draw: drawStarlightCamp,
    differences: [
      { id: 'owl-eyes', x: 522, y: 140, r: 20, label: 'The owl closed its eyes' },
      { id: 'tent-flag', x: 192, y: 278, r: 16, label: 'The tent lost its flag' },
      { id: 'fire-log', x: 415, y: 381, r: 18, label: 'A fire log is missing' },
      { id: 'star', x: 300, y: 50, r: 14, label: 'A bright star went out' },
      { id: 'marshmallow', x: 368, y: 329, r: 16, label: 'The marshmallow vanished' },
      { id: 'backpack-patch', x: 336, y: 391, r: 18, label: 'A patch left the backpack' },
      { id: 'crater', x: 88, y: 56, r: 16, label: 'A moon crater faded' },
      { id: 'pine-branch', x: 548, y: 276, r: 22, label: 'A pine branch fell off' },
    ],
  },
];
