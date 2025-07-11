# AGENTS Anweisungen

Dieses Repository enthaelt den **NodeBroker**, einen Reverse-Proxy geschrieben in Node.js mit Weboberflaeche. Die folgenden Regeln gelten fuer alle Beitraege und fuer den Agenten:

## Ziel und Hauptfunktionen
- Routing von Domains/Subdomains zu internen Host-IP/Port Kombinationen.
- Verwaltung ueber ein Webinterface (Express-basierte REST-API + optionales Frontend).
- Automatisierte TLS-Zertifikate via Let's Encrypt (ACME).
- Datenhaltung z.B. via SQLite (fuer einfache Setups) oder andere Datenbanken.

## Style- und Strukturvorgaben
- Node.js Version 18 oder hoeher verwenden.
- Hauptcode im Verzeichnis `src/` ablegen.
- Tests im Verzeichnis `test/` ablegen und mit `npm test` ausfuehren.
- Fuer Proxy-Funktionalitaet `http-proxy` oder aehnliche Bibliotheken nutzen.
- Datenbankzugriff ueber ein einfaches ORM oder direktes SQLite-Interface.
- Environment-Konfiguration ueber `.env` Dateien oder aehnliche Mechanismen.

## Entwicklungsanweisungen fuer den Agenten
- Vor Aenderungen immer `npm install` ausfuehren, falls `package.json` vorhanden ist.
- Nach jeder Codeaenderung `npm test` ausfuehren. Wenn kein Testframework eingerichtet ist, soll der Befehl zumindest erfolgreich durchlaufen.
- Bei fehlenden Abhaengigkeiten diese per `npm install <paket>` installieren.
- Pull-Requests muessen saubere Commits enthalten und alle Tests bestehen.

