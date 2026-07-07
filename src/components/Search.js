import React, { useState, useEffect, useRef } from 'react';
import PostCard from './PostCard'; // Leverages your existing component

function Search({ user, onUpdated, onDeleted }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Space Efficient Cache: Stores past searches as { "query_string": [posts_array] }
  // Using a ref prevents unnecessary component re-renders when the cache updates
  const searchCache = useRef({});

  useEffect(() => {
    // 1. If input is empty, clear results instantly without hitting network
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // 2. Check Cache First (O(1) Space Lookup - ultra fast)
    if (searchCache.current[query]) {
      setResults(searchCache.current[query]);
      return;
    }

    // 3. Time Efficient Debounce: Wait 300ms after user stops typing to trigger fetch
    const delayDebounceMatrix = setTimeout(async () => {
      setLoading(true);
      try {
        // Replace with your real filter endpoint, or filter down all posts
        const response = await fetch(`https://blog-2y55.onrender.com/posts`);
        const data = await response.json();
        
        // Simple client-side search indexing filter matching title/content
        const filtered = (Array.isArray(data) ? data : []).filter(post => 
          post.title.toLowerCase().includes(query.toLowerCase()) || 
          post.content.toLowerCase().includes(query.toLowerCase())
        );

        // Commit to cache map
        searchCache.current[query] = filtered;
        setResults(filtered);
      } catch (err) {
        console.error('Search query failure:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    // Cleanup function: Resets the timer if user presses another key within 300ms
    return () => clearTimeout(delayDebounceMatrix);
  }, [query]);

  return (
    <div className="search-container" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Search Articles</h2>
      <input
        type="text"
        placeholder="Type to search stories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          fontSize: '16px',
          marginBottom: '20px',
          boxSizing: 'border-box'
        }}
      />

      {loading && <p style={{ color: '#666' }}>Searching indices...</p>}

      <div className="search-results">
        {!loading && results.length === 0 && query.trim() !== '' && (
          <p style={{ color: '#888' }}>No matches found for "{query}"</p>
        )}

        {results.map(post => (
          <PostCard
            key={post.id}
            post={post}
            user={user}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
          />
        ))}
      </div>
    </div>
  );
}

export default Search;