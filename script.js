const espace = document.getElementById("espace");
const vaisseau = document.getElementById("vaisseau");
const asteroide = document.getElementById("asteroide");
const boss = document.getElementById("boss");
const infos = document.getElementById("infos");
const fin = document.getElementById("fin");
const boutonRejouer = document.getElementById("rejouer");
const boutonMusique = document.getElementById("musique");

const largeurVaisseau = 72;
const cadenceTir = 120;
const frappesAvantBoss = 25;
const vitesse = 14;
const tailleAsteroide = 28;
const vitesseAsteroide = 3;
const largeurLaser = 4;
const hauteurLaser = 16;
const vitesseLaser = 10;
const largeurBoss = 384;
const tailleChaton = 36;
const vitesseChaton = 4;
const pointsChaton = 2;
const vitesseBoss = 2;
const vieBossMax = 10;
const pointsBoss = 100;

let asteroideX = 0;
let asteroideY = 0;

let x = 0;
let controleClavier = false;
let points = 0;
let vies = 3;
let partieTerminee = false;
let frappes = 0;
let dernierTir = 0;
const lasers = [];
const chatons = [];
const bosses = [];
const touches = {
  gauche: false,
  droite: false,
  tir: false,
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

function creerLaser(xLaser, yLaser) {
  const laser = document.createElement("div");
  laser.className = "laser";
  laser.style.left = xLaser + "px";
  laser.style.top = yLaser + "px";
  espace.appendChild(laser);
  lasers.push({ element: laser, y: yLaser });
}

function tirer() {
  const zone = espace.getBoundingClientRect();
  const canons = vaisseau.querySelectorAll(".mitraillette");
  for (let i = 0; i < canons.length; i++) {
    const rect = canons[i].getBoundingClientRect();
    const laserX = rect.left - zone.left + rect.width / 2 - largeurLaser / 2;
    const laserY = rect.top - zone.top - hauteurLaser;
    creerLaser(laserX, laserY);
  }
}

function tirerMitraillettes() {
  if (!touches.tir) {
    return;
  }
  const maintenant = performance.now();
  if (maintenant - dernierTir < cadenceTir) {
    return;
  }
  dernierTir = maintenant;
  tirer();
}

function afficherInfos() {
  let texte = "Points : " + points + "  ·  Vies : " + vies;
  const vivants = bossesVivants();
  if (vivants > 0) {
    texte += "  ·  Boss : " + vivants;
  }
  infos.textContent = texte;
}

function bossesVivants() {
  let nombre = 0;
  for (let i = 0; i < bosses.length; i++) {
    if (bosses[i].present) {
      nombre += 1;
    }
  }
  return nombre;
}

function creerEtatBoss(element) {
  return {
    element: element,
    vieElement: element.querySelector(".vie-boss"),
    x: 0,
    direction: 1,
    pointsDeVie: vieBossMax,
    present: true,
  };
}

function placerUnBoss(etat, auCentre) {
  const limite = Math.max(0, espace.clientWidth - largeurBoss);
  etat.x = auCentre ? limite / 2 : Math.random() * limite;
  etat.direction = Math.random() < 0.5 ? -1 : 1;
  etat.pointsDeVie = vieBossMax;
  etat.present = true;
  etat.element.hidden = false;
  etat.element.style.left = etat.x + "px";
  etat.vieElement.textContent = etat.pointsDeVie;
}

function ajouterBoss() {
  const element = boss.cloneNode(true);
  element.removeAttribute("id");
  espace.insertBefore(element, asteroide);
  const etat = creerEtatBoss(element);
  placerUnBoss(etat, false);
  bosses.push(etat);
  afficherInfos();
}

function reinitialiserBoss() {
  for (let i = bosses.length - 1; i >= 1; i--) {
    bosses[i].element.remove();
    bosses.splice(i, 1);
  }
  if (bosses.length === 0) {
    bosses.push(creerEtatBoss(boss));
  }
  placerUnBoss(bosses[0], true);
}

function deplacerBoss() {
  const limite = Math.max(0, espace.clientWidth - largeurBoss);
  for (let i = 0; i < bosses.length; i++) {
    const etat = bosses[i];
    if (!etat.present) {
      continue;
    }
    etat.x += vitesseBoss * etat.direction;
    if (etat.x <= 0) {
      etat.x = 0;
      etat.direction = 1;
    }
    if (etat.x >= limite) {
      etat.x = limite;
      etat.direction = -1;
    }
    etat.element.style.left = etat.x + "px";
  }
}

function lacherChaton(elementBoss) {
  const zone = espace.getBoundingClientRect();
  const rect = elementBoss.getBoundingClientRect();
  const chaton = document.createElement("div");
  chaton.className = "chaton";
  chaton.setAttribute("aria-label", "Chaton");

  const oreilleGauche = document.createElement("span");
  oreilleGauche.className = "oreille gauche";
  const oreilleDroite = document.createElement("span");
  oreilleDroite.className = "oreille droite";
  chaton.appendChild(oreilleGauche);
  chaton.appendChild(oreilleDroite);

  const xChaton = rect.left - zone.left + rect.width / 2 - tailleChaton / 2;
  const yChaton = rect.bottom - zone.top - tailleChaton;
  chaton.style.left = xChaton + "px";
  chaton.style.top = yChaton + "px";
  espace.appendChild(chaton);
  chatons.push({ element: chaton, y: yChaton });
}

function descendreChatons() {
  for (let i = chatons.length - 1; i >= 0; i--) {
    const chaton = chatons[i];
    chaton.y += vitesseChaton;
    if (chaton.y > espace.clientHeight) {
      chaton.element.remove();
      chatons.splice(i, 1);
    } else {
      chaton.element.style.top = chaton.y + "px";
    }
  }
}

function attraperChatons() {
  const zoneVaisseau = vaisseau.getBoundingClientRect();
  for (let i = chatons.length - 1; i >= 0; i--) {
    if (seTouchent(chatons[i].element.getBoundingClientRect(), zoneVaisseau)) {
      chatons[i].element.remove();
      chatons.splice(i, 1);
      points += pointsChaton;
      afficherInfos();
    }
  }
}

function effacerChatons() {
  for (let i = 0; i < chatons.length; i++) {
    chatons[i].element.remove();
  }
  chatons.length = 0;
}

function blesserBoss(etat) {
  if (!etat.present) {
    return;
  }
  lacherChaton(etat.element);
  etat.pointsDeVie -= 1;
  etat.vieElement.textContent = etat.pointsDeVie;
  if (etat.pointsDeVie <= 0) {
    etat.present = false;
    etat.element.hidden = true;
    points += pointsBoss;
  }
  afficherInfos();
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
  touches.tir = false;
  effacerLasers();
  effacerChatons();
  asteroide.style.top = "-100px";
  fin.hidden = false;
}

function verifierCollisions() {
  attraperChatons();
  const zoneAsteroide = asteroide.getBoundingClientRect();

  for (let i = lasers.length - 1; i >= 0; i--) {
    const zoneLaser = lasers[i].element.getBoundingClientRect();
    let toucheBoss = false;
    for (let j = 0; j < bosses.length; j++) {
      const etat = bosses[j];
      if (etat.present && seTouchent(zoneLaser, etat.element.getBoundingClientRect())) {
        lasers[i].element.remove();
        lasers.splice(i, 1);
        blesserBoss(etat);
        toucheBoss = true;
        break;
      }
    }
    if (toucheBoss) {
      continue;
    }
    if (seTouchent(zoneLaser, zoneAsteroide)) {
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
  touches.tir = false;
  frappes = 0;
  dernierTir = 0;
  effacerLasers();
  effacerChatons();
  vaisseau.style.left = "50%";
  vaisseau.style.transform = "translateX(-50%)";
  fin.hidden = true;
  reinitialiserBoss();
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

  tirerMitraillettes();
  descendreAsteroide();
  deplacerBoss();
  descendreChatons();
  monterLasers();
  verifierCollisions();
  requestAnimationFrame(deplacer);
}

document.addEventListener("keydown", (evenement) => {
  demarrerMusique();
  if (partieTerminee) {
    return;
  }
  frappes += 1;
  if (frappes % frappesAvantBoss === 0) {
    ajouterBoss();
  }
  if (evenement.key === "ArrowLeft") {
    touches.gauche = true;
    evenement.preventDefault();
  }
  if (evenement.key === "ArrowRight") {
    touches.droite = true;
    evenement.preventDefault();
  }
  if (evenement.code === "Space") {
    touches.tir = true;
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
  if (evenement.code === "Space") {
    touches.tir = false;
  }
});

window.addEventListener("resize", () => {
  if (controleClavier) {
    garderDansLecran();
  }
});

let audio = null;
let musiqueActive = false;
let minuteurMusique = 0;

function jouerNote(frequence, debut, duree, type, volume) {
  const oscillateur = audio.createOscillator();
  const volumeNote = audio.createGain();
  oscillateur.type = type;
  oscillateur.frequency.value = frequence;
  volumeNote.gain.setValueAtTime(volume, debut);
  volumeNote.gain.exponentialRampToValueAtTime(0.001, debut + duree);
  oscillateur.connect(volumeNote);
  volumeNote.connect(audio.destination);
  oscillateur.start(debut);
  oscillateur.stop(debut + duree + 0.02);
}

function jouerBoucle() {
  if (!musiqueActive || !audio) {
    return;
  }
  const debut = audio.currentTime + 0.05;
  const temps = 0.24;
  const melodie = [523, 659, 784, 659, 880, 784, 659, 587];
  const basses = [131, 131, 196, 196, 220, 196, 175, 196];
  for (let i = 0; i < melodie.length; i++) {
    jouerNote(melodie[i], debut + i * temps, temps * 0.85, "square", 0.04);
    jouerNote(basses[i], debut + i * temps, temps * 0.85, "triangle", 0.06);
  }
  minuteurMusique = setTimeout(jouerBoucle, melodie.length * temps * 1000);
}

function demarrerMusique() {
  if (!audio) {
    audio = new AudioContext();
  }
  if (audio.state === "suspended") {
    audio.resume();
  }
  if (musiqueActive) {
    return;
  }
  musiqueActive = true;
  boutonMusique.textContent = "Musique : oui";
  jouerBoucle();
}

function couperMusique() {
  musiqueActive = false;
  clearTimeout(minuteurMusique);
  boutonMusique.textContent = "Musique : non";
}

boutonMusique.addEventListener("click", () => {
  if (musiqueActive) {
    couperMusique();
  } else {
    demarrerMusique();
  }
});

boutonRejouer.addEventListener("click", rejouer);

reinitialiserBoss();
afficherInfos();
placerAsteroideEnHaut();
requestAnimationFrame(deplacer);
