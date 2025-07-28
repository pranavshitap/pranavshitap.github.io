// Particle background setup
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
const colors = ['#50fa7b', '#8be9fd', '#ff79c6', '#f1fa8c'];
let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function Particle() {
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * canvas.height;
  this.radius = Math.random() * 2 + 1;
  this.color = colors[Math.floor(Math.random() * colors.length)];
  this.vx = (Math.random() - 0.5) * 0.7;
  this.vy = (Math.random() - 0.5) * 0.7;
}

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;
};

Particle.prototype.update = function () {
  this.x += this.vx;
  this.y += this.vy;
  if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
  if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

  let dx = mouse.x - this.x;
  let dy = mouse.y - this.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 120) {
    this.x -= dx * 0.01;
    this.y -= dy * 0.01;
  }
};

function createParticles(num) {
  particles = [];
  for (let i = 0; i < num; i++) {
    particles.push(new Particle());
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let p of particles) {
    p.update();
    p.draw();
  }
  requestAnimationFrame(animate);
}

createParticles(window.innerWidth < 600 ? 40 : 80);
animate();

const chatbotBtn = document.getElementById('chatbotBtn');
const chatbotModal = document.getElementById('chatbotModal');
const chatbotOverlay = document.getElementById('chatbotOverlay');
const chatbotClose = document.getElementById('chatbotClose');

chatbotBtn.onclick = () => {
  chatbotModal.classList.add('active');
  chatbotOverlay.classList.add('active');
};

chatbotClose.onclick = () => {
  chatbotModal.classList.remove('active');
  chatbotOverlay.classList.remove('active');
};

chatbotOverlay.onclick = () => {
  chatbotModal.classList.remove('active');
  chatbotOverlay.classList.remove('active');
};


// Theme toggle with localStorage
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  const newTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
}

themeToggle.addEventListener('click', toggleTheme);

// Apply saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  applyTheme(savedTheme);
}

// === Chatbot Logic ===

async function sendChatMessage(message, onStreamChunk) {
  const res = await fetch('http://127.0.0.1:8010/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ prompt: message }),
  });

  if (!res.body) return '';

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let reply = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    reply += chunk;
    if (onStreamChunk) onStreamChunk(chunk);
  }
  return reply;
}

function addChatMessage(sender, message) {
  const chatLog = document.getElementById('chat-log');
  const div = document.createElement('div');
  const isUser = sender === 'You';
  div.className = 'chat-message ' + (isUser ? 'user' : 'bot');
  div.innerHTML = `<div class="chat-bubble"><strong>${sender}:</strong> ${message}</div>`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function checkSessionAccess() {
  // Checks if session is present
  if (document.cookie.includes('session')) {
    document.getElementById('chat-access').style.display = 'block';
  }
}

document.getElementById('chat-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addChatMessage('You', userMessage);
  input.value = '';

  // Create bot message placeholder
  const chatLog = document.getElementById('chat-log');
  const botDiv = document.createElement('div');
  botDiv.className = 'chat-message bot';
  botDiv.innerHTML = `<div class="chat-bubble"><strong>Bot:</strong> <span id="bot-reply"></span></div>`;
  chatLog.appendChild(botDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  const botReplySpan = botDiv.querySelector('#bot-reply');
  try {
    await sendChatMessage(userMessage, chunk => {
      botReplySpan.textContent += chunk;
      chatLog.scrollTop = chatLog.scrollHeight;
    });
    checkSessionAccess();
  } catch (err) {
    console.error('Error:', err);
    botReplySpan.textContent = 'Something went wrong. Please try again.';
  }
});

window.addEventListener('load', checkSessionAccess);

