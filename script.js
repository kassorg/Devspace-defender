const espace = document.getElementById("espace");
const vaisseau = document.getElementById("vaisseau");
const asteroide = document.getElementById("asteroide");
const infos = document.getElementById("infos");
const fin = document.getElementById("fin");
const boutonRejouer = document.getElementById("rejouer");

const largeurVaisseau = 36;
const vitesse = 14;
const tailleAsteroide = 28;
const vitesseAsteroide = 3;
const largeurLaser = 4;
const hauteurLaser = 16;
const vitesseLaser = 10;

let asteroideX = 0;
let asteroideY = 0;

let x = 0;
let controleClavier = false;
let points = 0;
let vies = 3;
let partieTerminee = false;
const lasers = [];
const touches = {
  gauche: false,
  droite: false,
};

function garderDansLecran() {
  const limiteDroite = Math.max(0, espace.clientWidth - largeurVaisseau);
  if (x < 0) {
    x = 0;
  }
  if (x > limiteDroite) {
    x = limiteDroite;
  }
  vaisseau.style.left = x + "px";
}

function placerAsteroideEnHaut() {
  const limite = Math.max(0, espace.clientWidth - tailleAsteroide);
  asteroideX = Math.random() * limite;
  asteroideY = -tailleAsteroide;
  asteroide.style.left = asteroideX + "px";
  asteroide.style.top = asteroideY + "px";
}

function descendreAsteroide() {
  asteroideY += vitesseAsteroide;
  if (asteroideY > espace.clientHeight) {
    placerAsteroideEnHaut();
    return;
  }
  asteroide.style.top = asteroideY + "px";
}

function tirer() {
  const zone = espace.getBoundingClientRect();
  const rect = vaisseau.getBoundingClientRect();
  const laser = document.createElement("div");
  laser.className = "laser";

  const laserX = rect.left - zone.left + rect.width / 2 - largeurLaser / 2;
  const laserY = rect.top - zone.top - hauteurLaser;
  laser.style.left = laserX + "px";
  laser.style.top = laserY + "px";
  espace.appendChild(laser);
  lasers.push({ element: laser, y: laserY });
}

function afficherInfos() {
  infos.textContent = "Points : " + points + "  ·  Vies : " + vies;
}

function seTouchent(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function effacerLasers() {
  for (let i = 0; i < lasers.length; i++) {
    lasers[i].element.remove();
  }
  lasers.length = 0;
}

function terminerPartie() {
  partieTerminee = true;
  touches.gauche = false;
  touches.droite = false;
  effacerLasers();
  asteroide.style.top = "-100px";
  fin.hidden = false;
}

function verifierCollisions() {
  const zoneAsteroide = asteroide.getBoundingClientRect();

  for (let i = lasers.length - 1; i >= 0; i--) {
    if (seTouchent(lasers[i].element.getBoundingClientRect(), zoneAsteroide)) {
      lasers[i].element.remove();
      lasers.splice(i, 1);
      points += 10;
      afficherInfos();
      placerAsteroideEnHaut();
      return;
    }
  }

  if (seTouchent(vaisseau.getBoundingClientRect(), asteroide.getBoundingClientRect())) {
    vies -= 1;
    afficherInfos();
    if (vies <= 0) {
      terminerPartie();
      return;
    }
    placerAsteroideEnHaut();
  }
}

function rejouer() {
  points = 0;
  vies = 3;
  partieTerminee = false;
  controleClavier = false;
  touches.gauche = false;
  touches.droite = false;
  effacerLasers();
  vaisseau.style.left = "50%";
  vaisseau.style.transform = "translateX(-50%)";
  fin.hidden = true;
  afficherInfos();
  placerAsteroideEnHaut();
}

function monterLasers() {
  for (let i = lasers.length - 1; i >= 0; i--) {
    const laser = lasers[i];
    laser.y -= vitesseLaser;
    if (laser.y < -hauteurLaser) {
      laser.element.remove();
      lasers.splice(i, 1);
    } else {
      laser.element.style.top = laser.y + "px";
    }
  }
}

function deplacer() {
  if (partieTerminee) {
    requestAnimationFrame(deplacer);
    return;
  }

  if (touches.gauche || touches.droite) {
    if (!controleClavier) {
      const zone = espace.getBoundingClientRect();
      const rect = vaisseau.getBoundingClientRect();
      x = rect.left - zone.left;
      vaisseau.style.transform = "none";
      controleClavier = true;
    }

    if (touches.gauche) {
      x -= vitesse;
    }
    if (touches.droite) {
      x += vitesse;
    }

    garderDansLecran();
  }

  descendreAsteroide();
  monterLasers();
  verifierCollisions();
  requestAnimationFrame(deplacer);
}

document.addEventListener("keydown", (evenement) => {
  if (partieTerminee) {
    return;
  }
  if (evenement.key === "ArrowLeft") {
    touches.gauche = true;
    evenement.preventDefault();
  }
  if (evenement.key === "ArrowRight") {
    touches.droite = true;
    evenement.preventDefault();
  }
  if (evenement.code === "Space" && !evenement.repeat) {
    tirer();
    evenement.preventDefault();
  }
});

document.addEventListener("keyup", (evenement) => {
  if (evenement.key === "ArrowLeft") {
    touches.gauche = false;
  }
  if (evenement.key === "ArrowRight") {
    touches.droite = false;
  }
});

window.addEventListener("resize", () => {
  if (controleClavier) {
    garderDansLecran();
  }
});

boutonRejouer.addEventListener("click", rejouer);

afficherInfos();
placerAsteroideEnHaut();
requestAnimationFrame(deplacer);
