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

// Chatbot modal toggle
document.getElementById('chatbotBtn').onclick = () =>
  document.getElementById('chatbotModal').classList.add('active');
document.getElementById('chatbotClose').onclick = () =>
  document.getElementById('chatbotModal').classList.remove('active');

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
