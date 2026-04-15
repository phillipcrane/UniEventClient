import { Link, useLocation } from 'react-router-dom';

const LOGO_SRC = 'https://firebasestorage.googleapis.com/v0/b/dtuevent-8105b.firebasestorage.app/o/picture%2Fdtulogo.png?alt=media&token=7e86de6e-f1f4-471d-8354-70ad70bafe14';

export function HeaderLogoLink() {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <Link
            to="/"
            reloadDocument={isHomePage}
            aria-label={isHomePage ? 'Refresh the main page' : 'Go to the main page'}
            className="header-logo-link"
        >
            <img src={LOGO_SRC} alt="DTU Logo" className="header-logo" />
        </Link>
    );
}