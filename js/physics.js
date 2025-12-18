/**
 * Physics Module
 * Matter.js Implementation for ID Card and Rope
 */

export const initPhysics = () => {
    const cardElement = document.getElementById('id-card');
    const container = document.getElementById('id-card-container');
    const canvas = document.getElementById('lanyard');
    
    // Ensure Matter.js is available (loaded globally)
    const Matter = window.Matter;

    if (!cardElement || !container || !canvas || !Matter) {
        console.warn('[Physics] Matter.js not loaded or elements missing');
        return;
    }

    const ctx = canvas.getContext('2d');

    // ====== PHYSICS CONFIGURATION ======
    const PHYSICS_CONFIG = {
        // ====== ROPE ======
        ropeSegments: 15,            // More segments = smoother curves
        segmentLength: 8,            // Shorter links = more flexible
        ropeStiffness: 0.92,         // Slightly elastic for natural stretch
        ropeDamping: 0.2,            // Damping prevents infinite oscillation
        segmentMass: 0.0008,         // Light rope segments
        
        // ====== CARD ======
        cardDensity: 0.0006,         // Balanced weight for natural swing
        cardFriction: 0.3,           // Realistic surface friction
        cardRestitution: 0.15,       // Minimal bounce
        cardAirFriction: 0.025,      // Subtle air resistance
        
        // ====== DRAG ======
        dragStiffness: 0.7,          // Responsive but smooth follow
        dragDamping: 0.4,            // Prevents jitter
        throwMultiplier: 1.2,        // Velocity boost on release
        
        // ====== INTERACTIONS ======
        hoverEnabled: true,
        hoverForce: 0.0004,          // Subtle attraction
        hoverRadius: 180,            // Smaller attraction zone
        scrollForce: 0.5,            // Natural scroll reaction
        
        // ====== 3D TILT ======
        tiltFromVelocity: 12,        // Degrees from movement speed
        tiltFromGrab: 28,            // Degrees from grab position
        tiltFromSwing: 15,           // Degrees from pendulum angle
        tiltSmoothing: 0.08,         // Slower = smoother interpolation
        maxTilt: 40,                 // Maximum tilt angle
        
        // ====== ENGINE ======
        gravity: 0.9,
        positionIterations: 12,
        velocityIterations: 8,
        constraintIterations: 14
    };

    // Matter.js module aliases
    const Engine = Matter.Engine,
          Bodies = Matter.Bodies,
          Body = Matter.Body,
          Composite = Matter.Composite,
          Constraint = Matter.Constraint;

    // Create engine with optimized iterations
    const engine = Engine.create({
        gravity: { x: 0, y: PHYSICS_CONFIG.gravity },
        constraintIterations: PHYSICS_CONFIG.constraintIterations,
        positionIterations: PHYSICS_CONFIG.positionIterations,
        velocityIterations: PHYSICS_CONFIG.velocityIterations
    });

    const world = engine.world;

    // ====== RESIZE HANDLING ======
    const resize = () => {
        canvas.width = container.offsetWidth || window.innerWidth;
        canvas.height = container.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ====== PIVOT POINT (fixed anchor at top) ======
    const pivotX = window.innerWidth * 0.75;
    const pivotY = 0;

    const pivot = Bodies.circle(pivotX, pivotY, 5, {
        isStatic: true,
        render: { visible: false }
    });

    // ====== ENHANCED ROPE CHAIN ======
    const ropeSegments = [];
    const segLength = PHYSICS_CONFIG.segmentLength;
    const numSegments = PHYSICS_CONFIG.ropeSegments;

    for (let i = 0; i < numSegments; i++) {
        const progress = i / numSegments; // 0 to 1
        const segment = Bodies.circle(
            pivotX, 
            pivotY + (i + 1) * segLength, 
            3,
            {
                // Graduated mass: heavier near card for natural hang
                density: PHYSICS_CONFIG.segmentMass * (1 + progress * 0.6),
                friction: 0.1,
                // Less air friction at top for fluid motion
                frictionAir: 0.015 * (1 - progress * 0.4),
                restitution: 0.05,
                collisionFilter: { group: -1 },
                render: { visible: false }
            }
        );
        ropeSegments.push(segment);
    }

    Composite.add(world, [pivot, ...ropeSegments]);

    // ====== ROPE CONSTRAINTS (graduated stiffness) ======
    // First segment to pivot
    Composite.add(world, Constraint.create({
        bodyA: pivot,
        bodyB: ropeSegments[0],
        pointA: { x: 0, y: 0 },
        pointB: { x: 0, y: 0 },
        length: segLength,
        stiffness: 1.0, // Rigid at top
        damping: PHYSICS_CONFIG.ropeDamping
    }));

    // Chain segments with graduated stiffness
    for (let i = 0; i < ropeSegments.length - 1; i++) {
        const progress = i / ropeSegments.length;
        // Stiffness decreases slightly toward card for flexibility
        const stiff = PHYSICS_CONFIG.ropeStiffness - (progress * 0.05);
        
        Composite.add(world, Constraint.create({
            bodyA: ropeSegments[i],
            bodyB: ropeSegments[i + 1],
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 0 },
            length: segLength,
            stiffness: stiff,
            damping: PHYSICS_CONFIG.ropeDamping
        }));
    }

    // ====== CARD BODY ======
    const cardWidth = cardElement.offsetWidth || 260;
    const cardHeight = cardElement.offsetHeight || 400;

    const cardBody = Bodies.rectangle(
        pivotX,
        pivotY + numSegments * segLength + cardHeight / 2 + 20,
        cardWidth,
        cardHeight,
        {
            density: PHYSICS_CONFIG.cardDensity,
            friction: PHYSICS_CONFIG.cardFriction,
            frictionAir: PHYSICS_CONFIG.cardAirFriction,
            restitution: PHYSICS_CONFIG.cardRestitution,
            collisionFilter: { group: -1 },
            render: { visible: false }
        }
    );

    Composite.add(world, cardBody);

    // ====== ROPE TO CARD CONNECTION (rigid) ======
    const lastSegment = ropeSegments[ropeSegments.length - 1];
    const attachPointY = -cardHeight / 2 + 18; // 18px from top edge
    
    Composite.add(world, Constraint.create({
        bodyA: lastSegment,
        bodyB: cardBody,
        pointA: { x: 0, y: 0 },
        pointB: { x: 0, y: attachPointY },
        length: 8,
        stiffness: 1.0,  // Completely rigid
        damping: 0.15
    }));

    // ====== VIEWPORT BOUNDARIES ======
    const wallThickness = 100;
    const walls = [
        Bodies.rectangle(-wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true }),
        Bodies.rectangle(canvas.width + wallThickness / 2, canvas.height / 2, wallThickness, canvas.height * 2, { isStatic: true }),
        Bodies.rectangle(canvas.width / 2, canvas.height + wallThickness / 2, canvas.width * 2, wallThickness, { isStatic: true })
    ];
    Composite.add(world, walls);

    // ====== ENHANCED DRAG SYSTEM ======
    let isDragging = false;
    let dragConstraint = null;
    let grabTilt = { x: 0, y: 0 };
    
    // Velocity tracking for throw
    let lastMousePos = { x: 0, y: 0 };
    let mouseVelocity = { x: 0, y: 0 };
    let containerRect = container.getBoundingClientRect();

    const onCardMouseDown = (e) => {
        isDragging = true;
        cardElement.style.cursor = 'grabbing';
        
        document.body.style.userSelect = 'none';
        document.body.style.webkitUserSelect = 'none';
        
        containerRect = container.getBoundingClientRect();
        const mouseX = (e.clientX || e.touches?.[0]?.clientX) - containerRect.left;
        const mouseY = (e.clientY || e.touches?.[0]?.clientY) - containerRect.top;

        // Calculate grab offset in card's local coordinates
        const localX = mouseX - cardBody.position.x;
        const localY = mouseY - cardBody.position.y;
        const cos = Math.cos(-cardBody.angle);
        const sin = Math.sin(-cardBody.angle);
        const grabOffsetX = localX * cos - localY * sin;
        const grabOffsetY = localX * sin + localY * cos;

        dragConstraint = Constraint.create({
            pointA: { x: mouseX, y: mouseY },
            bodyB: cardBody,
            pointB: { x: grabOffsetX, y: grabOffsetY },
            length: 0,
            stiffness: PHYSICS_CONFIG.dragStiffness,
            damping: PHYSICS_CONFIG.dragDamping
        });
        Composite.add(world, dragConstraint);

        // Normalized grab offset for 3D tilt (-1 to 1)
        grabTilt.x = Math.max(-1, Math.min(1, grabOffsetX / (cardWidth / 2)));
        grabTilt.y = Math.max(-1, Math.min(1, grabOffsetY / (cardHeight / 2)));
        
        // Initialize velocity tracking
        lastMousePos = { x: mouseX, y: mouseY };
        mouseVelocity = { x: 0, y: 0 };

        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging || !dragConstraint) return;
        
        const mouseX = (e.clientX || e.touches?.[0]?.clientX) - containerRect.left;
        const mouseY = (e.clientY || e.touches?.[0]?.clientY) - containerRect.top;

        // Track velocity (smoothed)
        mouseVelocity.x = mouseVelocity.x * 0.7 + (mouseX - lastMousePos.x) * 0.3;
        mouseVelocity.y = mouseVelocity.y * 0.7 + (mouseY - lastMousePos.y) * 0.3;
        lastMousePos = { x: mouseX, y: mouseY };

        dragConstraint.pointA = { x: mouseX, y: mouseY };
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        cardElement.style.cursor = 'grab';
        
        document.body.style.userSelect = '';
        document.body.style.webkitUserSelect = '';
        
        // Apply throw velocity on release
        if (dragConstraint) {
            const throwX = mouseVelocity.x * PHYSICS_CONFIG.throwMultiplier;
            const throwY = mouseVelocity.y * PHYSICS_CONFIG.throwMultiplier;
            
            Body.setVelocity(cardBody, {
                x: cardBody.velocity.x + throwX,
                y: cardBody.velocity.y + throwY
            });
            
            Composite.remove(world, dragConstraint);
            dragConstraint = null;
        }
        
        grabTilt = { x: 0, y: 0 };
    };

    cardElement.addEventListener('mousedown', onCardMouseDown);
    cardElement.addEventListener('touchstart', onCardMouseDown, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp, { passive: true });

    // ====== GLOBAL MOUSE TRACKING ======
    const globalMouse = { x: canvas.width / 2, y: canvas.height / 2 };
    window.addEventListener('mousemove', (e) => {
        globalMouse.x = e.clientX;
        globalMouse.y = e.clientY;
    });

    // ====== SCROLL REACTION ======
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;
        lastScrollY = currentScrollY;

        const force = delta * PHYSICS_CONFIG.scrollForce * 0.001;
        Body.applyForce(cardBody, cardBody.position, {
            x: -force * 0.4,
            y: -force * 0.15
        });

        // Push rope segments with graduated influence
        ropeSegments.forEach((seg, i) => {
            const influence = (i + 1) / ropeSegments.length;
            Body.applyForce(seg, seg.position, {
                x: -force * 0.2 * influence,
                y: 0
            });
        });
    }, { passive: true });

    // ====== SMOOTHED 3D TILT STATE ======
    let smoothTiltX = 0;
    let smoothTiltY = 0;
    const baseAirFriction = PHYSICS_CONFIG.cardAirFriction;

    // ====== RENDER LOOP ======
    let time = 0;
    const render = () => {
        time++;

        // Update physics engine
        Engine.update(engine, 1000 / 60);

        // ====== DYNAMIC DAMPING (reduces for large swings) ======
        const swingAngle = Math.abs(cardBody.angle);
        const swingVelocity = Math.abs(cardBody.angularVelocity);
        
        if (swingAngle > 0.25 || swingVelocity > 0.08) {
            Body.set(cardBody, 'frictionAir', baseAirFriction * 1.8);
        } else {
            Body.set(cardBody, 'frictionAir', baseAirFriction);
        }

        // ====== HOVER ATTRACTION ======
        if (PHYSICS_CONFIG.hoverEnabled && !isDragging) {
            const dx = globalMouse.x - cardBody.position.x;
            const dy = globalMouse.y - cardBody.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < PHYSICS_CONFIG.hoverRadius && dist > 60) {
                const forceMag = PHYSICS_CONFIG.hoverForce * (1 - dist / PHYSICS_CONFIG.hoverRadius);
                Body.applyForce(cardBody, cardBody.position, {
                    x: (dx / dist) * forceMag,
                    y: (dy / dist) * forceMag
                });
            }
        }

        // ====== DRAW ROPE (Smooth Bézier Curves) ======
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate card attachment point
        const attachOffsetY = -cardHeight / 2 + 18;
        const attachX = cardBody.position.x - Math.sin(cardBody.angle) * attachOffsetY;
        const attachY = cardBody.position.y + Math.cos(cardBody.angle) * attachOffsetY;

        // Build smooth Bézier rope path
        const buildRopePath = () => {
            ctx.beginPath();
            ctx.moveTo(pivot.position.x, pivot.position.y);
            
            // Quadratic curves through segments
            for (let i = 0; i < ropeSegments.length - 1; i++) {
                const curr = ropeSegments[i];
                const next = ropeSegments[i + 1];
                const midX = (curr.position.x + next.position.x) / 2;
                const midY = (curr.position.y + next.position.y) / 2;
                ctx.quadraticCurveTo(curr.position.x, curr.position.y, midX, midY);
            }
            
            // Final curve to card
            const lastSeg = ropeSegments[ropeSegments.length - 1];
            ctx.quadraticCurveTo(lastSeg.position.x, lastSeg.position.y, attachX, attachY);
        };

        // Outer glow
        buildRopePath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.lineWidth = 14;
        ctx.stroke();

        // Core gradient
        buildRopePath();
        ctx.shadowBlur = 0;
        const gradient = ctx.createLinearGradient(
            pivot.position.x, pivot.position.y,
            cardBody.position.x, cardBody.position.y
        );
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(0.5, '#1e293b');
        gradient.addColorStop(1, '#0f172a');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 8;
        ctx.stroke();

        // Flowing energy particles
        ctx.save();
        const flowOffset = (Date.now() * 0.0008) % 1;
        for (let i = 0; i < ropeSegments.length - 1; i++) {
            const n1 = ropeSegments[i];
            const n2 = ropeSegments[i + 1];
            const dx = n2.position.x - n1.position.x;
            const dy = n2.position.y - n1.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            ctx.save();
            ctx.translate(n1.position.x, n1.position.y);
            ctx.rotate(angle);

            const particleSpacing = 25;
            for (let k = flowOffset * particleSpacing; k < dist; k += particleSpacing) {
                const alpha = Math.sin(k / particleSpacing + flowOffset * Math.PI * 2) * 0.25 + 0.25;
                ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
                ctx.fillRect(k - 2, -1.5, 4, 3);
            }
            ctx.restore();
        }
        ctx.restore();

        // Electric edge highlight
        buildRopePath();
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // TTL branding along rope
        ctx.save();
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.font = 'bold 9px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.6)';
        for (let i = 4; i < ropeSegments.length - 3; i += 6) {
            const seg = ropeSegments[i];
            const next = ropeSegments[i + 1] || seg;
            const textAngle = Math.atan2(next.position.y - seg.position.y, next.position.x - seg.position.x);
            ctx.save();
            ctx.translate(seg.position.x, seg.position.y);
            ctx.rotate(textAngle);
            ctx.fillText('TTL.', 0, 0);
            ctx.restore();
        }
        ctx.restore();

        // Draw connector at card attachment
        const lastSeg = ropeSegments[ropeSegments.length - 1];
        const connAngle = Math.atan2(attachY - lastSeg.position.y, attachX - lastSeg.position.x);
        
        ctx.save();
        ctx.translate(attachX, attachY);
        ctx.rotate(connAngle + Math.PI / 2);
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.7)';
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-7, -4);
        ctx.lineTo(7, -4);
        ctx.lineTo(5, 8);
        ctx.lineTo(-5, 8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-4, 0);
        ctx.lineTo(4, 0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 12, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // ====== UPDATE CARD DOM POSITION ======
        const cardX = cardBody.position.x;
        const cardY = cardBody.position.y;
        const cardAngle = cardBody.angle;

        // Physics-based 3D tilt
        const vx = cardBody.velocity.x;
        const vy = cardBody.velocity.y;

        // Calculate target tilt from multiple factors
        let targetTiltX = vy * PHYSICS_CONFIG.tiltFromVelocity;
        let targetTiltY = -vx * PHYSICS_CONFIG.tiltFromVelocity;
        
        // Add swing contribution
        targetTiltX += Math.sin(cardAngle) * PHYSICS_CONFIG.tiltFromSwing;
        
        // Add grab contribution when dragging
        if (isDragging) {
            targetTiltY += grabTilt.x * PHYSICS_CONFIG.tiltFromGrab;
            targetTiltX -= grabTilt.y * PHYSICS_CONFIG.tiltFromGrab;
        }

        // Smooth interpolation
        smoothTiltX += (targetTiltX - smoothTiltX) * PHYSICS_CONFIG.tiltSmoothing;
        smoothTiltY += (targetTiltY - smoothTiltY) * PHYSICS_CONFIG.tiltSmoothing;

        // Clamp to max range
        const finalTiltX = Math.max(-PHYSICS_CONFIG.maxTilt, Math.min(PHYSICS_CONFIG.maxTilt, smoothTiltX));
        const finalTiltY = Math.max(-PHYSICS_CONFIG.maxTilt, Math.min(PHYSICS_CONFIG.maxTilt, smoothTiltY));

        // Apply transform
        cardElement.style.left = `${cardX}px`;
        cardElement.style.top = `${cardY - cardHeight / 2}px`;
        cardElement.style.transform = `translateX(-50%) rotate(${cardAngle}rad) rotateX(${finalTiltX}deg) rotateY(${finalTiltY}deg)`;

        requestAnimationFrame(render);
    };

    render();
    console.log('[Physics] Enhanced Matter.js engine initialized with', numSegments, 'rope segments');
}

// --------------------------------------------------------------------------
// VOLUMETRIC CARD GENERATOR
// --------------------------------------------------------------------------
export const initVolumetricCard = () => {
    const card = document.getElementById('id-card');
    if (!card) return;

    // Configuration
    const thickness = 12; // Total thickness in px
    const layers = 12; // Number of slices (1 per px for density)
    
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

        fragment.appendChild(layer);
    }

    // Insert layers before the content faces to keep DOM tidy (though z-index handles viz)
    card.insertBefore(fragment, card.firstChild);
}
