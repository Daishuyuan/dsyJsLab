function getElementPosition(element) {
    var elem = element,
        tagname = "",
        x = 0,
        y = 0;
    while ((typeof (elem) == "object") && (typeof (elem.tagName) != "undefined")) {
        y += elem.offsetTop;
        x += elem.offsetLeft;
        tagname = elem.tagName.toUpperCase();
        if (tagname == "BODY") {
            elem = 0;
        }
        if (typeof (elem) == "object") {
            if (typeof (elem.offsetParent) == "object") {
                elem = elem.offsetParent;
            }
        }
    }
    return {
        x: x,
        y: y
    };
}

function init() {
    // Init brand
    $("#version").html(Initer.getChromeVersion() < 60 ||
        Initer.getBrowserType() !== "Chrome" ? "Maybe Not Support" : "Support");
    $("#today").html(Initer.getToday());
    $("#name").html(Initer.getName(68, 97, 118, 105, 100));
    window.initDrawing = function () {
        $("#viewPanel").show(500);
    }

    // Commen code for using Box2D object.
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2AABB = Box2D.Collision.b2AABB;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

    // Get canvas for drawing.
    var canvas = document.getElementById("canvas");
    var canvasPosition = getElementPosition(canvas);
    var context = canvas.getContext("2d");

    // World constants.
    var worldScale = 30;
    var dragConstant = 0.05;
    var dampingConstant = 2;
    var world = new b2World(new b2Vec2(0, 10), true);
    var strength = 0, mouseLID;

    document.addEventListener("mousedown",onMouseDown);
    document.addEventListener("mouseup",onMouseUp);
    debugDraw();
    window.setInterval(update, 1000 / 60);

    // Create bottom wall
    createBox(640, 30, 320, 480, b2Body.b2_staticBody, null);
    // Create top wall
    // createBox(640, 30, 320, 0, b2Body.b2_staticBody, null);
    // Create left wall
    createBox(30, 480, 0, 240, b2Body.b2_staticBody, null);
    // Create right wall
    createBox(30, 480, 640, 240, b2Body.b2_staticBody, null);
    // Create basket
    createBox(10, 10, 500, 150, b2Body.b2_staticBody, null);
    createBox(10, 10, 550, 150, b2Body.b2_staticBody, null);
    createBox(10, 60, 560, 120, b2Body.b2_staticBody, null);

    function onMouseDown(e){
        strength = 0;
        mouseLID = setInterval(function() {
            $("#logger").val(strength);
            strength += 5;
            if (strength > 50) {
                strength = 0;
            }
        }, 100);
    }

    function onMouseUp(e) {
        clearInterval(mouseLID);
        var evt = e||window.event;
        createArrow(e.clientX-canvasPosition.x,e.clientY-canvasPosition.y);
    }

    var ShapeUtil = (function () {
        return {
            createArrow: function () {
                var vertices = [];
                vertices.push(new b2Vec2(-1.4, 0));
                vertices.push(new b2Vec2(0, -0.1));
                vertices.push(new b2Vec2(1.4, 0));
                vertices.push(new b2Vec2(0, 0.1));
                return vertices;
            },
            createCircle: function (density, radius) {
                var vertices = [],
                    step = parseInt(360 / density),
                    x = 0,
                    y = 0;
                for (var angle=0; angle <= 360; angle+=step) {
                    x = Math.cos(angle / 180 * Math.PI) * radius;
                    y = Math.sin(angle / 180 * Math.PI) * radius;
                    vertices.push(new b2Vec2(x, y));
                }
                return vertices;
            }
        }
    })();

    var VecUtil = (function () {
        return {
            b2Dot: function (a, b) {
                return a.x * b.x + a.y * b.y;
            },
            Normalize2: function (b) {
                return Math.sqrt(b.x * b.x + b.y * b.y);
            }
        }
    })();

    function createArrow(pX, pY) {
        // Set the left corner as the original point.
        var angle = Math.atan2(pY - 450, pX);

        // Define the shape of arrow.
        var vertices = ShapeUtil.createCircle(20, 0.5);

        var bodyDef = new b2BodyDef;
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(40 / worldScale, 400 / worldScale);
        bodyDef.userData = "Bastekball";
        bodyDef.bullet = true;

        var polygonShape = new b2PolygonShape;
        polygonShape.SetAsVector(vertices, vertices.length);

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = 5.0;
        fixtureDef.friction = 0.8;
        fixtureDef.restitution = 0.7;
        fixtureDef.shape = polygonShape;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);

        // Set original state of arrow.
        body.SetLinearVelocity(new b2Vec2(strength * Math.cos(angle), strength * Math.sin(angle)));
        body.SetAngle(angle);
        body.SetAngularDamping(dampingConstant);
    }

    function createBox(width, height, pX, pY, type, data) {
        var bodyDef = new b2BodyDef;
        bodyDef.type = type;
        bodyDef.position.Set(pX / worldScale, pY / worldScale);
        bodyDef.userData = data;

        var polygonShape = new b2PolygonShape;
        polygonShape.SetAsBox(width / 2 / worldScale, height / 2 / worldScale);

        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.5;
        fixtureDef.restitution = 0.5;
        fixtureDef.shape = polygonShape;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixtureDef);
    }

    function debugDraw() {
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
        debugDraw.SetDrawScale(worldScale);
        debugDraw.SetFillAlpha(0.5);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
        world.SetDebugDraw(debugDraw);
    }

    function update() {
        // init environment
        world.Step(1 / 60, 10, 10);
        world.ClearForces();

        // logical calculation
        for (var b = world.m_bodyList; b != null; b = b.m_next) {
            if (b.GetUserData() === "Bastekball") {
                updateBody(b);
            }
        }

        // draw items
        world.DrawDebugData();
    }

    function updateBody(body) {
        // Calculate arrow's fligth speed.
        var flightSpeed = VecUtil.Normalize2(body.GetLinearVelocity());

        // Calculate arrow's pointing direction.
        var bodyAngle = body.GetAngle();
        var pointingDirection = new b2Vec2(Math.cos(bodyAngle), -Math.sin(bodyAngle));

        // Calculate arrow's flighting direction and normalize it.
        var flightAngle = Math.atan2(body.GetLinearVelocity().y, body.GetLinearVelocity().x);
        var flightDirection = new b2Vec2(Math.cos(flightAngle), Math.sin(flightAngle));

        // Calculate dot production.
        var dot = VecUtil.b2Dot(flightDirection, pointingDirection);
        var dragForceMagnitude = (1 - Math.abs(dot)) * flightSpeed * flightSpeed * dragConstant * body.GetMass();
        var arrowTailPosition = body.GetWorldPoint(new b2Vec2(-1.4, 0));
        body.ApplyForce(new b2Vec2(dragForceMagnitude * -flightDirection.x, dragForceMagnitude * -flightDirection.y), arrowTailPosition);
    }
};