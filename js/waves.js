(() => {
  const landing = document.getElementById('land');
  const canvas = document.getElementById('landingWaves');
  if (!landing || !canvas) return;

  const context = canvas.getContext('2d');
  if (!context) {
    console.warn('Landing wave background is unavailable: 2D canvas is not supported.');
    return;
  }

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = { x: 0, y: 0, clientX: 0, clientY: 0, seen: false, strength: 0 };
  const highlightColors = [
    'rgba(255,243,166,.34)',
    'rgba(255,243,166,.48)',
    'rgba(255,243,166,.64)',
    'rgba(255,243,166,.80)',
    'rgba(255,243,166,.96)'
  ];

  let width = 0;
  let height = 0;
  let frame = 0;
  let lastFrameTime = 0;
  let isVisible = true;
  let staticDrawFrame = 0;
  let touchClearTimer = 0;

  function resizeCanvas() {
    width = landing.clientWidth;
    height = landing.scrollHeight;
    if (!width || !height) return;

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      Math.sqrt(8000000 / (width * height))
    );
    canvas.width = Math.max(1, Math.round(width * pixelRatio));
    canvas.height = Math.max(1, Math.round(height * pixelRatio));
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    if (motionPreference.matches) draw(0);
  }

  function draw(time) {
    if (!width || !height) return;

    const isDark = document.documentElement.dataset.theme === 'dark';
    const step = Math.max(14, Math.min(24, Math.round(width / 70)));
    const radius = Math.max(130, Math.min(200, width * 0.16));
    const highlightPaths = [[], [], [], [], []];
    const rect = canvas.getBoundingClientRect();

    if (pointer.seen) {
      pointer.x = pointer.clientX - rect.left;
      pointer.y = pointer.clientY - rect.top;
    }

    context.clearRect(0, 0, width, height);
    context.fillStyle = isDark ? 'rgba(255,215,0,.15)' : 'rgba(53,56,57,.15)';
    context.beginPath();

    for (let baseY = step / 2; baseY < height; baseY += step) {
      for (let baseX = step / 2; baseX < width; baseX += step) {
        const x = baseX + Math.sin(baseY * 0.008 - baseX * 0.005 + time * 0.4) * 4;
        let y = baseY
          + Math.sin(baseX * 0.012 + baseY * 0.003 + time * 0.75) * 10
          + Math.sin(baseY * 0.006 - baseX * 0.005 + time * 0.35) * 7;

        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const proximity = distance < radius ? 1 - distance / radius : 0;
        const heat = proximity * proximity * pointer.strength;

        if (heat > 0.06) {
          if (distance > 0) {
            const push = heat * 4;
            y += dy / distance * push;
          }
          const level = Math.min(4, Math.floor((heat - 0.06) / 0.17));
          highlightPaths[level].push(x, y);
        }

        context.moveTo(x + 1.15, y);
        context.arc(x, y, 1.15, 0, Math.PI * 2);
      }
    }

    context.fill();
    for (let level = 0; level < highlightPaths.length; level += 1) {
      const points = highlightPaths[level];
      if (!points.length) continue;

      context.fillStyle = highlightColors[level];
      context.beginPath();
      for (let i = 0; i < points.length; i += 2) {
        context.moveTo(points[i] + 1.8, points[i + 1]);
        context.arc(points[i], points[i + 1], 1.8, 0, Math.PI * 2);
      }
      context.fill();
    }
  }

  function stopAnimation() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function animate(now) {
    frame = 0;
    if (!isVisible || document.hidden) return;

    if (now - lastFrameTime >= 33) {
      lastFrameTime = now;
      pointer.strength += ((pointer.seen ? 1 : 0) - pointer.strength) * 0.12;
      draw(now / 1000);
    }

    frame = requestAnimationFrame(animate);
  }

  function updateAnimation() {
    stopAnimation();
    if (motionPreference.matches) {
      pointer.strength = 0;
      draw(0);
    } else if (isVisible && !document.hidden) {
      frame = requestAnimationFrame(animate);
    }
  }

  function showPointerResponse(event) {
    if (touchClearTimer) {
      window.clearTimeout(touchClearTimer);
      touchClearTimer = 0;
    }

    pointer.clientX = event.clientX;
    pointer.clientY = event.clientY;
    pointer.seen = true;
    if (motionPreference.matches) {
      pointer.strength = 1;
      scheduleStaticDraw();
    } else if (event.type === 'pointerdown' && event.pointerType === 'touch') {
      pointer.strength = 1;
      draw(performance.now() / 1000);
    }
  }

  function scheduleStaticDraw() {
    if (staticDrawFrame) return;
    staticDrawFrame = requestAnimationFrame(() => {
      staticDrawFrame = 0;
      if (motionPreference.matches) draw(0);
    });
  }

  function clearPointerResponse() {
    pointer.seen = false;
    if (motionPreference.matches) {
      pointer.strength = 0;
      scheduleStaticDraw();
    }
  }

  landing.addEventListener('pointermove', showPointerResponse, { passive: true });
  landing.addEventListener('pointerdown', showPointerResponse, { passive: true });

  landing.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'touch') clearPointerResponse();
  }, { passive: true });
  landing.addEventListener('pointerup', event => {
    if (event.pointerType !== 'touch') return;
    pointer.seen = false;
    if (motionPreference.matches) {
      pointer.strength = 1;
      scheduleStaticDraw();
      touchClearTimer = window.setTimeout(() => {
        touchClearTimer = 0;
        clearPointerResponse();
      }, 650);
    }
  }, { passive: true });
  landing.addEventListener('pointercancel', clearPointerResponse, { passive: true });

  window.addEventListener('resize', resizeCanvas, { passive: true });
  document.addEventListener('visibilitychange', updateAnimation);
  if ('ResizeObserver' in window) {
    new ResizeObserver(resizeCanvas).observe(landing);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      isVisible = entries.some(entry => entry.isIntersecting);
      updateAnimation();
    }).observe(landing);
  }

  if (motionPreference.addEventListener) {
    motionPreference.addEventListener('change', updateAnimation);
  } else if (motionPreference.addListener) {
    motionPreference.addListener(updateAnimation);
  }

  new MutationObserver(() => draw(motionPreference.matches ? 0 : performance.now() / 1000))
    .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  resizeCanvas();
  updateAnimation();
})();
