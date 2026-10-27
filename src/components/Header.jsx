import Icon from './Icon.jsx'

// No title bar: only a small menu button on mobile so the sidebar can be opened.
export default function Header({ onMenuClick }) {
  return (
    <div className="mobile-menu-bar md:hidden">
      <button type="button" onClick={onMenuClick} className="menu-button" aria-label="Open menu">
        <Icon name="menu" />
      </button>
    </div>
  )
}
