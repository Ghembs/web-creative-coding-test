let canvas, context;

let w, h, particles;
let particleDistance = 40; // TODO impostare questo valore come parametro
particleDimension = particleDistance / 10;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    distance (vec) {
        let dx = this.x - vec.x;
        let dy = this.y - vec.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

class DotDrawer {
    constructor(x, y, radius) {
        this.pos = new Vector(x, y);
        this.baseX = x;
        this.baseY = y;
        this.radius = radius;
        this.color = "#ffffff"// `rgb(${150}, ${220}, ${255}, ${255})`//`hsl(${hue}, 100%, 50%)`
    };

    draw (context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        context.closePath();
        context.fill();
    }

    update () {
        const distance = this.pos.distance(mouse.pos);
        if (distance  < mouse.radius) {
            let force = (1 / distance - 1 / mouse.radius) * 10; // TODO parametrizzare la forza di repulsione
            this.pos.x -= (mouse.pos.x - this.pos.x) * force;
            this.pos.y -= (mouse.pos.y - this.pos.y) * force;
        } else {
            if (this.pos.x !== this.baseX) {
                this.pos.x -= (this.pos.x - this.baseX) / 10;
            }
            if (this.pos.y !== this.baseY) {
                this.pos.y -= (this.pos.y - this.baseY) / 10;
            }
        }
    }
}

let mouse = {
    pos: new Vector(undefined, undefined),
    radius: 50, // TODO parametrizzare la distanza dal mouse
}

function init() {
    canvas = document.querySelector('canvas');
    context = canvas.getContext('2d');
    resizeReset();
    animationLoop();
}

function resizeReset() {
    canvas.width = w = window.innerWidth;
    canvas.height = h = window.innerHeight;

    particles = [];
    for (let i = particleDistance / 2; i < w; i += particleDistance) {
        for (let j = particleDistance / 2; j < h; j += particleDistance) {
            let particle = new DotDrawer(i, j, particleDimension);
            particles.push(particle);
        }
    }
}

function animationLoop() {
    context.clearRect(0, 0, w, h);
    particles.map((p) =>{
        p.update();
        p.draw(context);
    });

    drawLine();
    requestAnimationFrame(animationLoop);
}

function drawLine() {
    for (let i = 0; i < particles.length; i++){
        for (let j = i+1; j < particles.length; j++) {
            let distance = particles[i].pos.distance(particles[j].pos);
            if (distance < particleDistance * 1.5) {
                let opacity = 1 - distance / (particleDistance * 1.5);
                context.strokeStyle = "rgba(255, 255, 255, " + opacity + ")";
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(particles[i].pos.x, particles[i].pos.y);
                context.lineTo(particles[j].pos.x, particles[j].pos.y);
                context.stroke();
                context.closePath();
            }
        }
    }
}

function mouseOut (e) {
    mouse.pos.x = undefined;
    mouse.pos.y = undefined;
}

function mouseMove(e) {
    mouse.pos.x = e.x;
    mouse.pos.y = e.y;
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", mouseMove);
window.addEventListener("mouseout", mouseOut);