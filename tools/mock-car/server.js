const { WebSocketServer } = require('ws');
const server = new WebSocketServer({ port: 8080, path: '/ws' });
const car = {
  es: 0,
  as: 0,
  r: 0,
  led: 0,
  g: 0,
  s: 0,
  c: 0,
  paused: false,
  pongDelay: 0,
  weak: false,
  d1Error: false,
};
let drvCount = 0,
  lastDrv = 0,
  maxGap = 0,
  lastMsgAt = 0;

function sendAll(msg) {
  server.clients.forEach(
    (client) => client.readyState === 1 && client.send(JSON.stringify(msg)),
  );
}

server.on('connection', (client) => {
  // Auto obsługuje tylko jedno połączenie naraz: zamykamy wszystkie poza nowym.
  server.clients.forEach((otherClient) => {
    if (otherClient !== client) {
      console.log('zamykam poprzednie połączenie');
      otherClient.terminate();
    }
  });
  console.log('klient połączony');
  lastMsgAt = Date.now();
  client.send(JSON.stringify({ t: 'hello', fw: 'mock-1.0' }));
  client.on('close', () => {
    if (server.clients.size > 0) return;
    lastMsgAt = 0;
    // Symulator nie ma diody, więc zgaszenie LED widać tylko w konsoli.
    if (car.led) console.log('LED OFF');
    car.led = 0;
  });
  client.on('message', (data) => {
    lastMsgAt = Date.now();
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return console.log('zły JSON');
    }
    if (typeof msg !== 'object' || msg === null) {
      return console.log('wiadomość nie jest obiektem JSON');
    }
    if (msg.t === 'drv') {
      const now = Date.now();
      if (lastDrv) maxGap = Math.max(maxGap, now - lastDrv);
      lastDrv = now;
      drvCount++;
      if (msg.g === 0) car.as = 0;
      const blocked = car.es || (car.as && msg.g > 0);
      car.g = blocked ? 0 : msg.g;
      car.s = Math.max(-100, Math.min(100, msg.s));
      car.c = msg.c;
    } else if (msg.t === 'ping') {
      setTimeout(
        () => client.send(JSON.stringify({ t: 'pong', id: msg.id })),
        car.pongDelay,
      );
    } else {
      if (msg.t === 'act' && msg.a === 'estop') car.es = msg.on;
      if (msg.t === 'act' && msg.a === 'led') car.led = msg.on;
      if (msg.t === 'act' && msg.a === 'radio') car.r = msg.n;
      console.log('<-', JSON.stringify(msg));
    }
  });
});

setInterval(() => {
  if (car.paused) return;
  sendAll({
    t: 'tel',
    d1: car.d1Error ? null : 40 + Math.round(Math.random() * 100),
    d2: Math.random() < 0.5 ? -1 : 30 + Math.round(Math.random() * 50),
    rssi: car.weak ? -80 : -50 - Math.round(Math.random() * 4),
    temp: 47,
    es: car.es,
    as: car.as,
    r: car.r,
  });
}, 100);

setInterval(() => {
  if (lastDrv && Date.now() - lastDrv > 300) {
    console.log('FAILSAFE: brak drv > 300 ms → moc 0, koła prosto');
    car.g = 0;
    car.s = 0;
    lastDrv = 0;
  }
  if (lastMsgAt && Date.now() - lastMsgAt > 2000) {
    console.log('brak wiadomości > 2 s → zamykam połączenie');
    server.clients.forEach((client) => client.terminate());
    lastMsgAt = 0;
  }
  if (drvCount) {
    console.log(
      `drv ${drvCount}/s, max przerwa ${maxGap} ms, g=${car.g} s=${car.s} c=${car.c}`,
    );
  }
  drvCount = 0;
  maxGap = 0;
}, 1000);

// Bindy do testowania:
// p - pauza / wznowienie telemetrii (utrata łącza)
// k - zerwanie połączenia
// l - opóźnienie pong +120 ms / bez opóźnienia
// w - słaby sygnał (RSSI -80) / normalny
// e - błąd przedniego czujnika (d1: null) / normalny
// a - auto-stop, działa tylko przy tempomacie (c = 1)
// r - radio gra (utwór 3) / nie gra
// q, Ctrl+C - wyjście
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (key) => {
  if (key === 'p') car.paused = !car.paused;
  if (key === 'k') server.clients.forEach((client) => client.terminate());
  if (key === 'l') car.pongDelay = car.pongDelay ? 0 : 120;
  if (key === 'w') car.weak = !car.weak;
  if (key === 'e') car.d1Error = !car.d1Error;
  if (key === 'a' && car.c) {
    car.as = 1;
    car.g = 0;
  }
  if (key === 'r') car.r = car.r ? 0 : 3;
  if (key === 'q' || key === '\u0003') process.exit();
  console.log('stan:', JSON.stringify(car));
});
