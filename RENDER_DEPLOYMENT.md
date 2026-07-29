# Render.com Deployment Guide for Poker Studio

Diese Poker WebApp ist voll optimiert für das **kostenlose Hosting auf Render.com** als einziger Node.js Web Service.

## 🚀 Schritt-für-Schritt Anleitung

### 1. Repository auf GitHub pushen
Lade den gesamten Projektordner in ein Git-Repository (GitHub oder GitLab) hoch.

### 2. Render.com Account & neuen Web Service erstellen
1. Registriere oder melde dich bei [Render.com](https://render.com) an.
2. Klicke auf **New +** -> **Web Service**.
3. Verbinde dein GitHub-Repository mit Render.

### 3. Konfiguration auf Render
Gib beim Erstellen des Web Services folgende Parameter ein:

- **Name**: `poker-studio` (oder ein beliebiger Name)
- **Region**: Frankfurt (EU) oder die nächstgelegene Region
- **Branch**: `main` (oder dein Haupt-Branch)
- **Root Directory**: *(Leer lassen)*
- **Environment / Runtime**: `Node`
- **Build Command**:
  ```bash
  npm run build
  ```
  *(Hinweis: Dieser Befehl wechselt ins `client/`-Verzeichnis, installiert die Vite-Abhängigkeiten und generiert den Produktions-Build im Ordner `client/dist`).*

- **Start Command**:
  ```bash
  npm start
  ```
  *(Hinweis: Dieser Befehl startet den Express/Socket.io Server `server/index.js`, welcher automatisch das gebündelte React-Frontend ausliefert).*

- **Instance Type**: `Free`

### 4. Deployen
Klicke auf **Create Web Service**. Render installiert automatisch alle Abhängigkeiten, baut das React-Frontend und startet den Socket.io-Server.

Sobald der Deployment-Prozess abgeschlossen ist, erhältst du deine Live-URL (z. B. `https://poker-studio.onrender.com`), unter der du und deine Freunde sofort Pokern können!

---
> [!NOTE]
> Auf dem kostenlosen Render-Tier schläft der Server nach 15 Minuten Inaktivität ein. Beim ersten Aufrufen nach dem Schlafmodus dauert das Aufwachen ca. 30 Sekunden. Sobald der Server wach ist, läuft das Spiel in Echtzeit ohne Verzögerung.
