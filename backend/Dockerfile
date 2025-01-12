# Użyj oficjalnego obrazu Pythona
FROM python:3.11-slim

# Ustaw katalog roboczy w kontenerze
WORKDIR /app

# Skopiuj plik requirements.txt do kontenera
COPY requirements.txt .

# Zainstaluj zależności Pythona
RUN pip install --no-cache-dir -r requirements.txt

# Skopiuj pozostałe pliki projektu do katalogu roboczego
COPY . .

# Ustawienie zmiennej środowiskowej PYTHONPATH
ENV PYTHONPATH=/app

# Ustawienie komendy startowej kontenera
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
