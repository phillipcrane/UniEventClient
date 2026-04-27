import { Link } from 'react-router-dom';
import { BadgeCheck, CalendarCheck2, FileText, Megaphone, ShieldCheck, Sparkles } from 'lucide-react';
import { Footer } from '../components/Footer';
import { HeaderLogoLink } from '../components/HeaderLogoLink';
import { ThemeToggle } from '../components/ThemeToggle';
import '../styles/BecomeOrganizerOnboardingPage.css';

export function BecomeOrganizerOnboardingPage() {
    return (
        <div className="organizer-onboarding-page min-h-screen flex flex-col">
            <header className="page-header mx-6 md:mx-8 mt-4 md:mt-6 mb-8">
                <div className="header-content">
                    <HeaderLogoLink />
                    <div className="header-text">
                        <h1 className="header-title">Become an Organizer</h1>
                        <p className="header-subtitle">Onboarding hub for creating and managing DTU events</p>
                    </div>
                </div>

                <div className="header-toggle">
                    <ThemeToggle />
                </div>
            </header>

            <main className="flex-1 px-6 md:px-8 pb-10 max-w-6xl mx-auto w-full">
                <section className="organizer-onboarding-shell" aria-label="Organizer onboarding content">
                    <div className="organizer-onboarding-card">
                        <div className="organizer-onboarding-glow" aria-hidden="true" />

                        <div className="organizer-onboarding-content">
                            <div className="organizer-onboarding-intro">
                                <p className="organizer-onboarding-eyebrow">ORGANIZER PROGRAM</p>
                                <h2 className="organizer-onboarding-title">Launch Your Organizer Profile</h2>
                                <p className="organizer-onboarding-description">
                                    This page is the first onboarding draft. Final actions and integrations will be wired next.
                                </p>
                            </div>

                            <div className="organizer-onboarding-highlight" role="status" aria-live="polite">
                                <Sparkles size={16} />
                                <span>Draft mode active: no data will be submitted yet.</span>
                            </div>

                            <div className="organizer-onboarding-grid" role="list" aria-label="Onboarding steps">
                                <article className="organizer-step" role="listitem">
                                    <div className="organizer-step-icon" aria-hidden="true">
                                        <BadgeCheck size={18} />
                                    </div>
                                    <h3>Verify Identity</h3>
                                    <p>Confirm your profile details and organizational role to unlock organizer tools.</p>
                                </article>

                                <article className="organizer-step" role="listitem">
                                    <div className="organizer-step-icon" aria-hidden="true">
                                        <ShieldCheck size={18} />
                                    </div>
                                    <h3>Permissions Review</h3>
                                    <p>Choose how your team can create, edit, and moderate events on your behalf.</p>
                                </article>

                                <article className="organizer-step" role="listitem">
                                    <div className="organizer-step-icon" aria-hidden="true">
                                        <CalendarCheck2 size={18} />
                                    </div>
                                    <h3>Publishing Setup</h3>
                                    <p>Define your default event settings so new posts are faster and more consistent.</p>
                                </article>

                                <article className="organizer-step" role="listitem">
                                    <div className="organizer-step-icon" aria-hidden="true">
                                        <Megaphone size={18} />
                                    </div>
                                    <h3>Promotion Preferences</h3>
                                    <p>Set communication channels to reach students through event reminders and updates.</p>
                                </article>
                            </div>

                            <section className="organizer-onboarding-checklist" aria-label="What to prepare">
                                <h3>
                                    <FileText size={16} />
                                    What to Prepare
                                </h3>
                                <ul>
                                    <li>Official organizer name and short description</li>
                                    <li>Primary contact email for approvals</li>
                                    <li>Logo or cover image assets</li>
                                    <li>Social links and event posting policy</li>
                                </ul>
                            </section>

                            <div className="organizer-onboarding-actions">
                                <Link to="/" className="organizer-btn organizer-btn-ghost">
                                    Back to Home
                                </Link>
                                <button type="button" className="organizer-btn organizer-btn-primary" disabled>
                                    Start Onboarding (Soon)
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
