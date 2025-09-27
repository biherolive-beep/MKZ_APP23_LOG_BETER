#!/bin/bash

# --- Kolory dla czytelności ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> Rozpoczynam instalację i konfigurację Systemu Wyszukiwania Dokumentów <<<${NC}"

# === Krok 1: Sprawdzanie zależności ===
echo -e "\n${YELLOW}--- Krok 1: Sprawdzanie zależności... ---${NC}"
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

for cmd in docker docker-compose python3 node npm; do
    if ! command_exists $cmd; then
        echo -e "${RED}BŁĄD: Wymagane narzędzie '$cmd' nie jest zainstalowane. Przerwij i zainstaluj, a następnie uruchom skrypt ponownie.${NC}"
        exit 1
    fi
done
echo -e "${GREEN}Wszystkie wymagane narzędzia są zainstalowane.${NC}"

# === Krok 2: Uruchomienie Elasticsearch ===
echo -e "\n${YELLOW}--- Krok 2: Konfiguracja i uruchomienie Elasticsearch... ---${NC}"
if [ ! -f docker-compose.yml ]; then
    echo "Tworzę plik docker-compose.yml..."
    cat > docker-compose.yml << EOL
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: elasticsearch
    environment:
      - "discovery.type=single-node"
      - "xpack.security.enabled=false"
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - esdata:/usr/share/elasticsearch/data

volumes:
  esdata:
EOL
fi

echo "Uruchamiam kontener Elasticsearch w tle (może to potrwać chwilę)..."
docker-compose up -d
echo -e "${GREEN}Kontener Elasticsearch został uruchomiony. Oczekiwanie na gotowość (ok. 30s)...${NC}"
sleep 30

# Sprawdzenie, czy Elasticsearch odpowiada
if ! curl -s "http://localhost:9200" > /dev/null; then
    echo -e "${RED}BŁĄD: Nie można połączyć się z Elasticsearch. Sprawdź logi kontenera za pomocą 'docker-compose logs'.${NC}"
    exit 1
fi
echo -e "${GREEN}Elasticsearch jest gotowy do pracy.${NC}"


# === Krok 3: Konfiguracja Backendu ===
echo -e "\n${YELLOW}--- Krok 3: Konfiguracja Backendu... ---${NC}"
cd backend || { echo -e "${RED}BŁĄD: Nie znaleziono katalogu 'backend'.${NC}"; exit 1; }

# Instalacja zależności
echo "Instaluję zależności Pythona..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Tworzenie pliku .env
if [ -f .env ]; then
    echo "Plik .env już istnieje. Pomijam tworzenie."
else
    echo "Tworzę plik konfiguracyjny .env dla backendu..."

    read -p "Podaj nazwę użytkownika administratora [admin]: " ADMIN_USERNAME
    ADMIN_USERNAME=${ADMIN_USERNAME:-admin}

    read -sp "Podaj hasło dla administratora: " ADMIN_PASSWORD
    echo

    echo "Generuję hash hasła..."
    ADMIN_PASSWORD_HASH=$(python -c "from passlib.context import CryptContext; pwd_context = CryptContext(schemes=['bcrypt']); print(pwd_context.hash('$ADMIN_PASSWORD'))")

    SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(32))')

    cat > .env << EOL
# Konfiguracja bazy danych
MONGO_URL="mongodb://localhost:27017/"
DB_NAME="document_search_db"

# Konfiguracja Elasticsearch
ELASTICSEARCH_URL="http://localhost:9200"

# Dane administratora
ADMIN_USERNAME=${ADMIN_USERNAME}
ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}

# Klucz JWT
SECRET_KEY=${SECRET_KEY}

# Konfiguracja CORS
CORS_ORIGINS="http://localhost:3000"
EOL
    echo -e "${GREEN}Plik .env dla backendu został pomyślnie utworzony.${NC}"
fi
cd ..

# === Krok 4: Konfiguracja Frontendu ===
echo -e "\n${YELLOW}--- Krok 4: Konfiguracja Frontendu... ---${NC}"
cd frontend || { echo -e "${RED}BŁĄD: Nie znaleziono katalogu 'frontend'.${NC}"; exit 1; }

echo "Instaluję zależności Node.js (może to potrwać chwilę)..."
npm install

if [ -f .env ]; then
    echo "Plik .env już istnieje. Pomijam tworzenie."
else
    echo "Tworzę plik .env dla frontendu..."
    cat > .env << EOL
REACT_APP_BACKEND_URL=http://localhost:8000
EOL
    echo -e "${GREEN}Plik .env dla frontendu został pomyślnie utworzony.${NC}"
fi
cd ..

# === Zakończenie ===
echo -e "\n\n${GREEN}>>> INSTALACJA ZAKOŃCZONA SUKCESEM! <<<${NC}"
echo -e "\n${YELLOW}Aby uruchomić aplikację, wykonaj następujące kroki:${NC}"
echo "1. W pierwszym terminalu uruchom serwer backendu:"
echo -e "   ${GREEN}cd backend && source venv/bin/activate && uvicorn server:app --reload${NC}"
echo ""
echo "2. W drugim terminalu uruchom serwer frontendu:"
echo -e "   ${GREEN}cd frontend && npm start${NC}"
echo ""
echo "Aplikacja będzie dostępna pod adresem http://localhost:3000"
echo "Panel administratora: http://localhost:3000/login"
echo ""
exit 0