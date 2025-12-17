/**
 * Premium Portfolio Interactive Scripts
 * 5 Random Interactive Backgrounds
 */

const initBackground = () => {
    const canvas = document.getElementById('bg-canvas');
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
        mouse.x = event.x;
        mouse.y = event.y;
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
                this.color = `rgba(59, 130, 246, ${Math.random() * 0.15})`;
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
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.1 - d / 1200})`;
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
    // THEME 4: DATA WAVES (Improved Interaction)
    // ----------------------------------------------------------------------
    const initDataWaves = () => {
        const rows = 40;
        const cols = 60;
        const gapX = canvas.width / cols;
        const gapY = canvas.height / rows;

        const animate = () => {
            requestAnimationFrame(animate);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const time = Date.now() * 0.002;

            for (let j = 0; j < rows; j++) {
                ctx.beginPath();
                for (let i = 0; i < cols; i++) {
                    const x = i * gapX;
                    const baseX = x;
                    const baseY = j * gapY * 1.5 - (rows * gapY * 0.25); // Center vertically more or less

                    // Distance from mouse for local affect
                    const dx = mouse.x - baseX;
                    const dy = mouse.y - baseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Local distortion based on mouse distance
                    // If close, wave gets bigger and faster
                    let localAmp = 0;
                    if (dist < 300) {
                        localAmp = (300 - dist) * 0.2; // Max 60px push
                    }

                    const y = baseY + Math.sin(i * 0.2 + time + (j * 0.1)) * (10 + localAmp * 0.5);

                    // Mouse also pushes the lines apart vertically slightly
                    const pushY = (dist < 200) ? (200 - dist) * 0.2 : 0;

                    if (i === 0) ctx.moveTo(x, y + pushY);
                    else ctx.lineTo(x, y + pushY);
                }
                const alpha = 0.3 - (Math.abs(j - rows / 2) / rows) * 0.3; // Fade edges
                ctx.strokeStyle = `rgba(59, 130, 246, ${alpha + 0.1})`;
                ctx.stroke();
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
    const effects = [initConstellation, initCircuitFlow, initDeepSpace, initDataWaves, initHexGrid];
    const randomIndex = Math.floor(Math.random() * effects.length);
    console.log("Loading Background Effect:", randomIndex);
    effects[randomIndex]();
}


// --------------------------------------------------------------------------
// ID CARD PHYSICS
// --------------------------------------------------------------------------
const initIDCard = () => {
    const card = document.getElementById('id-card');
    const container = document.getElementById('id-card-container');
    const canvas = document.getElementById('lanyard');

    if (!card || !container || !canvas) return;

    const ctx = canvas.getContext('2d');

    // Physics Config - Realistic physics simulation
    const config = {
        segmentCount: 30, // Fewer segments for cleaner chain behavior
        segmentLength: 18,
        gravity: 0.6, // Realistic gravity (~9.8m/s² scaled for 60fps)
        friction: 0.995, // Very low friction - realistic energy loss
        airResistance: 0.998, // Minimal air drag for natural motion
        iterations: 20, // High iterations for stable constraint solving
        strapWidth: 15,
        pivotX: 0,
        pivotY: 0,
        // Wind simulation - disabled for pure physics
        windEnabled: false,
        windStrength: 0.08,
        windFrequency: 0.001,
        // Bounce damping when hitting limits
        bounceDamping: 0.7,
        // Maximum swing angle (radians)
        maxSwingAngle: Math.PI / 2.5
    };

    // State
    const nodes = [];
    let isDragging = false;
    let dragNode = null;
    let lastMouse = { x: 0, y: 0 };
    let dragOffset = { x: 0, y: 0 };
    let dragVelocity = { x: 0, y: 0 };

    // Resize & Init
    const resize = () => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        config.pivotX = window.innerWidth * 0.75; // Right side (75%)
        config.pivotY = 0; // Top of container

        // Local length: scale segment length to fit window height
        // Target length: ~25% of window height (reduced from 35%)
        const maxRopeLength = window.innerHeight * 0.15;
        config.segmentLength = Math.min(15, maxRopeLength / config.segmentCount);

        // Reset or init nodes if empty
        if (nodes.length === 0) {
            initNodes();
        } else {
            // Update pivot pos of first node (pinned)
            nodes[0].x = config.pivotX;
            nodes[0].y = config.pivotY;
        }
    };

    const initNodes = () => {
        nodes.length = 0;
        let startX = config.pivotX;
        let startY = 0; // Start at pivot to prevent "jump" or high-flying start

        for (let i = 0; i < config.segmentCount; i++) {
            nodes.push({
                x: startX,
                y: startY + i * config.segmentLength,
                oldX: startX,
                oldY: startY + i * config.segmentLength, // Zero initial velocity
                pinned: i === 0
            });
        }
    };

    resize();
    window.addEventListener('resize', resize);

    // Time tracking for wind simulation
    let time = 0;

    // Physics Loop
    const updatePhysics = () => {
        time += 1;

        // 1. Verlet Integration with enhanced forces
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            if (n.pinned) continue; // Skip pivot
            if (isDragging && i === nodes.length - 1) continue; // Skip dragged node handling here

            let vx = (n.x - n.oldX) * config.friction;
            let vy = (n.y - n.oldY) * config.friction;

            // Apply stronger horizontal damping to prevent wild sideways motion
            vx *= 0.98; // Extra horizontal friction

            // Apply air resistance based on velocity magnitude
            const speed = Math.sqrt(vx * vx + vy * vy);
            if (speed > 0.1) {
                const airDrag = 1 - (speed * 0.002); // Stronger quadratic drag
                vx *= Math.max(0.85, airDrag);
                vy *= Math.max(0.92, airDrag);
            }

            // Gentle centering force towards pivot X position (pendulum behavior)
            const distFromPivot = n.x - config.pivotX;
            const centeringForce = distFromPivot * 0.001 * (i / nodes.length); // Stronger for nodes further down
            vx -= centeringForce;

            // Wind simulation - gentle ambient motion
            if (config.windEnabled && !isDragging) {
                const windPhase = time * config.windFrequency + i * 0.1;
                const windX = Math.sin(windPhase) * Math.cos(windPhase * 0.7) * config.windStrength;
                const windY = Math.sin(windPhase * 0.5) * 0.05 * config.windStrength;

                // Nodes further down the rope are affected more by wind
                const windInfluence = (i / nodes.length) * 0.8 + 0.2;
                vx += windX * windInfluence;
                vy += windY * windInfluence;
            }

            n.oldX = n.x;
            n.oldY = n.y;

            n.x += vx;
            n.y += vy;
            n.y += config.gravity;

            // Apply air resistance to overall motion
            n.x += (n.x - n.oldX) * (1 - config.airResistance);
            n.y += (n.y - n.oldY) * (1 - config.airResistance);

            // Constrain maximum horizontal distance from pivot (prevent going too far)
            const maxHorizontalOffset = 300; // Maximum pixels from pivot
            if (Math.abs(n.x - config.pivotX) > maxHorizontalOffset) {
                const sign = n.x > config.pivotX ? 1 : -1;
                n.x = config.pivotX + sign * maxHorizontalOffset;
                // Dampen horizontal velocity when hitting limit
                n.oldX = n.x - (n.x - n.oldX) * 0.3;
            }
        }

        // Drag processing
        if (isDragging && dragNode) {
            dragNode.x = lastMouse.x - dragOffset.x;
            dragNode.y = lastMouse.y - dragOffset.y;
            // No velocity update here, verlet infers it next frame
        }

        // 2. Constraints (Stick constraint)
        for (let k = 0; k < config.iterations; k++) {
            for (let i = 0; i < nodes.length - 1; i++) {
                const n1 = nodes[i];
                const n2 = nodes[i + 1];

                const dx = n2.x - n1.x;
                const dy = n2.y - n1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const diff = config.segmentLength - dist;
                const percent = diff / dist / 2;
                const offsetX = dx * percent;
                const offsetY = dy * percent;

                if (!n1.pinned) {
                    n1.x -= offsetX;
                    n1.y -= offsetY;
                }
                if (!isDragging || i + 1 !== nodes.length - 1) { // Don't constrain dragged last node fully? Actually we want string to pull card.
                    // If dragging card, card pulls string.
                    // If not dragging, string pulls card.
                    if (isDragging && i + 1 === nodes.length - 1) {
                        // If n2 is dragged, n1 pulled to it. n2 fixed position this subframe.
                        // So allow n2 update NO. n2 is set by mouse.
                        // Just update n1.
                    } else {
                        n2.x += offsetX;
                        n2.y += offsetY;
                    }
                }
            }
        }

        // 3. Render Lanyard
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        for (let i = 1; i < nodes.length; i++) {
            ctx.lineTo(nodes[i].x, nodes[i].y);
        }

        // Base Strap (Tech Cable Style)
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer Glow/Shadow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';

        // 1. Core (Dark)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 12;
        ctx.stroke();

        ctx.shadowBlur = 0; // Reset shadow for details

        // 2. Texture Pattern (Braided look)
        // We iterate segments to draw detail
        ctx.save();
        for (let i = 0; i < nodes.length - 1; i++) {
            const n1 = nodes[i];
            const n2 = nodes[i + 1];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            ctx.translate(n1.x, n1.y);
            ctx.rotate(angle);

            // Draw small diagonal lines to simulate braiding
            ctx.fillStyle = '#1e293b'; // Slightly lighter dark
            const patternSpacing = 4;
            for (let k = 0; k < dist; k += patternSpacing) {
                ctx.fillRect(k, -4, 2, 8); // Small ticks
            }

            ctx.rotate(-angle);
            ctx.translate(-n1.x, -n1.y);
        }
        ctx.restore();

        // 3. Highlight (Top edge reflection)
        ctx.beginPath();
        ctx.moveTo(nodes[0].x - 2, nodes[0].y); // Offset slightly
        for (let i = 1; i < nodes.length; i++) {
            ctx.lineTo(nodes[i].x - 2, nodes[i].y);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 4. Branding Text (TTL)
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 2; i < nodes.length - 2; i += 4) {
            const n = nodes[i];
            const next = nodes[i + 1];
            const textDx = next.x - n.x;
            const textDy = next.y - n.y;
            const textAngle = Math.atan2(textDy, textDx);

            ctx.save();
            ctx.translate(n.x, n.y);
            ctx.rotate(textAngle);
            ctx.fillText('TTL', 0, 0);
            ctx.restore();
        }
        ctx.restore();

        // Draw Clip (Carabiner) at the end
        const tail = nodes[nodes.length - 1];
        ctx.save();
        ctx.translate(tail.x, tail.y);
        // Rotate to match last segment
        const lastSegDx = tail.x - nodes[nodes.length - 2].x;
        const lastSegDy = tail.y - nodes[nodes.length - 2].y;
        const tailAngle = Math.atan2(lastSegDy, lastSegDx);
        ctx.rotate(tailAngle - Math.PI / 2);

        // Draw Clip
        ctx.beginPath();
        ctx.fillStyle = '#94a3b8'; // Metal grey
        ctx.moveTo(-6, 0);
        ctx.lineTo(6, 0);
        ctx.lineTo(4, 15);
        ctx.lineTo(-4, 15);
        ctx.closePath();
        ctx.fill();

        // Ring
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 18, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 5. Update Card Position (Attached to last node)
        const lastNode = nodes[nodes.length - 1];
        const prevTail = nodes[nodes.length - 2];
        const prevPrevTail = nodes[nodes.length - 3] || prevTail;

        // Calculate rotation based on average of last segments for smoother angle
        const cardDx = lastNode.x - prevTail.x;
        const cardDy = lastNode.y - prevTail.y;
        const cardDx2 = prevTail.x - prevPrevTail.x;
        const cardDy2 = prevTail.y - prevPrevTail.y;

        const avgDx = (cardDx + cardDx2) / 2;
        const avgDy = (cardDy + cardDy2) / 2;
        const cardAngle = Math.atan2(avgDy, avgDx) - Math.PI / 2; // -90deg because card is vertical

        // Update DOM
        card.style.left = `${lastNode.x}px`;
        card.style.top = `${lastNode.y}px`;

        // Enhanced 3D Tilt calculation with smoothing
        // Velocity of tail (using 2-frame average for smoothness)
        const vx = (lastNode.x - lastNode.oldX);
        const vy = (lastNode.y - lastNode.oldY);

        // Calculate acceleration for more dynamic feel
        const ax = vx - (prevTail.x - prevTail.oldX);
        const ay = vy - (prevTail.y - prevTail.oldY);

        // Combine velocity and acceleration for tilt
        // Clamp values to prevent extreme tilting
        const maxTilt = 25;
        let tiltX = (vy * 1.5 + ay * 0.5);
        let tiltY = (-vx * 1.5 - ax * 0.5);

        tiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
        tiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));

        // Add subtle wobble based on angular velocity
        const angularVel = cardAngle - (prevAngularVel || cardAngle);
        prevAngularVel = cardAngle;

        const wobble = Math.sin(time * 0.1) * Math.abs(angularVel) * 2;

        card.style.transform = `translateX(-50%) rotate(${cardAngle}rad) rotateX(${tiltX + wobble}deg) rotateY(${tiltY}deg)`;

        requestAnimationFrame(updatePhysics);
    };

    // Track previous angular velocity for wobble
    let prevAngularVel = 0;

    // Scroll Reaction - Gentle and controlled
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        // Smooth the scroll velocity
        scrollVelocity = scrollVelocity * 0.8 + delta * 0.2;

        // Apply gentle force to nodes based on scroll direction/speed
        const force = scrollVelocity * 0.3; // Reduced force

        for (let i = 1; i < nodes.length; i++) {
            // Progressive force - nodes at the end swing more
            const influence = (i / nodes.length);

            // Add subtle sway (X) with progressive influence
            nodes[i].x -= force * 0.15 * influence; // Much gentler
            // Add vertical lag
            nodes[i].y -= force * 0.08 * influence;
        }
    });

    // Interaction
    const onDown = (e) => {
        isDragging = true;
        card.style.cursor = 'grabbing';

        const cx = e.clientX || e.touches[0].clientX;
        const cy = e.clientY || e.touches[0].clientY;

        // Calculate Mouse Position in Container relative to rect (same as onMove)
        const containerRect = container.getBoundingClientRect();
        const localX = cx - containerRect.left;
        const localY = cy - containerRect.top;

        lastMouse = { x: localX, y: localY };

        // Drag node is the last one
        dragNode = nodes[nodes.length - 1];

        // Calculate offset so the card doesn't snap to center
        dragOffset = {
            x: localX - dragNode.x,
            y: localY - dragNode.y
        };

        // Reset velocity variables
        dragVelocity = { x: 0, y: 0 };

        // Stop physics momentum
        dragNode.oldX = dragNode.x;
        dragNode.oldY = dragNode.y;

        e.preventDefault();
    };

    const onMove = (e) => {
        if (!isDragging) return;

        const cx = e.clientX || e.touches[0].clientX;
        const cy = e.clientY || e.touches[0].clientY;

        const containerRect = container.getBoundingClientRect();

        // Calculate Mouse Position in Container
        const localX = cx - containerRect.left;
        const localY = cy - containerRect.top;

        // Calculate Velocity with exponential smoothing for consistent throws
        const instantVelX = localX - lastMouse.x;
        const instantVelY = localY - lastMouse.y;

        // Smooth velocity using exponential moving average
        dragVelocity.x = dragVelocity.x * 0.6 + instantVelX * 0.4;
        dragVelocity.y = dragVelocity.y * 0.6 + instantVelY * 0.4;

        lastMouse = { x: localX, y: localY };
    };

    const onUp = () => {
        if (!isDragging) return;
        isDragging = false;
        card.style.cursor = 'grab';

        // Apply Throw Velocity with controlled physics
        // Verlet: x - oldX = velocity
        // So: oldX = x - velocity
        if (dragNode) {
            // Moderate throw factor for natural motion
            const speed = Math.sqrt(dragVelocity.x ** 2 + dragVelocity.y ** 2);
            const baseThrow = 1.2; // Reduced base throw
            const speedBonus = Math.min(speed * 0.02, 0.3); // Smaller bonus
            const throwFactor = baseThrow + speedBonus;

            dragNode.oldX = dragNode.x - (dragVelocity.x * throwFactor);
            dragNode.oldY = dragNode.y - (dragVelocity.y * throwFactor);
        }

        dragNode = null;
    };

    // Attach listeners to Card for starting drag
    card.addEventListener('mousedown', onDown);
    card.addEventListener('touchstart', onDown);

    // Window for move/up to catch slip
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove);

    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);

    updatePhysics();
}

// --------------------------------------------------------------------------
// VOLUMETRIC CARD GENERATOR
// --------------------------------------------------------------------------
const initVolumetricCard = () => {
    const card = document.getElementById('id-card');
    if (!card) return;

    // Configuration
    const thickness = 12; // Total thickness in px
    const layers = 12; // Number of slices (1 per px for density)
    const color = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary').trim();

    // Clean existing layers if re-running
    const existingLayers = card.querySelectorAll('.thickness-layer');
    existingLayers.forEach(l => l.remove());

    // Create layers
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < layers; i++) {
        const layer = document.createElement('div');
        layer.classList.add('thickness-layer');

        // Calculate Z position: from -thickness/2 to +thickness/2
        // We want them effectively between the front face (+6px) and back face (-6px)
        const z = (thickness / 2) - (i * (thickness / (layers - 1)));

        layer.style.transform = `translateZ(${z}px)`;
        layer.style.opacity = (i === 0 || i === layers - 1) ? '0' : '1'; // Hide first/last if they clip faces, though usually fine

        // Slight darkening for inner layers to simulate solid material?
        // simple: keep same color

        fragment.appendChild(layer);
    }

    // Insert layers before the content faces to keep DOM tidy (though z-index handles viz)
    card.insertBefore(fragment, card.firstChild);
}

document.addEventListener('DOMContentLoaded', () => {

    // START BACKGROUND ANIMATION
    initBackground();

    // START ID CARD
    initIDCard();
    initVolumetricCard();

    // ----------------------------------------------------------------------
    // CUSTOM CURSOR
    // ----------------------------------------------------------------------
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            setTimeout(() => {
                follower.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }, 50);
        });

        const hoverables = document.querySelectorAll('a, button, .project-card, .timeline-content');
        hoverables.forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('hover-effect'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('hover-effect'));
        });
    }

    // ----------------------------------------------------------------------
    // SCROLL REVEAL (Observer)
    // ----------------------------------------------------------------------
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    const hiddenElements = [
        ...document.querySelectorAll('.section-title'),
        ...document.querySelectorAll('.project-card'),
        ...document.querySelectorAll('.timeline-item'),
        ...document.querySelectorAll('.skill-category')
    ];

    hiddenElements.forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
        el.style.transition = "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        observer.observe(el);
    });

    // ----------------------------------------------------------------------
    // NAVBAR SCROLL EFFECT
    // ----------------------------------------------------------------------
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // ----------------------------------------------------------------------
    // MOBILE MENU
    // ----------------------------------------------------------------------
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');

            // Icon animation
            const icon = menuToggle.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    }

    // ----------------------------------------------------------------------
    // SMOOTH SCROLL
    // ----------------------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ----------------------------------------------------------------------
    // TILT EFFECT
    // ----------------------------------------------------------------------
    document.querySelectorAll('[data-tilt]').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            card.style.transform = `perspective(1000px) rotateX(${((y - centerY) / centerY) * -5}deg) rotateY(${((x - centerX) / centerX) * 5}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
});
