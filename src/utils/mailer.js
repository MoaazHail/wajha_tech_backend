import nodemailer from "nodemailer";

import { env } from "../config/env.js";

/**
 * SMTP when SMTP_HOST is set. Without it, development prints each email to the
 * console instead of sending it, and production refuses to pretend it worked.
 */
export const mailConfigured = Boolean(env.mail.host);

const transporter = mailConfigured
  ? nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.port === 465,
      auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

export async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({ from: env.mail.from, to, subject, html, text });

  if (!mailConfigured) console.log(`[mail:dev] to=${to} subject=${subject}\n${text}`);
  return info;
}

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
