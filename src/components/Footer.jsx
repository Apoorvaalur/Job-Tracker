export default function Footer({ tone = 'light' }) {
  return <footer className={`app-footer ${tone === 'dark' ? 'app-footer-dark' : ''}`}>
    © {new Date().getFullYear()} Job Application Tracker. All rights reserved.
  </footer>
}
