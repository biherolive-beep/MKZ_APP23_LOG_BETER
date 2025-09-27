import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminPanel = ({ authToken, setAuthToken }) => {
    const [siteTitle, setSiteTitle] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await axios.get(`${API}/settings`);
                setSiteTitle(response.data.site_title);
                setWelcomeMessage(response.data.welcome_message);
            } catch (error) {
                console.error('Nie można pobrać ustawień:', error);
                setMessage('Błąd: Nie można pobrać aktualnych ustawień.');
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            await axios.put(`${API}/admin/settings`, {
                site_title: siteTitle,
                welcome_message: welcomeMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            setMessage('Ustawienia zostały pomyślnie zaktualizowane!');
        } catch (error) {
            console.error('Błąd podczas zapisywania ustawień:', error);
            setMessage('Błąd: Nie udało się zapisać ustawień.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setAuthToken(null);
        navigate('/login');
    };

    return (
        <div className="admin-panel-container">
            <h2>Panel Administratora</h2>
            <form onSubmit={handleSave}>
                <div className="form-group">
                    <label htmlFor="siteTitle">Tytuł strony</label>
                    <input
                        type="text"
                        id="siteTitle"
                        value={siteTitle}
                        onChange={(e) => setSiteTitle(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="welcomeMessage">Wiadomość powitalna</label>
                    <textarea
                        id="welcomeMessage"
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        rows="4"
                    />
                </div>
                <button type="submit" className="save-button">Zapisz zmiany</button>
            </form>
            {message && <p className="status-message">{message}</p>}
            <button onClick={handleLogout} className="logout-button">Wyloguj</button>
        </div>
    );
};

export default AdminPanel;