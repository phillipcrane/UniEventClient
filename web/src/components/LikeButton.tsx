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
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => onAuthUserChanged(setCurrentUser), []);

    useEffect(() => {
        const syncLikedState = async () => {
            if (!currentUser?.uid) {
                setIsLiked(false);
                return;
            }

            setIsLiked(await isEventLiked(currentUser.uid, event.id));
        };

        void syncLikedState();
        const handleLikesChanged = () => {
            void syncLikedState();
        };
        window.addEventListener(LIKES_CHANGED_EVENT, handleLikesChanged);

        return () => {
            window.removeEventListener(LIKES_CHANGED_EVENT, handleLikesChanged);
        };
    }, [currentUser?.uid, event.id]);

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (isUpdating) {
            return;
        }

        if (!currentUser?.uid) {
            navigate('/login');
            return;
        }

        try {
            setIsUpdating(true);
            const nextLiked = await toggleLikedEvent(currentUser.uid, event.id);
            setIsLiked(nextLiked);
        } finally {
            setIsUpdating(false);
        }
    };

    const label = isLiked ? 'Liked' : 'Like';
    const buttonClasses = compact
        ? 'inline-flex items-center gap-2 rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--button-hover)]'
        : 'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors duration-200';
    const iconOnlyClasses = iconOnly
        ? 'h-12 w-12 justify-center rounded-xl border border-white/85 bg-white/96 p-0 shadow-[0_8px_18px_rgba(16,24,40,0.14)] backdrop-blur-sm hover:bg-white dark:border-white/45 dark:bg-black/30 dark:shadow-[0_4px_14px_rgba(0,0,0,0.35)] dark:hover:bg-black/38'
        : '';
    const stateClasses = isLiked
        ? 'border-[color-mix(in_srgb,var(--dtu-accent)_55%,var(--panel-border)_45%)] bg-[color-mix(in_srgb,var(--dtu-accent)_16%,var(--panel-bg)_84%)] text-[var(--text-primary)]'
        : 'border-[var(--panel-border)] bg-[var(--panel-bg)] text-[var(--text-primary)] hover:bg-[var(--button-hover)]';
    const rootClasses = iconOnly ? 'text-[var(--text-primary)] hover:text-[var(--dtu-accent)] dark:text-white dark:hover:text-[var(--dtu-accent-light)]' : stateClasses;

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={isUpdating}
            aria-pressed={isLiked}
            aria-label={label}
            className={`${buttonClasses} ${iconOnlyClasses} ${rootClasses} ${className}`.trim()}
        >
            <Heart
                size={iconOnly ? 24 : 18}
                strokeWidth={iconOnly ? 2.6 : 2.2}
                className={isLiked ? 'text-red-500' : undefined}
                fill={isLiked ? 'currentColor' : 'none'}
            />
            {!iconOnly && label}
        </button>
    );
}