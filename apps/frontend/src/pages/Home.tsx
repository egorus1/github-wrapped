import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [displayedText, setDisplayedText] = useState('');
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const fullText = 'github wrapped';

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      navigate(`/results?username=${encodeURIComponent(username)}`);
    }
  };

  return (
    <div className="container">
      <div className="terminal">
        <div className="title-wrapper">
          <h1 className="title">
            {displayedText}
            <span className="cursor">_</span>
          </h1>
        </div>

        <form className="input-section" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <span className="prompt">{'>'}</span>
            <input
              type="text"
              className="github-input"
              placeholder="enter github username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>
          <button type="submit" className="submit-btn">
            execute
          </button>
        </form>

        <div className="coffee-section">
          <p>
            liked it? i would appreciate if you{' '}
            <a href="LINK_HERE" target="_blank" rel="noopener noreferrer" className="coffee-link">
              buy me a coffee
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;
