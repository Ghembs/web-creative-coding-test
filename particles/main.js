let canvas, context;

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function init () {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    animate();
    resizeReset();
}

function resizeReset () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

let dots = [];
let hue = 0;

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
        this.vel = new Vector(0, getRndInteger(-5, -1))//getRndInteger(-1, 1), getRndInteger(-1, 1));
        this.radius = radius;
        this.color = "#C2FFFF"// `rgb(${150}, ${220}, ${255}, ${255})`//`hsl(${hue}, 100%, 50%)`
    };

    draw (context) {
        context.beginPath();
        context.strokeStyle= this.color//"red";
        context.fillStyle = this.color//"red";
        context.save();
        context.lineWidth = 2;
        context.translate(this.pos.x, this.pos.y);
        context.arc(0, 0, this.radius, 0, Math.PI * 2);
        //context.stroke();
        context.fill();
        context.restore();
    }

    update (width, height) {
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        //hue++;

        this.bounce(width, height);
    }

    bounce (width, height) {
        if (this.pos.x - this.radius <= 0 || this.pos.x + this.radius >= width) this.vel.x *= -1;
        if (this.pos.y - this.radius <= 0 || this.pos.y + this.radius >= height) this.vel.y *= -1;
    }

    wrap (width, height) {
        if (this.pos.x <= 0) this.pos.x += width;
        if (this.pos.y <= 0) this.pos.y += height;

        if (this.pos.x >= width) this.pos.x = 0;
        if (this.pos.y >= height) this.pos.y = 0;
    }
}

const drawCircle = (event) => {
    let x, y;
    x = event.pageX;
    if (event.pageY < 10) y = 10;
    else if (event.pageY >= canvas.height - 10) y = canvas.height -10;
    else y = event.pageY;
    //event.pageX < 10 ? x = 10: x = event.pageX;

    
    const radius = getRndInteger(2, 8);

    const dotDrawer = new DotDrawer(x, y, radius);

    dots.push(dotDrawer);

    if (dots.length > 500) dots.shift();
    dotDrawer.draw(context);
}

const animate = () => {
    //context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    context.fillStyle = "rgba(0, 0, 0, 0.25)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(animate);

    for (let i = 0; i < dots.length; i++){
        dots[i].update(window.innerWidth, window.innerHeight);
        dots[i].draw(context);
        for (let j = i+1; j < dots.length; j++){
            let dist = dots[i].pos.distance(dots[j].pos);
            if (dist <= 200){
                context.strokeStyle = "rgba(255, 255, 255, " + (1 - dist / 200) + ")"
                context.beginPath();
                context.moveTo(dots[i].pos.x, dots[i].pos.y);
                context.lineTo(dots[j].pos.x, dots[j].pos.y);
                context.stroke();
            }
        }
    }
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", resizeReset);
window.addEventListener("mousemove", drawCircle);