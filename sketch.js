// ─── Project URLs ─────────────────────────────────────────────────
const projects = [
  {
    label: "Red Circle",
    url: "https://vero279.github.io/RedCircle/",
    accent: [180, 20, 20],
    accentBright: [220, 60, 60],
    symbol: "✦",
  },
  {
    label: "Blue Square",
    url: "https://vero279.github.io/BlueSquare/",
    accent: [30, 60, 160],
    accentBright: [70, 110, 220],
    symbol: "✦",
  },
];

// ─── Layout ───────────────────────────────────────────────────────
const BTN_W = 320;
const BTN_H = 68;
const BTN_GAP = 28;
const FRAME_PAD = 28;

let buttons = [];
let hoveredIndex = -1;
let drips = [];
let smokeParticles = [];
let t = 0;

// ─── Drip class ───────────────────────────────────────────────────
class Drip {
  constructor(x) {
    this.x = x;
    this.y = FRAME_PAD - 2;
    this.len = random(10, 38);
    this.speed = random(0.3, 1.1);
    this.w = random(1.5, 3.5);
    this.alpha = random(160, 230);
    this.r = random() > 0.5 ? 160 : 30;
    this.g = 0;
    this.b = this.r === 30 ? 120 : 0;
  }
  update() { this.y += this.speed; }
  draw() {
    strokeWeight(this.w);
    stroke(this.r, this.g, this.b, this.alpha);
    line(this.x, this.y - this.len, this.x, this.y);
    noStroke();
    fill(this.r, this.g, this.b, this.alpha * 0.6);
    ellipse(this.x, this.y, this.w * 2.5, this.w * 2.5);
  }
  isDead() { return this.y - this.len > height; }
}

