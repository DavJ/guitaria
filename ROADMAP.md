	
# 🎸 Guitaria – Kompletní Roadmap

## 🎯 Účel aplikace

**Guitaria** je interaktivní webová aplikace pro výuku **konkrétních skladeb na kytaru**, určená jak pro **začátečníky**, tak pro **pokročilé hráče**. Nabízí notaci, prstoklady, přehrávání, živou zpětnou vazbu a pokročilé tréninkové funkce.

---

## 🧠 Cílové skupiny

### 🔹 Začátečníci a mírně pokročilí
- Učí se základní akordy a rytmy
- Hrají jednodušší verze skladeb
- Potřebují vizuální nápovědu a zpomalené tempo

### 🔸 Pokročilí a profesionálové
- Hrají technicky náročné verze skladeb (sóla, barre, tapping)
- Potřebují přesné vyhodnocení hraní a kontrolu rytmu
- Chtějí výběr obtížnosti, vlastní tempo a pokročilé funkce

---

## 🧩 Moduly aplikace

### 1. `SongImport` 🎼
- Import skladby z MusicXML
- Extrakce not, tabulatury, struktury, akordů

### 2. `LessonView` 🧑‍🏫
- Hlavní obrazovka lekce
- Zobrazuje notaci, hmatník, přehrávání, detekci, skóre

### 3. `Fretboard` 🖐️
- Vizualizace hmatníku
- Zobrazení prstokladu a správných pozic v reálném čase

### 4. `Player` ⏯️
- Přehrávání skladby (smyčky, zpomalení, sekce)
- Synchronizace s hmatníkem a analýzou

### 5. `PitchDetection` 🎙️
- Detekce tónu z mikrofonu
- Porovnání s notací, určení správnosti tónu a rytmu

### 6. `DifficultySelector` 🎚️
- Přepínání mezi verzemi skladby (začátečník, originál, pokročilý)

### 7. `Scoring` 📊
- Vyhodnocení hry (tónová přesnost, rytmus, skóre)
- Statistiky a tréninková doporučení

---

## 🧠 Funkce podle úrovně

### 👶 Funkce pro začátečníky
- Vizualizace základních akordů (C, G, Am, Dm…)
- Tréninkový režim s metronomem a smyčkou
- Barevné zvýraznění prstů na hmatníku
- Guided mode: krok po kroku refrén nebo sloka
- Návrhy skladeb podle úrovně hráče

### 🎸 Funkce pro pokročilé
- Import originálních skladeb (vč. sólových partů)
- Zobrazení prstokladu včetně barre, tapping, slides
- Reálné přehrávání s možností detailního zastavení
- Živá detekce výšky tónu (pitch) a rytmu přes mikrofon
- Skórování podle přesnosti a načasování
- Export výkonu nebo logu hraní
- Volba části skladby (bridge, sólo, chorus)

---

## 🌐 Technologie

| Oblast | Stack |
|--------|-------|
| Frontend | React + Vite + TypeScript |
| Stylování | TailwindCSS |
| Routing | React Router |
| Analýza zvuku | Web Audio API, Pitchy, Meyda |
| Notace | OpenSheetMusicDisplay (MusicXML) |
| Stav | Zustand / Redux |
| Data | IndexedDB / localStorage / Cloud (v2) |

---

## 🚧 Roadmap podle verzí

### ✅ Fáze 1: MVP – základní přehrávač skladby
- [ ] Import skladby (MusicXML)
- [ ] Zobrazení notace + hmatníku
- [ ] Mikrofonová detekce tónu
- [ ] Přehrávání skladby (tempo, smyčka)
- [ ] Jednoduché skórování (tón správně / špatně)

### 🔜 Fáze 2: Interaktivní výuka
- [ ] Přepínání obtížností
- [ ] Trénink konkrétních částí písně (bridge, refrén, sólo)
- [ ] Detailní skórování + analýza rytmu

### 🎯 Fáze 3: Chytrý trénink a rozšíření
- [ ] Doporučení na míru (na základě výkonu)
- [ ] Offline režim (PWA / Electron)
- [ ] Export výsledků, sdílení, historie tréninku

---

## 💡 Kontext pro Copilot

```ts
// Guitaria je aplikace pro výuku konkrétních skladeb na kytaru.
// Zaměřuje se na pokročilé hráče, ale má i režim pro začátečníky.
// Pracuje s MusicXML, zobrazuje notaci + prstoklady, analyzuje hraní pomocí mikrofonu.
// Tvým úkolem je postupně implementovat jednotlivé moduly podle ROADMAP.md.
```
