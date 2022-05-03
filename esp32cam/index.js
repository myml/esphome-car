document.writeln(
  `<meta name="viewport" content="width=device-width, user-scalable=no" />`
);
const fb = document.createElement("button");
fb.textContent = "前进";
fb.addEventListener("touchstart", () => touchstart("up"));
fb.addEventListener("touchend", () => touchend("up"));

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
speed.value = 50;

const c1 = document.createElement("div");
c1.appendChild(fb);
c1.className = "c1";
const c2 = document.createElement("div");
c2.appendChild(speed);
c2.appendChild(lb);
c2.appendChild(rb);
c2.className = "c2";

const app = document.querySelector("esp-app");
app.style = `background-image: url(${location.origin}:8081)`;
app.appendChild(c1);
app.appendChild(c2);

app.querySelectorAll("button").forEach((el) => {
  el.addEventListener("touchstart", () => el.classList.add("touch"));
  el.addEventListener("touchend", () => el.classList.remove("touch"));
});

let run = false;
async function touchstart(name) {
  if (name == "up" || name == "down") {
    run = true;
  }
  await fetch(`/switch/${name}/turn_on`, { method: "POST" });
  running();
}
async function touchend(name) {
  await fetch(`/switch/${name}/turn_off`, { method: "POST" });
  if (name == "up" || name == "down") {
    stop();
  }
}
async function running() {
  if (!run) {
    return;
  }
  await fetch("/number/speed/set?value=" + speed.value, { method: "POST" });
  setTimeout(() => {
    running();
  }, 300);
}

function stop() {
  run = false;
  fetch("/number/speed/set?value=0", { method: "POST" });
}
