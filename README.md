# System Wyszukiwania Dokumentów

Jest to zaawansowana aplikacja typu full-stack, która umożliwia indeksowanie i przeszukiwanie treści dokumentów (PDF, Word, Excel, RTF, TXT). Aplikacja została wyposażona w interfejs w języku polskim oraz panel administratora do zarządzania treścią.

## Funkcjonalności

- **Przeglądanie plików i folderów:** Intuicyjny interfejs do nawigacji po strukturze dokumentów.
- **Wyszukiwanie pełnotekstowe:** Wyszukiwanie fraz zarówno w nazwach plików, jak i w ich treści.
- **Podgląd dokumentów:** Możliwość podglądu plików PDF bezpośrednio w przeglądarce oraz opcje pobierania i otwierania innych typów plików.
- **Panel Administratora:**
  - Bezpieczne logowanie (JWT).
  - Możliwość dynamicznej zmiany tytułu strony i wiadomości powitalnej.
- **Sekcja "Ostatnio dodane":** Wyświetlanie listy najnowszych zindeksowanych dokumentów na stronie głównej.
- **Interfejs w języku polskim:** Cała aplikacja jest dostępna w języku polskim.

## Wymagania wstępne

Przed rozpoczęciem upewnij się, że masz zainstalowane następujące narzędzia:
- **Node.js** (wersja 14.x lub nowsza)
- **Python** (wersja 3.8 lub nowsza)
- **MongoDB** (lokalnie lub na zdalnym serwerze)
- `pip` (menedżer pakietów dla Pythona)
- `npm` lub `yarn` (menedżer pakietów dla Node.js)

## Instalacja i Konfiguracja

### 1. Klonowanie Repozytorium

```bash
git clone <adres-repozytorium>
cd <nazwa-katalogu>
```

### 2. Konfiguracja Backendu

Backend jest oparty na frameworku FastAPI.

**a) Utwórz i aktywuj wirtualne środowisko (opcjonalne, ale zalecane):**

```bash
python3 -m venv venv
source venv/bin/activate  # Na systemach Linux/macOS
# venv\Scripts\activate    # Na systemie Windows
```

**b) Zainstaluj zależności Pythona:**

```bash
pip install -r backend/requirements.txt
```

**c) Utwórz plik konfiguracyjny `.env`:**

W katalogu `backend/` utwórz plik o nazwie `.env` i uzupełnij go następującymi zmiennymi:

```env
# Adres URL do Twojej bazy danych MongoDB
MONGO_URL="mongodb://localhost:27017/"

# Nazwa bazy danych, która zostanie utworzona
DB_NAME="document_search_db"

# Dane logowania dla administratora
ADMIN_USERNAME="admin"

# Hasło dla administratora (poniżej instrukcja generowania hasha)
ADMIN_PASSWORD_HASH="<tutaj_wklej_hash_hasla>"

# Sekretny klucz do generowania tokenów JWT (zmień na własny, unikalny ciąg znaków)
SECRET_KEY="bardzo_tajny_klucz_do_zmiany"

# Dozwolone źródła CORS (jeśli frontend jest na innym adresie)
CORS_ORIGINS="http://localhost:3000"
```

**d) Wygeneruj hash hasła administratora:**

Aby bezpiecznie przechowywać hasło, musimy je zahashować. Użyj poniższego skryptu Pythona. Uruchom go w terminalu (z aktywnym środowiskiem wirtualnym), a następnie wklej wynik do pliku `.env`.

```bash
python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('twoje_bezpieczne_haslo'))"
```
*Zastąp `twoje_bezpieczne_haslo` swoim hasłem.*

### 3. Konfiguracja Frontendu

Frontend jest oparty na React.

**a) Zainstaluj zależności Node.js:**

Przejdź do katalogu `frontend/` i uruchom:

```bash
npm install
# LUB
# yarn install
```

**b) Utwórz plik konfiguracyjny `.env`:**

W katalogu `frontend/` utwórz plik o nazwie `.env` i dodaj do niego poniższą zmienną, wskazującą na adres Twojego backendu:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Uruchamianie Aplikacji

### 1. Uruchom Backend

Otwórz terminal, przejdź do katalogu `backend/` i uruchom serwer FastAPI za pomocą `uvicorn`:

```bash
uvicorn server:app --reload
```

Serwer backendu będzie działał pod adresem `http://localhost:8000`.

### 2. Uruchom Frontend

Otwórz drugi terminal, przejdź do katalogu `frontend/` i uruchom serwer deweloperski React:

```bash
npm start
# LUB
# yarn start
```

Aplikacja frontendowa będzie dostępna pod adresem `http://localhost:3000`.

## Panel Administratora

### Dostęp

Panel administratora jest dostępny pod adresem `http://localhost:3000/login`.

### Logowanie

