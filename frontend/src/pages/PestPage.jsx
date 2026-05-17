function PestPage() {
  return (
    <section className="page">
      <div className="shell-container route-hero">
        <div>
          <p className="eyebrow">Pest workflow</p>
          <h2>Upload flow placeholder, ready for the ML-backed analyze experience.</h2>
          <p>
            Day 8 connected Node to `ml-service`, so this page can move straight into an authenticated image upload
            journey next without reworking the architecture underneath it.
          </p>
        </div>
        <div className="surface-card accent-card">
          <p className="card-kicker">Upstream ready</p>
          <p>
            `POST /api/pest/detect` already routes through Node to the Python service with request IDs and graceful
            outage handling.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PestPage;
