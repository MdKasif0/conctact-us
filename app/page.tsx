import ContactForm from "@/components/contact-form";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Reach our team</p>
          <h1>Contact us without the usual friction.</h1>
          <p className="hero-text">
            Questions, project details, or partnership requests. Send a message
            and it will be delivered directly through a protected server-side
            workflow.
          </p>
        </div>

        <div className="hero-panel">
          <div className="info-chip">Secure delivery via Netlify Functions</div>
          <div className="info-grid">
            <article>
              <strong>Inbox</strong>
              <span>Configured through protected environment variables</span>
            </article>
            <article>
              <strong>Stack</strong>
              <span>Next.js, TypeScript, Resend</span>
            </article>
          </div>
        </div>
      </section>

      <ContactForm />
    </main>
  );
}
