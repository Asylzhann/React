import './Footer.css'

function Footer({ name }) {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container footer__row">
        <span>
          {name} · {year}
        </span>
        <span>built with React</span>
      </div>
    </footer>
  )
}

export default Footer
