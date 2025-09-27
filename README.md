# Zaawansowany System Wyszukiwania Dokumentów z Elasticsearch

Jest to rozbudowana aplikacja typu full-stack, która umożliwia indeksowanie i przeszukiwanie treści dokumentów (PDF, Word, Excel, RTF, TXT) z wykorzystaniem potęgi silnika wyszukiwania **Elasticsearch**. Aplikacja została wyposażona w interfejs w języku polskim oraz panel administratora do zarządzania treścią.

## Funkcjonalności

- **Wyszukiwanie Pełnotekstowe (Elasticsearch):** Błyskawiczne i trafne wyszukiwanie fraz w nazwach plików i treści, z podświetlaniem wyników.
- **Przeglądanie Plików i Folderów:** Intuicyjny interfejs do nawigacji po strukturze dokumentów.
- **Podgląd Dokumentów:** Możliwość podglądu plików PDF bezpośrednio w przeglądarce.
- **Panel Administratora:**
  - Bezpieczne logowanie (JWT).
  - Możliwość dynamicznej zmiany tytułu strony i wiadomości powitalnej.
- **Sekcja "Ostatnio dodane":** Lista najnowszych dokumentów na stronie głównej (dane z MongoDB).
- **Interfejs w języku polskim.**

## Architektura

- **Backend:** FastAPI (Python) - obsługuje API, logikę biznesową i komunikację z bazami danych.
- **Frontend:** React (JavaScript) - interfejs użytkownika.
- **Główna Baza Danych (Ustawienia i "Ostatnie pliki"):** MongoDB.
- **Silnik Wyszukiwania:** Elasticsearch.

## Wymagania wstępne

- **Docker** i **Docker Compose** - do uruchomienia Elasticsearch.
- **Node.js** (wersja 14.x lub nowsza).
- **Python** (wersja 3.8 lub nowsza).
- `pip` i `npm` (lub `yarn`).

---

## Instalacja i Konfiguracja

### 1. Uruchomienie Elasticsearch

Najprostszym sposobem na uruchomienie Elasticsearch jest użycie Dockera.

**a) Utwórz plik `docker-compose.yml` w głównym katalogu projektu:**

```yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - "discovery.type=single-node"
      - "xpack.security.enabled=false" # Uproszczona konfiguracja bez zabezpieczeń
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - esdata:/usr/share/elasticsearch/data

volumes:
  esdata:
```

**b) Uruchom kontener:**

W głównym katalogu projektu wykonaj polecenie:
```bash
docker-compose up -d
```
Elasticsearch będzie teraz działał pod adresem `http://localhost:9200`.

### 2. Konfiguracja Backendu

**a) Zainstaluj zależności Pythona:**

```bash
# Utwórz i aktywuj wirtualne środowisko (zalecane)
python3 -m venv venv
source venv/bin/activate

# Zainstaluj pakiety
pip install -r backend/requirements.txt
```

**b) Utwórz plik konfiguracyjny `backend/.env`:**

```env
# Adres URL do Twojej bazy danych MongoDB
MONGO_URL="mongodb://localhost:27017/"
DB_NAME="document_search_db"

# Adres URL do Elasticsearch
ELASTICSEARCH_URL="http://localhost:9200"

# Dane logowania dla administratora
ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="<tutaj_wklej_hash_hasla>" # Instrukcja generowania poniżej
SECRET_KEY="bardzo_tajny_klucz_do_zmiany"
CORS_ORIGINS="http://localhost:3000"
```

**c) Wygeneruj hash hasła administratora:**

Uruchom poniższy skrypt w terminalu (z aktywnym środowiskiem wirtualnym):
```bash
python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('twoje_bezpieczne_haslo'))"
```
*Zastąp `twoje_bezpieczne_haslo` swoim hasłem i wklej wynik do pliku `.env`.*

### 3. Konfiguracja Frontendu

**a) Zainstaluj zależności Node.js:**

```bash
cd frontend
npm install
cd ..
```

**b) Utwórz plik `frontend/.env`:**

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## Uruchamianie Aplikacji

1.  **Upewnij się, że Elasticsearch działa** (krok 1).
2.  **Uruchom Backend:**
    ```bash
    cd backend
    uvicorn server:app --reload
    ```
3.  **Uruchom Frontend** (w nowym terminalu):
    ```bash
    cd frontend
    npm start
    ```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`.

---

## Panel Administratora

- **Dostęp:** `http://localhost:3000/login`
- **Dane logowania:** Użyj danych skonfigurowanych w `backend/.env`.
- **Funkcje:** Zmiana tytułu strony i wiadomości powitalnej.

---

## Wdrożenie na serwerze Debian z Apache

*Ta sekcja pozostaje taka sama jak poprzednio, z uwzględnieniem konieczności uruchomienia Elasticsearch (najlepiej jako kontener Docker) na serwerze produkcyjnym.*