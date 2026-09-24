import './Contact.css'

function Contact({ items }) {
  return (
    <section id="contact" className="contact">
      <div className="container">
        <p className="contact__label">contact</p>
        <h2 className="contact__heading">Let's build something.</h2>

        <div className="contact__grid">
          {items.map((item) => (
            <a
              className="contact__card"
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact__card-label">{item.label}</span>
              <span className="contact__card-value">{item.value}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Contact
