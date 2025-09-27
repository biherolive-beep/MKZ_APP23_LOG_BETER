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