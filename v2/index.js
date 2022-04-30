document.writeln(
  `<meta name="viewport" content="width=device-width, user-scalable=no" />`
);
const fb = document.createElement("button");
fb.textContent = "前进";
fb.addEventListener("touchstart", () => touchstart("up"));
fb.addEventListener("touchend", () => touchend("up"));

const bb = document.createElement("button");
bb.textContent = "后退";
bb.addEventListener("touchstart", () => touchstart("down"));
bb.addEventListener("touchend", () => touchend("down"));

const lb = document.createElement("button");
lb.textContent = "左转";
lb.addEventListener("touchstart", () => touchstart("left"));
lb.addEventListener("touchend", () => touchend("left"));

const rb = document.createElement("button");
rb.textContent = "右转";
rb.addEventListener("touchstart", () => touchstart("right"));
rb.addEventListener("touchend", () => touchend("right"));

const speed = document.createElement("input");
speed.type = "range";
speed.max = 100;
speed.min = 0;

const c1 = document.createElement("div");
c1.appendChild(bb);
c1.appendChild(fb);
c1.className = "c1";
const c2 = document.createElement("div");
c2.appendChild(speed);
c2.appendChild(lb);
c2.appendChild(rb);
c2.className = "c2";

const app = document.querySelector("esp-app");
app.appendChild(c1);
app.appendChild(c2);

async function touchstart(name) {
  await fetch(`/switch/${name}/turn_on`, { method: "POST" });
  if (name == "up" || name == "down") {
    running();
  }
}
async function touchend(name) {
  await fetch(`/switch/${name}/turn_off`, { method: "POST" });
  if (name == "up" || name == "down") {
    stop();
  }
}
let interval;
function running() {
  clearInterval(interval);
  fetch("/number/speed/set?value=" + speed.value, { method: "POST" });
  interval = setInterval(() => {
    fetch("/number/speed/set?value=" + speed.value, { method: "POST" });
  }, 300);
}
function stop() {
  clearInterval(interval);
  fetch("/number/speed/set?value=" + speed.value, { method: "POST" });
}
