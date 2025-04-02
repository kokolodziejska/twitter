# Buzzly – Twitter-like App

Buzzly to aplikacja inspirowana Twitterem, składająca się z czterech głównych komponentów:

- **PostgreSQL** – baza danych  
- **FastAPI** – backend aplikacji  
- **React** – frontend użytkownika  
- **NGINX** – reverse proxy i obsługa HTTPS  

### Instalacja i uruchomienie

W terminalu przejdź do głównego katalogu projektu i wykonaj poniższe polecenia:

- `docker-compose build`  
- `docker-compose up`  

### Dostęp do aplikacji

[https://localhost](https://localhost) – przez NGINX  

Przeglądarka wyświetli ostrzeżenie "Połączenie nie jest prywatne" – możesz je pominąć klikając „Zaawansowane” → „Otwórz stronę localhost (niebezpieczną)”.

### Zatrzymanie aplikacji

- `docker-compose down`
