<role>
Du bist ein erfahrener Full-Stack-Developer für Echtzeit-Webanwendungen mit Schwerpunkt auf Node.js, React und Socket.io.
</role>

<context>
Der Nutzer möchte eine leichtgewichtige, moderne WebApp für ein Multiplayer-Pokerspiel (Texas Hold'em) entwickeln. 
Das Spiel ist für private Runden im Freundes- und Familienkreis gedacht (max. 6 Spieler pro Tisch). Der Fokus liegt auf einfacher Bedienung, lockerem UI, schnellem Einstieg ohne Registrierung und hoher Zuverlässigkeit beim Deployment auf Render.
</context>

<task>
Erstelle ein vollständiges technisches Konzept und die finale Code-Architektur für die Poker-WebApp.

Der Tech-Stack ist vorgegeben:
- **Backend:** Node.js mit Socket.io (Echtzeit-Kommunikation)
- **Frontend:** React (Vite)
- **Hosting:** Optimiert für das kostenlose Hosting auf Render.com

Modus & Spielregeln:
- **Reines Turnier-Format (Sit & Go):** Alle Spieler starten mit demselben Chip-Stack. Wer alle Chips verliert, scheidet aus (kein Nachkaufen/Rebuy). Das Spiel endet, wenn nur noch ein Spieler übrig ist (Gewinner).
- **Blind-Timer:** Automatische Erhöhung der Blinds nach festgelegten Zeitintervallen (z. B. alle 5 oder 10 Minuten).

Kern-Anforderungen:
1. **Lobby & Beitritt:** Räume erstellen/beitreten via Room-Code. Eingabe eines Spitznamens genügt (kein Login erforderlich). Max. 6 Spieler pro Raum.
2. **Poker-Engine:** Vollständige Texas Hold'em Logik (Blinds, Setzrunden, Chip-Handling, Hand-Bewertung, Side-Pots, Split-Pots, Spieler-Eliminierung).
3. **Echtzeit-Interaktion:**
   - Synchroner Spielablauf und Handkarten-Sichtbarkeit nur für den jeweiligen Spieler.
   - Text-Chat am Tisch.
   - Schnelle Emoji-Reaktionen für eine lockere Atmosphäre.
</task>

<constraints>
- Halte die Codebase übersichtlich und modular.
- Verwende ausschließlich Spielgeld/Chips (keine Zahlungsdienstleister).
- Optimiere den Server so, dass der Spielzustand (State) im Arbeitsspeicher gehalten wird (In-Memory), um ohne Datenbank für Render auszukommen.
</constraints>

<output_format>
1. **Projekt-Struktur**: Übersicht der Ordner- und Dateistruktur für Frontend und Backend.
2. **Backend Code (Node.js + Socket.io)**:
   - Server-Setup & Socket-Events.
   - In-Memory State Management (`rooms`, `game_state` inklusive Blind-Timer und Eliminierungs-Status).
   - Poker-Game-Logic (Rundenablauf, Hand-Evaluation, Pot-Verteilung, Player-Elimination).
3. **Frontend Code (React)**:
   - Socket-Verbindung & State-Hooks.
   - Poker-Tisch UI (Community Cards, Spieler-Positionen, Chip-Einsätze, Handkarten, Anzeige der aktuellen/nächsten Blinds, Chat/Emojis).
4. **Render Deployment Guide**: Kurze Anleitung zur Konfiguration im Render-Dashboard.
</output_format>

<edge_cases>
Implementiere oder berücksichtige explizit folgende Szenarien:
- **Player Elimination:** Ein Spieler verliert alle Chips, wird als ausgeschieden markiert und in den Zuschauer-Modus (Spectator) versetzt.
- **Disconnection/Reconnect:** Ein Spieler verliert kurz die Verbindung und kehrt mit demselben Namen/Session in denselben Raum zurück.
- **Side-Pots bei All-In:** Korrekte Berechnung der Pots, wenn ein Spieler mit weniger Chips All-In geht als die anderen.
- **Split-Pot:** Gleichmäßige Verteilung des Pots bei identischer Handstärke am Showdown.
</edge_cases>