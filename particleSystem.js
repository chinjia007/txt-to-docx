class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.hue = 0;

    // 初始化画布尺寸
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles(x, y, speed = 0) {
    const particleCount = Math.min(5 + Math.floor(speed * 3), 15);
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        glow: speed > 2,
        speedX: Math.random() * 4 * (speed/5) - 2 * (speed/5),
        x,
        y,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
        speed: () => Math.sqrt(this.speedX**2 + this.speedY**2),
        trail: [],
        maxTrail: 5,
        angle: Math.random() * Math.PI * 2,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'circle' : 'star',
        rotation: 0
      });
    }
  }

  update() {
    this.hue += 0.5;
    this.particles.forEach((p, index) => {
      p.x += p.speedX + Math.cos(p.angle) * 2;
      p.y += p.speedY + Math.sin(p.angle) * 2;
      p.opacity -= 0.02;
      p.angle += 0.02;

      if (p.opacity < 0.05) {
        this.particles.splice(index, 1);
      }
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.fillStyle = `hsla(${this.hue + p.speed()*10}, 70%, 50%, ${p.opacity})`;
        
        // 绘制拖尾效果
        p.trail.forEach((pos, index) => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `hsla(${this.hue + p.speed()*10}, 70%, 50%, ${0.2 * index/5})`;
            this.ctx.arc(pos.x, pos.y, p.size*(0.8 - index/10), 0, Math.PI*2);
            this.ctx.fill();
        });
        
        if(p.trail.length > p.maxTrail) p.trail.shift();
        p.trail.push({x: p.x, y: p.y});
        
        if(p.shape === 'star') {
          this.drawStar(p.x, p.y, p.size);
        } else {
          this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        }
        this.ctx.fill();
    });
  }

  animate() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  drawStar(x, y, size) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.rotate(this.hue * Math.PI/180);
    
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;
    
    this.ctx.beginPath();
    for(let i = 0; i < spikes; i++) {
      const angle = Math.PI/2 + i * 2*Math.PI/spikes;
      this.ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
      this.ctx.lineTo(Math.cos(angle + Math.PI/spikes) * innerRadius, Math.sin(angle + Math.PI/spikes) * innerRadius);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
}

// 初始化粒子系统
function initParticleSystem() {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.zIndex = 9999;
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const particleSystem = new ParticleSystem(canvas);
  particleSystem.animate();

  // 监听鼠标移动
  let lastMouseTime = Date.now();
  let lastX = 0, lastY = 0;
  
  document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      const deltaTime = now - lastMouseTime;
      const distance = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
      const speed = distance / (deltaTime || 1) * 10;
      
      particleSystem.createParticles(e.clientX, e.clientY, speed);
      
      lastX = e.clientX;
      lastY = e.clientY;
      lastMouseTime = now;
  });
}

export { initParticleSystem };