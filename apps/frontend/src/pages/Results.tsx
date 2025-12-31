import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubData {
  username: string;
  contributions: ContributionDay[];
  total: number;
}

function Results() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get('username');
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const screenshotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/get-data?username=${encodeURIComponent(username)}`);
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Failed to fetch data');
          setLoading(false);
          return;
        }

        setData(result);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate]);

  const getColorClass = (level: number) => {
    if (level === 0) return 'level-0';
    if (level === 1) return 'level-1';
    if (level === 2) return 'level-2';
    if (level === 3) return 'level-3';
    return 'level-4';
  };

  const getMostActiveDay = () => {
    if (!data) return { date: '', count: 0 };
    return data.contributions.reduce((max, day) =>
      day.count > max.count ? day : max
    , { date: '', count: 0 });
  };

  const getLongestStreak = () => {
    if (!data) return 0;
    let currentStreak = 0;
    let maxStreak = 0;

    data.contributions.forEach(day => {
      if (day.count > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  };

  const handleShare = async () => {
    if (!screenshotRef.current) return;

    try {
      const canvas = await html2canvas(screenshotRef.current, {
        backgroundColor: '#000000',
        scale: 2,
      });

      const imageUrl = canvas.toDataURL('image/png');
      setPreviewImage(imageUrl);
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
    }
  };

  const handleDownload = () => {
    if (!previewImage) return;

    const link = document.createElement('a');
    link.href = previewImage;
    link.download = `${username}-github-wrapped.png`;
    link.click();
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="terminal">
          <p className="loading-text">loading data for {username}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="terminal">
          <p className="error-text">error: {error}</p>
          <button className="submit-btn" onClick={() => navigate('/')}>
            back
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container">
      {/* Hidden screenshot layout for phone format */}
      <div className="screenshot-container" ref={screenshotRef}>
        <div className="screenshot-background">
          {Array.from({ length: 3600 }).map((_, index) => {
            const day = data.contributions[index % data.contributions.length];
            return (
              <div
                key={index}
                className={`screenshot-contribution-box ${getColorClass(day.level)}`}
              />
            );
          })}
        </div>

        <div className="screenshot-overlay">
          <div className="screenshot-box">
            <h1 className="screenshot-title">{username}'s github wrapped</h1>
            <p className="screenshot-total">{data.total} contributions in the last year</p>
          </div>

          <div className="screenshot-stats-box">
            <div className="screenshot-stat">
              <p className="screenshot-stat-label">Most active day</p>
              <p className="screenshot-stat-value">{getMostActiveDay().count} commits</p>
            </div>
            <div className="screenshot-stat">
              <p className="screenshot-stat-label">Longest streak</p>
              <p className="screenshot-stat-value">{getLongestStreak()} days</p>
            </div>
          </div>
        </div>
      </div>

      <div className="results-terminal">
        <div className="results-header">
          <h1 className="results-title">{username}'s github wrapped</h1>
          <p className="total-contributions">{data.total} contributions in the last year</p>
        </div>

        <div className="contribution-graph">
          {data.contributions.map((day) => (
            <div
              key={day.date}
              className={`contribution-box ${getColorClass(day.level)}`}
              title={`${day.date}: ${day.count} contributions`}
            />
          ))}
        </div>

        <div className="legend">
          <span className="legend-label">less</span>
          <div className="contribution-box level-0" />
          <div className="contribution-box level-1" />
          <div className="contribution-box level-2" />
          <div className="contribution-box level-3" />
          <div className="contribution-box level-4" />
          <span className="legend-label">more</span>
        </div>

        <div className="stats">
          <p className="stat-item">Most active day: {getMostActiveDay().count} commits</p>
          <p className="stat-item">Longest streak: {getLongestStreak()} days</p>
        </div>

        <div className="button-group">
          <button className="submit-btn share-btn" onClick={handleShare}>
            share
          </button>
          <button className="submit-btn back-btn" onClick={() => navigate('/')}>
            back to home
          </button>
        </div>
      </div>

      {previewImage && (
        <div className="preview-modal" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2 className="preview-title">Preview</h2>
              <button className="close-btn" onClick={closePreview}>✕</button>
            </div>
            <img src={previewImage} alt="Preview" className="preview-image" />
            <div className="preview-actions">
              <button className="submit-btn download-btn" onClick={handleDownload}>
                download
              </button>
              <button className="submit-btn cancel-btn" onClick={closePreview}>
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Results;
