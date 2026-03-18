import { FSM } from './fsm.js';

export class Drone {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = 1.5;
        this.health = 100;
        this.radius = 12;
        this.fsm = new FSM('SPAWN');
        this.setupFSM();
    }

    setupFSM() {
        this.fsm.addState('SPAWN', {
            update: (e) => { e.y += 0.5; },
            transitions: { 'CRUISE': (e) => e.y > 50 }
        });

        this.fsm.addState('CRUISE', {
            update: (e) => { e.x += e.speed; },
            transitions: { 
                'LOCK': (e, p) => Math.abs(e.x - p.x) < 150,
                'DEAD': (e) => e.health <= 0 
            }
        });

        this.fsm.addState('LOCK', {
            update: (e, p) => { 
                e.y += 0.8; 
                e.x += (e.x < p.x) ? 0.4 : -0.4; 
            },
            transitions: { 
                'EVADE': (e) => e.y > 250,
                'DEAD': (e) => e.health <= 0 
            }
        });

        this.fsm.addState('EVADE', {
            update: (e) => { 
                e.x += Math.sin(Date.now() / 150) * 4; 
                e.y += 0.3; 
            },
            transitions: { 'KAMIKAZE': (e) => e.y > 450 }
        });

        this.fsm.addState('KAMIKAZE', {
            update: (e) => { e.y += 6; },
            transitions: { 'DEAD': (e) => e.y > 590 || e.health <= 0 }
        });

        this.fsm.addState('DEAD', {
            update: (e) => { e.radius *= 0.9; },
            transitions: {}
        });
    }

    update(player) {
        this.fsm.update(this, player);
    }

    draw(ctx) {
        ctx.fillStyle = this.fsm.state === 'KAMIKAZE' ? '#ff4d00' : '#ff0000';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius);
        ctx.lineTo(this.x + this.radius, this.y + this.radius);
        ctx.lineTo(this.x - this.radius, this.y + this.radius);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = '10px Monospace';
        ctx.textAlign = 'center';
        ctx.fillText(this.fsm.state, this.x, this.y - 15);
    }
}