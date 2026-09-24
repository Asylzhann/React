import Header from './components/Header'
import Hero from './components/Hero'
import AboutMe from './components/AboutMe'
import Skills from './components/Skills'
import Contact from './components/Contact'
import Footer from './components/Footer'

import photo from './assets/photo.jpg'

const NAME = 'Assylzhan'
const TAGLINE = 'Frontend developer and coffee enthusiast'

const PHOTO_URL = photo

const ABOUT_PARAGRAPHS = [
  "Hi, I'm Assylzhan — a student and developer who likes turning ideas into things people can actually click on. I'm currently learning React and enjoy the moment a pile of components finally becomes a real page.",
  "Outside of code I'm usually reading sci-fi, tinkering with side projects, or arguing about the best way to organize a CSS file.",
]

const FACTS = [
  { label: 'based in', value: 'Planet Earth' },
  { label: 'currently', value: 'Learning React' },
  { label: 'focused on', value: 'Frontend Dev' },
]

const SKILLS = ['JavaScript', 'React', 'HTML & CSS', 'Git & GitHub', 'Figma', 'Problem Solving']

const CONTACT_ITEMS = [
  { label: 'github', value: '@username', href: 'https://github.com/username' },
  { label: 'instagram', value: '@username', href: 'https://instagram.com/username' },
  { label: 'email', value: 'hello@example.com', href: 'mailto:hello@example.com' },
]

function App() {
  return (
    <>
      <Header name={NAME} />
      <Hero name={NAME} tagline={TAGLINE} photoUrl={PHOTO_URL} />
      <AboutMe paragraphs={ABOUT_PARAGRAPHS} facts={FACTS} />
      <Skills skills={SKILLS} />
      <Contact items={CONTACT_ITEMS} />
      <Footer name={NAME} />
    </>
  )
}

export default App
