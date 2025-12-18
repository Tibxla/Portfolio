/**
 * Background Effects Module
 * Contains 5 interactive canvas themes
 */

export const initBackground = () => {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');

    // Resize handling
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Mouse Tracking
    const mouse = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        radius: 150
    }

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    // ----------------------------------------------------------------------
    // THEME 1: CONSTELLATION (Network)
    // ----------------------------------------------------------------------
    const initConstellation = () => {
        let particlesArray = [];
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.dx = (Math.random() * 0.4) - 0.2;
                this.dy = (Math.random() * 0.4) - 0.2;
                this.size = Math.random() * 2 + 1;
                this.color = `rgba(59, 130, 246, ${Math.random() * 0.6})`;
            }
            update() {
                if (this.x > canvas.width || this.x < 0) this.dx = -this.dx;
                if (this.y > canvas.height || this.y < 0) this.dy = -this.dy;

                // Mouse repulsion
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const angle = Math.atan2(dy, dx);
                    this.x -= Math.cos(angle) * 2;
                    this.y -= Math.sin(angle) * 2;
                }

                this.x += this.dx;
                this.y += this.dy;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            particlesArray = [];
            let count = (canvas.width * canvas.height) / 12000;
            for (let i = 0; i < count; i++) particlesArray.push(new Particle());
        }

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let p of particlesArray) p.update();
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    let d = Math.hypot(particlesArray[a].x - particlesArray[b].x, particlesArray[a].y - particlesArray[b].y);
                    if (d < 120) {
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 - d / 240})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }
        init();
        animate();
    }

    // ----------------------------------------------------------------------
    // THEME 2: CIRCUIT FLOW (Replaces Matrix)
    // ----------------------------------------------------------------------
    const initCircuitFlow = () => {
        const gridSize = 40;
        const particles = [];

        class CircuitParticle {
            constructor() {
                this.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
                this.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
                this.dir = Math.floor(Math.random() * 4); // 0:right, 1:down, 2:left, 3:up
                this.speed = gridSize / 10;
                this.history = [];
                this.maxLength = Math.random() * 20 + 10;
                // Darker base state
                this.baseColor = Math.random() > 0.9 ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)';
                this.activeColor = Math.random() > 0.9 ? '#fbbf24' : '#3b82f6'; // Bright when active
                this.color = this.baseColor;
                this.life = Math.random() * 100 + 50;
            }
            update() {
                this.history.push({ x: this.x, y: this.y });
                if (this.history.length > this.maxLength) this.history.shift();

                // INTERACTIVITY: Magnet Effect
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 200) {
                    this.color = this.activeColor; // Light up!
                    // Magnetic pull: steer towards mouse
                    if (Math.random() < 0.2) { // Agility
                        if (Math.abs(dx) > Math.abs(dy)) {
                            this.dir = dx > 0 ? 0 : 2;
                        } else {
                            this.dir = dy > 0 ? 1 : 3;
                        }
                    }
                } else {
                    this.color = this.baseColor;
                }

                switch (this.dir) {
                    case 0: this.x += this.speed; break;
                    case 1: this.y += this.speed; break;
                    case 2: this.x -= this.speed; break;
                    case 3: this.y -= this.speed; break;
                }

                // Random turn or boundary check
                if (Math.random() < 0.05 ||
                    this.x < 0 || this.x > canvas.width ||
                    this.y < 0 || this.y > canvas.height) {

                    this.dir = Math.floor(Math.random() * 4);
                }

                this.life--;
                if (this.life <= 0) {
                    this.x = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
                    this.y = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
                    this.history = [];
                    this.life = Math.random() * 100 + 50;
                }
            }
            draw() {
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                // Only glow if active
                if (this.color === this.activeColor) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = this.color;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.beginPath();
                if (this.history.length > 0) ctx.moveTo(this.history[0].x, this.history[0].y);
                for (let p of this.history) ctx.lineTo(p.x, p.y);
                ctx.stroke();

                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < 40; i++) particles.push(new CircuitParticle());

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Very subtle trail
            ctx.fillStyle = 'rgba(3, 4, 7, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let p of particles) {
                p.update();
                p.draw();
            }
        }
        animate();
    }

    // ----------------------------------------------------------------------
    // THEME 3: DEEP SPACE WARP (Slower Interaction)
    // ----------------------------------------------------------------------
    const initDeepSpace = () => {
        let stars = [];
        const numStars = 600;

        class Star {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = (Math.random() - 0.5) * canvas.width * 2;
                this.y = (Math.random() - 0.5) * canvas.height * 2;
                this.z = Math.random() * canvas.width;
                this.color = Math.random() > 0.8 ? '#fbbf24' : '#3b82f6';
            }
            update() {
                this.z -= 4;

                // SLOWED DOWN INTERACTION: 0.5 multiplier instead of 2 or direct mapping
                const offsetX = (mouse.x - canvas.width / 2) * 0.1;
                const offsetY = (mouse.y - canvas.height / 2) * 0.1;

                if (this.z <= 0) this.reset();

                const sx = (this.x / this.z) * canvas.width + canvas.width / 2 - (offsetX * (canvas.width / this.z));
                const sy = (this.y / this.z) * canvas.height + canvas.height / 2 - (offsetY * (canvas.height / this.z));

                const r = Math.max(0.1, (1 - this.z / canvas.width) * 3);

                ctx.beginPath();
                ctx.arc(sx, sy, r, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        for (let i = 0; i < numStars; i++) stars.push(new Star());

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.fillStyle = 'rgba(3, 4, 7, 0.4)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let s of stars) s.update();
        }
        animate();
    }

    // ----------------------------------------------------------------------
    // THEME 4: NEON FLOW (Fluid Particles)
    // ----------------------------------------------------------------------
    const initNeonFlow = () => {
        const particles = [];
        const particleCount = 700;
        const flowScale = 0.005;
        let time = 0;
        
        class FlowParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = 0;
                this.vy = 0;
                this.history = [];
                this.maxHistory = 8;
                this.speed = Math.random() * 2 + 1.5;
                // High contrast premium colors: Cyan to Electric Purple
                this.hue = Math.random() > 0.5 ? 190 + Math.random() * 20 : 260 + Math.random() * 20;
            }

            update() {
                // Evolving Flow Field
                // Angle based on position and time
                const angle = (Math.cos(this.x * flowScale + time) + Math.sin(this.y * flowScale + time)) * Math.PI;
                
                // Target velocity vector based on angle
                const targetVx = Math.cos(angle) * this.speed;
                const targetVy = Math.sin(angle) * this.speed;

                // Smoothly steer towards target velocity (Inertia)
                this.vx += (targetVx - this.vx) * 0.1;
                this.vy += (targetVy - this.vy) * 0.1;

                // MOUSE INTERACTION DISTURBANCE
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 200) {
                    const repulsionForce = (200 - dist) * 0.05;
                    const angleToMouse = Math.atan2(dy, dx);
                    // Push away perpendicular to radius for a "swirl" feel, or just radial repulsion
                    // Let's do radial repulsion + slight swirl
                    this.vx -= Math.cos(angleToMouse) * repulsionForce;
                    this.vy -= Math.sin(angleToMouse) * repulsionForce;
                }

                this.x += this.vx;
                this.y += this.vy;

                // Wrap around edges
                if (this.x < 0) { this.x = canvas.width; this.history = []; }
                else if (this.x > canvas.width) { this.x = 0; this.history = []; }
                if (this.y < 0) { this.y = canvas.height; this.history = []; }
                else if (this.y > canvas.height) { this.y = 0; this.history = []; }

                // Trail History
                this.history.push({x: this.x, y: this.y});
                if (this.history.length > this.maxHistory) this.history.shift();
            }

            draw() {
                 if (this.history.length < 2) return;
                 
                 ctx.beginPath();
                 ctx.moveTo(this.history[0].x, this.history[0].y);
                 for (let i = 1; i < this.history.length; i++) {
                     ctx.lineTo(this.history[i].x, this.history[i].y);
                 }
                 
                 // Fade out tail
                 ctx.strokeStyle = `hsla(${this.hue}, 90%, 60%, 0.075)`;
                 ctx.lineWidth = 1.5;
                 ctx.stroke();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new FlowParticle());
        }

        const animate = () => {
            requestAnimationFrame(animate);
            time += 0.005; 
            
            // Motion Blur / Fade effect
            ctx.fillStyle = 'rgba(3, 4, 7, 0.2)'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            for (let p of particles) {
                p.update();
                p.draw();
            }
        }
        animate();
    }

    // ----------------------------------------------------------------------
    // THEME 5: HEX GRID SCANNERS (Darker)
    // ----------------------------------------------------------------------
    const initHexGrid = () => {
        const hexSize = 30;
        const grid = [];

        const rows = Math.ceil(canvas.height / (hexSize * 1.5));
        const cols = Math.ceil(canvas.width / (hexSize * Math.sqrt(3)));

        class Hex {
            constructor(c, r) {
                this.c = c;
                this.r = r;
                this.x = c * hexSize * Math.sqrt(3) + (r % 2) * (hexSize * Math.sqrt(3) / 2);
                this.y = r * hexSize * 1.5;
                this.opacity = 0;
            }
            draw() {
                if (this.opacity <= 0.01) return;

                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = 2 * Math.PI / 6 * i;
                    const x_i = this.x + hexSize * Math.cos(angle);
                    const y_i = this.y + hexSize * Math.sin(angle);
                    if (i === 0) ctx.moveTo(x_i, y_i);
                    else ctx.lineTo(x_i, y_i);
                }
                ctx.closePath();

                // DARKER: reduced opacity multipliers
                ctx.strokeStyle = `rgba(59, 130, 246, ${this.opacity * 0.5})`; // Half brightness stroke
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity * 0.05})`; // Very faint fill
                ctx.fill();
            }
            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    this.opacity = Math.min(this.opacity + 0.1, 0.6); // Cap at 0.6 instead of 0.8
                } else {
                    this.opacity = Math.max(this.opacity - 0.02, 0);
                }
                this.draw();
            }
        }

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                grid.push(new Hex(c, r));
            }
        }

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let h of grid) h.update();
        }
        animate();
    }

    // ----------------------------------------------------------------------
    // RANDOMIZER
    // ----------------------------------------------------------------------
    const effects = [initConstellation,initCircuitFlow,initDeepSpace,initNeonFlow, initHexGrid];
    const randomIndex = Math.floor(Math.random() * effects.length);
    console.log("Loading Background Effect:", randomIndex);
    effects[randomIndex]();
}
