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
const clicsAvantSouris = 5;
const vitesse = 14;
const tailleAsteroide = 28;
const vitesseAsteroide = 3;
const largeurLaser = 4;
const hauteurLaser = 16;
const vitesseLaser = 10;
const largeurBoss = 384;
const largeurSouris = 120;
const vitesseSouris = 3;
const vieSourisMax = 3;
const pointsSouris = 30;
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
let clics = 0;
let dernierTir = 0;
const lasers = [];
const chatons = [];
const bosses = [];
const sourisListe = [];
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
  const sourisVivantes = sourisEncoreLa();
  if (sourisVivantes > 0) {
    texte += "  ·  Souris : " + sourisVivantes;
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

function sourisEncoreLa() {
  let nombre = 0;
  for (let i = 0; i < sourisListe.length; i++) {
    if (sourisListe[i].present) {
      nombre += 1;
    }
  }
  return nombre;
}

function creerElementSouris() {
  const element = document.createElement("div");
  element.className = "souris";
  element.setAttribute("aria-label", "Mini boss souris");
  const oreilleGauche = document.createElement("span");
  oreilleGauche.className = "oreille gauche";
  const oreilleDroite = document.createElement("span");
  oreilleDroite.className = "oreille droite";
  const oeilGauche = document.createElement("span");
  oeilGauche.className = "oeil gauche";
  const oeilDroit = document.createElement("span");
  oeilDroit.className = "oeil droite";
  oeilGauche.appendChild(document.createElement("span")).className = "pupille";
  oeilDroit.appendChild(document.createElement("span")).className = "pupille";
  const nez = document.createElement("span");
  nez.className = "nez";
  const queue = document.createElement("span");
  queue.className = "queue";
  const vie = document.createElement("span");
  vie.className = "vie-boss";
  element.appendChild(oreilleGauche);
  element.appendChild(oreilleDroite);
  element.appendChild(oeilGauche);
  element.appendChild(oeilDroit);
  element.appendChild(nez);
  element.appendChild(queue);
  element.appendChild(vie);
  return element;
}

function ajouterSouris() {
  const element = creerElementSouris();
  espace.insertBefore(element, asteroide);
  const limite = Math.max(0, espace.clientWidth - largeurSouris);
  const etat = {
    element: element,
    vieElement: element.querySelector(".vie-boss"),
    x: Math.random() * limite,
    direction: Math.random() < 0.5 ? -1 : 1,
    pointsDeVie: vieSourisMax,
    present: true,
  };
  etat.element.style.left = etat.x + "px";
  etat.vieElement.textContent = etat.pointsDeVie;
  sourisListe.push(etat);
  afficherInfos();
}

function deplacerSouris() {
  const limite = Math.max(0, espace.clientWidth - largeurSouris);
  for (let i = 0; i < sourisListe.length; i++) {
    const etat = sourisListe[i];
    if (!etat.present) {
      continue;
    }
    etat.x += vitesseSouris * etat.direction;
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

function blesserSouris(etat) {
  if (!etat.present) {
    return;
  }
  etat.pointsDeVie -= 1;
  etat.vieElement.textContent = etat.pointsDeVie;
  if (etat.pointsDeVie <= 0) {
    etat.present = false;
    etat.element.hidden = true;
    points += pointsSouris;
  }
  afficherInfos();
}

function effacerSouris() {
  for (let i = 0; i < sourisListe.length; i++) {
    sourisListe[i].element.remove();
  }
  sourisListe.length = 0;
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
  const oeilGauche = document.createElement("span");
  oeilGauche.className = "oeil gauche";
  const oeilDroit = document.createElement("span");
  oeilDroit.className = "oeil droite";
  oeilGauche.appendChild(document.createElement("span")).className = "pupille";
  oeilDroit.appendChild(document.createElement("span")).className = "pupille";
  chaton.appendChild(oreilleGauche);
  chaton.appendChild(oreilleDroite);
  chaton.appendChild(oeilGauche);
  chaton.appendChild(oeilDroit);

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
    for (let j = 0; j < sourisListe.length; j++) {
      const etat = sourisListe[j];
      if (etat.present && seTouchent(zoneLaser, etat.element.getBoundingClientRect())) {
        lasers[i].element.remove();
        lasers.splice(i, 1);
        blesserSouris(etat);
        toucheBoss = true;
        break;
      }
    }
    if (toucheBoss) {
      continue;
    }
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
  clics = 0;
  dernierTir = 0;
  effacerSouris();
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

function suivreVaisseau(oeil, distanceMax) {
  const pupille = oeil.querySelector(".pupille");
  const zoneOeil = oeil.getBoundingClientRect();
  const zoneVaisseau = vaisseau.getBoundingClientRect();
  const centreX = zoneOeil.left + zoneOeil.width / 2;
  const centreY = zoneOeil.top + zoneOeil.height / 2;
  const cibleX = zoneVaisseau.left + zoneVaisseau.width / 2;
  const cibleY = zoneVaisseau.top + zoneVaisseau.height / 2;
  let decalageX = cibleX - centreX;
  let decalageY = cibleY - centreY;
  const distance = Math.hypot(decalageX, decalageY) || 1;
  decalageX = (decalageX / distance) * distanceMax;
  decalageY = (decalageY / distance) * distanceMax;
  pupille.style.transform = "translate(" + decalageX + "px, " + decalageY + "px)";
}

function orienterYeux() {
  const yeux = document.querySelectorAll(".boss .oeil, .souris .oeil, .chaton .oeil");
  for (let i = 0; i < yeux.length; i++) {
    const animal = yeux[i].closest(".boss, .souris, .chaton");
    if (!animal || animal.hidden) {
      continue;
    }
    let distanceMax = 2;
    if (animal.classList.contains("boss")) {
      distanceMax = 12;
    } else if (animal.classList.contains("souris")) {
      distanceMax = 3;
    }
    suivreVaisseau(yeux[i], distanceMax);
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
  deplacerSouris();
  descendreChatons();
  orienterYeux();
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

espace.addEventListener("click", (evenement) => {
  if (partieTerminee || evenement.target.closest("button")) {
    return;
  }
  clics += 1;
  if (clics % clicsAvantSouris === 0) {
    ajouterSouris();
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

function jouerBruit(debut, duree, volume, frequence) {
  const taille = Math.floor(audio.sampleRate * duree);
  const tampon = audio.createBuffer(1, taille, audio.sampleRate);
  const donnees = tampon.getChannelData(0);
  for (let i = 0; i < taille; i++) {
    donnees[i] = Math.random() * 2 - 1;
  }
  const source = audio.createBufferSource();
  source.buffer = tampon;
  const filtre = audio.createBiquadFilter();
  filtre.type = "highpass";
  filtre.frequency.value = frequence;
  const volumeNote = audio.createGain();
  volumeNote.gain.setValueAtTime(volume, debut);
  volumeNote.gain.exponentialRampToValueAtTime(0.001, debut + duree);
  source.connect(filtre);
  filtre.connect(volumeNote);
  volumeNote.connect(audio.destination);
  source.start(debut);
  source.stop(debut + duree);
}

function jouerAccord(fondamentale, debut, duree) {
  jouerNote(fondamentale, debut, duree, "sawtooth", 0.05);
  jouerNote(fondamentale * 2, debut, duree, "square", 0.03);
  jouerNote(fondamentale * 3, debut, duree, "square", 0.02);
}

function jouerBoucle() {
  if (!musiqueActive || !audio) {
    return;
  }
  const debut = audio.currentTime + 0.05;
  const temps = 0.15;
  const riff = [82, 82, 82, 98, 82, 82, 73, 82, 110, 110, 98, 82, 82, 98, 110, 82];
  for (let i = 0; i < riff.length; i++) {
    const moment = debut + i * temps;
    jouerAccord(riff[i], moment, temps * 0.42);
    if (i % 2 === 0) {
      jouerNote(55, moment, 0.08, "sine", 0.12);
    }
    if (i % 4 === 2) {
      jouerBruit(moment, 0.12, 0.08, 1800);
    } else {
      jouerBruit(moment, 0.03, 0.025, 7000);
    }
  }
  minuteurMusique = setTimeout(jouerBoucle, riff.length * temps * 1000);
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
