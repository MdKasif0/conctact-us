"use client";

import { FormEvent, useMemo, useState } from "react";

type FormValues = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  name: "",
  email: "",
  subject: "",
  message: "",
  company: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeClientInput(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function validateForm(values: FormValues) {
  const errors: FormErrors = {};

  if (!sanitizeClientInput(values.name)) {
    errors.name = "Please enter your name.";
  } else if (sanitizeClientInput(values.name).length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!sanitizeClientInput(values.email)) {
    errors.email = "Please enter your email address.";
  } else if (!emailPattern.test(sanitizeClientInput(values.email))) {
    errors.email = "Please enter a valid email address.";
  }

  if (!sanitizeClientInput(values.subject)) {
    errors.subject = "Please enter a subject.";
  } else if (sanitizeClientInput(values.subject).length < 3) {
    errors.subject = "Subject must be at least 3 characters.";
  }

  if (!sanitizeClientInput(values.message)) {
    errors.message = "Please enter your message.";
  } else if (sanitizeClientInput(values.message).length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));

    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedValues: FormValues = {
      name: sanitizeClientInput(values.name),
      email: sanitizeClientInput(values.email),
      subject: sanitizeClientInput(values.subject),
      message: values.message.trim(),
      company: values.company
    };

    const nextErrors = validateForm(normalizedValues);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setServerMessage("");
      return;
    }

    setIsSubmitting(true);
    setServerMessage("");

    try {
      const response = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(normalizedValues)
      });

      const contentType = response.headers.get("content-type") || "";
      let payload: { message?: string } = {};

      if (contentType.includes("application/json")) {
        payload = (await response.json()) as { message?: string };
      } else {
        const rawText = await response.text();

        if (!response.ok) {
          throw new Error(
            rawText.includes("<!DOCTYPE")
              ? "The contact endpoint is not available in plain Next.js dev mode. Start the app with Netlify dev to enable /.netlify/functions/contact."
              : "Unexpected response from the contact endpoint."
          );
        }
      }

      if (!response.ok) {
        throw new Error(payload.message || "Something went wrong. Please try again.");
      }

      setIsSubmitted(true);
      setValues(initialValues);
      setErrors({});
      setServerMessage(payload.message || "Your message has been sent.");
    } catch (error) {
      setServerMessage(
        error instanceof Error
          ? error.message
          : "Unable to send your message right now."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <section className="card success-card" aria-live="polite">
        <p className="eyebrow">Message sent</p>
        <h2>Thanks. We&apos;ll get back to you shortly.</h2>
        <p>
          Your message was delivered successfully. If you need to send another
          one, you can reopen the form below.
        </p>
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            setIsSubmitted(false);
            setServerMessage("");
          }}
        >
          Send another message
        </button>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="card-copy">
        <p className="eyebrow">Contact us</p>
        <h2>Tell us what you need.</h2>
        <p>
          Share the details below and your message will be sent securely to our
          inbox.
        </p>
      </div>

      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name ? (
              <p className="error-text" id="name-error">
                {errors.name}
              </p>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email ? (
              <p className="error-text" id="email-error">
                {errors.email}
              </p>
            ) : null}
          </div>
        </div>

        <div className="field">
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            autoComplete="off"
            value={values.subject}
            onChange={(event) => updateField("subject", event.target.value)}
            aria-invalid={Boolean(errors.subject)}
            aria-describedby={errors.subject ? "subject-error" : undefined}
          />
          {errors.subject ? (
            <p className="error-text" id="subject-error">
              {errors.subject}
            </p>
          ) : null}
        </div>

        <div className="field field-hidden">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company}
            onChange={(event) => updateField("company", event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={values.message}
            onChange={(event) => updateField("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message ? (
            <p className="error-text" id="message-error">
              {errors.message}
            </p>
          ) : null}
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send message"}
          </button>
          <p className="helper-text" aria-live="polite">
            {isSubmitting
              ? "Submitting your message securely."
              : hasErrors
                ? "Please fix the highlighted fields."
                : serverMessage}
          </p>
        </div>

        {serverMessage && !isSubmitting && !hasErrors ? (
          <p className="status-text" aria-live="polite">
            {serverMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}
