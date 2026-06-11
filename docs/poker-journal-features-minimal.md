# Journal de poker — fonctionnalités minimales attendues

Document de référence pour définir le périmètre **minimal** d’un journal de poker standard (suivi manuel de sessions et bankroll), basé sur l’analyse des outils les plus connus du marché.

**Date :** juin 2025

---

## Sources analysées

### Apps de journal / bankroll (suivi manuel — référence principale)

| Outil | Type | Lien |
|-------|------|------|
| **Poker Income** | App mobile, entrée de gamme | [App Store](https://apps.apple.com/us/app/poker-income-ultimate/id317786797) |
| **Poker Bankroll Tracker (PBT)** | App mobile, très populaire | [Google Play](https://play.google.com/store/apps/details?id=com.filavision.brt) |
| **Poker Analytics 6** | App + desktop, analyse avancée | [poker-analytics.net](https://www.poker-analytics.net/us/features.html) |
| **BINK Poker Tracker** | App moderne, graphs avancés | [App Store](https://apps.apple.com/us/app/bink-poker-bankroll-tracker/id6445878829) |
| **Pokerbase** | App live + staking + social | [blog comparatif 2025](https://blog.pokerbase.app/best-poker-bankroll-tracker-2025/) |
| **StackEdge** | App iOS, bankroll pro | [stackedge.app](https://www.stackedge.app/) |
| **PokerPro Journal** | Journal web cross-device | [pokerpro.tools](https://pokerpro.tools/tools/journal) |

### Trackers online (hand histories — hors périmètre minimal mais référence métier)

| Outil | Usage typique |
|-------|----------------|
| **PokerTracker 4** | Import HH, HUD, reports SQL, replayer |
| **Hold'em Manager 3** | Import HH, HUD, live dashboard |
| **Hand2Note** | HUD performant, popups dynamiques |
| **DriveHUD** | Alternative mid-tier |

> Un journal minimal couvre le **logging manuel** (live et online sans import HH). Les trackers PT4/HM3 sont cités pour les métriques métier (bb/100, VPIP, etc.) que les apps mobiles imitent partiellement.

---

## Échelle de difficulté d’implémentation

Estimation pour une stack **Next.js + Supabase** (web responsive), développeur solo, UI existante.

| Niveau | Symbole | Effort indicatif | Description |
|--------|---------|------------------|-------------|
| Facile | ⭐ | 0,5–2 j | CRUD, calculs simples, un composant UI |
| Moyenne | ⭐⭐ | 2–5 j | Agrégations, filtres, graphiques basiques |
| Difficile | ⭐⭐⭐ | 1–2 sem | Logique métier riche, sync temps réel, mobile natif |
| Très difficile | ⭐⭐⭐⭐ | 2+ sem | Domaine poker profond, intégrations externes, perf |

---

## 1. Fonctionnalités CORE (minimal absolu)

Sans ces éléments, le produit n’est pas reconnu comme un journal de poker.

| # | Fonctionnalité | Description | Présent dans | Difficulté | Notes implémentation |
|---|----------------|-------------|--------------|------------|----------------------|
| 1.1 | **Création de session** | Enregistrer une session terminée | Tous | ⭐ | Formulaire + validation Zod + insert Supabase |
| 1.2 | **Buy-in** | Montant investi à la table | Tous | ⭐ | Champ `DECIMAL`, validation ≥ 0 |
| 1.3 | **Cash-out** | Montant final encaissé | Tous | ⭐ | Idem |
| 1.4 | **Profit net (P&L)** | `cash_out - buy_in` (affiché auto) | Tous | ⭐ | Calcul côté client ou colonne générée DB |
| 1.5 | **Date de session** | Jour (et idéalement heure) de jeu | Tous | ⭐ | `date` + option `started_at` |
| 1.6 | **Durée / heures** | Temps de jeu en heures ou minutes | Tous | ⭐ | Champ numérique ou timer → durée |
| 1.7 | **Type de jeu** | Cash game vs tournoi (minimum) | Tous | ⭐ | Enum / literal type |
| 1.8 | **Liste des sessions** | Historique ordonné par date | Tous | ⭐ | Table + pagination |
| 1.9 | **Édition / suppression** | Corriger une session erronée | Tous | ⭐ | Update/delete avec RLS |
| 1.10 | **Bankroll actuel** | Solde total après sessions | Tous | ⭐ | `initial_bankroll + sum(P&L)` ou table dédiée |
| 1.11 | **Profit total** | Somme de tous les P&L | Tous | ⭐ | Agrégation SQL `SUM` |
| 1.12 | **Authentification** | Données privées par utilisateur | Pokerbase, PBT, StackEdge | ⭐⭐ | Supabase Auth + RLS (déjà en place) |

**Verdict :** ~12 features — socle indispensable. Un MVP fonctionnel = **1.1 à 1.11** + auth.

---

## 2. Fonctionnalités STANDARD (attendues sur un journal « sérieux »)

Présentes sur **≥ 70 %** des apps analysées. Sans elles, l’outil paraît incomplet face à Poker Income / PBT.

| # | Fonctionnalité | Description | Présent dans | Difficulté | Notes implémentation |
|---|----------------|-------------|--------------|------------|----------------------|
| 2.1 | **Stakes / blinds** | Ex. `1/2`, `2/5`, `NL50` | Tous | ⭐ | Champ texte ou preset par stake |
| 2.2 | **Lieu / venue** | Casino, club, site online | Tous | ⭐ | `location` + liste réutilisable |
| 2.3 | **Notes libres** | Commentaires post-session | Tous | ⭐ | Champ `TEXT` |
| 2.4 | **ROI session** | `(P&L / buy_in) × 100` | PBT, Poker Analytics, BKM | ⭐ | Calcul dérivé |
| 2.5 | **Taux horaire** | `P&L / heures` | Tous | ⭐ | Agrégation simple |
| 2.6 | **% sessions gagnantes** | Win rate session (pas mains) | Tous | ⭐ | `COUNT(win) / COUNT(*)` |
| 2.7 | **Graphique bankroll** | Courbe cumulative du solde | Tous | ⭐⭐ | Recharts / line chart sur historique |
| 2.8 | **Graphique profit par session** | Barres ou courbe des P&L | PBT, BINK, Poker Analytics | ⭐⭐ | Chart sur sessions |
| 2.9 | **Filtres basiques** | Par date, type, lieu, stake | PBT, Poker Analytics, BINK | ⭐⭐ | Query params + filtres Supabase |
| 2.10 | **Bankroll initial** | Point de départ configurable | Tous | ⭐ | Table `bankroll_stats` |
| 2.11 | **Dashboard résumé** | KPIs : profit, heures, win %, ROI | Tous | ⭐⭐ | Page agrégée, cache optionnel |
| 2.12 | **Format de jeu** | Hold'em, PLO, etc. | PBT, Poker Analytics | ⭐ | Extension de `game_type` |
| 2.13 | **Nombre de tables** | Multi-tabling online | PBT, Poker Income | ⭐ | Champ entier optionnel |
| 2.14 | **Rebuys / add-ons** | Ajustements buy-in en cours | Poker Income, StackEdge, PBT | ⭐⭐ | Lignes `session_transactions` ou champs multiples |
| 2.15 | **Sync cloud multi-device** | Données sur tous les appareils | Pokerbase, PBT, Poker Analytics | ⭐⭐ | Supabase = natif si auth |

---

## 3. Fonctionnalités MÉTIER poker (standard avancé)

Attendues par les joueurs réguliers ; souvent dans la version Pro des apps.

| # | Fonctionnalité | Description | Présent dans | Difficulté | Notes implémentation |
|---|----------------|-------------|--------------|------------|----------------------|
| 3.1 | **Nombre de mains** | Hands jouées (estimé ou saisi) | PokerPro, PBT, Poker Analytics | ⭐ | Champ + validation |
| 3.2 | **bb/100** | `((P&L / big_blind) / hands) × 100` | PokerPro, StackEdge, PBT | ⭐⭐ | Nécessite mains + parse blinds |
| 3.3 | **Timer session live** | Chronomètre pendant le jeu | Poker Income, StackEdge, PBT | ⭐⭐⭐ | État persistant, pause/rebuy UI |
| 3.4 | **Session en cours** | Log en temps réel avant cash-out | StackEdge, Poker Income | ⭐⭐⭐ | Statut `active`, WebSocket ou polling |
| 3.5 | **Tournois : buy-in structure** | Entrée, rebuy, addon séparés | PBT, Poker Analytics | ⭐⭐ | Sous-champs ou JSON |
| 3.6 | **Tournois : ITM %** | % de tournois avec payout | PBT, Poker Analytics | ⭐⭐ | Filtre `game_type = tournament` + flag ITM |
| 3.7 | **Tournois : ROI global** | ROI sur buy-ins cumulés MTT | Tous (tournois) | ⭐⭐ | Agrégation dédiée |
| 3.8 | **Dépôts / retraits** | Transactions hors table (bankroll réel) | Poker Analytics, StackEdge | ⭐⭐ | Table `bankroll_transactions` |
| 3.9 | **Multi-devises** | EUR, USD, GBP + taux de change | PBT (40+), Poker Analytics | ⭐⭐⭐ | Table devises, API taux, conversion affichage |
| 3.10 | **Coûts annexes** | Hôtel, transport, rake live | PBT, Poker Analytics | ⭐⭐ | Lignes de coût liées à session |
| 3.11 | **Tags session** | tilt, tired, hot table | PokerPro | ⭐⭐ | Table tags + relation many-to-many |
| 3.12 | **Humeur (1–5)** | Corrélation état mental / résultats | PokerPro | ⭐⭐ | Champ + heatmap (⭐⭐⭐ pour viz) |
| 3.13 | **Stats par stake** | P&L, bb/100, heures groupés | PokerPro, BINK, PBT | ⭐⭐ | `GROUP BY blinds` |
| 3.14 | **Stats par lieu** | Identifier les spots rentables | BINK, PBT | ⭐⭐ | `GROUP BY location` |
| 3.15 | **Stats par jour / heure** | Jour de semaine, time of day | PokerPro, StackEdge | ⭐⭐ | Agrégation `date_trunc` |
| 3.16 | **Export CSV / JSON** | Portabilité des données | PBT, Poker Analytics, StackEdge | ⭐⭐ | Endpoint API + download |
| 3.17 | **Import CSV** | Migration depuis autre app | PBT, Poker Analytics | ⭐⭐⭐ | Mapping colonnes, validation batch |
| 3.18 | **Risk of ruin** | Probabilité de bust selon bankroll | StackEdge, Poker Analytics | ⭐⭐⭐ | Modèle statistique (variance, win rate) |
| 3.19 | **Recommandation de stake** | Bankroll management (règles 20/30/40 BI) | StackEdge | ⭐⭐ | Règles configurables par format |
| 3.20 | **Variance / bell curve** | Distribution des résultats | PBT, PT4 | ⭐⭐⭐ | Simulation Monte Carlo ou stats |

---

## 4. Fonctionnalités AVANCÉES (hors minimal — référence marché)

Non requises pour un journal minimal, mais présentes sur les leaders.

| # | Fonctionnalité | Description | Présent dans | Difficulté | Notes implémentation |
|---|----------------|-------------|--------------|------------|----------------------|
| 4.1 | **Replayer de mains** | Revoir une main street par street | PBT, Pokerbase, Poker Analytics | ⭐⭐⭐⭐ | UI poker table, état des cartes/actions |
| 4.2 | **Stats adversaires (VPIP, PFR, 3bet)** | HUD manuel ou import | Poker Income, PBT | ⭐⭐⭐ | Table `players` + agrégations |
| 4.3 | **Notes sur adversaires** | Profils joueurs | PBT, PT4 | ⭐⭐ | CRUD joueurs lié aux sessions |
| 4.4 | **Calculateur cotes** | Odds Hold'em / Omaha | PBT | ⭐⭐⭐ | Moteur combinatique |
| 4.5 | **Calculateur ICM / deals** | Final table chop | PBT, PT4 | ⭐⭐⭐ | Algorithme ICM standard |
| 4.6 | **Calendrier tournois** | Events publics | PBT, Pokerbase | ⭐⭐⭐ | API externe ou scraping |
| 4.7 | **Staking / backers** | Parts vendues, markup | Pokerbase, StackEdge | ⭐⭐⭐⭐ | Multi-parties, payouts, ROI backer |
| 4.8 | **Profils publics / social** | Partage résultats | Pokerbase, BINK | ⭐⭐⭐ | Pages publiques, modération |
| 4.9 | **Import hand histories** | Auto-tracking online | PT4, HM3, Hand2Note | ⭐⭐⭐⭐ | Parsers par site, millions de mains |
| 4.10 | **HUD en jeu** | Overlay stats live | PT4, HM3, Hand2Note | ⭐⭐⭐⭐ | Desktop natif, hooks process |
| 4.11 | **Reports SQL / leak finder** | Queries custom sur mains | PT4 | ⭐⭐⭐⭐ | DB locale + query builder |
| 4.12 | **Scan reçus tournoi** | OCR buy-in slips | Pokerbase | ⭐⭐⭐⭐ | Vision API / OCR |
| 4.13 | **Apple Watch / lock screen timer** | Timer natif OS | StackEdge, Poker Analytics | ⭐⭐⭐⭐ | App native ou widgets iOS/Android |
| 4.14 | **Mode focus** | Masquer résultats en session | Pokerbase | ⭐ | Flag UI simple |
| 4.15 | **Export PDF / factures** | Compta, taxes | Pokerbase | ⭐⭐⭐ | Template PDF server-side |

---

## 5. Synthèse — périmètre MINIMAL recommandé

### Tier A — MVP journal (indispensable)

```
Session (buy-in, cash-out, date, durée, type)
  → P&L, liste, édition, suppression
  → Bankroll + profit total
  → Auth utilisateur
```

**Effort total estimé :** 1–2 semaines (base existante BKM-Poker couvre déjà ~80 %).

### Tier B — Journal standard compétitif

Ajouter à Tier A :

```
Stakes, lieu, notes
ROI, taux horaire, % sessions gagnantes
Graphiques bankroll + P&L
Filtres (date, type, lieu, stake)
Dashboard KPIs
Rebuys (optionnel mais très attendu)
```

**Effort additionnel :** 2–3 semaines.

### Tier C — Journal « pro » live/online

Ajouter à Tier B :

```
Mains + bb/100
Timer session live
Tournois (ITM, structure buy-in)
Dépôts/retraits
Tags / humeur
Stats par stake / lieu / période
Export/import CSV
Multi-devises (si audience internationale)
```

**Effort additionnel :** 4–8 semaines.

---

## 6. Matrice de couverture BKM-Poker (état actuel)

| Feature | Statut BKM-Poker |
|---------|------------------|
| Session CRUD | ✅ |
| Buy-in / cash-out / durée | ✅ |
| Type jeu, lieu, blinds, notes | ✅ |
| Bankroll initial + évolution | ✅ |
| ROI, win rate horaire, % gagnantes | ✅ |
| Graphique bankroll | ✅ |
| Dashboard | ✅ |
| Filtres avancés history | ⚠️ Partiel (`history/page.tsx`) |
| Timer live | ❌ |
| Mains / bb/100 | ❌ |
| Tournois dédiés (ITM) | ❌ |
| Tags / humeur | ❌ |
| Dépôts / retraits | ❌ |
| Export CSV | ❌ |
| Multi-devises | ❌ |
| Replayer / HUD | ❌ (hors scope journal) |

---

## 7. Priorisation suggérée (roadmap)

| Priorité | Feature | Difficulté | Valeur utilisateur |
|----------|---------|------------|-------------------|
| P0 | Filtres history complets | ⭐⭐ | Haute |
| P0 | Rebuys / add-ons | ⭐⭐ | Haute |
| P1 | Nombre de mains + bb/100 | ⭐⭐ | Haute (online) |
| P1 | Export CSV | ⭐⭐ | Haute (rétention) |
| P1 | Dépôts / retraits | ⭐⭐ | Moyenne-haute |
| P2 | Timer session live | ⭐⭐⭐ | Haute (live) |
| P2 | Mode tournoi (ITM, ROI MTT) | ⭐⭐ | Moyenne |
| P2 | Tags + humeur | ⭐⭐ | Moyenne (PokerPro) |
| P3 | Stats par stake/lieu/période | ⭐⭐ | Moyenne |
| P3 | Multi-devises | ⭐⭐⭐ | Variable |
| P4 | Risk of ruin + stake recommandé | ⭐⭐⭐ | Niche pro |
| P5 | Replayer, HUD, import HH | ⭐⭐⭐⭐ | Pro online (autre produit) |

---

## Références

- [PokerNews — Top 5 bankroll trackers](https://www.pokernews.com/strategy/the-top-5-best-poker-bankroll-trackers-48862.htm)
- [Pokerbase — Comparatif 2025](https://blog.pokerbase.app/best-poker-bankroll-tracker-2025/)
- [Poker Tools Guide — PT4 vs HM3 vs DriveHUD vs Hand2Note](https://pokertoolsguide.com/poker-database-software-comparison/)
- [PokerTracker 4 — Features](https://www.pokertracker.com/products/PT4/)
- [Hold'em Manager 3](https://www.holdemmanager.com/hm3/)
- [PokerPro Journal](https://pokerpro.tools/tools/journal)
- [StackEdge](https://www.stackedge.app/)
- [Poker Analytics — Features](https://www.poker-analytics.net/us/features.html)
