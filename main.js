import { Enemy } from './enemy.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const player = { 
    x: 400, 
    y: 560, 
    angle: 0, 
    intercepted: 0, 
    missed: 0,
    maxMissed: 5,
    isGameOver: false 
};

let enemies = [];
let interceptors = [];
let isPaused = false;

function createTone(freq, dur, type = 'sine') {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + dur);
    osc.start();
    osc.stop(audioContext.currentTime + dur);
}

window.addEventListener('load', () => {
    setInterval(() => { 
        if(!isPaused && !player.isGameOver) {
            const type = Math.random() > 0.5 ? 'DRONE' : 'ROCKET';
            enemies.push(new Enemy(Math.random() * 700, 0, type));
        }
    }, 2000);
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.angle = Math.atan2(e.clientY - rect.top - player.y, e.clientX - rect.left - player.x);
});

canvas.addEventListener('mousedown', () => {
    if (isPaused || player.isGameOver) return;
    if (audioContext.state === 'suspended') audioContext.resume();
    
    createTone(600, 0.1, 'square'); 
    interceptors.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * 8,
        vy: Math.sin(player.angle) * 8
    });
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.x -= 20;
    if (e.code === 'ArrowRight') player.x += 20;
    if (e.code === 'Escape') isPaused = !isPaused;
    if (e.code === 'KeyR' && player.isGameOver) location.reload(); 
});

function drawHUD() {
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 18px Monospace';
    ctx.textAlign = 'right'; // Aligns text to the right
    
    // Positioned at canvas.width - 20 (780px)
    ctx.fillText(`INTERCEPTED: ${player.intercepted}`, canvas.width - 20, 40);
    
    ctx.fillStyle = '#ff4444';
    ctx.fillText(`HITS ON TARGET: ${player.missed}/${player.maxMissed}`, canvas.width - 20, 70);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ff0000';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText("DEFENSE BREACHED", canvas.width/2, canvas.height/2);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText("Press 'R' to Reboot System", canvas.width/2, canvas.height/2 + 50);
}

function gameLoop() {
    if (!isPaused && !player.isGameOver) {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#c2b280';
        ctx.fillRect(0, 580, canvas.width, 20);

        interceptors.forEach((missile, mIdx) => {
            missile.x += missile.vx;
            missile.y += missile.vy;
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(missile.x, missile.y, 4, 4);

            enemies.forEach((enemy) => {
                const dist = Math.hypot(missile.x - enemy.x, missile.y - enemy.y);
                if (dist < enemy.radius && enemy.fsm.state !== 'DEAD') {
                    createTone(150, 0.2, 'sawtooth'); // Explosion sound
                    enemy.health = 0;
                    enemy.fsm.state = 'DEAD';
                    interceptors.splice(mIdx, 1);
                    player.intercepted++;
                }
            });

            if (missile.y < 0 || missile.x < 0 || missile.x > 800) interceptors.splice(mIdx, 1);
        });

        enemies.forEach((enemy, i) => {
            enemy.update(player);
            enemy.draw(ctx);
            
            if (enemy.y > 575 && enemy.fsm.state !== 'DEAD') {
                createTone(100, 0.5, 'sine'); // Impact alert
                player.missed++;
                enemies.splice(i, 1);
                if (player.missed >= player.maxMissed) player.isGameOver = true;
            }

            if (enemy.fsm.state === 'DEAD' && enemy.radius < 1) enemies.splice(i, 1);
        });

        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle + Math.PI/2);
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(-12, -35, 24, 45); // Larger turret
        ctx.restore();

        drawHUD();
    } else if (player.isGameOver) {
        drawGameOver();
    }
    
    requestAnimationFrame(gameLoop);
}

gameLoop();