export const handler = ({ inputs, mechanic, sketch }) => {
  // Importar Matter.js
  const Matter = require('matter-js');
  const Engine = Matter.Engine;
  const World = Matter.World;
  const Bodies = Matter.Bodies;
  const Body = Matter.Body;
  const Mouse = Matter.Mouse;
  const MouseConstraint = Matter.MouseConstraint;

  let imagenesLetras = {};
  let letrasCuerpos = [];
  let initialLetterStates = []; // Array para guardar el estado inicial de cada letra
  let engine;
  let world;
  let mConstraint;
  const canvasWidth = 1080;
  const canvasHeight = 1920;
  const letraScale = 0.14;

  sketch.preload = () => {
    for (let i = 0; i < 26; i++) {
      const letra = String.fromCharCode(97 + i);
      imagenesLetras[letra] = sketch.loadImage(`static/letter_${letra}.png`);
    }
  };

  sketch.setup = () => {
    sketch.createCanvas(canvasWidth, canvasHeight);
    sketch.imageMode(sketch.CENTER);

    // Inicializar el motor de física
    engine = Engine.create();
    world = engine.world;
    engine.world.gravity.y = 0.5;
    engine.world.frictionAir = 0.02;

    // Crear los bordes del canvas como cuerpos estáticos
    const bordeGrosor = 100;
    const ground = Bodies.rectangle(canvasWidth / 2, canvasHeight + bordeGrosor / 2, canvasWidth, bordeGrosor, { isStatic: true });
    const ceiling = Bodies.rectangle(canvasWidth / 2, -bordeGrosor / 2, canvasWidth, bordeGrosor, { isStatic: true });
    const leftWall = Bodies.rectangle(-bordeGrosor / 2, canvasHeight / 2, bordeGrosor, canvasHeight, { isStatic: true });
    const rightWall = Bodies.rectangle(canvasWidth + bordeGrosor / 2, canvasHeight / 2, bordeGrosor, canvasHeight, { isStatic: true });

    World.add(world, [ground, ceiling, leftWall, rightWall]);

    const margin = 50;

    for (const caracter in imagenesLetras) {
      const img = imagenesLetras[caracter];
      const randomX = sketch.random(margin, canvasWidth - margin);
      const randomY = sketch.random(margin, canvasHeight * 0.6);
      const randomRotation = sketch.random(-sketch.PI / 6, sketch.PI / 6);

      const nuevoCuerpo = Bodies.rectangle(randomX, randomY, img.width * letraScale, img.height * letraScale, {
        friction: 0.3,
        restitution: 0.3,
        angle: randomRotation,
        label: caracter
      });
      letrasCuerpos.push({ cuerpo: nuevoCuerpo, img: img });
      World.add(world, nuevoCuerpo);

      // Guardar el estado inicial
      initialLetterStates.push({
        position: { x: randomX, y: randomY },
        angle: randomRotation,
        velocity: { x: 0, y: 0 },
        angularVelocity: 0
      });
    }

    // Configurar la interacción con el ratón
    const canvasMouse = Mouse.create(sketch.canvas.elt);
    canvasMouse.pixelRatio = sketch.pixelDensity();
    mConstraint = MouseConstraint.create(engine, {
      mouse: canvasMouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    World.add(world, mConstraint);

    // Resetear las letras cada 2 minutos
    setInterval(resetLetters, 19999);
  };

  sketch.draw = () => {
    sketch.background(255);

    // Actualizar el motor de física
    Engine.update(engine);

    // Dibujar las letras según la posición de sus cuerpos
    for (const letraObj of letrasCuerpos) {
      const pos = letraObj.cuerpo.position;
      const angle = letraObj.cuerpo.angle;
      sketch.push();
      sketch.translate(pos.x, pos.y);
      sketch.rotate(angle);
      sketch.image(letraObj.img, 0, 0, letraObj.img.width * letraScale, letraObj.img.height * letraScale);
      sketch.pop();
    }
  };

  sketch.mousePressed = () => {
    // La interacción de arrastrar la maneja MouseConstraint
  };

  sketch.mouseReleased = () => {
    // La interacción de arrastrar la maneja MouseConstraint
  };

  function resetLetters() {
    letrasCuerpos.forEach((letraObj, index) => {
      Body.setPosition(letraObj.cuerpo, initialLetterStates[index].position);
      Body.setAngle(letraObj.cuerpo, initialLetterStates[index].angle);
      Body.setVelocity(letraObj.cuerpo, initialLetterStates[index].velocity);
      Body.setAngularVelocity(letraObj.cuerpo, initialLetterStates[index].angularVelocity);
    });
  }
};

export const inputs = {};

export const settings = {
  engine: require("@mechanic-design/engine-p5"),
  modules: {
    matter: require('matter-js')
  }
};