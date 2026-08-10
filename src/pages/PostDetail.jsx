// File Location: src/pages/PostDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard'; // Correct path

export default function PostDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // A. Fetch individual post parameters metrics
  useEffect(() => {
    fetch(`https://blog-2y55.onrender.com/posts/${id}`)
      .then(res => res.json())
      .then(data => setPost(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // B. 📈 Run telemetry collection unique views session log tracking safely here
  useEffect(() => {
    if (!id) return;

    const sessionViewKey = `viewed_post_${id}`;

    if (!sessionStorage.getItem(sessionViewKey)) {
      fetch(`https://blog-2y55.onrender.com/api/analytics/posts/${id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
        .then(() => sessionStorage.setItem(sessionViewKey, 'true'))
        .catch(err => console.error('View tracking error:', err));
    }
  }, [id]);

  if (loading) return <div className="post-detail-page" style={{ padding: '40px', textAlign: 'center' }}><h3>Loading article data streams...</h3></div>;
  if (!post) return <div className="post-detail-page" style={{ padding: '40px', textAlign: 'center' }}><h3>Post not found.</h3><button className="btn btn-primary" onClick={() => navigate('/')}>Back Home</button></div>;

  return (
    <div className="post-detail-page">
      <div className="post-detail-header">
        <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <PostCard 
        post={post} 
        user={user} 
        isFeedMode={false} /* 💡 Enables full reading content, comments layout, and likes */
        onUpdated={(updated) => setPost(updated)}
        onDeleted={() => navigate('/')}
      />
    </div>
  );
}