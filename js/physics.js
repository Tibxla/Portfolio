/**
 * Physics Module
 * Matter.js Implementation for Falling ID Card with Rope
 */

export const initPhysics = () => {
    const cardElement = document.getElementById('id-card');
    const container = document.getElementById('id-card-container');
    const canvas = document.getElementById('lanyard');
    
    // Ensure Matter.js is available
    const Matter = window.Matter;

    if (!cardElement || !container || !canvas || !Matter) {
        console.warn('[Physics] Matter.js not loaded or elements missing');
        return;
    }

    const ctx = canvas.getContext('2d');

    // Matter.js module aliases
    const Engine = Matter.Engine,
          Bodies = Matter.Bodies,
          Body = Matter.Body,
          Composite = Matter.Composite,
          Constraint = Matter.Constraint;

    // Create engine
    const engine = Engine.create({
        gravity: { x: 0, y: 1 }
    });

    const world = engine.world;

    // ====== RESIZE HANDLING ======
    const resize = () => {
        canvas.width = container.offsetWidth || window.innerWidth;
        canvas.height = window.innerHeight * 2; // Extended canvas for scrolling
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

    Composite.add(world, pivot);

    // ====== CARD BODY ======
    const cardWidth = 230;
    const cardHeight = 350;
    const ropeLength = 350;

    // Start card hanging at rest position
    const cardBody = Bodies.rectangle(
        pivotX,
        pivotY + ropeLength + cardHeight / 2 - 18, // Position based on rope length
        cardWidth,
        cardHeight,
        {
            density: 0.001,
            friction: 0.3,
            frictionAir: 0.05, // Increased air friction to prevent spinning
            restitution: 0.1,
            angle: 0,
            angularVelocity: 0,
            render: { visible: false }
        }
    );

    Composite.add(world, cardBody);

    // ====== ROPE CONSTRAINT ======
    const attachPointY = -cardHeight / 2 + 18; // 18px from top edge

    const rope = Constraint.create({
        bodyA: pivot,
        bodyB: cardBody,
        pointA: { x: 0, y: 0 },
        pointB: { x: 0, y: attachPointY },
        length: ropeLength,
        stiffness: 1.0, // Rigid rope
        damping: 0.3 // More damping to prevent oscillation
    });

    Composite.add(world, rope);

    // ====== DRAG SYSTEM ======
    let isDragging = false;
    let dragConstraint = null;
    let containerRect = container.getBoundingClientRect();

    const onCardMouseDown = (e) => {
        isDragging = true;
        cardElement.style.cursor = 'grabbing';
        
        document.body.style.userSelect = 'none';
        
        containerRect = container.getBoundingClientRect();
        const mouseX = (e.clientX || e.touches?.[0]?.clientX) - containerRect.left;
        const mouseY = (e.clientY || e.touches?.[0]?.clientY) - containerRect.top;

        dragConstraint = Constraint.create({
            pointA: { x: mouseX, y: mouseY },
            bodyB: cardBody,
            length: 0,
            stiffness: 0.9,
            damping: 0.5
        });
        Composite.add(world, dragConstraint);

        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!isDragging || !dragConstraint) return;
        
        const mouseX = (e.clientX || e.touches?.[0]?.clientX) - containerRect.left;
        const mouseY = (e.clientY || e.touches?.[0]?.clientY) - containerRect.top;

        dragConstraint.pointA = { x: mouseX, y: mouseY };
    };

    const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        cardElement.style.cursor = 'grab';
        
        document.body.style.userSelect = '';
        
        if (dragConstraint) {
            Composite.remove(world, dragConstraint);
            dragConstraint = null;
        }
    };

    cardElement.addEventListener('mousedown', onCardMouseDown);
    cardElement.addEventListener('touchstart', onCardMouseDown, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp, { passive: true });

    // ====== RENDER LOOP ======
    const render = () => {
        // Update physics
        Engine.update(engine, 1000 / 60);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate card attachment point (rotated)
        const attachOffsetY = -cardHeight / 2 + 18;
        const cos = Math.cos(cardBody.angle);
        const sin = Math.sin(cardBody.angle);
        const attachX = cardBody.position.x - sin * attachOffsetY;
        const attachY = cardBody.position.y + cos * attachOffsetY;

        // Draw rope
        ctx.beginPath();
        ctx.moveTo(pivot.position.x, pivot.position.y);
        ctx.lineTo(attachX, attachY);
        
        // Outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.4)';
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
        ctx.lineWidth = 12;
        ctx.stroke();

        // Core line
        ctx.beginPath();
        ctx.moveTo(pivot.position.x, pivot.position.y);
        ctx.lineTo(attachX, attachY);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Edge highlight
        ctx.beginPath();
        ctx.moveTo(pivot.position.x, pivot.position.y);
        ctx.lineTo(attachX, attachY);
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw connector at card attachment
        ctx.save();
        ctx.translate(attachX, attachY);
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.7)';
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // ====== UPDATE CARD DOM POSITION ======
        const cardX = cardBody.position.x;
        const cardY = cardBody.position.y;
        const cardAngle = cardBody.angle;

        // Dynamic 3D Tilt based on velocity
        const velocityX = cardBody.velocity.x;
        const tiltAngle = -velocityX * 5; // Tilt factor (adjust for sensitivity)
        
        // Limit max tilt
        const clampedTilt = Math.max(-25, Math.min(25, tiltAngle));

        // Set position (left/top represent the center)
        cardElement.style.left = `${cardX}px`;
        cardElement.style.top = `${cardY}px`;
        
        // Combine Z-rotation (physics) with Y-rotation (velocity tilt)
        // Perspective is handled by container
        cardElement.style.transform = `
            translate(-50%, -50%) 
            rotate(${cardAngle}rad) 
            rotateY(${clampedTilt}deg)
            rotateX(${Math.abs(clampedTilt) * 0.1}deg) /* Slight X tilt for realism */
        `;

        requestAnimationFrame(render);
    };

    render();
    console.log('[Physics] Falling card physics initialized');
};
