import './Hero.css'

function Hero({ name, tagline, photoUrl }) {
  return (
    <section id="top" className="hero">
      <div className="container hero__row">
        <div className="hero__text">
          <h1 className="hero__name">{name}</h1>
          <p className="hero__tagline">{tagline}</p>
          <a className="hero__cta" href="#contact">
            Get in touch ↓
          </a>
        </div>

        <div className="hero__photo-wrap">
          <div className="hero__tape hero__tape--left" />
          <div className="hero__tape hero__tape--right" />
          <img className="hero__photo" src={photoUrl} alt={`Portrait of ${name}`} />
        </div>
      </div>
    </section>
  )
}

export default Hero
