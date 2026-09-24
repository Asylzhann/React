import './Skills.css'

function Skills({ skills }) {
  return (
    <section id="skills" className="skills">
      <div className="container">
        <p className="skills__label">tools + skills</p>
        <div className="skills__grid">
          {skills.map((skill) => (
            <span className="skills__pill" key={skill}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Skills