class Smoke {
  constructor(x, y, r, g, b) {
    this.x = x + random(-20, 20);
    this.y = y;
    this.vx = random(-0.4, 0.4);
    this.vy = random(-1, -0.3);
    this.alpha = random(60, 120);
    this.size = random(6, 16);
    this.r = r; this.g = g; this.b = b;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 2.5;
    this.size += 0.3;
  }
  draw() {
    noStroke();
    fill(this.r, this.g, this.b, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
  isDead() { return this.alpha <= 0; }
}

// ─── Setup ────────────────────────────────────────────────────────
function setup() {
  let cnv = createCanvas(620, 400);
  cnv.parent("canvas-container");
  buildButtons();
  // Initial drips
  for (let i = 0; i < 12; i++) {
    let d = new Drip(random(FRAME_PAD + 10, width - FRAME_PAD - 10));
    d.y = random(FRAME_PAD, height * 0.4);
    drips.push(d);
  }
}

function buildButtons() {
  let totalH = projects.length * BTN_H + (projects.length - 1) * BTN_GAP;
  let startY = (height - totalH) / 2 + 18;
  buttons = projects.map((p, i) => ({
    ...p,
    x: (width - BTN_W) / 2,
    y: startY + i * (BTN_H + BTN_GAP),
    w: BTN_W,
    h: BTN_H,
    hover: 0,
  }));
}

// ─── Draw ─────────────────────────────────────────────────────────
function draw() {
  background(6, 4, 8);
  t += 0.01;

  drawAtmosphere();
  drawFrame();
  drawTitle();

  // Update drips
  if (frameCount % 18 === 0) {
    drips.push(new Drip(random(FRAME_PAD + 10, width - FRAME_PAD - 10)));
  }
  drips = drips.filter(d => !d.isDead());
  drips.forEach(d => { d.update(); d.draw(); });

  // Smoke
  smokeParticles = smokeParticles.filter(s => !s.isDead());
  smokeParticles.forEach(s => { s.update(); s.draw(); });

  // Buttons
  buttons.forEach((btn, i) => {
    let target = i === hoveredIndex ? 1 : 0;
    btn.hover += (target - btn.hover) * 0.1;
    drawButton(btn, i);
  });

  drawFrameOverlay();
}

function drawAtmosphere() {
  // Deep red vignette
  noStroke();
  for (let r = max(width, height); r > 0; r -= 20) {
    let alpha = map(r, 0, max(width, height), 0, 18);
    fill(80, 0, 0, alpha);
    ellipse(width / 2, height / 2, r * 2);
  }
  // Fog wisps
  for (let i = 0; i < 3; i++) {
    let wx = (sin(t * 0.4 + i * 2.1) * 0.5 + 0.5) * width;
    let wy = height * 0.7 + sin(t * 0.3 + i) * 20;
    for (let s = 80; s > 0; s -= 15) {
      fill(30, 10, 40, map(s, 0, 80, 0, 6));
      ellipse(wx, wy, s * 3, s * 1.2);
    }
  }
}

function drawFrame() {
  let p = FRAME_PAD;
  // Outer border — thick dark
  stroke(80, 10, 10);
  strokeWeight(3);
  noFill();
  rect(p, p, width - p * 2, height - p * 2);

  // Inner border — thin crimson
  stroke(140, 15, 15, 180);
  strokeWeight(0.8);
  rect(p + 6, p + 6, width - (p + 6) * 2, height - (p + 6) * 2);

  // Corner ornaments
  drawCornerOrnament(p, p, 0);
  drawCornerOrnament(width - p, p, 1);
  drawCornerOrnament(p, height - p, 2);
  drawCornerOrnament(width - p, height - p, 3);
}

function drawCornerOrnament(x, y, corner) {
  push();
  translate(x, y);
  let sx = (corner === 1 || corner === 3) ? -1 : 1;
  let sy = (corner === 2 || corner === 3) ? -1 : 1;
  scale(sx, sy);

  stroke(160, 20, 20, 200);
  strokeWeight(1);
  noFill();

  // L-bracket
  line(0, 0, 18, 0);
  line(0, 0, 0, 18);

  // Diamond
  fill(120, 10, 10, 160);
  noStroke();
  beginShape();
  vertex(0, -5);
  vertex(5, 0);
  vertex(0, 5);
  vertex(-5, 0);
  endShape(CLOSE);

  // Cross ticks
  stroke(160, 20, 20, 120);
  strokeWeight(0.8);
  line(9, 0, 9, 5);
  line(0, 9, 5, 9);

  pop();
}

function drawFrameOverlay() {
  // Scan line effect
  noStroke();
  for (let y = FRAME_PAD + 6; y < height - FRAME_PAD - 6; y += 4) {
    fill(0, 0, 0, 18);
    rect(FRAME_PAD + 6, y, width - (FRAME_PAD + 6) * 2, 2);
  }
  // Top drip mask (hides drips outside frame)
  fill(6, 4, 8);
  noStroke();
  rect(0, 0, width, FRAME_PAD - 1);
  rect(0, height - FRAME_PAD + 1, width, FRAME_PAD);
  rect(0, 0, FRAME_PAD - 1, height);
  rect(width - FRAME_PAD + 1, 0, FRAME_PAD, height);
}

function drawTitle() {
  // Gothic title using custom letterform simulation
  noStroke();

  // Glow behind title
  for (let s = 40; s > 0; s -= 8) {
    fill(160, 0, 0, map(s, 0, 40, 0, 10));
    ellipse(width / 2, 62, s * 5, s * 1.5);
  }

  // Title
  fill(200, 180, 140);
  textFont("serif");
  textSize(15);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("⸸ SELECT THY PROJECT ⸸", width / 2, 62);

  // Subtitle line
  stroke(100, 15, 15, 160);
  strokeWeight(0.8);
  line(width / 2 - 110, 76, width / 2 + 110, 76);

  // Side decorations
  noStroke();
  fill(160, 20, 20, 120);
  textSize(10);
  text("✦", width / 2 - 118, 62);
  text("✦", width / 2 + 118, 62);
}

function drawButton(btn, i) {
  let h = btn.hover;
  let [r, g, b] = btn.accent;
  let [rb, gb, bb] = btn.accentBright;

  // Outer glow
  noStroke();
  for (let spread = 28; spread > 0; spread -= 5) {
    fill(rb, gb, bb, map(spread, 0, 28, 0, h * 20));
    rect(btn.x - spread, btn.y - spread,
         btn.w + spread * 2, btn.h + spread * 2, 2 + spread);
  }

  // Background fill
  fill(lerp(12, r * 0.18, h), lerp(6, g * 0.18, h), lerp(16, b * 0.18, h));
  noStroke();
  rect(btn.x, btn.y, btn.w, btn.h);

  // Sharp border — NO radius (gothic, angular)
  strokeWeight(lerp(1, 2, h));
  stroke(lerp(r, rb, h), lerp(g, gb, h), lerp(b, bb, h), lerp(140, 255, h));
  noFill();
  rect(btn.x, btn.y, btn.w, btn.h);

  // Inner inset border
  stroke(lerp(r, rb, h), lerp(g, gb, h), lerp(b, bb, h), lerp(40, 90, h));
  strokeWeight(0.5);
  rect(btn.x + 4, btn.y + 4, btn.w - 8, btn.h - 8);

  // Corner accent marks
  drawBtnCorners(btn, lerp(r, rb, h), lerp(g, gb, h), lerp(b, bb, h), lerp(150, 255, h));

  // Symbol left
  noStroke();
  fill(rb, gb, bb, lerp(100, 220, h));
  textSize(12);
  textFont("serif");
  textStyle(NORMAL);
  textAlign(LEFT, CENTER);
  text(btn.symbol, btn.x + 18, btn.y + BTN_H / 2);

  // Label — gothic bold serif
  fill(lerp(180, rb, h), lerp(160, gb, h), lerp(130, bb, h));
  textSize(15);
  textStyle(BOLD);
  textFont("serif");
  textAlign(LEFT, CENTER);
  text(btn.label.toUpperCase(), btn.x + 42, btn.y + BTN_H / 2 - 7);

  // URL subdued
  fill(120, 100, 80, lerp(80, 160, h));
  textSize(9);
  textStyle(ITALIC);
  textFont("serif");
  let short = btn.url.replace("https://", "");
  text(short, btn.x + 42, btn.y + BTN_H / 2 + 10);

  // Arrow right
  noStroke();
  fill(rb, gb, bb, lerp(80, 240, h));
  textSize(16);
  textStyle(NORMAL);
  textFont("serif");
  textAlign(CENTER, CENTER);
  text("⟶", btn.x + btn.w - 22, btn.y + BTN_H / 2);

  // Spawn smoke on hover
  if (h > 0.6 && frameCount % 5 === 0) {
    smokeParticles.push(new Smoke(
      btn.x + random(10, btn.w - 10),
      btn.y,
      rb, gb, bb
    ));
  }
}

function drawBtnCorners(btn, r, g, b, alpha) {
  stroke(r, g, b, alpha);
  strokeWeight(1.5);
  let cs = 10; // corner size
  // TL
  line(btn.x, btn.y, btn.x + cs, btn.y);
  line(btn.x, btn.y, btn.x, btn.y + cs);
  // TR
  line(btn.x + btn.w, btn.y, btn.x + btn.w - cs, btn.y);
  line(btn.x + btn.w, btn.y, btn.x + btn.w, btn.y + cs);
  // BL
  line(btn.x, btn.y + btn.h, btn.x + cs, btn.y + btn.h);
  line(btn.x, btn.y + btn.h, btn.x, btn.y + btn.h - cs);
  // BR
  line(btn.x + btn.w, btn.y + btn.h, btn.x + btn.w - cs, btn.y + btn.h);
  line(btn.x + btn.w, btn.y + btn.h, btn.x + btn.w, btn.y + btn.h - cs);
}

// ─── Interaction ──────────────────────────────────────────────────
function mouseMoved() {
  hoveredIndex = buttons.findIndex(btn => isOverButton(btn));
  cursor(hoveredIndex >= 0 ? HAND : "default");
}

function mousePressed() {
  let clicked = buttons.findIndex(btn => isOverButton(btn));
  if (clicked >= 0) window.open(buttons[clicked].url, "_blank");
}

function isOverButton(btn) {
  return mouseX >= btn.x && mouseX <= btn.x + btn.w &&
         mouseY >= btn.y && mouseY <= btn.y + btn.h;
}
