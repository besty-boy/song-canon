/* Volume bar with long-press cannonball launch (mobile/desktop)
 * - Click/tap the track to set volume directly
 * - Drag the track to adjust
 * - Long-press the speaker icon to CHARGE. On release, a cannonball starts from the icon and
 *   travels along the track; the longer you hold, the farther it goes. When it stops, volume is set.
 * - Keyboard: ArrowLeft/ArrowRight to adjust, Space/Enter on the icon to charge/release
 */
(function () {
  const track = document.getElementById('volumeTrack');
  const fill = document.getElementById('volumeFill');
  const percentEl = document.getElementById('volumePercent');
  const iconBtn = document.getElementById('volumeIcon');
  const ball = document.getElementById('cannonBall');
  const volumeGroup = document.querySelector('.volume');

  // State
  let volume = 0;
  let isDragging = false;
  let charging = false;
  let launching = false;
  let chargeStart = 0;
  let chargeRaf = 0;
  let launchRaf = 0;


  const MAX_CHARGE_MS = 2000;
  const MIN_TARGET_PCT = 0;
  const MAX_TARGET_PCT = 100;


  const LOOP_START = 15;
  const LOOP_END = 45;
  let audioStarted = false;
  let audioEl = null;
  function startAudio() {
    if (audioStarted) {
      if (audioEl && audioEl.paused) {
        audioEl.play().catch(() => {});
      }
      return;
    }
    audioStarted = true;
    try {
      audioEl = new Audio('img/music.mp3');
      audioEl.preload = 'auto';
      audioEl.loop = false;
      audioEl.volume = volume;


      const seekToLoopStart = () => {
        try {
          const dur = isFinite(audioEl.duration) ? audioEl.duration : Infinity;
          const t = Math.min(LOOP_START, Math.max(0, dur));
          if (!isNaN(t) && isFinite(t)) {
            audioEl.currentTime = t;
          }
        } catch {}
      };
      if (audioEl.readyState >= 1) {
        seekToLoopStart();
      } else {
        audioEl.addEventListener('loadedmetadata', seekToLoopStart, { once: true });
      }


      audioEl.addEventListener('timeupdate', () => {
        if (audioEl.currentTime >= LOOP_END) {
          audioEl.currentTime = LOOP_START;

          if (audioEl.paused) audioEl.play().catch(() => {});
        }
      });


      audioEl.play().catch(() => {

        audioStarted = true;
      });
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  }

  function setVolumeFromPct(p) {
    const clamped = Math.max(0, Math.min(100, p));
    volume = clamped / 100;
    updateUI();
    if (audioEl) audioEl.volume = volume;
  }

  function setVolume(v01) {
    const v = Math.max(0, Math.min(1, v01));
    volume = v;
    updateUI();
    if (audioEl) audioEl.volume = volume;
  }

  function updateUI() {
    const pct = Math.round(volume * 100);
    fill.style.width = pct + '%';
    track.setAttribute('aria-valuenow', String(pct));
    percentEl.value = pct + '%';
    // Hide the ball when not charging/launching; keep it at the fill end
    if (!charging && !launching) {
      ball.style.left = pct + '%';
      ball.style.scale = '0';
      volumeGroup.classList.remove('volume--charging');
    }
  }

  function pctFromEvent(ev) {
    const rect = track.getBoundingClientRect();
    const x = (ev.clientX ?? (ev.touches && ev.touches[0]?.clientX) ?? 0) - rect.left;
    const p = (x / rect.width) * 100;
    return Math.max(0, Math.min(100, p));
  }

  // Utility: get positions for launch
  function getGeometry() {
    const trackRect = track.getBoundingClientRect();
    const iconRect = iconBtn.getBoundingClientRect();
    const startX = iconRect.left + iconRect.width / 2 - trackRect.left; // px relative to track left
    const width = trackRect.width;
    return { startX, width };
  }


  function onPointerDownTrack(ev) {
    if (launching) return;
    startAudio();
    ev.preventDefault();
    isDragging = true;
    track.setPointerCapture?.(ev.pointerId ?? 1);
    const p = pctFromEvent(ev);
    setVolumeFromPct(p);
  }
  function onPointerMoveTrack(ev) {
    if (!isDragging) return;
    ev.preventDefault();
    const p = pctFromEvent(ev);
    setVolumeFromPct(p);
  }
  function onPointerUpTrack(ev) {
    if (!isDragging) return;
    ev.preventDefault();
    isDragging = false;
    track.releasePointerCapture?.(ev.pointerId ?? 1);
  }

  // Charging on the icon
  function startCharging() {
    if (charging || launching) return;
    startAudio();
    charging = true;
    chargeStart = performance.now();
    volumeGroup.classList.add('volume--charging');


    const { startX } = getGeometry();
    ball.style.left = startX + 'px';
    ball.style.scale = '1';

  }

  function animateLaunchTo(targetPct, onDone) {
    const { startX, width } = getGeometry();
    const startPx = startX;
    const endPx = (Math.max(0, Math.min(100, targetPct)) / 100) * width;
    const distance = Math.abs(endPx - startPx);
    const base = 350;
    const perPx = 0.6;
    const duration = Math.max(280, Math.min(900, base + distance * perPx));

    const t0 = performance.now();
    cancelAnimationFrame(launchRaf);


    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const step = () => {
      const t = (performance.now() - t0) / duration;
      if (t >= 1) {
        ball.style.left = endPx + 'px';
        onDone?.();
        return;
      }
      const k = ease(t);
      const x = startPx + (endPx - startPx) * k;
      ball.style.left = x + 'px';
      launchRaf = requestAnimationFrame(step);
    };
    launchRaf = requestAnimationFrame(step);
  }

  function stopCharging(apply = true) {
    if (!charging) return;
    charging = false;
    cancelAnimationFrame(chargeRaf);
    volumeGroup.classList.remove('volume--charging');

    if (!apply) {

      ball.style.scale = '0';
      ball.style.transform = 'scale(1)';
      ball.style.left = (volume * 100) + '%';
      return;
    }


    const hold = performance.now() - chargeStart;
    const power = Math.min(1, hold / MAX_CHARGE_MS);
    const targetPct = MIN_TARGET_PCT + power * (MAX_TARGET_PCT - MIN_TARGET_PCT);

    launching = true;
    animateLaunchTo(targetPct, () => {
      launching = false;

      setVolumeFromPct(targetPct);
      ball.style.scale = '0';
      ball.style.transform = 'scale(1)';
    });
  }

  // Icon pointer handlers
  iconBtn.addEventListener('pointerdown', (ev) => {
    ev.preventDefault();
    startCharging();
    iconBtn.setPointerCapture?.(ev.pointerId ?? 1);
  });
  iconBtn.addEventListener('pointerup', (ev) => {
    ev.preventDefault();
    stopCharging(true);
    iconBtn.releasePointerCapture?.(ev.pointerId ?? 1);
  });
  iconBtn.addEventListener('pointercancel', () => stopCharging(false));
  iconBtn.addEventListener('pointerleave', () => stopCharging(false));

  // Track pointer listeners (mouse/touch unified)
  track.addEventListener('pointerdown', onPointerDownTrack);
  window.addEventListener('pointermove', onPointerMoveTrack);
  window.addEventListener('pointerup', onPointerUpTrack);

  // Keyboard support on the track
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setVolume(Math.max(0, volume - 0.05));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setVolume(Math.min(1, volume + 0.05));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setVolume(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setVolume(1);
    }
  });


  iconBtn.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
      e.preventDefault();
      if (!charging) startCharging(); else stopCharging(true);
    }
  });



  updateUI();
})();
