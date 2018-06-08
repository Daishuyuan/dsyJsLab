class ParticlesTypes {
    static get Static() {
        return Symbol.for("Static");
    }
    static get Dynamic() {
        return Symbol.for("Dynamic");
    }
    static get Meteor() {
        return Symbol.for("Meteor");
    }
    static get Enum() {
        return [
            ParticlesTypes.Static,
            ParticlesTypes.Dynamic,
            ParticlesTypes.Meteor
        ];
    }
};

class ForceTypes {
    static get Gravity() {
        return Symbol.for("Gravity");
    }
    static get Elastic() {
        return Symbol.for("Elastic");
    }
    static get Friction() {
        return Symbol.for("Friction");
    }
    static get AirResistance() {
        return Symbol.for("AirResistance");
    }
    static get Float() {
        return Symbol.for("Float");
    }
    static get Enum() {
        return [
            ForceTypes.Gravity,
            ForceTypes.Elastic,
            ForceTypes.Friction,
            ForceTypes.AirResistance,
            ForceTypes.Float
        ];
    }
}

class PerfectIniter {
    static checkId(id, types) {
        if (!id || !Object.prototype.toString.call(id) === "[object Symbol]") {
            throw new Error("id is illegle!!!");
        } else {
            for (let name of types.Enum) {
                if (name === id) {
                    return id;
                }
            }
            throw new Error("id is illegle in " + types);
        }
    }

    static initNumberProperties(entity, properties) {
        if (entity.params == undefined) entity.params = {};
        for (let element of properties) {
            if (!entity.params ||
                !entity.params.hasOwnProperty(element.prop) ||
                isNaN(entity.params[element.prop])) {
                console.log("no property: " + element.prop + " is " + element.mean);
                entity.params[element.prop] = 0.01;
            } else {
                entity.params[element.prop] = parseFloat(entity.params[element.prop]);
            }
        }
    }

    static initVectorProperties(entity, properties) {
        if (entity.params == undefined) entity.params = {};
        for (let element of properties) {
            if (!entity.params.hasOwnProperty(element.prop) ||
                entity.params[element.prop].constructor.name !== "Vector2") {
                console.log("no property: " + element.prop + " is " + element.mean);
                entity.params[element.prop] = new Vector2(0.01, 0.01);
            }
        }
    }

    static initParticleProperties(entity, properties) {
        if (entity.params == undefined) entity.params = {};
        for (let element of properties) {
            if (!entity.params.hasOwnProperty(element.prop) ||
                entity.params[element.prop].constructor.name !== "Particle") {
                console.log("no property: " + element.prop + " is " + element.mean);
                entity.params[element.prop] = new Particle(ParticlesTypes.Static);
            }
        }
    }

    static registryResource(key, value) {
        if (!PerfectIniter.resource) {
            PerfectIniter.resource = new Map();
            PerfectIniter.record = new Map();
        }
        if (key && value) {
            PerfectIniter.resource.set(key, value);
            PerfectIniter.record.set(key, 0);
        } else {
            console.error("key or value is void!");
        }

        if (PerfectIniter.resource.size >= 3) {
            var it = PerfectIniter.record.entries(),
                min = Infinity,
                index = 0,
                elem;
            while (!(elem = it.next()).done) {
                if (elem.value[1] < min) {
                    min = elem.value[1];
                    index = elem.value[0];
                }
            }
            PerfectIniter.resource.delete(index);
            PerfectIniter.record.delete(index);
        }
    }

    static getResourceByKey(key) {
        if (!PerfectIniter.resource) {
            PerfectIniter.resource = new Map();
            PerfectIniter.record = new Map();
        } else if (PerfectIniter.resource.get(key)) {
            PerfectIniter.record.set(key, PerfectIniter.record.get(key) + 1);
            return PerfectIniter.resource.get(key);
        }
    }
}

class PhysicalWorld {
    constructor(dom) {
        this.particles = [];
        this.forceList = [];
        this.count = 0;
        this.context = dom.getContext("2d");
        this.params = {};
        this.params.x = 0;
        this.params.y = 0;
        this.params.width = dom.width;
        this.params.height = dom.height;
        this.params.deltaTime = 1;
        PerfectIniter.initNumberProperties(this, [{
                prop: "x",
                mean: "physical world position X"
            },
            {
                prop: "y",
                mean: "physical world position Y"
            },
            {
                prop: "width",
                mean: "physical world size width"
            },
            {
                prop: "height",
                mean: "physical world size heigtht"
            },
            {
                prop: "deltaTime",
                mean: "physical world deltaTime"
            }
        ]);
    }

