// Settings - ngày sinh: 07/01/2004
const BIRTH_DATE = new Date(2004, 0, 7, 0, 0, 0); // 07 Jan 2004

// Secret message text
const SECRET = "Chúc em luôn cười thật tươi, luôn hạnh phúc và biết rằng có một người rất yêu và trân trọng em 💖";

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initPinOverlay();
  initSecretButton();
  tryPlayMusic();
  initHearts();
  initHeartbeat();
});

/* ---------- PIN overlay (6 digits) ---------- */
const CORRECT = '070104';
function initPinOverlay(){
  const overlay = document.getElementById('pin-overlay');
  if(!overlay) return;
  const digits = Array.from(document.querySelectorAll('.pin-digit'));
  const submit = document.getElementById('pin-submit');
  const clear = document.getElementById('pin-clear');
  const err = document.getElementById('pin-error');

  function getCode(){
    return digits.map(d=>d.value || '').join('');
  }

  digits.forEach((input, idx)=>{
    input.addEventListener('input', (e)=>{
      const v = input.value.replace(/[^0-9]/g,'');
      input.value = v.slice(-1);
      if(v && idx < digits.length-1) digits[idx+1].focus();
      if(v.length>1){
        const chars = v.split('');
        for(let i=0;i<chars.length && (idx+i)<digits.length;i++){
          digits[idx+i].value = chars[i];
        }
      }
      err.textContent = '';
    });
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Backspace' && !input.value && idx>0){
        digits[idx-1].focus();
      }
      if(e.key === 'Enter') submit.click();
    });
    input.addEventListener('paste', (e)=>{
      e.preventDefault();
      const txt = (e.clipboardData || window.clipboardData).getData('text')||'';
      const nums = txt.replace(/\D/g,'').slice(0,6).split('');
      for(let i=0;i<6;i++) digits[i].value = nums[i]||'';
    });
  });

  function checkPass(code){
    if(code.length === 6){
      return code === CORRECT;
    }
    return false;
  }

  submit.addEventListener('click', ()=>{
    const code = getCode();
    if(code.length < 6){ err.textContent = 'Vui lòng nhập đủ 6 chữ số'; return; }
    if(checkPass(code)){
      overlay.setAttribute('aria-hidden','true');
      digits.forEach(d=>d.value='');
      if (window.unlockSecret) {
        window.unlockSecret();
      }
      if (window.showSecretMessage) {
        setTimeout(() => {
          window.showSecretMessage();
        }, 300);
      }
    } else {
      err.textContent = 'Mật khẩu sai — thử lại nhé';
      digits.forEach(d=>d.classList.add('shake'));
      setTimeout(()=>digits.forEach(d=>d.classList.remove('shake')),400);
    }
  });

  clear.addEventListener('click', ()=>{ digits.forEach(d=>d.value=''); digits[0].focus(); err.textContent=''; });
  
  // Function to show PIN overlay and focus first input
  window.showPinOverlay = function() {
    overlay.setAttribute('aria-hidden','false');
    setTimeout(() => digits[0].focus(), 100);
  };
}


