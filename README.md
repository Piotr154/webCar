# WebCar — aplikacja mobilna

Aplikacja na iPhone'a do sterowania samochodem RC WebCar (React Native + Expo, tylko iOS).
Opis działania, protokół i ekrany: `context/WebCar_kontekst.md`. Podział pracy i zadania: `context/WebCar_aplikacja_mobilna_podzial_pracy_i_plan_Sprintu_1.pdf`.

## Wymagania

- Node.js w wersji LTS (co najmniej 22.13; oboje używajcie tej samej wersji głównej)
- Git
- Expo Go na iPhonie (App Store)
- VS Code z rozszerzeniami z `.vscode/extensions.json` (VS Code sam je zaproponuje)

## Pierwsze uruchomienie (po `git clone` albo `git pull`, który zmienił `package.json`)

```bash
npm install
```

## Uruchomienie

```bash
npx expo start
```

Zeskanuj kod QR Aparatem na iPhonie → otworzy się w Expo Go. iPhone i Mac muszą być w tej samej sieci,
a Expo Go musi mieć zgodę na sieć lokalną (Ustawienia → Prywatność i ochrona → Sieć lokalna).

Jeśli telefon nie łączy się z Makiem, użyj tunelu (wymaga zalogowania: `npx expo login`, to samo konto w Expo Go):

```bash
npx expo start --tunnel
```

Żółty komunikat `Unable to run simctl` można ignorować — dotyczy symulatora iOS z Xcode, którego nie używamy.

## Przydatne komendy

| Komenda                     | Co robi                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `npx expo install <paczka>` | instaluje bibliotekę w wersji zgodnej z Expo Go — zawsze zamiast `npm install <paczka>` |
| `npm run typecheck`         | sprawdza typy TypeScript (`tsc --noEmit`) — przed każdym PR                             |
| `npm run format`            | formatuje kod Prettierem                                                                |
| `npx expo-doctor`           | diagnozuje problemy z zależnościami                                                     |

Nie uruchamiajcie `npm audit fix --force` — podmienia wersje paczek na niezgodne z Expo.

## Struktura

```
app/              ekrany (expo-router) — każdy plik to ekran
src/components/   wspólne komponenty UI (B)
src/connection/   łączność z autem (A)
src/drive/        model pedałów, pętla 20 Hz (A)
src/db/           SQLite (B: profile, A: sesje)
src/state/        konteksty React (A: połączenie, B: profile)
tools/mock-car/   symulator auta (A)
context/          dokumentacja projektu
```

Importy z `src/` przez alias `@/`, np. `import { ScreenStub } from '@/components/ScreenStub';`.

## Zasady pracy

- `main` zawsze działa na iPhonie. Praca na gałęziach `a/A3-connection`, `b/B4-sqlite` (osoba + ID zadania).
- Pull request → przegląd drugiej osoby → merge.
- Nazwy w kodzie po angielsku, formatowanie Prettier (formatowanie przy zapisie jest włączone w `.vscode/settings.json`).

## Decyzje

- **W1 (7 XI 2026):** projekt z szablonu `create-expo-app` (Expo SDK 58). Ekrany zostają w `app/` w katalogu głównym,
  zgodnie z planem pracy — szablon domyślnie używa `src/app/`, ale cały plan i kontrakt odwołują się do `app/`.
- **B1 — kursywa Saira Condensed:** do ustalenia (fontStyle italic czy skewX).
