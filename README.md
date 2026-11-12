# CPRE Foundation Level – Prüfungstrainer 4.2

Offline-Lernwerkzeug für die IREB-Prüfung CPRE Foundation Level.
Grundlage: Lehrplan 3.3.0 (1. April 2026), Handbuch 1.3.3 (23. Juli 2026), Glossar 2.2.0 (Oktober 2025) und Prüfungsordnung 5.6.2.
**Start:** ZIP entpacken und `index.html` im Browser öffnen. Es braucht keine Installation und kein Internet. Der Lernstand wird lokal im Browser gespeichert.

## Modi
- **Prüfungssimulation:** 45 Fragen, 75 Minuten (90 Minuten mit Zeitverlängerung für Nicht-Muttersprachler). Die Verteilung entspricht genau der offiziellen Musterprüfung:
  LE 1–7 = 3 · 4 · 18 · 10 · 2 · 6 · 2 Fragen; 18 A-, 12 P- und 15 K-Fragen. Lösungen gibt es erst nach der Abgabe. Fragen, die du noch nicht gesehen hast, werden bevorzugt. Antwortoptionen und Aussagen werden gemischt.
- **Offizielle Übungsprüfung:** die 45 Originalfragen aus Set_Public_DE_3.3.3 mit offiziellem Lösungsschlüssel, in Originalreihenfolge und ungemischt.
- **Kurztest:** 20 Fragen in 30 Minuten, verteilt wie die Musterprüfung im Kleinen.
- **Lernmodus / Fehlertraining:** sofortiges Feedback mit Begründung und Quellenangabe.

Oben rechts schaltest du zwischen hellem und dunklem Modus um. Ohne eigene Wahl folgt die Seite der Systemeinstellung. Diagramme bleiben auch im dunklen Modus auf weißem Grund.

## Bewertung (PO 5.6.2)
- **A:** volle Punkte oder 0.
- **P:** Punkte geteilt durch die geforderte Anzahl, je richtig gewählter Antwort. Wer mehr Antworten ankreuzt als gefordert, bekommt 0 Punkte.
- **K:** Punkte geteilt durch die Anzahl Aussagen, je richtig bewerteter Aussage. Eine unbeantwortete Aussage zählt 0.
- **Bestanden** ab 70 %.

## Inhalt und Prüfung der Fragen
- 265 eigene Fragen: 152 A, 50 P, 63 K. Alle 70 Lernziele sind abgedeckt.
  Je LE: 16 / 21 / 95 / 64 / 19 / 36 / 14.
- Jede Frage hat eine Quellenangabe (LP = Lehrplan, HB = Handbuch) und eine Erklärung, warum die richtigen Antworten richtig und die Distraktoren falsch sind.
- Die Lösungen wurden gegen den Text von Lehrplan und Handbuch geprüft. Fragen zum Interaktionsmodell gibt es nicht mehr, weil es in 3.3.0 gestrichen wurde. Weitere Modelltypen (Handbuch 3.4.6) werden nur auf Zweck-Ebene abgefragt.
- Automatische Prüfungen:
  - Datenvalidierung: Felder, Antwortindizes, „(n Antworten)“ passt zur Lösung, Labels, keine Duplikate.
  - Längen-Bias: Die richtige A-Antwort ist nur in 37 % der Fälle die längste Option, bei Zufall wären es etwa 25 %.
  - Browser-Test: Bewertungslogik, Verteilung bei 40 generierten Simulationen, Diagrammdarstellung.
  - Mit dem offiziellen Schlüssel ergibt die offizielle Übungsprüfung genau 100 %.
- Diagrammfragen (Klassen-, Aktivitäts-, Zustands- und Use-Case-Diagramm) sind als SVG enthalten. In einer Simulation kommt pro Diagramm höchstens eine Frage vor.

## Abgleich mit Handbuch 1.3.3 und Glossar 2.2
- Lehrplan 3.3.0: Gegenüber 3.2 ist der Inhalt bis auf zwei Punkte gleich. Das Interaktionsmodell ist aus den Lernzielen gestrichen. Die Qualitätskriterien sind „empfohlen“ und keine abschließende Liste. Beides ist im Pool berücksichtigt.
- Neue Fragen zu Ergänzungen im Handbuch:
  - Dokumentenanalyse als artefaktbasierte Technik: Schritte und Triangulation (4-62, 4-63)
  - aktualisierte Übersicht der Ermittlungstechniken, Abb. 4.4 (4-64)
  - drei Schichten des Zwiebelmodells (4-65)
  - Systemkontext vorzugsweise als Modell (3-95)
- Begriffshinweise in den Erklärungen:
  - Das Handbuch schreibt jetzt „Rückmeldungsschleifen“, der Lehrplan weiterhin „Rückkopplungsschleifen“.
  - Die Werkzeugkategorie heißt im Handbuch „Management des RE-Prozesses“, im Lehrplan „Steuerung des RE-Prozesses“. In der Prüfung zählt der Lehrplan.
  - Fehlende Identifizierung macht Requirements Management laut Handbuch jetzt „sehr schwierig“, früher hieß es „unmöglich“.
- Glossar 2.2 trennt Auftraggeber (bestellt das System) und Kunde (erhält das System). Eine Persona steht jetzt für Menschen, die das System nutzen oder davon profitieren. Keine Lösung im Pool ändert sich dadurch.

## Änderungsverlauf
- **4.2 (12.11.2026):** Befunde aus einem externen Einzelreview der 310 Fragen eingearbeitet.
  - 3-31 fragt jetzt nach fachlich geeigneten, nutzerzentrierten User Storys.
  - 3-43 nennt im Kontextdiagramm einen echten Informationsfluss.
  - 4-47 legt die Bewertungsrichtung der Entscheidungsmatrix fest.
  - Die Erklärung zur offiziellen Frage A0922 kennzeichnet ihre Mehrdeutigkeit, der Schlüssel B bleibt.
  - Lernziele der IREB-Fragen folgen den offiziellen EO-Angaben, außer wo der Lehrplan 3.3.0 das Lernziel verschoben hat (P0113: 1.3.2 → 1.1.2) oder es nicht mehr gibt (A0922: 7.1.2 → 7.1.1).
  - Neu ist außerdem der Schalter für den hellen und dunklen Modus.
- **4.1 (11.11.2026):** Abgleich mit Handbuch 1.3.3 und Glossar 2.2, fünf neue Fragen.
- **4.0 (11.11.2026):** Neuaufbau für Lehrplan 3.3.0 mit 260 Fragen und Prüfungssimulation nach PO 5.6.2.

## Grenzen
- Die eigenen Fragen sind **keine** echten Prüfungsfragen. Sie sind nach Stil und Schwierigkeit der Musterprüfung gebaut.
- Der Fragenpool der alten Version 3.2 wurde bewusst nicht übernommen. Er basiert auf älteren Lehrplanständen und hatte deutliche Antwortmuster (richtige Antwort meist die längste).
- Maßgeblich sind immer die aktuellen Dokumente auf ireb.org.

© der offiziellen Übungsprüfung: IREB e.V. Sie wird gemäß deren Nutzungsbedingungen unverändert verwendet. Die Erklärungstexte zur Übungsprüfung sind eigene Ergänzungen.
