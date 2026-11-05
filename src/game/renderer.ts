import {
  BiomeType,
  BreakableCrate,
  Bullet,
  CharacterSkin,
  EnemyBullet,
  FloatingText,
  LootDrop,
  Monster,
  Particle,
  Platform,
  PlayerStats,
  SpringPad,
} from '../types/game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
  private clouds: { x: number; y: number; speed: number; w: number; h: number }[] = [];
  private weatherParticles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = [];

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    // Generate static stars for night sky
    for (let i = 0; i < 75; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.65),
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.05 + 0.01,
      });
    }

    // Generate atmospheric clouds
    for (let i = 0; i < 5; i++) {
      this.clouds.push({
        x: (i * width) / 4 + Math.random() * 50,
        y: 40 + Math.random() * 80,
        speed: 0.2 + Math.random() * 0.3,
        w: 90 + Math.random() * 70,
        h: 24 + Math.random() * 14,
      });
    }

    // Weather ambient particles (snow / cyber motes)
    for (let i = 0; i < 40; i++) {
      this.weatherParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: Math.random() * 1.2 + 0.5,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.6 + 0.3,
      });
    }
  }

  /**
   * Safe cross-browser roundRect polyfill fallback
   */
  private safeRoundRect(x: number, y: number, w: number, h: number, radii: number | number[]) {
    const ctx = this.ctx;
    if (typeof ctx.roundRect === 'function') {
      try {
        ctx.roundRect(x, y, w, h, radii);
        return;
      } catch {
        // Fallback below
      }
    }

    let r = typeof radii === 'number' ? radii : (Array.isArray(radii) && radii.length > 0 ? radii[0] : 0);
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  public updateSkyClouds() {
    this.clouds.forEach(c => {
      c.x += c.speed;
      if (c.x > this.width + 120) {
        c.x = -120;
        c.y = 40 + Math.random() * 80;
      }
    });

    this.weatherParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y > this.height) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
    });
  }

  public drawBackground(timeOfDay: number, biome: BiomeType) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    let skyTop = '#53a8da';
    let skyBottom = '#9be3ec';
    let isNight = false;
    let nightAlpha = 0;

    if (timeOfDay >= 0.5 && timeOfDay <= 0.85) {
      isNight = true;
      nightAlpha = 1;
      skyTop = '#070913';
      skyBottom = '#131c33';
    } else if (timeOfDay > 0.4 && timeOfDay < 0.5) {
      const t = (timeOfDay - 0.4) / 0.1;
      nightAlpha = t;
      skyTop = t > 0.5 ? '#16192e' : '#2b3365';
      skyBottom = t > 0.5 ? '#582b4a' : '#f59e0b';
    } else if (timeOfDay > 0.85) {
      const t = (timeOfDay - 0.85) / 0.15;
      nightAlpha = 1 - t;
      skyTop = t > 0.5 ? '#437cb0' : '#1c223d';
      skyBottom = t > 0.5 ? '#8cd3e4' : '#d97706';
    }

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, skyTop);
    skyGrad.addColorStop(1, skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars at Night
    if (nightAlpha > 0.1) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      this.stars.forEach(s => {
        const twinkle = Math.sin(Date.now() * 0.003 + s.x) * 0.3 + 0.7;
        ctx.globalAlpha = s.alpha * nightAlpha * twinkle;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      });
      ctx.restore();
    }

    // Celestial Body (Sun & Moon)
    const sunAngle = timeOfDay * Math.PI * 2 - Math.PI / 2;
    const celestialRadius = w * 0.42;
    const centerX = w * 0.5;
    const centerY = h * 0.7;

    const sunX = centerX + Math.cos(sunAngle) * celestialRadius;
    const sunY = centerY + Math.sin(sunAngle) * (celestialRadius * 0.75);

    const moonAngle = sunAngle + Math.PI;
    const moonX = centerX + Math.cos(moonAngle) * celestialRadius;
    const moonY = centerY + Math.sin(moonAngle) * (celestialRadius * 0.75);

    // Draw Sun with Radial Rays
    if (sunY < h - 40) {
      ctx.save();
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 55);
      sunGrad.addColorStop(0, 'rgba(255, 230, 120, 0.95)');
      sunGrad.addColorStop(0.5, 'rgba(255, 170, 50, 0.45)');
      sunGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 55, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffdf4a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 19, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    // Draw Moon
    if (moonY < h - 40) {
      ctx.save();
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 8, moonX, moonY, 44);
      moonGrad.addColorStop(0, 'rgba(226, 232, 240, 0.85)');
      moonGrad.addColorStop(0.6, 'rgba(148, 163, 184, 0.35)');
      moonGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 44, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 17, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(moonX - 4, moonY - 3, 3, 0, Math.PI * 2);
      ctx.arc(moonX + 5, moonY + 2, 4, 0, Math.PI * 2);
      ctx.arc(moonX - 2, moonY + 6, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Drifting Clouds
    ctx.save();
    this.clouds.forEach(c => {
      ctx.fillStyle = isNight ? 'rgba(30, 41, 59, 0.45)' : 'rgba(255, 255, 255, 0.6)';
      this.safeRoundRect(c.x, c.y, c.w, c.h, 12);
      ctx.fill();
      this.safeRoundRect(c.x + 14, c.y - 10, c.w * 0.6, c.h, 10);
      ctx.fill();
    });
    ctx.restore();

    // Biome-Specific Background Elements
    if (biome === 'MOUNTAIN') {
      this.drawMountainScenery(isNight);
    } else if (biome === 'BEACH') {
      this.drawBeachScenery(isNight);
    } else if (biome === 'CITY') {
      this.drawCityScenery(isNight);
    }

    // Weather Particles Layer
    ctx.save();
    this.weatherParticles.forEach(p => {
      ctx.globalAlpha = p.alpha;
      if (biome === 'MOUNTAIN') {
        ctx.fillStyle = '#ffffff'; // Snow flurries
      } else if (biome === 'BEACH') {
        ctx.fillStyle = '#fef08a'; // Sand glints
      } else {
        ctx.fillStyle = '#38bdf8'; // Cyber rain / motes
      }
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.restore();
  }

  private drawMountainScenery(isNight: boolean) {
    const ctx = this.ctx;
    const h = this.height;

    // Distant mountain layer 1
    ctx.fillStyle = isNight ? '#131b2e' : '#475569';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(80, h - 180);
    ctx.lineTo(190, h);
    ctx.lineTo(280, h - 220);
    ctx.lineTo(410, h);
    ctx.lineTo(540, h - 260);
    ctx.lineTo(670, h);
    ctx.lineTo(760, h - 190);
    ctx.lineTo(800, h - 150);
    ctx.lineTo(800, h);
    ctx.closePath();
    ctx.fill();

    // Mid-ground mountains layer 2 with snowy tips
    ctx.fillStyle = isNight ? '#1e293b' : '#64748b';
    ctx.beginPath();
    ctx.moveTo(30, h);
    ctx.lineTo(160, h - 150);
    ctx.lineTo(300, h);
    ctx.lineTo(440, h - 190);
    ctx.lineTo(600, h);
    ctx.lineTo(720, h - 140);
    ctx.lineTo(800, h);
    ctx.closePath();
    ctx.fill();

    // Snow caps
    ctx.fillStyle = isNight ? '#94a3b8' : '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(160, h - 150);
    ctx.lineTo(140, h - 125);
    ctx.lineTo(160, h - 130);
    ctx.lineTo(180, h - 125);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(440, h - 190);
    ctx.lineTo(415, h - 160);
    ctx.lineTo(440, h - 165);
    ctx.lineTo(465, h - 160);
    ctx.closePath();
    ctx.fill();

    // Pine Trees
    ctx.fillStyle = isNight ? '#0f172a' : '#1e3a1e';
    const treeX = [40, 110, 310, 500, 680, 770];
    treeX.forEach(tx => {
      ctx.beginPath();
      ctx.moveTo(tx, h - 30);
      ctx.lineTo(tx + 12, h - 70);
      ctx.lineTo(tx + 24, h - 30);
      ctx.closePath();
      ctx.fill();
    });
  }

  private drawBeachScenery(isNight: boolean) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.fillStyle = isNight ? '#0c2340' : '#0284c7';
    ctx.fillRect(0, h - 130, w, 60);

    const waveOffset = (Date.now() * 0.002) % (Math.PI * 2);
    ctx.fillStyle = isNight ? '#1e3a8a' : '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, h - 90);
    for (let x = 0; x <= w; x += 30) {
      const y = h - 95 + Math.sin(x * 0.03 + waveOffset) * 6;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h - 60);
    ctx.lineTo(0, h - 60);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 40) {
      const y = h - 95 + Math.sin(x * 0.03 + waveOffset) * 6;
      ctx.moveTo(x - 10, y);
      ctx.lineTo(x + 10, y);
    }
    ctx.stroke();

    ctx.fillStyle = isNight ? '#172554' : '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(650, h - 110, 70, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isNight ? '#0f172a' : '#713f12';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(650, h - 110);
    ctx.quadraticCurveTo(660, h - 145, 655, h - 165);
    ctx.stroke();

    ctx.fillStyle = isNight ? '#064e3b' : '#15803d';
    const leaves = [-0.6, -0.2, 0.2, 0.6];
    leaves.forEach(ang => {
      ctx.beginPath();
      ctx.ellipse(655 + ang * 25, h - 165 + Math.abs(ang) * 6, 18, 5, ang, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private drawCityScenery(isNight: boolean) {
    const ctx = this.ctx;
    const h = this.height;

    ctx.fillStyle = isNight ? '#0b0f19' : '#334155';
    const bldgs = [
      { x: 30, w: 75, h: 220 },
      { x: 130, w: 90, h: 260 },
      { x: 245, w: 80, h: 200 },
      { x: 350, w: 100, h: 280 },
      { x: 480, w: 70, h: 230 },
      { x: 575, w: 95, h: 270 },
      { x: 690, w: 85, h: 210 },
    ];

    bldgs.forEach(b => {
      ctx.fillRect(b.x, h - b.h, b.w, b.h);

      ctx.fillStyle = isNight ? 'rgba(253, 224, 71, 0.65)' : 'rgba(255, 255, 255, 0.35)';
      for (let wy = h - b.h + 20; wy < h - 40; wy += 22) {
        for (let wx = b.x + 10; wx < b.x + b.w - 12; wx += 16) {
          if ((wx + wy) % 5 !== 0) {
            ctx.fillRect(wx, wy, 8, 10);
          }
        }
      }
      ctx.fillStyle = isNight ? '#0b0f19' : '#334155';
    });

    // In-game Physical SHOP Building from sketch
    ctx.save();
    const shopX = 280;
    const shopY = h - 145;
    const shopW = 120;
    const shopH = 115;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(shopX, shopY, shopW, shopH);
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.strokeRect(shopX, shopY, shopW, shopH);

    const pulse = Math.sin(Date.now() * 0.005) * 0.15 + 0.85;
    ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
    ctx.fillRect(shopX + 15, shopY + 12, shopW - 30, 26);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.strokeRect(shopX + 15, shopY + 12, shopW - 30, 26);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SHOP ⚡', shopX + shopW / 2, shopY + 30);

    ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
    ctx.fillRect(shopX + 12, shopY + 48, 42, 45);
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(shopX + 12, shopY + 48, 42, 45);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(shopX + 22, shopY + 68, 20, 6);
    ctx.fillRect(shopX + 32, shopY + 74, 5, 8);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(shopX + 66, shopY + 45, 42, 70);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(shopX + 66, shopY + 45, 42, 70);

    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 9px "Press Start 2P", monospace';
    ctx.fillText('ENTER', shopX + 87, shopY + 40);

    ctx.restore();
  }

  public drawPlatforms(platforms: Platform[], biome: BiomeType) {
    const ctx = this.ctx;

    platforms.forEach(p => {
      ctx.save();
      if (p.type === 'moving') {
        // High-tech magnetic hover platform
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(p.x, p.y, p.w, 3);

        // Hover thruster glow beneath
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.ellipse(p.x + p.w / 2, p.y + p.h + 4, p.w * 0.4, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (biome === 'BEACH') {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = '#b45309';
        for (let px = p.x; px < p.x + p.w; px += 20) {
          ctx.fillRect(px, p.y, 2, p.h);
        }
        ctx.fillStyle = '#fde047';
        ctx.fillRect(p.x, p.y, p.w, 4);
      } else if (biome === 'CITY') {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(p.x, p.y, p.w, 3);

        ctx.fillStyle = '#475569';
        for (let rx = p.x + 8; rx < p.x + p.w; rx += 25) {
          ctx.beginPath();
          ctx.arc(rx, p.y + 10, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        ctx.fillStyle = '#22c55e';
        ctx.fillRect(p.x, p.y, p.w, 5);

        ctx.fillStyle = '#334155';
        ctx.fillRect(p.x + 5, p.y + 10, p.w - 10, 3);
        ctx.fillRect(p.x + 15, p.y + 18, Math.max(0, p.w - 30), 2);
      }

      ctx.restore();
    });
  }

  public drawSprings(springs: SpringPad[]) {
    const ctx = this.ctx;
    springs.forEach(s => {
      ctx.save();
      const compress = s.animTimer > 0 ? Math.sin(s.animTimer * 0.4) * 4 : 0;
      // Base
      ctx.fillStyle = '#334155';
      ctx.fillRect(s.x, s.y + s.h - 4, s.w, 4);

      // Coils
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(s.x + 4, s.y + s.h - 4);
      ctx.lineTo(s.x + s.w / 2, s.y + compress + 3);
      ctx.lineTo(s.x + s.w - 4, s.y + s.h - 4);
      ctx.stroke();

      // Top Plate
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(s.x + 2, s.y + compress, s.w - 4, 4);

      // Up arrow
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('▲', s.x + s.w / 2, s.y + compress + 4);

      ctx.restore();
    });
  }

  public drawCrates(crates: BreakableCrate[]) {
    const ctx = this.ctx;
    crates.forEach(c => {
      ctx.save();
      ctx.fillStyle = '#854d0e'; // Wood crate
      ctx.fillRect(c.x, c.y, c.w, c.h);

      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 2;
      ctx.strokeRect(c.x, c.y, c.w, c.h);

      // Diagonal cross brace
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x + c.w, c.y + c.h);
      ctx.moveTo(c.x + c.w, c.y);
      ctx.lineTo(c.x, c.y + c.h);
      ctx.stroke();

      // Damage crack if damaged
      if (c.hp < c.maxHp) {
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c.x + 6, c.y + 4);
        ctx.lineTo(c.x + 12, c.y + 11);
        ctx.lineTo(c.x + 16, c.y + 8);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  public drawGPPlayer(player: PlayerStats, skin: CharacterSkin) {
    const ctx = this.ctx;
    ctx.save();

    if (player.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.translate(player.x + player.w / 2, player.y + player.h / 2);

    if (player.facing === 'left') {
      ctx.scale(-1, 1);
    }

    const colors = skin.colors;

    // Movement speed blur trail if moving fast or dashing
    if (player.isBashing || Math.abs(player.vx) > 4) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = skin.colors.trailColor || colors.shield;
      ctx.fillRect(-16, -20, 26, 40);
      ctx.restore();
    }

    // 1. FLUFFY HAIR
    ctx.fillStyle = colors.hair;
    this.safeRoundRect(-14, -25, 28, 14, 8);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-8, -24, 7, 0, Math.PI * 2);
    ctx.arc(2, -26, 8, 0, Math.PI * 2);
    ctx.arc(10, -23, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(-6, -26, 8, 3);

    // 2. HEAD & ROUND GLASSES
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-10, -14, 20, 13);
    ctx.fillRect(-12, -10, 2, 4);

    ctx.strokeStyle = '#090d16';
    ctx.lineWidth = 2.5;

    ctx.strokeRect(-8, -12, 7, 7);
    ctx.strokeRect(2, -12, 7, 7);
    ctx.beginPath();
    ctx.moveTo(-1, -9);
    ctx.lineTo(2, -9);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-7, -11, 2, 2);
    ctx.fillRect(3, -11, 2, 2);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5, -10, 3, 3);
    ctx.fillRect(5, -10, 3, 3);

    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, -3, 4, 1.5);

    // 3. BODY / SHIRT WITH "GP" EMBLEM
    ctx.fillStyle = colors.shirt;
    this.safeRoundRect(-11, -1, 22, 19, 3);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-11, 15, 22, 3);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-3, 15, 6, 3);

    ctx.fillStyle = colors.emblem;
    ctx.font = '900 9px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GP', 0, 11);

    // 4. PANTS & LEGS
    ctx.fillStyle = colors.pants;

    if (!player.grounded) {
      // Signature airborne jump pose: SPREAD LEGS from user sketch
      ctx.save();
      ctx.translate(-7, 18);
      ctx.rotate(-0.4);
      ctx.fillRect(-4, 0, 7, 12);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-5, 9, 8, 4);
      ctx.restore();

      ctx.save();
      ctx.translate(6, 18);
      ctx.rotate(0.4);
      ctx.fillStyle = colors.pants;
      ctx.fillRect(-3, 0, 7, 12);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-2, 9, 8, 4);
      ctx.restore();

      if (player.hasDoubleJump) {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-11, 31, 3 + Math.sin(Date.now() * 0.03) * 1.5, 0, Math.PI * 2);
        ctx.arc(11, 31, 3 + Math.cos(Date.now() * 0.03) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (Math.abs(player.vx) > 0.2) {
      const legOffset = Math.sin(player.animTimer * 0.25) * 6;
      ctx.fillRect(-8 + legOffset, 18, 6, 12);
      ctx.fillRect(2 - legOffset, 18, 6, 12);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-9 + legOffset, 27, 8, 3.5);
      ctx.fillRect(1 - legOffset, 27, 8, 3.5);
    } else {
      const idleBob = Math.sin(player.animTimer * 0.08) * 0.8;
      ctx.fillRect(-8, 18 + idleBob, 6, 12 - idleBob);
      ctx.fillRect(2, 18 + idleBob, 6, 12 - idleBob);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-9, 27, 8, 3.5);
      ctx.fillRect(1, 27, 8, 3.5);
    }

    // 5. HANDS WITH FINGERS & WEAPON
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-15, 3, 5, 5);
    ctx.fillRect(-16, 5, 2, 2);

    ctx.fillStyle = '#fde047';
    ctx.fillRect(7, 3, 5, 5);
    ctx.fillRect(12, 4, 3, 3);

    // Dynamic weapon color based on equipped weapon
    let weaponColor = '#334155';
    if (player.equippedWeapon === 'plasma') weaponColor = '#a855f7';
    if (player.equippedWeapon === 'spread') weaponColor = '#ea580c';
    if (player.equippedWeapon === 'railgun') weaponColor = '#16a34a';
    if (player.equippedWeapon === 'missiles') weaponColor = '#dc2626';

    ctx.fillStyle = weaponColor;
    ctx.fillRect(10, 2, 14, 5);
    ctx.fillRect(21, 0, 2, 2);
    ctx.fillRect(12, 7, 4, 6);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(22, 2, 2, 5);

    // Muzzle flash when shooting
    if (player.shootTimer > 8) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(27, 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(29, 4, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. ACTIVE SHIELD
    if (player.shieldActive && player.shield > 0) {
      ctx.save();
      const shieldRadius = 32;
      const shieldPulse = Math.sin(Date.now() * 0.01) * 2;

      const shieldGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, shieldRadius + 6);
      shieldGrad.addColorStop(0, 'rgba(6, 182, 212, 0.05)');
      shieldGrad.addColorStop(0.8, `${colors.shield}22`);
      shieldGrad.addColorStop(1, `${colors.shield}66`);
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(4, 0, shieldRadius + shieldPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = colors.shield;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(4, 0, shieldRadius + shieldPulse, -Math.PI * 0.65, Math.PI * 0.65);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(4, 0, shieldRadius - 4, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      const orbitAng = (Date.now() * 0.008) % (Math.PI * 2);
      const ox = 4 + Math.cos(orbitAng) * (shieldRadius + shieldPulse);
      const oy = Math.sin(orbitAng) * (shieldRadius + shieldPulse);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  public drawMonsters(monsters: Monster[]) {
    const ctx = this.ctx;

    monsters.forEach(m => {
      ctx.save();

      // Hit Flash effect (turns monster bright yellow/white for 3 frames)
      if (m.hitFlash && m.hitFlash > 0) {
        ctx.filter = 'brightness(2.5)';
      }

      if (m.type === 'slime') {
        const squish = Math.sin(m.animTimer * 0.15) * 3;
        const sw = m.w + squish;
        const sh = m.h - squish;

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(m.x + m.w / 2, m.y + m.h - sh / 2, sw / 2, sh / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(m.x + 4, m.y + m.h - 2, 4, 0, Math.PI);
        ctx.arc(m.x + m.w / 2, m.y + m.h - 1, 5, 0, Math.PI);
        ctx.arc(m.x + m.w - 4, m.y + m.h - 2, 4, 0, Math.PI);
        ctx.fill();

        const eyeY = m.y + m.h / 2 - 2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(m.x + m.w / 2, eyeY, 6.5, 0, Math.PI * 2);
        ctx.fill();

        const pupilOffset = m.vx > 0 ? 2 : -2;
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(m.x + m.w / 2 + pupilOffset, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(m.x + m.w / 2 - 4, m.y + 6, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'snake') {
        const bob = Math.sin(m.animTimer * 0.1) * 2;
        ctx.fillStyle = '#a855f7';

        this.safeRoundRect(m.x + 6, m.y + 14 + bob, 20, 22, 6);
        ctx.fill();

        ctx.fillRect(m.x, m.y + bob, 24, 14);

        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(m.x + 8, m.y + 18 + bob, 16, 3);
        ctx.fillRect(m.x + 8, m.y + 26 + bob, 16, 3);

        ctx.fillStyle = '#facc15';
        ctx.fillRect(m.x + 4, m.y + 3 + bob, 3, 3);
        ctx.fillRect(m.x + 12, m.y + 3 + bob, 3, 3);

        const tongueOut = Math.sin(m.animTimer * 0.2) > 0.4;
        if (tongueOut) {
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(m.x - 7, m.y + 7 + bob, 7, 2);
          ctx.fillRect(m.x - 9, m.y + 5 + bob, 2, 2);
          ctx.fillRect(m.x - 9, m.y + 9 + bob, 2, 2);
        }
      } else if (m.type === 'drone') {
        const flap = Math.sin(m.animTimer * 0.3) * 4;
        ctx.fillStyle = '#3b82f6';
        this.safeRoundRect(m.x + 4, m.y + 8, 20, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(m.x - 6, m.y + 6 + flap, 10, 4);
        ctx.fillRect(m.x + 24, m.y + 6 - flap, 10, 4);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(m.x + 14, m.y + 16, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (m.type === 'boss') {
        const bPulse = Math.sin(m.animTimer * 0.08) * 3;
        ctx.fillStyle = m.hp < m.maxHp * 0.4 ? '#991b1b' : '#dc2626';
        ctx.fillRect(m.x, m.y + bPulse, m.w, m.h);

        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 4;
        ctx.strokeRect(m.x, m.y + bPulse, m.w, m.h);

        // Core
        ctx.fillStyle = m.hp < m.maxHp * 0.4 ? '#ef4444' : '#facc15';
        ctx.beginPath();
        ctx.arc(m.x + m.w / 2, m.y + m.h / 2 + bPulse, 14, 0, Math.PI * 2);
        ctx.fill();

        // Crown Spikes
        ctx.fillStyle = '#7f1d1d';
        ctx.beginPath();
        ctx.moveTo(m.x + 8, m.y + bPulse);
        ctx.lineTo(m.x + 14, m.y - 14 + bPulse);
        ctx.lineTo(m.x + 20, m.y + bPulse);
        ctx.moveTo(m.x + m.w - 20, m.y + bPulse);
        ctx.lineTo(m.x + m.w - 14, m.y - 14 + bPulse);
        ctx.lineTo(m.x + m.w - 8, m.y + bPulse);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(m.name || 'BOSS', m.x + m.w / 2, m.y - 18 + bPulse);
      }

      if (m.hp < m.maxHp && m.type !== 'boss') {
        const barW = Math.max(28, m.w);
        const barH = 4;
        const barX = m.x + m.w / 2 - barW / 2;
        const barY = m.y - 8;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(barX, barY, (m.hp / m.maxHp) * barW, barH);
      }

      ctx.restore();
    });
  }

  public drawBullets(bullets: Bullet[]) {
    const ctx = this.ctx;
    bullets.forEach(b => {
      ctx.save();
      const bColor = b.color || '#38bdf8';
      ctx.fillStyle = bColor;

      ctx.shadowColor = bColor;
      ctx.shadowBlur = 10;

      if (b.isLaser) {
        // Piercing railgun beam
        ctx.fillRect(b.x - 6, b.y - 3, 26, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x, b.y, 18, 3);
      } else if (b.isHoming) {
        // Homing micro rocket
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(b.x - 4, b.y - 2, 12, 6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(b.x - 6, b.y - 1, 3, 4); // Thruster spark
      } else {
        this.safeRoundRect(b.x, b.y, 11, 5, 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(b.x + 3, b.y + 1, 4, 3);
      }
      ctx.restore();
    });
  }

  public drawEnemyBullets(enemyBullets: EnemyBullet[]) {
    const ctx = this.ctx;
    enemyBullets.forEach(eb => {
      ctx.save();
      const color = eb.isReflected ? '#38bdf8' : eb.color || '#a855f7';
      const size = eb.size || 6;

      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;

      ctx.beginPath();
      ctx.arc(eb.x, eb.y, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  public drawLootDrops(loot: LootDrop[]) {
    const ctx = this.ctx;

    loot.forEach(item => {
      ctx.save();
      const floatBob = Math.sin(Date.now() * 0.008 + item.x) * 3;
      const y = item.y + floatBob;

      if (item.type === 'coin') {
        const spin = Math.sin(Date.now() * 0.01 + item.x);
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(item.x, y, 7 * Math.abs(spin) + 2, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('G', item.x, y + 3);
      } else if (item.type === 'gem') {
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.moveTo(item.x, y - 8);
        ctx.lineTo(item.x + 8, y);
        ctx.lineTo(item.x, y + 8);
        ctx.lineTo(item.x - 8, y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (item.type === 'heart') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(item.x - 3.5, y - 3, 4, 0, Math.PI * 2);
        ctx.arc(item.x + 3.5, y - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(item.x - 7, y - 2);
        ctx.lineTo(item.x, y + 6);
        ctx.lineTo(item.x + 7, y - 2);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'battery') {
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(item.x - 4, y - 5, 8, 10);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(item.x - 2, y - 7, 4, 2);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(item.x - 2, y - 2, 4, 4);
      } else if (item.type === 'star') {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(item.x, y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  public drawParticles(particles: Particle[]) {
    const ctx = this.ctx;
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'spark') {
        ctx.fillRect(p.x, p.y, p.size * 2, 1.5);
      } else if (p.shape === 'ring') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      ctx.restore();
    });
  }

  public drawFloatingTexts(floatingTexts: FloatingText[]) {
    const ctx = this.ctx;
    floatingTexts.forEach(ft => {
      ctx.save();
      const alpha = ft.life / ft.maxLife;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 11px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
