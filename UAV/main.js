import { Drone } from './enemy.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const player = { x: 400, y: 560, angle: 0, score: 0 };
let drones = [];
let isPaused = false;

window.addEventListener('load', () => {
    setInterval(() => { if(!isPaused) drones.push(new Drone(Math.random() * 700, 0)); }, 3000);
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') player.x -= 10;
    if (e.code === 'ArrowRight') player.x += 10;
    if (e.code === 'Escape') isPaused = !isPaused;
});

window.addEventListener('keyup', (e) => { if(e.code === 'Space') console.log('Weapon Ready'); });
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    player.angle = Math.atan2(e.clientY - rect.top - player.y, e.clientX - rect.left - player.x);
});
canvas.addEventListener('mousedown', () => { player.score++; });
canvas.addEventListener('mouseup', () => {});
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('wheel', (e) => { console.log('Zoom Level Adjusted'); });
window.addEventListener('resize', () => { console.log('Layout Refreshed'); });
window.addEventListener('blur', () => { isPaused = true; });

function gameLoop() {
    if (!isPaused) {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#c2b280';
        ctx.fillRect(0, 580, canvas.width, 20);

        drones.forEach((drone, i) => {
            drone.update(player);
            drone.draw(ctx);
            if (drone.fsm.state === 'DEAD' && drone.radius < 1) drones.splice(i, 1);
        });

        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle + Math.PI/2);
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(-15, -10, 30, 40);
        ctx.restore();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();