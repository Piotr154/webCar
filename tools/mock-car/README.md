# mock-car

Symulator auta WebCar. Mówi tym samym protokołem WebSocket co ESP32,
więc aplikację da się uruchomić i testować bez pojazdu.

## Uruchomienie

```sh
cd tools/mock-car
npm install
node server.js
```

Serwer nasłuchuje na `ws://<adres komputera>:8080/ws`. Aplikacja łączy się z nim,
gdy w `src/config.ts` jest `USE_MOCK = true` — adres komputera bierze z Expo,
więc telefon i komputer muszą być w tej samej sieci.

Uruchamiaj w zwykłym terminalu (Terminal.app, terminal VS Code) — serwer czyta
pojedyncze klawisze i bez terminala się nie uruchomi.

## Zachowanie

- po połączeniu wysyła `hello`, potem telemetrię `tel` co 100 ms
- odpowiada `pong` na `ping`
- `drv`: E-STOP i blokada auto-stopu zerują moc, skręt obcięty do −100…100
- failsafe: brak `drv` > 300 ms → moc 0, koła prosto (sprawdzane raz na sekundę)
- po 2 s bez żadnej wiadomości od aplikacji zamyka połączenie (sprawdzane raz na sekundę, więc po 2–3 s; samo połączenie liczy się jak wiadomość)
- po zamknięciu połączenia gasi podświetlenie (`LED OFF` w konsoli)
- nowe połączenie zamyka poprzednie (`zamykam poprzednie połączenie` w konsoli)
- co sekundę wypisuje, ile ramek `drv` przyszło i jaka była najdłuższa przerwa

## Klawisze

| Klawisz     | Działanie                                                                   |
| ----------- | --------------------------------------------------------------------------- |
| `p`         | pauza / wznowienie telemetrii (utrata łącza)                                |
| `k`         | zerwanie połączenia                                                         |
| `l`         | opóźnienie `pong` +120 ms / bez opóźnienia                                  |
| `w`         | słaby sygnał (RSSI −80) / normalny                                          |
| `e`         | błąd przedniego czujnika (`d1: null`) / normalny                            |
| `a`         | auto-stop — tylko przy tempomacie (`c` = 1); `as` = 1 aż do `drv` z `g` = 0 |
| `r`         | radio gra (utwór 3) / nie gra                                               |
| `q`, Ctrl+C | wyjście                                                                     |

## Test bez aplikacji

```sh
npx wscat -c ws://localhost:8080/ws
```

Powinny lecieć ramki `tel`. Wklej (szybko, w ciągu 2 s) `{"t":"ping","id":1}` — ma wrócić `{"t":"pong","id":1}`.
Bez kolejnych wiadomości serwer po 2–3 s zamknie połączenie — tak ma być.

Żeby sprawdzić `a`, najpierw wyślij `{"t":"drv","g":30,"s":0,"c":1}`.