/* ---------- Countdown từ ngày sinh ---------- */
function initCountdown() {
  const years = document.getElementById('cd-years');
  const months = document.getElementById('cd-months');
  const days = document.getElementById('cd-days');
  const hours = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  function update() {
    const now = new Date();
    
    // Tính toán số năm, tháng, ngày từ ngày sinh
    let yearDiff = now.getFullYear() - BIRTH_DATE.getFullYear();
    let monthDiff = now.getMonth() - BIRTH_DATE.getMonth();
    let dayDiff = now.getDate() - BIRTH_DATE.getDate();
    let hourDiff = now.getHours() - BIRTH_DATE.getHours();
    let minuteDiff = now.getMinutes() - BIRTH_DATE.getMinutes();
    let secondDiff = now.getSeconds() - BIRTH_DATE.getSeconds();
    // Điều chỉnh borrow từ giây -> phút -> giờ -> ngày -> tháng -> năm
    if (secondDiff < 0) {
      minuteDiff--;
      secondDiff += 60;
    }

    if (minuteDiff < 0) {
      hourDiff--;
      minuteDiff += 60;
    }

    if (hourDiff < 0) {
      dayDiff--;
      hourDiff += 24;
    }

    if (dayDiff < 0) {
      monthDiff--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      dayDiff += lastMonth.getDate();
    }

    if (monthDiff < 0) {
      yearDiff--;
      monthDiff += 12;
    }
    
    years.textContent = yearDiff;
    months.textContent = monthDiff;
    days.textContent = dayDiff;
    hours.textContent = String(hourDiff).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minuteDiff).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(secondDiff).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

function initSecretButton() {
  const btn = document.getElementById('btn-secret');
  const msgEl = document.getElementById('message');
  let typingId = null;
  let isUnlocked = false;
  
  // Function to show secret message
  function showSecretMessage() {
    if (typingId) return;
    msgEl.textContent = '';
    msgEl.style.opacity = '0';
    msgEl.style.display = 'block';
    let i = 0;
    btn.disabled = true;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      btn.style.transform = '';
    }, 150);
    typingId = setInterval(() => {
      if (i < SECRET.length) {
        msgEl.textContent += SECRET[i++];
        if (i === 1) {
          msgEl.style.opacity = '1';
          msgEl.style.transition = 'opacity 0.3s ease';
        }
      } else {
        clearInterval(typingId);
        typingId = null;
        btn.disabled = false;
        msgEl.classList.add('secret-revealed');
        setTimeout(() => msgEl.classList.remove('secret-revealed'), 800);
      }
    }, 35);
  }
  
  btn.addEventListener('click', () => {
    // If not unlocked yet, show PIN overlay
    if (!isUnlocked) {
      if (window.showPinOverlay) {
        window.showPinOverlay();
      }
      return;
    }

    // If unlocked, navigate to the galaxy-love page
    window.location.href = 'galaxy-love/index-galaxy.html';
  });
  
  // Store unlock function globally so PIN overlay can call it
  window.unlockSecret = function() {
    isUnlocked = true;
    try {
      btn.textContent = 'Nhấn vào trái tim để thấy điều bất ngờ';
      btn.classList.remove('muted');
      btn.style.cursor = 'pointer';
      btn.setAttribute('aria-label', 'Mở galaxy love');
    } catch (e) {
    }
    try {
      const heartCanvas = document.getElementById('heartbeat');
      if (heartCanvas) {
        heartCanvas.removeEventListener('click', heartCanvas._redirectHandler);
        heartCanvas._redirectHandler = function() { window.location.href = 'galaxy-love/index-galaxy.html'; };
        heartCanvas.addEventListener('click', heartCanvas._redirectHandler);
      }
    } catch (e) {
    }
  };
  
  // Store show message function globally so PIN overlay can call it
  window.showSecretMessage = showSecretMessage;
}

/* ---------- Music play with fallback button ---------- */
function tryPlayMusic() {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('btn-music');
  let isPlaying = false;
  
  btn.addEventListener('click', async () => {
    try {
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        btn.textContent = 'Bật nhạc';
        btn.classList.add('muted');
      } else {
        audio.muted = false;
        audio.volume = 1;
        await audio.play();
        isPlaying = true;
        btn.textContent = 'Tạm dừng';
        btn.classList.remove('muted');
      }
    } catch (e) {
      btn.textContent = 'Không thể phát';
    }
  });
  
  audio.addEventListener('pause', () => {
    if (!audio.ended) {
      isPlaying = false;
      btn.textContent = 'Bật nhạc';
      btn.classList.add('muted');
    }
  });
  
  audio.addEventListener('play', () => {
    isPlaying = true;
    btn.textContent = 'Tạm dừng';
    btn.classList.remove('muted');
  });
}

