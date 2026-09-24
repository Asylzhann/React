import './Header.css'

function Header({ name }) {

  return (
    <header className="header">
      <div className="container header__row">
        <nav className="header__nav">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  )
}

export default Header
