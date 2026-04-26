import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useEventCard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCardClick = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  return {
    isExpanded,
    toggleExpanded,
    handleCardClick,
  };
}
