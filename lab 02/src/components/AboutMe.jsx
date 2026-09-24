import './AboutMe.css'

function AboutMe({ paragraphs, facts }) {
  return (
    <section id="about" className="about">
      <div className="container about__row">
        <div className="about__margin">
          <p className="about__label">about me</p>
          <ul className="about__facts">
            {facts.map((fact) => (
              <li key={fact.label}>
                <span className="about__fact-label">{fact.label}</span>
                <span className="about__fact-value">{fact.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="about__body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AboutMe
