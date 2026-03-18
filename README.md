# Shield of the Desert: AA Defense

## Description
A browser-based tactical defense game where UAE Anti-Air systems intercept incoming drone and rocket threats. Inspired by UFO vs Asteroids and modern air defense mechanics.

## How to Play
- **Move:** Arrow Left / Arrow Right
- **Aim:** Mouse Movement
- **Fire:** Left Click
- **Pause:** Escape Key
- **Zoom:** Mouse Wheel

## Implemented Events (10+)
1. load - System initialization
2. keydown - Player movement and pause
3. keyup - Weapon status check
4. mousemove - Turret aiming logic
5. mousedown - Interceptor firing
6. mouseup - Click release handling
7. contextmenu - Prevent default browser menu
8. wheel - Radar zoom simulation
9. resize - Responsive canvas scaling
10. blur - Auto-pause on tab switch

## FSM AI Behavior
The drones operate on a Finite State Machine with 5 distinct states:

| Current State | Condition | Next State | Action |
| --- | --- | --- | --- |
| SPAWN | Altitude > 50 | CRUISE | Enter battlefield |
| CRUISE | Player Distance < 150 | LOCK | Begin targeting |
| LOCK | Altitude > 250 | EVADE | Start dodging |
| EVADE | Altitude > 450 | KAMIKAZE | High-speed dive |
| ANY | Health <= 0 | DEAD | Explosion effect |

## Technologies Used
- HTML5 Canvas
- Web Audio API (Synthesized sounds)
- JavaScript (ES6+ Classes)
- CSS3
