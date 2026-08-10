import { useEffect } from 'react';

export default function ReadingTracker({ userId, postId }) {
  useEffect(() => {
    if (!userId || !postId) return;

    // 1. Restore scroll position on mount
    fetch(`https://blog-2y55.onrender.com/api/user/reading-progress/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.postId === postId && data.scrollPercentage) {
          const scrollTarget = (document.documentElement.scrollHeight - window.innerHeight) * (data.scrollPercentage / 100);
          window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
        }
      })
      .catch(err => console.error(err));

    // 2. Save scroll position periodically
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      
      const scrollPercentage = Math.round((window.scrollY / totalHeight) * 100);

      fetch('https://blog-2y55.onrender.com/api/user/reading-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, postId, scrollPercentage })
      }).catch(() => {});
    };

    window.addEventListener('beforeunload', handleScroll);
    return () => window.removeEventListener('beforeunload', handleScroll);
  }, [userId, postId]);

  return null;
}