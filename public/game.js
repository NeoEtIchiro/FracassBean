import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

const k = kaplay({
  global: false,
  width: 1920,
  height: 1080,
  letterbox: true,
  background: "#674770",
  debug: false,
});

k.loadRoot("./");
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("steel", "sprites/steel.png");
k.loadSprite("grass", "sprites/grass.png");
k.loadSprite("lava", "sprites/lava.png");
k.loadSprite("heart", "sprites/heart-o.png");
k.loadSprite("logo", "sprites/logo.png");

k.loadBitmapFont("happy-o", "fonts/happy-o.png", 36, 45);

k.loadSound("music", "sounds/music.mp3");
k.loadSound("challenge", "sounds/challenge.wav");
k.loadSound("jump", "sounds/jump.wav");
k.loadSound("damage", "sounds/damage.wav");
k.loadSound("break", "sounds/break.wav");

k.setGravity(2000);

let state = "menu"

const eventText = k.add([
  k.text("", { align: "center", size: 100, font: "happy-o" }),
  k.pos(k.width() / 2, 24),
  k.anchor("top"),
  k.color(255, 255, 255)
])

const pressText = k.add([
  k.text("Press Space !", { align: "center", size: 120, font: "happy-o" }),
  k.pos(k.center().add(0, 250)),
  k.anchor("center"),
])

const logo = k.add([
  k.sprite("logo"),
  k.pos(k.center().add(-350, -300)),
  k.anchor("center"),
  k.scale(3)
])

const logo_text = k.add([
  k.text("Fracass\nBean", { align: "left", size: 150, font: "happy-o" }),
  k.pos(k.center().add(50, -85)),
  k.anchor("center"),
])

const ground = k.add([
  k.sprite("grass", { width: 64 * 50, height: 64, tiled: true }),
  k.pos(-128, 1080 - 64),
  k.area(),
  k.scale(1, 1),
  k.body({isStatic: true}),
  "ground"
]);

const events = [
  { id: "lava", name: "Floor is lava", color: "#FF0000" }, 
  { id: "destroyer", name: "Destroyer", color: "#c4c4c4" },
  { id: "density", name: "Density", color: "#505050" },
  { id: "double", name: "Double Trouble", color: "#187cff" },
  { id: "big", name: "Big Bean", color: "#5ba675" },
  { id: "big_block", name: "Big Blocks", color: "#ffc814" },
  { id: "full_life", name: "Full Life", color: "#ff4dbb" },
  { id: "jump", name: "Jumptastic", color: "#00ff4c" },
  { id: "moon", name: "Astronaut", color: "#fafafa" },
  { id: "chaos", name: "Chaos !", color: "#222222" },
];
let currentEvent = { id: "", name: "", color: "#FFFFFF"};

function triggerEvent(useCurrent){
  ground.use(k.sprite("grass", { width: 64 * 50, height: 64, tiled: true }));
  player.scaleTo(1);
  k.setGravity(2000);

  if (!useCurrent){
    const idx = Math.floor(Math.random() * events.length);
    currentEvent = events[idx];
    k.play("challenge");
  }
  eventText.color = k.Color.fromHex(currentEvent.color);
  eventText.text = currentEvent.name;

  switch (currentEvent.id){
    case "lava":
      ground.use(k.sprite("lava", { width: 64 * 50, height: 64, tiled: true }))
      break;
    case "density":
      k.setGravity(4000);
      break;
    case "big":
      player.scaleTo(3);
      break;
    case "full_life":
      player.lives = player.maxLives;
      showLives();
      break;
    case "moon":
      k.setGravity(1000);
      break;
  }
}

const player = k.add([
  k.pos(k.center()), 
  k.sprite("bean"),
  k.body(),
  k.area(),
  k.offscreen(),
  k.scale(1),
  "player",
  { maxLives: 5, lives: 5 },
]);
player.hidden = true;

function showLives(){
  k.get("heart").forEach((heart) => {
    heart.destroy();
  });

  for (let i = 0; i < player.lives; i ++){
    k.add([
      "heart",
      k.sprite("heart"),
      k.pos(k.width() - 24, 24 + 64 * i),
      k.anchor("topright")
    ])
  }
}

showLives()

