import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';
import RecentFiles from './components/RecentFiles';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main application component
const MainLayout = ({ siteTitle, welcomeMessage, handleFileSelect, selectedFile, renderDocumentPreview, getFileIcon }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [fileTree, setFileTree] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const loadFileTree = useCallback(async (path = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/files/tree?path=${encodeURIComponent(path)}`);
      setFileTree(response.data.items);
      setCurrentPath(response.data.current_path);
    } catch (error) {
      console.error('Błąd podczas ładowania drzewa plików:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchFiles = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await axios.get(`${API}/search?q=${encodeURIComponent(query)}&limit=50`);
      setSearchResults(response.data.results);
    } catch (error) {
      console.error('Błąd podczas wyszukiwania plików:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchFiles(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchFiles]);

  const indexPDFs = async () => {
    setIsIndexing(true);
    try {
      await axios.post(`${API}/files/index`);
      alert('Indeksowanie dokumentów zakończone! Wyszukiwanie w treści jest teraz dostępne.');
    } catch (error) {
      console.error('Błąd podczas indeksowania dokumentów:', error);
      alert('Błąd podczas indeksowania dokumentów. Sprawdź konsolę.');
    } finally {
      setIsIndexing(false);
    }
  };

  const handleFolderClick = (folderPath) => {
    if (expandedFolders.has(folderPath)) {
      setExpandedFolders(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderPath);
        return newSet;
      });
    } else {
      setExpandedFolders(prev => new Set([...prev, folderPath]));
      loadFileTree(folderPath);
    }
  };

  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  const renderFileTree = (items, level = 0) => {
    return items
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((item) => (
        <div key={item.id || item.path} className={`file-item level-${level}`}>
          <div
            className={`file-item-content ${item.type === 'folder' ? 'folder' : 'file'} ${
              selectedFile?.id === item.id ? 'selected' : ''
            }`}
            onClick={() => item.type === 'folder' ? handleFolderClick(item.path) : handleFileSelect(item)}
          >
            <span className="file-icon">
              {item.type === 'folder' ? 
                (expandedFolders.has(item.path) ? '📂' : '📁') : 
                getFileIcon(item.name)
              }
            </span>
            <span className="file-name">{item.name}</span>
            {item.type === 'file' && item.size && (
              <span className="file-size">
                {(item.size / 1024).toFixed(1)}KB
              </span>
            )}
          </div>
        </div>
      ));
  };

  const renderSearchResults = () => {
    if (!searchQuery) return null;

    return (
      <div className="search-results">
        <div className="search-header">
          <h3>Wyniki wyszukiwania ({searchResults.length})</h3>
          {isSearching && <div className="loading-spinner">🔍</div>}
        </div>
        {searchResults.length === 0 && !isSearching && searchQuery.length >= 2 && (
          <div className="no-results">Nie znaleziono plików pasujących do "{searchQuery}"</div>
        )}
        {searchResults.map((result) => (
          <div
            key={result.id}
            className={`search-result-item ${selectedFile?.path === result.file_path ? 'selected' : ''}`}
            onClick={() => {
              const fileObj = {
                id: result.id,
                name: result.file_name,
                path: result.file_path,
                type: 'file'
              };
              handleFileSelect(fileObj);
            }}
          >
            <div className="result-filename">{getFileIcon(result.file_name)} {result.file_name}</div>
            <div className="result-path">{result.file_path}</div>
            {result.content_match && (
              <div className="result-snippet">
                {result.content_match}
              </div>
            )}
            <div className="result-type">
              Dopasowanie: {result.match_type === 'both' ? 'Nazwa pliku i treść' :
                     result.match_type === 'filename' ? 'Nazwa pliku' : 'Treść'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              {siteTitle}
            </Link>
          </h1>
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Szukaj plików po nazwie lub treści..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                  title="Wyczyść wyszukiwanie"
                >
                  ✕
                </button>
              )}
              {isSearching && <div className="search-loading">🔍</div>}
            </div>
          </div>
          <button 
            className="index-button"
            onClick={indexPDFs}
            disabled={isIndexing}
          >
            {isIndexing ? '⏳ Indeksowanie...' : '🔄 Indeksuj Dokumenty'}
          </button>
        </div>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <div className="file-browser">
            <div className="browser-header">
              <h3>📁 Przeglądarka Plików</h3>
              {currentPath && (
                <div className="current-path">
                  📍 {currentPath || 'Główny katalog'}
                </div>
              )}
              {loading && <div className="loading-spinner">⏳</div>}
            </div>
            
            {currentPath && (
              <div className="navigation">
                <button 
                  className="nav-button"
                  onClick={() => {
                    const parentPath = currentPath.split('/').slice(0, -1).join('/');
                    loadFileTree(parentPath);
                  }}
                >
                  ⬆️ Wróć
                </button>
              </div>
            )}

            <div className="file-tree">
              {renderFileTree(fileTree)}
            </div>
          </div>
        </div>

        <div className="middle-panel">
          {selectedFile ? (
            <div className="pdf-preview">
              <div className="preview-header">
                <h3>{getFileIcon(selectedFile.name)} {selectedFile.name}</h3>
                <div className="preview-path">{selectedFile.path}</div>
              </div>
              {renderDocumentPreview(selectedFile)}
            </div>
          ) : (
            <div className="no-selection">
              <div className="no-selection-content">
                <h2>{siteTitle}</h2>
                <p>{welcomeMessage}</p>

                <RecentFiles onFileSelect={handleFileSelect} />

                <div className="instructions">
                  <h3>Jak używać:</h3>
                  <ul>
                    <li>🔍 Użyj paska wyszukiwania, aby znaleźć pliki po nazwie lub treści</li>
                    <li>📁 Klikaj na foldery po lewej stronie, aby je rozwinąć</li>
                    <li>📄 Klikaj na pliki, aby zobaczyć ich podgląd</li>
                    <li>🔄 Kliknij "Indeksuj Dokumenty", aby włączyć wyszukiwanie w treści</li>
                  </ul>
                  <div className="supported-formats">
                    <h4>Wspierane formaty:</h4>
                    <div className="format-list">
                      <span>📄 PDF</span>
                      <span>📊 Excel (xlsx, xls)</span>
                      <span>📝 Word (docx, doc)</span>
                      <span>📝 RTF</span>
                      <span>📃 Pliki tekstowe</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          {searchQuery ? renderSearchResults() : (
            <div className="search-placeholder">
              <div className="search-placeholder-content">
                <h3>🔍 Wyniki wyszukiwania</h3>
                <p>Zacznij pisać w pasku wyszukiwania, aby znaleźć dokumenty</p>
                <div className="search-tips">
                  <h4>Wskazówki:</h4>
                  <ul>
                    <li>Wyszukuj po nazwie pliku: "projekt", "finansowy"</li>
                    <li>Wyszukuj po treści: "uczenie maszynowe", "polityka"</li>
                    <li>Wymagane minimum 2 znaki</li>
                    <li>Wyniki pokazują dopasowania w nazwie i treści pliku</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const App = () => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [siteTitle, setSiteTitle] = useState('Ładowanie...');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await axios.get(`${API}/settings`);
            setSiteTitle(`📚 ${response.data.site_title}`);
            setWelcomeMessage(response.data.welcome_message);
        } catch (error) {
            console.error('Nie można pobrać ustawień:', error);
            setSiteTitle('📚 System Wyszukiwania Dokumentów');
            setWelcomeMessage('Wystąpił błąd podczas ładowania ustawień.');
        }
    };
    fetchSettings();
  }, [authToken]);

  const getFileType = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    return extension;
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    const iconMap = {
      'pdf': '📄', 'xlsx': '📊', 'xls': '📊', 'docx': '📝', 'doc': '📝', 'rtf': '📝', 'txt': '📃'
    };
    return iconMap[extension] || '📄';
  };

  const isSupportedFile = (fileName) => {
    const extension = fileName.toLowerCase().split('.').pop();
    return ['pdf', 'xlsx', 'xls', 'docx', 'doc', 'rtf', 'txt'].includes(extension);
  };

  const handleFileSelect = (file) => {
    if (file.type === 'file' && isSupportedFile(file.name)) {
      setSelectedFile(file);
    }
  };

  const renderDocumentPreview = (file) => {
    const fileType = getFileType(file.name);

    if (fileType === 'pdf') {
      return (
        <div className="pdf-viewer">
          <iframe
            src={`${API}/files/serve/${encodeURIComponent(file.path)}#toolbar=1&navpanes=1&scrollbar=1`}
            title={file.name}
            width="100%"
            height="100%"
            frameBorder="0"
          />
          <div className="pdf-fallback">
            <p>Nie można wyświetlić pliku PDF?
              <a href={`${API}/files/serve/${encodeURIComponent(file.path)}`} target="_blank" rel="noopener noreferrer" className="pdf-link">
                Otwórz PDF w nowej karcie
              </a>
            </p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="document-viewer">
          <div className="document-info">
            <h4>Podgląd dokumentu</h4>
            <p>Typ pliku: {fileType.toUpperCase()}</p>
            <p>Ten typ dokumentu nie może być wyświetlany w podglądzie.</p>
          </div>
          <div className="document-actions">
            <a href={`${API}/files/serve/${encodeURIComponent(file.path)}`} download={file.name} className="download-button">
              📥 Pobierz plik
            </a>
            <a href={`${API}/files/serve/${encodeURIComponent(file.path)}`} target="_blank" rel="noopener noreferrer" className="view-button">
              👁️ Otwórz w przeglądarce
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <Router>
        <Routes>
            <Route
                path="/"
                element={
                    <MainLayout
                        siteTitle={siteTitle}
                        welcomeMessage={welcomeMessage}
                        handleFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                        renderDocumentPreview={renderDocumentPreview}
                        getFileIcon={getFileIcon}
                    />
                }
            />
            <Route path="/login" element={<AdminLogin setAuthToken={setAuthToken} />} />
            <Route
                path="/admin"
                element={
                    authToken ? (
                        <AdminPanel authToken={authToken} setAuthToken={setAuthToken} />
                    ) : (
                        <Navigate to="/login" />
                    )
                }
            />
        </Routes>
    </Router>
  );
};

export default App;