Użyj nazwy użytkownika i hasła, które skonfigurowałeś w pliku `.env` w backendzie (`ADMIN_USERNAME` i hasło, dla którego wygenerowałeś hash).

### Zarządzanie

Po zalogowaniu zostaniesz przekierowany do panelu (`/admin`), gdzie możesz:
- Zmienić **tytuł strony**.
- Zmienić **wiadomość powitalną** wyświetlaną na stronie głównej.
- Wylogować się.

Zmiany są zapisywane i od razu widoczne na stronie głównej.

---

## Wdrożenie na serwerze Debian z Apache (Produkcja)

Poniższa instrukcja przeprowadzi Cię przez proces wdrożenia aplikacji w środowisku produkcyjnym na serwerze Debian. Użyjemy `systemd` do zarządzania procesem backendu oraz Apache jako reverse proxy do serwowania aplikacji.

### 1. Wymagania na serwerze

Upewnij się, że na serwerze są zainstalowane następujące pakiety:

```bash
sudo apt update
sudo apt install apache2 python3-venv python3-pip nodejs npm
```

Włącz niezbędne moduły Apache:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### 2. Przygotowanie Aplikacji

**a) Sklonuj repozytorium i zainstaluj zależności:**

Postępuj zgodnie z krokami z sekcji **Instalacja i Konfiguracja**, aby sklonować repozytorium i zainstalować wszystkie zależności dla backendu i frontendu.

**b) Zbuduj frontend do wersji produkcyjnej:**

Przejdź do katalogu `frontend/` i uruchom:

```bash
npm run build
```
To polecenie utworzy katalog `build/` z gotowymi do wdrożenia plikami statycznymi.

**c) Skonfiguruj pliki `.env` dla produkcji:**

- **`frontend/.env`**: Zmienna `REACT_APP_BACKEND_URL` powinna być pusta, aby zapytania do API były wysyłane na ten sam host, z którego serwowany jest frontend.
  ```env
  REACT_APP_BACKEND_URL=
  ```

- **`backend/.env`**: Ustaw `CORS_ORIGINS` na domenę, pod którą będzie dostępna aplikacja (np. `http://twoja-domena.com`).

### 3. Skonfiguruj i uruchom Backend jako usługę `systemd`

Utworzenie usługi systemowej zapewni, że backend będzie działał w tle i automatycznie uruchamiał się po restarcie serwera.

**a) Utwórz plik usługi:**

```bash
sudo nano /etc/systemd/system/document-search-backend.service
```

**b) Wklej poniższą konfigurację:**

Zastąp `<uzytkownik>`, `<grupa>` oraz ścieżki do Twojego projektu.

```ini
[Unit]
Description=Document Search Backend Service
After=network.target

[Service]
User=<uzytkownik>
Group=<grupa>
WorkingDirectory=/sciezka/do/twojego/projektu/backend
ExecStart=/sciezka/do/twojego/projektu/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
Restart=always
EnvironmentFile=/sciezka/do/twojego/projektu/backend/.env

[Install]
WantedBy=multi-user.target
```

**c) Uruchom i włącz usługę:**

```bash
sudo systemctl daemon-reload
sudo systemctl start document-search-backend
sudo systemctl enable document-search-backend
```

Aby sprawdzić status usługi, użyj: `sudo systemctl status document-search-backend`.

### 4. Skonfiguruj Apache jako Reverse Proxy

**a) Utwórz plik konfiguracyjny dla nowej strony w Apache:**

```bash
sudo nano /etc/apache2/sites-available/document-search.conf
```

**b) Wklej poniższą konfigurację:**

Zastąp `twoja-domena.com` oraz ścieżki do Twojego projektu.

```apache
<VirtualHost *:80>
    ServerName twoja-domena.com

    # Ścieżka do zbudowanego frontendu
    DocumentRoot /sciezka/do/twojego/projektu/frontend/build

    # Konfiguracja proxy dla API backendu
    ProxyPreserveHost On
    ProxyPass /api/ http://127.0.0.1:8000/api/
    ProxyPassReverse /api/ http://127.0.0.1:8000/api/

    # Umożliwia React Routerowi obsługę routingu po stronie klienta
    <Directory /sciezka/do/twojego/projektu/frontend/build>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    RewriteEngine On
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_FILENAME} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    RewriteRule ^ /index.html [L]

    ErrorLog ${APACHE_LOG_DIR}/document-search-error.log
    CustomLog ${APACHE_LOG_DIR}/document-search-access.log combined
</VirtualHost>
```

**c) Włącz nową konfigurację i zrestartuj Apache:**

```bash
sudo a2ensite document-search.conf
sudo a2dissite 000-default.conf  # Wyłączenie domyślnej strony
sudo systemctl restart apache2
```

Twoja aplikacja powinna być teraz dostępna pod adresem `http://twoja-domena.com`.