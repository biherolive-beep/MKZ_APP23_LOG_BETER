import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RecentFiles = ({ onFileSelect }) => {
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentFiles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/files/recent?limit=10`);
        setRecentFiles(response.data);
        setError(null);
      } catch (err) {
        setError('Nie można załadować ostatnio dodanych plików.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentFiles();
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div>Ładowanie...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="recent-files-container">
      <h3>Ostatnio dodane dokumenty</h3>
      {recentFiles.length > 0 ? (
        <ul className="recent-files-list">
          {recentFiles.map((file) => (
            <li key={file.file_path} className="recent-file-item" onClick={() => onFileSelect({ name: file.file_name, path: file.file_path, type: 'file' })}>
              <span className="file-name">{file.file_name}</span>
              <span className="file-date">{formatDate(file.created_at)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Brak ostatnio dodanych plików.</p>
      )}
    </div>
  );
};

export default RecentFiles;