// Inject footer link labels + cookie-consent strings into all locale message files.
import fs from "node:fs";

const dir = "src/messages";
const locales = ["en", "fr", "de", "it", "zh"];

// Footer link labels (short)
const footerLinks = {
  en: { privacy: "Privacy Policy", about: "About", contact: "Contact", terms: "Terms of Service" },
  fr: {
    privacy: "Politique de confidentialité",
    about: "À propos",
    contact: "Contact",
    terms: "Conditions d'utilisation",
  },
  de: {
    privacy: "Datenschutz",
    about: "Über uns",
    contact: "Kontakt",
    terms: "Nutzungsbedingungen",
  },
  it: {
    privacy: "Informativa sulla privacy",
    about: "Chi siamo",
    contact: "Contatti",
    terms: "Termini di servizio",
  },
};

// Cookie consent banner strings
const cookieConsent = {
  en: {
    title: "We value your privacy",
    description:
      "We use cookies to improve your experience and to serve personalized advertisements. You can accept or decline non-essential cookies at any time.",
    accept: "Accept all",
    decline: "Decline",
    manage: "Manage",
  },
  fr: {
    title: "Nous respectons votre vie privée",
    description:
      "Nous utilisons des cookies pour améliorer votre expérience et afficher des publicités personnalisées. Vous pouvez accepter ou refuser les cookies non essentiels à tout moment.",
    accept: "Tout accepter",
    decline: "Refuser",
    manage: "Gérer",
  },
  de: {
    title: "Wir schätzen Ihre Privatsphäre",
    description:
      "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und personalisierte Werbung anzuzeigen. Sie können nicht essenzielle Cookies jederzeit akzeptieren oder ablehnen.",
    accept: "Alle akzeptieren",
    decline: "Ablehnen",
    manage: "Verwalten",
  },
  it: {
    title: "Rispettiamo la tua privacy",
    description:
      "Utilizziamo i cookie per migliorare la tua esperienza e per mostrare annunci personalizzati. Puoi accettare o rifiutare i cookie non essenziali in qualsiasi momento.",
    accept: "Accetta tutto",
    decline: "Rifiuta",
    manage: "Gestisci",
  },
};

for (const loc of locales) {
  const path = `${dir}/${loc}.json`;
  const json = JSON.parse(fs.readFileSync(path, "utf8"));
  json.common = json.common || {};
  json.common.footer = json.common.footer || {};
  json.common.footer.links = { ...(json.common.footer.links || {}), ...footerLinks[loc] };
  json.common.cookieConsent = cookieConsent[loc];
  fs.writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
  console.log(`updated ${path}`);
}
