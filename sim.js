//commented ;) lots of inefficiency in this rough initial
init();
function init() {
    hRadius = 16
    pRadius = 1;
    hSize = 2*hRadius;
    pSize = 2*pRadius;
    tao = 2*Math.PI;
    can = document.getElementById('c');
    c = can.getContext('2d');
    w = can.width = window.innerWidth;
    h = can.height = window.innerHeight;
    backColor = 'black';
    freePos = -1;
    hCount = 0;
    hubs = [];
    pacs = [];
    free = [];
    data = [];
    pCount = 0;
    for (x = 0; x < w; x++) {
        data[x] = [];
        for (y = 0; y < h; y++) {
            data[x][y] = 0;
        }
    }
    c.fillStyle = 'backColor';
    c.fillRect(0,0,w,h);
    requestAnimationFrame(function run() {
        requestAnimationFrame(run);
        if (hubs.length < 64) {
            new Hub().init();
        }
        new Pac();
        for (i = 0; i < pCount; i++) {
            if (pacs[i] !== null) {
                pacs[i].move();
            }
        }
        for (i = 0; i<hCount; i++) {
            hubs[i].draw();
        }
    });
}
function Pac() {
    this.send = s = hubs[r(hCount)];
    this.take = t = hubs[s.partners[r(s.partners.length)]];
    dx = t.x - s.x;
    dy = t.y - s.y;
    a = Math.atan2(dy,dx);
    this.cx = Math.cos(a);
    this.cy = Math.sin(a);
    A = hRadius+pSize;
    this.x = s.x + A*this.cx;
    this.y = s.y + A*this.cy;
    this.dx = dx - 2*A*this.cx;
    this.dy = dy - 2*A*this.cy;
    this.dist = dist(this.dx, this.dy);
    this.speed = speed = r(5)+1;
    this.cx *= speed;
    this.cy *= speed;
    red = ~~(255*speed/5);
    col = 255-red;
    red = red.toString();
    col = col.toString();
    this.color = 'rgb('+red+','+0+','+col+')';
    if (0 <= freePos) {
        i = free[freePos--];
    } else {
        i = pCount++;
    }
    this.i = i;
    this.count = 0;
    pacs[i] = this;
    this.move = function () {
        if (this.count < hRadius/4) {
            this.count++;
            c.fillStyle = 'red';
            c.beginPath();
            c.arc(this.send.x + hRadius*this.cx/this.speed, this.send.y + hRadius*this.cy/this.speed,2*pSize,0,tao);
            c.fill();
            if (this.count === hRadius/4) {
                c.fillStyle = backColor;
                c.beginPath();
                c.arc(this.send.x+hRadius*this.cx/this.speed,this.send.y + hRadius*this.cy/this.speed,2*pSize+1,0,tao);
                c.fill();
            }
        }
        d = dist(this.dx, this.dy);
        if (d < hSize) {
            c.fillStyle = this.take.color;
            c.beginPath();
            c.arc(this.take.x - hRadius*this.cx/this.speed, this.take.y - hRadius*this.cy/this.speed,2*pSize,0,tao);
            c.fill();
        }
        if (this.dist < d) {
            c.fillStyle = backColor;
            c.beginPath();
            c.arc(this.take.x - hRadius*this.cx/this.speed, this.take.y - hRadius*this.cy/this.speed,2*pSize+1,0,tao);
            c.arc(this.send.x + hRadius*this.cx/this.speed, this.send.y + hRadius*this.cy/this.speed,2*pSize+1,0,tao);
            c.fill();
            pacs[this.i] = null;
            free[++freePos] = this.i;
            return;
        }
        this.dist = d;
        c.fillStyle = backColor;
        this.draw(pSize+1);
        this.x += this.cx;
        this.y += this.cy;
        this.dx -= this.cx;
        this.dy -= this.cy;
        c.fillStyle = this.color;
        this.draw(pSize);
    };
    this.draw = function (v) {
        c.beginPath();
        c.arc(this.x,this.y,v,0,tao);
        c.fill();
    };
}
function Hub() {
    x = hRadius + r(w-hSize);
    y = hRadius + r(h-hSize);
    if (0 < data[x][y]) {
        return;
    }
    for (a = 0; a < tao; a += 0.1) {
        A = hRadius+2*pSize;
        if (0 < data[x + ~~(A*Math.cos(a))][y + ~~(A*Math.sin(a))]) {
            return;
        }
    }
    this.i = hCount;
    this.x = x;
    this.y = y;
    this.partners = [];
    d = 1+r(255).toString();
    this.color = 'rgb(0,0,'+d+')';
    for (i = 0; i < hCount; i++) {
        this.partners.push(i);
        hubs[i].partners.push(hCount);
    }
    hubs[hCount++] = this;
    this.draw = function () {
        c.fillStyle = 'black';
        this.fill();
        c.fillStyle = this.color;
        this.fill();
    };
    this.fill = function () {
        c.beginPath();
        c.arc(this.x,this.y,hRadius,0,tao);
        c.fill();
    };
    this.init = function () {
        c.fillStyle = this.color;
        this.fill();
        id = c.getImageData(this.x-hRadius,this.y-hRadius,hSize,hSize).data;
        for (i = 0; i < hSize; i++) {
            for (j = 0; j < hSize; j++) {
                data[this.x-hRadius+i][this.y-hRadius+j] = id[4*(j*hSize+i)+2];
            }
        }
    };
}
function dist(dx,dy) {
    return Math.pow(dx*dx+dy*dy, .5);
}
function r(n) {
    return ~~(Math.random()*n);
}
window.onresize = function() {
    init();
}