    outofRange(particle) {
        let site = particle.params.pos,
            vec = particle.params.v,
            dis = 0;
        if ((dis = site.x - this.params.x) < 0) {
            site.x = this.params.x;
            dis = Math.sqrt(Math.abs(dis));
            vec = new Vector2(-vec.x, vec.y);
            vec = vec.one().mult(vec.norm());
        }
        if ((dis = site.y - this.params.y) < 0) {
            site.y = this.params.y;
            dis = Math.sqrt(Math.abs(dis));
            vec = new Vector2(vec.x, -vec.y);
            vec = vec.one().mult(vec.norm());
        }
        if ((dis = site.x + particle.params.width - this.params.width) > 0) {
            site.x = this.params.width - particle.params.width;
            dis = Math.sqrt(Math.abs(dis));
            vec = new Vector2(-vec.x, vec.y);
            vec = vec.one().mult(vec.norm());
        }
        if ((dis = site.y + particle.params.height - this.params.height) > 0) {
            site.y = this.params.height - particle.params.height;
            dis = Math.sqrt(Math.abs(dis));
            vec = new Vector2(vec.x, -vec.y);
            vec = vec.one().mult(vec.norm());
        }
        particle.params.v = vec;
        particle.setPosition(site);
    }

    applyForce(force) {
        this.forceList.push(force);
    }

    removeForce(force) {
        this.forceList = this.forceList.filter((e) => e !== force);
    }

    clearForce() {
        this.forceList = [];
    }

    addParticle(particle) {
        this.particles.push(particle);
    }

    clear() {
        this.particles = [];
    }

    removeParticle(particle) {
        this.particles = this.particles.filter((e) => e !== particle);
    }

    isCollision(part1, part2) {

    }

    getParticles() {
        return this.particles;
    }

    calForce(particle) {
        let f = new Vector2(0, 0);
        for (let force of this.forceList) {
            let fparams = force.params;
            switch (force.id) {
                case ForceTypes.Gravity:
                    f = f.add(fparams.dir.one().mult(fparams.g));
                    break;
                case ForceTypes.Elastic:
                    let anchorX = fparams.anchor.params.pos.x;
                    let anchorY = fparams.anchor.params.pos.y;
                    let particleX = particle.params.pos.x;
                    let particleY = particle.params.pos.y;
                    let _curLenv = new Vector2(anchorX - particleX, anchorY - particleY);
                    let _curLen = _curLenv.norm();
                    if (_curLen > fparams.slack) {
                        f = f.add(_curLenv.one().mult(fparams.k * (_curLen - fparams.slack)));
                    }
                    break;
                case ForceTypes.Friction:
                    let dir = particle.params.v.one().mult(-1);
                    f = f.add(dir.mult(fparams.f * particle.params.m));
                    break;
                case ForceTypes.AirResistance:
                    let speed = particle.params.v.one().mult(-1);
                    let velocity = particle.params.v.norm();
                    f = f.add(speed.mult(0.5 * fparams.C * velocity * velocity * particle.area));
                    break;
                case ForceTypes.Float:
                    //TODO
                    break;
                default:
                    throw new Error("no this type of force!");
            }
        }
        return f;
    }

    runFrame() {
        var self = this;
        let deltaT = this.params.deltaTime;
        self.context.clearRect(0, 0, self.params.width, self.params.height);
        for (let particle of self.particles) {
            switch (particle.id) {
                case ParticlesTypes.Static:
                    // have nothing to do
                    break;
                case ParticlesTypes.Meteor:
                    // loss one heart
                    particle.params.life -= 1;
                    // particle having no hearts means death
                    if (particle.params.life < 0) {
                        break;
                    }
                case ParticlesTypes.Dynamic:
                    // Welley integration method simulate reality
                    let a = self.calForce(particle).div(particle.params.m);
                    let oldSite = particle.params.pos.sub(particle.params.v);
                    let newSite = particle.params.pos.mult(2).sub(oldSite).add(a.mult(deltaT * deltaT));
                    particle.params.v = newSite.sub(particle.params.pos);
                    particle.setPosition(newSite);
                    // resolution of out of the physical world
                    self.outofRange(particle);
                    break;
            }
        }
        this.count++;
        this.particles = this.particles.filter((e) => e.params.life >= 0);
        this.particles.forEach(function (particle) {
            particle.display(self.context);
        });
    }
}

