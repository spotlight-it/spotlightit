export default function LandingPage() {
  return (
    <div>
      <section className="hero">
        <h1>Find independent creators worth cheering for.</h1>
        <p>
          SpotlightIt is a directory of small, independent creators — poets,
          musicians, illustrators, and more — organized by niche. Support
          isn't money here. It's showing up: visiting their page, following
          them, and leaving a public word of encouragement.
        </p>
        <div className="hero-actions">
          <a href="/browse" className="btn">
            Browse creators
          </a>
          <a href="/submit" className="btn secondary">
            Submit a creator
          </a>
        </div>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginTop: 0 }}>How it works</h3>
        <ol style={{ paddingLeft: 18, color: "#4b4557", lineHeight: 1.7 }}>
          <li>
            Anyone can submit a listing — their own, or a friend's whose work
            deserves more eyes.
          </li>
          <li>
            If you submit someone else, we don't publish anything until{" "}
            <strong>they</strong> confirm it themselves via a private claim
            link.
          </li>
          <li>
            Once approved, visitors can browse by niche, visit their
            Instagram, and leave a public cheer on their profile.
          </li>
        </ol>
      </section>
    </div>
  );
}