function initHearts() {
  const container = document.getElementById('hearts');
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  function makeHeart() {
    const el = document.createElement('div');
    el.className = 'heart';
    const size = 16 + Math.random() * 32;
    el.style.width = size + 'px';
    el.style.height = (size * 0.9) + 'px';
    el.style.left = Math.random() * 100 + '%';
    el.style.top = (85 + Math.random() * 15) + '%';
    el.style.opacity = 0.8 + Math.random() * 0.2;
    const rotation = -30 + Math.random() * 60;
    const scale = 0.7 + Math.random() * 0.5;
    el.style.transform = `translateY(0) scale(${scale}) rotate(${rotation}deg)`;
    const duration = 7 + Math.random() * 5;
    el.style.transition = `transform ${duration}s cubic-bezier(0.4, 0, 0.2, 1), top ${duration}s cubic-bezier(0.4, 0, 0.2, 1), opacity ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
    container.appendChild(el);
    requestAnimationFrame(() => {
      el.style.top = (-15 - Math.random() * 25) + '%';
      el.style.opacity = 0;
      el.style.transform = `translateY(0) scale(${scale * 0.5}) rotate(${rotation + Math.random() * 20}deg)`;
    });
    setTimeout(() => el.remove(), (duration + 2) * 1000);
  }
  for (let i = 0; i < 15; i++) setTimeout(makeHeart, i * 250);
  setInterval(makeHeart, 1200);
}

function initFireworks() {
  const canvas = document.getElementById('fireworks');
  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width = canvas.clientWidth = Math.min(window.innerWidth * 0.9, 800);
    canvas.height = canvas.clientHeight = 220;
  }
  window.addEventListener('resize', resize); resize();

  const particles = [];
  function spawn(x, y) {
    const hue = 300 + Math.random() * 60;
    const count = 20 + Math.floor(Math.random() * 20);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 3 + Math.random() * 4;
      particles.push({
        x, y,
        vel: { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        life: 70 + Math.random() * 50,
        color: `hsl(${hue + Math.random() * 30},85%,${55 + Math.random() * 15}%)`,
        alpha: 1,
        size: 2 + Math.random() * 2
      });
    }
  }

  function step() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vel.x;
      p.y += p.vel.y;
      p.vel.y += 0.15;
      p.vel.x *= 0.98;
      p.alpha *= 0.987;
      p.life--;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.life <= 0 || p.alpha < 0.02) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    if (Math.random() < 0.035) {
      spawn(Math.random() * canvas.width, 30 + Math.random() * 70);
    }
    requestAnimationFrame(step);
  }
  step();
}

function initHeartbeat() {
  const c = document.getElementById('heartbeat');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height, cx = w / 2, cy = h / 2;
  let t = 0;
  // overlay text that can be set from elsewhere (e.g. after unlocking)
  window.heartbeatOverlayText = '';
  window.setHeartbeatOverlay = function(text) {
    window.heartbeatOverlayText = text || '';
    if (c) c.style.cursor = text ? 'pointer' : '';
  };
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const beat = 1 + Math.abs(Math.sin(t * 2)) * 0.16 + Math.max(0, Math.sin(t * 8)) * 0.06;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(beat, beat);
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 107, 149, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.bezierCurveTo(25, -60, 80, -30, 0, 60);
    ctx.bezierCurveTo(-80, -30, -25, -60, 0, -20);
    ctx.closePath();
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    grad.addColorStop(0, '#ffb3cc');
    grad.addColorStop(0.5, '#ff8bb3');
    grad.addColorStop(1, '#ff5e78');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
    // draw overlay text if provided
    if (window.heartbeatOverlayText) {
      ctx.save();
      const textX = cx + 50;
      const textY = cy + 75;
      ctx.font = '600 17px "Segoe UI", system-ui, sans-serif';
      const textMetrics = ctx.measureText(window.heartbeatOverlayText);
      const textWidth = textMetrics.width;
      const padding = 12;
      const borderRadius = 16;
      const boxX = -padding - 20;
      const boxY = -18;
      const boxW = textWidth + padding * 2 + 20;
      const boxH = 36;
      
      ctx.translate(textX, textY);
      
      ctx.beginPath();
      ctx.moveTo(boxX + borderRadius, boxY);
      ctx.lineTo(boxX + boxW - borderRadius, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + borderRadius);
      ctx.lineTo(boxX + boxW, boxY + boxH - borderRadius);
      ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - borderRadius, boxY + boxH);
      ctx.lineTo(boxX + borderRadius, boxY + boxH);
      ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - borderRadius);
      ctx.lineTo(boxX, boxY + borderRadius);
      ctx.quadraticCurveTo(boxX, boxY, boxX + borderRadius, boxY);
      ctx.closePath();
      
      const bgGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
      bgGrad.addColorStop(0, 'rgba(255, 182, 193, 0.95)');
      bgGrad.addColorStop(1, 'rgba(255, 107, 149, 0.95)');
      ctx.fillStyle = bgGrad;
      ctx.shadowColor = 'rgba(255, 107, 149, 0.5)';
      ctx.shadowBlur = 12;
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(-20, -8);
      ctx.lineTo(-8, 0);
      ctx.lineTo(-20, 8);
      ctx.closePath();
      const arrowGrad = ctx.createLinearGradient(-20, -8, -8, 8);
      arrowGrad.addColorStop(0, '#ff8bb3');
      arrowGrad.addColorStop(1, '#ff5e78');
      ctx.fillStyle = arrowGrad;
      ctx.shadowBlur = 8;
      ctx.fill();
      
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.fillText(window.heartbeatOverlayText, 0, 5);
      
      ctx.restore();
    }
    t += 0.035;
    requestAnimationFrame(draw);
  }
  draw();
}