class Particle {
    constructor(id, params) {
        this.id = PerfectIniter.checkId(id, ParticlesTypes);
        this.params = params;
        this.shape = params.shape;
        PerfectIniter.initNumberProperties(this, [{
                prop: "m",
                mean: "Quality"
            },
            {
                prop: "life",
                mean: "Life Time"
            },
            {
                prop: "width",
                mean: "Width"
            },
            {
                prop: "height",
                mean: "Height"
            }
        ]);
        PerfectIniter.initVectorProperties(this, [{
                prop: "v",
                mean: "Vector"
            },
            {
                prop: "pos",
                mean: "Position"
            }
        ]);
    }

    set idTo(id) {
        this.id = PerfectIniter.checkId(_id, ParticlesTypes);
    }

    get area() {
        return this.params.width * this.params.height;
    }

    get center() {
        return new Vector2(
            this.params.pos.x + this.params.width / 2,
            this.params.pos.y + this.params.height / 2
        );
    }

    setSize(width, height) {
        this.params.width = width;
        this.params.height = height;
    }

    setPosition(vec) {
        this.params.pos = vec;
    }

    display(ctx) {
        if (this.shape && this.shape.type) {
            switch (this.shape.type) {
                case "circle":
                    var color = this.shape.color ? this.shape.color : "#000",
                        r = Math.sqrt(Math.pow(this.params.width, 2) + Math.pow(this.params.height, 2));
                    ctx.lineWidth = 1;
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(this.params.pos.x, this.params.pos.y, r, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.closePath();
                    break;
                case "image":
                    if (this.shape.src) {
                        var res = PerfectIniter.getResourceByKey(this.shape.src);
                        if (res) {
                            ctx.drawImage(res, this.params.pos.x, this.params.pos.y, this.params.width, this.params.height);
                        } else {
                            var img = new Image();
                            img.src = this.shape.src;
                            img.onload = function () {
                                ctx.drawImage(img, this.params.pos.x, this.params.pos.y, this.params.width, this.params.height);
                            };
                            PerfectIniter.registryResource(this.shape.src, img);
                        }
                    } else {
                        throw new Error("shape:src is void!");
                    }
                    break;
                default:
                    throw new Error("can't identify this shape.");
            }
        }
    }
}

class Force {
    constructor(id, params) {
        this.id = PerfectIniter.checkId(id, ForceTypes);
        this.params = params;
        switch (id) {
            case ForceTypes.Gravity:
                PerfectIniter.initNumberProperties(this, [{
                    prop: "g",
                    mean: "gravity"
                }]);
                PerfectIniter.initVectorProperties(this, [{
                    prop: "dir",
                    mean: "direction"
                }]);
                break;
            case ForceTypes.Elastic:
                PerfectIniter.initParticleProperties(this, [{
                    prop: "anchor",
                    mean: "anchor"
                }]);
                PerfectIniter.initNumberProperties(this, [{
                    prop: "k",
                    mean: "stiffness coefficient"
                }, {
                    prop: "slack",
                    mean: "the length of slack"
                }]);
                break;
            case ForceTypes.Friction:
                PerfectIniter.initNumberProperties(this, [{
                    prop: "f",
                    mean: "coefficient of friction"
                }]);
                break;
            case ForceTypes.AirResistance:
                PerfectIniter.initNumberProperties(this, [{
                    prop: "C",
                    mean: "air resistance factor * air density"
                }]);
                break;
            case ForceTypes.Float:
                PerfectIniter.initNumberProperties(this, [{
                    prop: "R",
                    mean: "liquid density * gravity acceleration"
                }, {
                    prop: "f",
                    mean: "viscosity coefficient"
                }]);
                PerfectIniter.initVectorProperties(this, [{
                    prop: "dir",
                    mean: "the direction of float"
                }]);
                PerfectIniter.initParticleProperties(this, [{
                    prop: "liquid",
                    mean: "the range of liquid"
                }]);
                break;
            default:
                throw new Error("no this force!!!");
        }
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    rotate(angle) {
        let norm = this.norm();
        let degree = Math.atan2(this.y, this.x) - (angle / 180) * Math.PI;
        return new Vector2(norm * Math.cos(degree), norm * Math.sin(degree));
    }
    add(vector) {
        return new Vector2(vector.x + this.x, vector.y + this.y)
    }
    sub(vector) {
        return new Vector2(this.x - vector.x, this.y - vector.y)
    }
    mult(step) {
        return new Vector2(step * this.x, step * this.y);
    }
    div(step) {
        if (step != 0) {
            return new Vector2(this.x / step, this.y / step);
        } else {
            return this;
        }
    }
    dot(vector) {
        return vector.x * this.x + vector.y * this.y;
    }
    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    one() {
        return this.div(this.norm());
    }
}