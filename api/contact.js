// Fonction serverless Vercel : reçoit le formulaire et envoie l'e-mail via Resend.
// La clé RESEND_API_KEY reste côté serveur (variable d'environnement), jamais dans le navigateur.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clean = (s, max) => String(s || "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
// Les images d'un e-mail doivent avoir une adresse publique : le logo est servi par le site déployé.
const SITE = (process.env.SITE_URL || "https://redianice.vercel.app").replace(/\/$/, "");
const LOGO = SITE + "/assets/logo-clair.png";

// E-mail HTML : mise en page en tableaux et styles en ligne, pour s'afficher correctement dans Gmail (web et mobile).
const buildHtml = (prenom, nom, email, message) => {
  const full = esc(prenom + " " + nom), mail = esc(email);
  const reply = "mailto:" + mail + "?subject=" + encodeURIComponent("Re: votre message à Redianice");
  const font = "font-family:Arial,Helvetica,sans-serif;";
  const initials = esc((prenom[0] || "") + (nom[0] || "")).toUpperCase();
  return '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>'
    + '<body style="margin:0;padding:0;background:#eaf1ff;">'
    + '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">' + full + " vous a écrit depuis le site Redianice.</div>"
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#eaf1ff"><tr><td align="center" style="padding:24px 12px;">'
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">'
    // bandeau
    + '<tr><td bgcolor="#0b3dff" style="background:#0b3dff;border-radius:20px 20px 0 0;padding:26px 28px;' + font + '">'
    + '<img src="' + LOGO + '" alt="redianice" width="160" height="26" style="display:block;border:0;outline:none;width:160px;height:26px;font-size:22px;font-weight:700;color:#ffffff;' + font + '">'
    + '<div style="margin-top:14px;font-size:13px;color:#c6dffd;">Nouveau message du site</div></td></tr>'
    // expéditeur
    + '<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:26px 28px 8px;' + font + '">'
    + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
    + '<td width="48" height="48" align="center" valign="middle" bgcolor="#c6dffd" style="width:48px;height:48px;background:#c6dffd;border-radius:24px;font-size:17px;font-weight:700;color:#0b3dff;' + font + '">' + initials + '</td>'
    + '<td style="padding-left:14px;' + font + '"><div style="font-size:19px;font-weight:700;color:#050c3a;">' + full + '</div>'
    + '<div style="margin-top:2px;font-size:14px;"><a href="mailto:' + mail + '" style="color:#0b3dff;text-decoration:none;">' + mail + '</a></div></td></tr></table></td></tr>'
    // message
    + '<tr><td bgcolor="#ffffff" style="background:#ffffff;padding:18px 28px 6px;' + font + '">'
    + '<div style="font-size:12px;font-weight:700;letter-spacing:.6px;color:#5b6aa8;text-transform:uppercase;">Message</div>'
    + '<div style="margin-top:8px;padding:16px 18px;background:#f1f6ff;border-left:4px solid #0b3dff;border-radius:8px;font-size:16px;line-height:1.6;color:#050c3a;">' + esc(message).replace(/\n/g, "<br>") + '</div></td></tr>'
    // bouton
    + '<tr><td bgcolor="#ffffff" align="left" style="background:#ffffff;padding:22px 28px 30px;border-radius:0 0 20px 20px;' + font + '">'
    + '<a href="' + reply + '" style="display:inline-block;background:#0b3dff;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:13px 26px;border-radius:999px;">Répondre à ' + esc(prenom) + '</a>'
    + '<div style="margin-top:14px;font-size:12px;color:#7a86b8;">Répondre à cet e-mail écrit directement à ' + esc(prenom) + '.</div></td></tr>'
    + '<tr><td align="center" style="padding:16px 8px 0;font-size:12px;color:#7a86b8;' + font + '">Envoyé depuis le formulaire de contact de Redianice</td></tr>'
    + '</table></td></tr></table></body></html>';
};
const hits = new Map(); // limite simple par IP (par instance)

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée." });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ error: "Service d'envoi non configuré." });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "inconnu";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) return res.status(429).json({ error: "Trop d'envois. Réessayez dans quelques minutes." });
  recent.push(now); hits.set(ip, recent);

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch (e) { b = {}; } }
  b = b || {};
  if (b.website) return res.status(200).json({ ok: true }); // champ piège rempli : on ignore

  // Vérification anti-spam Cloudflare Turnstile (active seulement si TURNSTILE_SECRET_KEY est définie)
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    const token = String(b.token || "");
    if (!token) return res.status(400).json({ error: "Vérification anti-spam requise. Rechargez la page et réessayez." });
    try {
      const v = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ secret, response: token, remoteip: ip }) });
      const vj = await v.json();
      if (!vj.success) return res.status(403).json({ error: "Vérification anti-spam échouée. Réessayez." });
    } catch (e) { return res.status(502).json({ error: "Vérification anti-spam indisponible. Réessayez." }); }
  }

  const prenom = clean(b.prenom, 80), nom = clean(b.nom, 80), email = clean(b.email, 120);
  const message = String(b.message || "").trim().slice(0, 3000);
  const MOTIFS = { general: "Demande générale", partenariat: "Partenariat ou pilote", investissement: "Investissement", presse: "Presse", autre: "Autre" };
  const motif = Object.prototype.hasOwnProperty.call(MOTIFS, b.motif) ? b.motif : "general";
  const organisation = clean(b.organisation, 120);
  if (!prenom || !nom) return res.status(400).json({ error: "Merci d'indiquer votre prénom et votre nom." });
  if (!EMAIL.test(email)) return res.status(400).json({ error: "Adresse e-mail invalide." });
  if (message.length < 10) return res.status(400).json({ error: "Votre message est trop court." });

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Redianice <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO || "redianicegroup@gmail.com"],
        reply_to: email,
        subject: "[" + MOTIFS[motif] + "] Nouveau message de " + prenom + " " + nom,
        text: "Motif : " + MOTIFS[motif] + (organisation ? "\nOrganisation : " + organisation : "") + "\n" + prenom + " " + nom + " (" + email + ")\n\n" + message,
        html: buildHtml(prenom, nom, email, message),
      }),
    });
    if (!r.ok) return res.status(502).json({ error: "L'envoi a échoué. Écrivez-nous à redianicegroup@gmail.com." });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: "L'envoi a échoué. Écrivez-nous à redianicegroup@gmail.com." });
  }
};
