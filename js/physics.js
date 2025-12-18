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
          Constraint = Matter.Constraint,
          Vector = Matter.Vector;

    // Create engine
    const engine = Engine.create({
        gravity: { x: 0, y: 3 }, // Increased gravity (1.0 -> 1.5) for "Earth-like" snap
        positionIterations: 50, // High iterations for rigid, non-elastic rope
        velocityIterations: 10
    });

    const world = engine.world;

    // ====== RESIZE HANDLING ======
    // Defined properly later to access bodies

    // ====== PIVOT POINT (fixed anchor at top) ======
    /* Initial Pivot X */
    let pivotX = window.innerWidth * 0.75;
    if (window.innerWidth < 1000) pivotX = window.innerWidth * 0.5;
    
    const pivotY = 0;

    const pivot = Bodies.circle(pivotX, pivotY, 5, {
        isStatic: true,
        collisionFilter: { group: -1 }, // Non-colliding pivot
        render: { visible: false }
    });

    Composite.add(world, pivot);

    // ====== CARD BODY ======
    const cardWidth = 230;
    const cardHeight = 350;
    const ropeLength = 120; // Shorter rope
    const ropeSegmentsCount = 10; // Fewer segments = less stretch
    const segmentLength = ropeLength / ropeSegmentsCount;

    // Start card hanging at rest position but heavier
    const cardBody = Bodies.rectangle(
        pivotX,
        pivotY + ropeLength + cardHeight / 2 - 18, 
        cardWidth,
        cardHeight,
        {
            density: 0.03, // Heavy enough for inertia
            friction: 0.3,
            frictionAir: 0.05, // Standard air friction
            restitution: 0.0,
            angle: 0,
            angularVelocity: 0,
            collisionFilter: { group: 1 }, // Default collision group
            render: { visible: false }
        }
    );

    Composite.add(world, cardBody);

    // ====== REALISTIC ROPE CHAIN ======
    const ropeSegments = [];
    const ropeConstraints = [];

    // Create segments
    let prevBody = pivot;
    
    for (let i = 0; i < ropeSegmentsCount; i++) {
        // Pivot/First Node Logic
        const isFirst = i === 0;
        
        // Invisible small bodies for rope nodes
        const body = Bodies.circle(
            pivotX, 
            pivotY + (i + 1) * segmentLength, 
            2, 
            {
                density: 1, // Heavier segments help stability
                frictionAir: 0.01, // Standard friction
                collisionFilter: { group: -1 }, // Disable collisions between segments
                render: { visible: false }
            }
        );
        
        Composite.add(world, body);
        ropeSegments.push(body);

        const constraint = Constraint.create({
            bodyA: prevBody,
            bodyB: body,
            length: segmentLength,
            stiffness: 1, // Max stiffness
            damping: 1, // Higher damping for "dry" feel (absorbs shock)
            render: { visible: false }
        });
        
        Composite.add(world, constraint);
        ropeConstraints.push(constraint);
        
        prevBody = body;
    }

    // Connect last segment to Card
    const attachPointY = -cardHeight / 2 + 18;
    const finalConstraint = Constraint.create({
        bodyA: prevBody,
        bodyB: cardBody,
        pointB: { x: 0, y: attachPointY },
        length: segmentLength,
        stiffness: 1,
        damping: 0.5, // Higher damping
        render: { visible: false }
    });
    Composite.add(world, finalConstraint);
    ropeConstraints.push(finalConstraint);

    // FORCE INITIAL FALL (Simulation of "drop")
    // Move card move card up to start position
    Body.setPosition(cardBody, { x: pivotX - 50, y: pivotY - 1000 }); // "Throw" it up


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

        // Calculate grab point in local body coordinates
        const relativeX = mouseX - cardBody.position.x;
        const relativeY = mouseY - cardBody.position.y;
        // Rotate the vector inverse to the body's rotation to get local point
        const localPoint = Vector.rotate({ x: relativeX, y: relativeY }, -cardBody.angle);

        dragConstraint = Constraint.create({
            pointA: { x: mouseX, y: mouseY },
            bodyB: cardBody,
            pointB: localPoint,
            length: 0,
            stiffness: 0.1, // Much softer grab to prevent vibration/fighting with the rigid rope
            damping: 0.1
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

    // ====== RESPONSIVE RESIZE HANDLING ======
    const resize = () => {
        const width = window.innerWidth;
        
        // Hide card on smaller screens (< 900px)
        if (width < 900) {
            container.style.opacity = '0';
            container.style.visibility = 'hidden';
            container.style.pointerEvents = 'none'; // Ensure no interactions
        } else {
            container.style.opacity = '1';
            container.style.visibility = 'visible';
            container.style.pointerEvents = 'none'; // Container is none, children are auto (see CSS)
        }

        canvas.width = container.offsetWidth || window.innerWidth;
        canvas.height = window.innerHeight * 2;
        
        // Recalculate target Pivot X
        let newPivotX = width * 0.75;
        // Even if hidden, we keep the logic consistent or fallback to centered
        if (width < 900) {
            newPivotX = width * 0.5; 
        }
        
        const deltaX = newPivotX - pivot.position.x;
        
        // Translate entire physics assembly
        Body.translate(pivot, { x: deltaX, y: 0 });
        Body.translate(cardBody, { x: deltaX, y: 0 });
        
        ropeSegments.forEach(segment => {
            Body.translate(segment, { x: deltaX, y: 0 });
        });
    };
    resize(); // Initial call
    window.addEventListener('resize', resize);

    // ====== SCROLL BOUNCE EFFECT ======
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const deltaY = currentScrollY - lastScrollY;
        
        // Apply force based on scroll direction
        // limit force to avoid exploding physics on super fast scroll
        const forceY = Math.max(-25, Math.min(25, deltaY * 0.25)); 
        
        if (Math.abs(deltaY) > 0) {
            Body.applyForce(cardBody, cardBody.position, { 
                x: 0, 
                y: forceY 
            });
        }

        lastScrollY = currentScrollY;
    });

    // ====== FLIP SYSTEM ======
    let isFlipped = false;
    let currentFlipAngle = 0;
    const targetFlipAngle0 = 0;
    const targetFlipAngle180 = 180;

    // Use double click to flip to avoid conflict with drag
    cardElement.addEventListener('dblclick', () => {
        isFlipped = !isFlipped;
    });

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

        // Draw Multi-Segment Rope
        ctx.beginPath();
        ctx.moveTo(pivot.position.x, pivot.position.y);
        
        // Curve through segments
        for (let i = 0; i < ropeSegments.length; i++) {
            const pos = ropeSegments[i].position;
            ctx.lineTo(pos.x, pos.y);
        }
        ctx.lineTo(attachX, attachY); // Connect to card
        
        // Styles
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        // Outer glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(139, 92, 246, 0.4)'; // Violet glow
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Core line
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#3b82f6'; // Blue core
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw connector at card attachment
        ctx.save();
        ctx.translate(attachX, attachY);
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(59, 130, 246, 0.7)';
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // ====== UPDATE CARD DOM POSITION ======
        const cardX = cardBody.position.x;
        const cardY = cardBody.position.y;
        const cardAngle = cardBody.angle;

        // Smoothly interpolate flip angle
        const target = isFlipped ? targetFlipAngle180 : targetFlipAngle0;
        // Simple lerp for smooth transition
        currentFlipAngle += (target - currentFlipAngle) * 0.1;

        // Dynamic 3D Tilt based on velocity
        const velocityX = cardBody.velocity.x;
        const velocityY = cardBody.velocity.y;
        
        // Horizontal Tilt (Left/Right)
        const tiltAngleY = -velocityX * 5; 
        const clampedTiltY = Math.max(-55, Math.min(55, tiltAngleY));

        // Vertical Tilt (Top/Bottom) - Pivoting around top
        // Positive velocity (falling) -> Tilt BACK (negative rotateX) to look like drag
        // Negative velocity (rising) -> Tilt FRONT (positive rotateX)
        const tiltAngleX = velocityY * 5; 
        const clampedTiltX = Math.max(-55, Math.min(55, tiltAngleX));

        // Set position (left/top represent the center)
        cardElement.style.left = `${cardX}px`;
        cardElement.style.top = `${cardY}px`;
        
        // Pivot Offset: Distance from center to attachment point
        // cardHeight/2 (175) - 18px = 157px
        const pivotOffset = 157;

        // Combine transforms:
        // 1. Center the element (-50%, -50%)
        // 2. Apply Physics Rotation (Z) around center
        // 3. Apply Horizontal Flip/Tilt (Y) around center
        // 4. Apply Vertical Tilt (X) pivoting around TOP:
        //    Move up to pivot -> Rotate X -> Move back down
        cardElement.style.transform = `
            translate(-50%, -50%) 
            rotate(${cardAngle}rad) 
            rotateY(${clampedTiltY + currentFlipAngle}deg)
            translateY(-${pivotOffset}px) rotateX(${clampedTiltX}deg) translateY(${pivotOffset}px)
        `;

        requestAnimationFrame(render);
    };

    render();
    console.log('[Physics] Falling card physics initialized');
};
