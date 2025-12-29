import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

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

        <button className="submit-btn back-btn" onClick={() => navigate('/')}>
          back to home
        </button>
      </div>
    </div>
  );
}

export default Results;
