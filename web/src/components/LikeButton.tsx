import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { onAuthUserChanged, type AuthUser } from '../services/auth';
import { isEventLiked, LIKES_CHANGED_EVENT, toggleLikedEvent } from '../services/likes';
import type { Event } from '../types';

type LikeButtonProps = {
    event: Event;
    compact?: boolean;
    iconOnly?: boolean;
    className?: string;
};

export function LikeButton({ event, compact = false, iconOnly = false, className = '' }: LikeButtonProps) {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => onAuthUserChanged(setCurrentUser), []);

    useEffect(() => {
        const syncLikedState = () => {
            if (!currentUser?.uid) {
                setIsLiked(false);
                return;
            }

            setIsLiked(isEventLiked(currentUser.uid, event.id));
        };

        syncLikedState();
        window.addEventListener(LIKES_CHANGED_EVENT, syncLikedState);

        return () => {
            window.removeEventListener(LIKES_CHANGED_EVENT, syncLikedState);
        };
    }, [currentUser?.uid, event.id]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser?.uid) {
            navigate('/login');
            return;
        }

        const nextLiked = toggleLikedEvent(currentUser.uid, event.id);
        setIsLiked(nextLiked);
    };

    const label = isLiked ? 'Liked' : 'Like';
    const buttonClasses = compact
        ? 'inline-flex items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--button-hover)]'
        : 'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200';
    const iconOnlyClasses = iconOnly
        ? 'h-12 w-12 justify-center rounded-xl border border-white/35 bg-black/45 p-0 shadow-[0_4px_14px_rgba(0,0,0,0.45)] backdrop-blur-sm hover:bg-black/55'
        : '';
    const stateClasses = isLiked
        ? 'border-[color-mix(in_srgb,var(--dtu-accent)_55%,var(--panel-border)_45%)] bg-[color-mix(in_srgb,var(--dtu-accent)_16%,var(--panel-bg)_84%)] text-[var(--text-primary)]'
        : 'border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover)]';
    const rootClasses = iconOnly ? 'text-white hover:text-[var(--dtu-accent-light)]' : stateClasses;

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={isLiked}
            aria-label={label}
            className={`${buttonClasses} ${iconOnlyClasses} ${rootClasses} ${className}`.trim()}
        >
            <Heart
                size={iconOnly ? 24 : 18}
                strokeWidth={iconOnly ? 2.6 : 2.2}
                className={isLiked ? 'text-red-500' : (iconOnly ? 'text-white' : undefined)}
                fill={isLiked ? 'currentColor' : 'none'}
            />
            {!iconOnly && label}
        </button>
    );
}