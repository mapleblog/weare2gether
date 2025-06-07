class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsl(${Math.random() * 60 + 300}, 100%, 70%)`;
        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.01;
        this.rotation += this.rotationSpeed;

        if (this.size > 0.2) this.size -= 0.1;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.particles = [];
        this.animationFrameId = null;
        this.lastTime = 0;
        this.particlePool = [];
        this.maxParticles = 80;
        this.init();
    }

    init() {
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        document.body.insertBefore(this.canvas, document.body.firstChild);

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
    }

    createGradient() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#ffd1dc');    // 浅粉色
        gradient.addColorStop(0.5, '#e6e6fa');  // 淡紫色
        gradient.addColorStop(1, '#ffb6c1');    // 浅玫瑰色
        return gradient;
    }

    getParticle(x, y) {
        if (this.particlePool.length > 0) {
            const particle = this.particlePool.pop();
            particle.x = x;
            particle.y = y;
            particle.size = Math.random() * 3 + 1;
            particle.speedX = Math.random() * 2 - 1;
            particle.speedY = Math.random() * 2 - 1;
            particle.color = `hsl(${Math.random() * 60 + 300}, 100%, 70%)`;
            particle.opacity = 1;
            particle.rotation = Math.random() * Math.PI * 2;
            particle.rotationSpeed = (Math.random() - 0.5) * 0.02;
            return particle;
        }
        return new Particle(x, y);
    }

    createParticles() {
        if (this.particles.length < this.maxParticles) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            this.particles.push(this.getParticle(x, y));
        }
    }

    animate(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制渐变背景
        this.ctx.fillStyle = this.createGradient();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.createParticles();
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            particle.draw(this.ctx);

            if (particle.size <= 0.2 || particle.opacity <= 0) {
                this.particlePool.push(this.particles.splice(i, 1)[0]);
            }
        }

        this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.canvas.remove();
        this.particles = [];
        this.particlePool = [];
    }
}

// 当页面加载完成后初始化粒子背景
document.addEventListener('DOMContentLoaded', () => {
    const particleBackground = new ParticleBackground();
    
    // 在页面卸载时清理资源
    window.addEventListener('unload', () => {
        particleBackground.destroy();
    });
}); 