function takeDamage(){
  if (state != "play") return;

  player.lives--;
  player.pos = k.center();
  showLives()
  k.play("damage");

  if (player.lives <= 0){
    gameOver();
  }
}

function startGame(){
  if (state == "menu"){
    k.play("music", {
      loop: true,
      speed: 1,
      volume: 1
    })
  }

  state = "play";
  player.pos = k.center();
  player.hidden = false;
  player.vel = new k.Vec2(0, 0);
  player.lives = player.maxLives;
  showLives();

  score.value = 0.0;
  score.pos = new k.Vec2(24, 24);
  score.textSize = 64;
  score.anchor = "topleft";
  bestScore.hidden = true;

  pressText.hidden = true;
  logo.hidden = true;
  logo_text.hidden = true;

  currentEvent = { id: "", name: "", color: "#FFFFFF"};
  triggerEvent(true);

  k.get("block").forEach((block) => {
    block.destroy();
  });
}

let game_over_time = 0.5;
function gameOver(){
  game_over_time = 0.0;
  state = "game_over";
  player.hidden = true;
  pressText.hidden = false;
  score.pos = k.center().add(0, -100);
  score.textSize = 80;
  score.anchor = "center";

  const bestScoreValue = k.getData("best_score");
  bestScore.text = "Best:" + (Number.isInteger(bestScoreValue) ? bestScoreValue + ".0" : bestScoreValue);
  bestScore.hidden = false;
}

k.onKeyPress(["space", "up"], () => {
  if (state != "play" && game_over_time > 0.5){
    startGame();
    k.play("jump");
    return;
  }

  if (player.isGrounded() || currentEvent.id == "jump"){
    player.jump(1200);
    k.play("jump");
  }
})

player.onExitScreen(() => {
  takeDamage();
})

const player_speed = 700

k.onKeyDown("right", () => {
  player.move(new k.Vec2(player_speed, 0))
})

k.onKeyDown("left", () => {
  player.move(new k.Vec2(-player_speed, 0))
})

const score = k.add([
  k.text("0.0", { size: 64, font: "happy-o" }),
  k.pos(24, 24),
  { value: 0.0 }
])

const bestScore = k.add([
  k.text("Best: 0.0", { size: 64, font: "happy-o" }),
  k.pos(k.center()),
  k.anchor("center"),
  k.color(k.Color.fromHex("#ffff00"))
])
bestScore.hidden = true;

k.loop(0.1, () => {
  game_over_time += 0.1;
  if (state != "play") return;

  score.value += 0.1;
  score.value = Math.round(score.value * 10) / 10;
  score.text = Number.isInteger(score.value) ? score.value + ".0" : score.value;

  if (!k.getData("best_score") || score.value > k.getData("best_score")) k.setData("best_score", score.value);

  if (score.value % 10 == 0){
    triggerEvent()
  }

  const minSpeed = 1500;
  const maxSpeed = 2500;
  let speed = Math.floor(Math.random() * (maxSpeed - minSpeed + 1)) + 300;
  let num = Math.min(Math.max(1, Math.floor(Math.random() * (score.value / 10))), 12);

  if (currentEvent.id == "double"){
    speed = speed / 2;
    num = Math.min(num * 2, 12);
  }
  else if (currentEvent.id == "big_block"){
    num = Math.max(1, Math.floor(num/2));
  }

  for (let i = 0; i < num; i++){
    const cube = k.add([
      k.sprite("steel"),
      k.outline(5),
      k.pos(2500, -500),
      k.area(),
      k.rotate(currentEvent.id == "chaos" ? Math.random() * 360 : 0),
      k.body(), 
      k.scale(currentEvent.id == "big_block" ? 2 : 1),
      k.move(new k.Vec2(-1, 0), speed),
      k.offscreen(),
      k.color(255, 255, 255),
      { onScreen: false },
      "block"
    ]);

    cube.onEnterScreen(() => {
      cube.onScreen = true;
    })
    
    cube.onExitScreen(() => {
      if (cube.onScreen){
        cube.destroy()
      }
    })
  }
});

k.onCollideUpdate("player", "ground", () => {
  if (currentEvent.id == "lava"){
    takeDamage();
  }
})

k.onCollide("player", "block", (p, b) => {
  if (currentEvent.id == "destroyer"){
    k.play("break");
    b.destroy();
  }
})