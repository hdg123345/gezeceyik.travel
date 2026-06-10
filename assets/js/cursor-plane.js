(function initCursorPlane() {
  const cursorPlane = document.getElementById('cursorPlane');
  if (!cursorPlane) return;
  if (('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
    cursorPlane.style.display = 'none';
    return;
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cursorPlane.style.display = 'none';
    return;
  }

  // Replace native cursor with plane
  document.body.classList.add('cursor-plane-active');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let lastMouseX = mouseX;
  let lastMouseY = mouseY;
  // SVG plane nose points UP natively (y small). To align with movement
  // direction from atan2 (0°=right, 90°=down): rotate by +90°.
  //   move right  → atan2 = 0   → rotation =  90° (nose right)  ✓
  //   move down   → atan2 = 90  → rotation = 180° (nose down)   ✓
  //   move up     → atan2 = -90 → rotation =   0° (nose up)     ✓
  //   move left   → atan2 = 180 → rotation = 270° (nose left)   ✓
  let currentAngle = 0;
  let targetAngle  = 0;
  let mouseVisible = false;
  let lastTrailTime = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!mouseVisible) {
      cursorPlane.classList.add('visible');
      mouseVisible = true;
    }

    const dx = mouseX - lastMouseX;
    const dy = mouseY - lastMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Update target rotation only when there is meaningful movement
    if (dist > 1.5) {
      targetAngle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    }

    // Emit vapor trail along movement direction (not when stationary)
    const now = Date.now();
    if (dist > 2 && now - lastTrailTime > 14) {
      const movementAngle = Math.atan2(dy, dx) * (180 / Math.PI);
      createTrail(mouseX, mouseY, movementAngle);
      lastTrailTime = now;
    }

    lastMouseX = mouseX;
    lastMouseY = mouseY;
  });

  document.addEventListener('mouseleave', () => {
    cursorPlane.classList.remove('visible');
    mouseVisible = false;
  });
  document.addEventListener('mouseenter', () => {
    cursorPlane.classList.add('visible');
    mouseVisible = true;
  });

  // Shortest-path angle lerp (handles 359° → 1° smoothly)
  function shortestAngleDiff(target, current) {
    let diff = (target - current) % 360;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  }

  // Render loop: position INSTANT, rotation SMOOTH (snappy turning)
  function tick() {
    const diff = shortestAngleDiff(targetAngle, currentAngle);
    currentAngle += diff * 0.14;
    cursorPlane.style.transform =
      'translate(-50%, -50%) translate(' + mouseX + 'px, ' + mouseY +
      'px) rotate(' + currentAngle.toFixed(1) + 'deg)';
    requestAnimationFrame(tick);
  }
  tick();

  function createTrail(x, y, angle) {
    // Cloud puff with subtle perpendicular jitter — natural irregular vapor
    const rad = angle * Math.PI / 180;
    const perpX = -Math.sin(rad);
    const perpY =  Math.cos(rad);
    const jitter = (Math.random() - 0.5) * 5;

    const puff = document.createElement('div');
    puff.className = 'cursor-trail';
    puff.style.left = (x + perpX * jitter).toFixed(1) + 'px';
    puff.style.top  = (y + perpY * jitter).toFixed(1) + 'px';
    document.body.appendChild(puff);
    setTimeout(() => { puff.remove(); }, 1300);
  }
})();
