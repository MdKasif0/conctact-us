import { Resend } from "resend";

export type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  company?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return stripTags(value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeMessage(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return stripTags(value)
    .replace(/\r\n/g, "\n")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function validateContactPayload(payload: ContactPayload) {
  const name = sanitizeText(payload.name, 120);
  const email = sanitizeText(payload.email, 160).toLowerCase();
  const subject = sanitizeText(payload.subject, 160);
  const message = sanitizeMessage(payload.message, 4000);
  const company = sanitizeText(payload.company, 200);

  if (company) {
    return { ok: true as const, honeypot: true, name, email, subject, message };
  }

  if (!name || name.length < 2) {
    return { ok: false as const, statusCode: 400, message: "Please provide a valid name." };
  }

  if (!email || !emailPattern.test(email)) {
    return {
      ok: false as const,
      statusCode: 400,
      message: "Please provide a valid email address."
    };
  }

  if (!subject || subject.length < 3) {
    return {
      ok: false as const,
      statusCode: 400,
      message: "Please provide a valid subject."
    };
  }

  if (!message || message.length < 10) {
    return {
      ok: false as const,
      statusCode: 400,
      message: "Please provide a more detailed message."
    };
  }

  return {
    ok: true as const,
    honeypot: false,
    name,
    email,
    subject,
    message
  };
}

export async function sendContactEmail(payload: ContactPayload, env = process.env) {
  const resendApiKey = env.RESEND_API_KEY;
  const toEmail = env.TO_EMAIL;
  const fromEmail = env.FROM_EMAIL;

  if (!resendApiKey || !toEmail || !fromEmail) {
    return { ok: false as const, statusCode: 500, message: "Email service is not configured." };
  }

  const validation = validateContactPayload(payload);

  if (!validation.ok) {
    return validation;
  }

  if (validation.honeypot) {
    return { ok: true as const, statusCode: 200, message: "Your message has been submitted." };
  }

  try {
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: validation.email,
      subject: `Contact Form: ${validation.subject}`,
      text: [
        `Name: ${validation.name}`,
        `Email: ${validation.email}`,
        `Subject: ${validation.subject}`,
        "",
        "Message:",
        validation.message
      ].join("\n"),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(validation.name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(validation.email)}</p>
          <p><strong>Subject:</strong> ${escapeHtml(validation.subject)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(validation.message).replace(/\n/g, "<br />")}</p>
        </div>
      `
    });

    return {
      ok: true as const,
      statusCode: 200,
      message: "Your message has been sent successfully."
    };
  } catch (error) {
    console.error("Failed to send contact form email", error);
    return {
      ok: false as const,
      statusCode: 500,
      message: "Unable to send your message right now."
    };
  }
}
