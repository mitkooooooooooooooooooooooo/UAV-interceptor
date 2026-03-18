import { FSM } from './fsm.js';

export class Enemy {
    constructor(x, y, type = 'DRONE') {
        this.x = x;
        this.y = y;
        this.type = type; 
        this.speed = type === 'ROCKET' ? 3 : 1.5;
        this.health = 100;
        this.radius = type === 'ROCKET' ? 8 : 15;
        this.fsm = new FSM('SPAWN');
        this.setupFSM();
    }

    setupFSM() {
        this.fsm.addState('SPAWN', {
            update: (e) => { e.y += 1; },
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
                e.y += this.type === 'ROCKET' ? 2 : 0.8; 
                e.x += (e.x < p.x) ? 0.5 : -0.5; 
            },
            transitions: { 
                'EVADE': (e) => e.y > 250 && this.type === 'DRONE',
                'KAMIKAZE': (e) => e.y > 250 && this.type === 'ROCKET',
                'DEAD': (e) => e.health <= 0 
            }
        });

        this.fsm.addState('EVADE', {
            update: (e) => { 
                e.x += Math.sin(Date.now() / 150) * 4; 
                e.y += 0.3; 
            },
            transitions: { 'KAMIKAZE': (e) => e.y > 450, 'DEAD': (e) => e.health <= 0 }
        });

        this.fsm.addState('KAMIKAZE', {
            update: (e) => { e.y += 6; },
            transitions: { 'DEAD': (e) => e.y > 590 || e.health <= 0 }
        });

        this.fsm.addState('DEAD', {
            update: (e) => { e.radius *= 0.8; },
            transitions: {}
        });
    }

    update(player) {
        this.fsm.update(this, player);
    }

    draw(ctx) {
        ctx.fillStyle = this.type === 'ROCKET' ? '#ffaa00' : '#ff0000';
        ctx.beginPath();
        if (this.type === 'ROCKET') {
            ctx.rect(this.x - 5, this.y - 15, 10, 30);
        } else {
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        }
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.type, this.x, this.y - 20);
        ctx.fillText(this.fsm.state, this.x, this.y + 25);
    }
}