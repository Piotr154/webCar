# WebCar — kontekst projektu

Stan: 2 listopada 2026 · wersja dokumentu 2.5

## 0. Jak korzystać z tego dokumentu

To jest **jedyny plik z kontekstem projektu**. Opisuje sprzęt, połączenia, firmware, protokół i aplikację mobilną (tylko iOS, iPhone).

Oznaczenia w tekście:

- **[SZACUNEK]** — wartość niezmierzona na naszym sprzęcie, do weryfikacji w testach. Stałe do dobrania są zebrane w sekcji 12.
- **[PROPOZYCJA]** — rozwiązanie zaproponowane, jeszcze niepotwierdzone przez zespół.

Zasady: zespół jest na poziomie początkującym w programowaniu — rozwiązania mają być możliwie proste, bez nadmiarowych warstw abstrakcji. Nie projektujemy funkcji opartych na danych, których pojazd nie mierzy (sekcja 5).

## 1. Kontekst

**Temat pracy (zgłoszony na uczelni):** WebCar – internetowy system sterowania i monitorowania wielofunkcyjnego pojazdu mobilnego IoT

**Zakres pracy (zgłoszony na uczelni):**

1. Przegląd rozwiązań technologicznych związanych ze zdalnym sterowaniem pojazdami, systemami IoT oraz komunikacją bezprzewodową.
2. Zaprojektowanie i realizacja platformy sprzętowej pojazdu obejmującej napęd, zasilanie, jednostkę sterującą oraz elementy pomiarowe i wykonawcze.
3. Opracowanie konstrukcji mechanicznej oraz karoserii z wykorzystaniem modelowania CAD oraz technologii druku 3D.
4. Implementacja oprogramowania wbudowanego do sterowania pojazdem, obsługi urządzeń peryferyjnych oraz akwizycji danych pomiarowych.
5. Zaprojektowanie i realizacja serwera oraz bazy danych do komunikacji, monitorowania i zarządzania systemem.
6. Opracowanie aplikacji webowej umożliwiającej zdalne sterowanie pojazdem, podgląd wideo oraz wizualizację danych telemetrycznych.
7. Integracja, testy oraz weryfikacja i walidacja poprawności działania systemu.

**Założenie zespołu:** zgłoszony zakres nie musi być spełniony dosłownie. Część punktów realizujemy inaczej, niż sugeruje ich brzmienie: punkt 5 (serwer i baza danych) to serwer WebSocket na głównym ESP32 oraz lokalna baza SQLite w aplikacji (sekcja 7), a punkt 6 (aplikacja webowa) to aplikacja mobilna na iPhone'a (sekcja 8).

Praca inżynierska na studiach informatycznych, zespół czteroosobowy (Piotrek, Wojtas, Jagoda, Wojtek). Role: aplikacja mobilna; systemy IoT i backend; dobór komponentów i platforma sprzętowa; karoseria CAD/druk 3D.

Cel: zdalnie sterowany model samochodu z rozbudowaną elektroniką, sterowany z aplikacji na iPhonie przez WiFi, z podglądem wideo i telemetrią.

Etap: sprzęt w trakcie montażu i testów podzespołów; schemat płytki głównej gotowy; działa blokujący program testowy (sekcja 6). Kod aplikacji nie istnieje. Istnieją makiety ekranów (sekcja 11).

## 2. Platforma sprzętowa

### Podwozie i napęd

| Element | Model | Uwagi |
|---|---|---|
| Podwozie | Tamiya TT-02D Drift | 1:10, gotowe RC, 4WD, napęd wałem, amortyzatory olejowe; drukowana w 3D jest tylko karoseria |
| Silnik | RS-540 szczotkowy (Sport Tuned) | 3× kondensator 0,1 µF odkłócający |
| Regulator (ESC) | Hobbywing QuicRun WP-1060, 60 A | BEC 6 V / 3 A, sygnał PWM 50 Hz; tryb **Fwd/Rev** (zworka — sekcja 4); zabezpieczenia: odcięcie przy niskim napięciu (LVC), przegrzanie, zanik sygnału |
| Serwo skrętu | TowerPro SG5010 | zasilane z BEC regulatora (szyna +6V_BEC), nie z szyny 5 V |

Regulator przyjmuje wyłącznie zasilanie i sygnał PWM. Nie ma telemetrii — mikrokontroler nie zna prądu, obrotów ani temperatury silnika.

### Jednostka sterująca

ESP32-S3-DevKitC-1 N8R8 (rewizja v1.1) — jedyny „mózg" pojazdu. Zasilany z szyny 5 V przez pin 5V. Ma wbudowany czujnik temperatury chipu oraz NVS — trwałą pamięć na ustawienia. Na pojeździe nie ma komputera pokładowego ani serwera.

Na N8R8 zajęte/zarezerwowane są: GPIO26–37 (Flash/PSRAM oktalny), GPIO0/3/45/46 (strapping), GPIO19/20 (USB). Wbudowana dioda RGB na rewizji v1.1 to **GPIO38** (GPIO48 dotyczy rewizji v1.0). Schemat nie używa żadnego z tych pinów.

### Zasilanie

LiPo 2S 7,4 V 6000 mAh (XT90/T-Plug) → bezpiecznik inline 15 A → wyłącznik główny → rozgałęzienie:

- **gałąź mocy:** regulator ESC → silnik; BEC regulatora (+6 V) → przez złącze J_ESC na płytkę → serwo (J_SERWO)
- **gałąź logiki:** bezpiecznik 3 A → przetwornica LM2596 (7,4 V → 5,0 V, ustawić miernikiem przed podłączeniem) → złącze J_5V → szyna +5V płytki

Wyjść BEC (6 V) i LM2596 (5 V) nigdy nie łączymy — wspólna jest tylko masa. Wszystkie masy zebrane w jeden punkt gwiazdy. Przetwornica, akumulator, bezpieczniki, wyłącznik i regulator są poza płytką główną.

### Przypisanie pinów (zgodne ze schematem)

| GPIO | Sieć na schemacie | Element | Funkcja |
|---|---|---|---|
| 4 | ESC_SIG | ESC | PWM 1000 / 1500 / 2000 µs |
| 5 | SERVO_SIG | serwo SG5010 | PWM: 1250 µs = pełny skręt w lewo, 1500 µs = prosto, 1750 µs = pełny w prawo |
| 6 | LED → R2 330 Ω → LED_DIN | taśma WS2813 | dane, bez konwertera poziomów (sekcja 12) |
| 7 | BUZZ | moduł buzzera aktywnego Iduino ST1143 | wł./wył., bezpośrednio z pinu (moduł ma własny tranzystor); jeden ton; pikanie przy cofaniu |
| 8 / 9 | SDA / SCL | 2× VL53L0X | I²C wspólne |
| 10 | XSHUT1 | VL53L0X #1 — **przedni**, adres 0x30 | reset/adresacja |
| 11 | XSHUT2 | VL53L0X #2 — **tylny**, adres 0x31 | reset/adresacja |
| 12 | DF_RX | DFPlayer Mini RX | UART TX ESP32 → RX DFPlayera przez R1 1 kΩ, 9600 bps |
| 14 | DF_TX | DFPlayer Mini TX | UART RX ESP32 ← TX DFPlayera |
| 15 | L_LEWY | LED | kierunkowskaz lewy |
| 16 | L_PRAWY | LED | kierunkowskaz prawy |
| 17 | L_PRZOD | LED (niebieskie) | reflektory — świecą stale, gdy pojazd jest włączony; sterowanie wprost z pinu nie wystarczy |
| 18 | L_TYL | LED | światła tylne — świecą tylko podczas jazdy wstecz |
| 38 | — (na płytce DevKit) | dioda RGB wbudowana | sygnalizacja stanu |
| 0 | — (na płytce DevKit) | przycisk BOOT | start/stop programu testowego |

Nieużywane piny modułu (pozostawione niepodłączone): 3V3, RST, GPIO1, 2, 3, 13, 21, 39–42, 45–48, TX/RX (43/44).

### Płytka główna — złącza (ze schematu)

| Złącze | Typ | Pin 1 | Pin 2 | Pin 3 | Pin 4 | Pin 5 | Pin 6 | Pin 7 | Pin 8 |
|---|---|---|---|---|---|---|---|---|---|
| J_5V | KF301-5.0-2P | +5V (wejście z LM2596) | GND | | | | | | |
| J_ESC | PZ2.54 1×3 | ESC_SIG | +6V_BEC (z ESC) | GND | | | | | |
| J_SERWO | PZ2.54 1×3 | SERVO_SIG | +6V_BEC | GND | | | | | |
| J_KAMERA | PZ2.54 1×2 | +5V | GND | | | | | | |
| J_TOF1 | PZ2.54 1×7 (Pololu 2490) | VDD — n.c. | VIN +5V | GND | SDA | SCL | XSHUT1 | GPIO1 — n.c. | |
| J_TOF2 | PZ2.54 1×7 (Pololu 2490) | VDD — n.c. | VIN +5V | GND | SDA | SCL | XSHUT2 | GPIO1 — n.c. | |
| J_DF_L | PM2.54 1×8 (lewa strona DFPlayera) | VCC +5V | RX (przez R1 1 kΩ) | TX | DAC_R — n.c. | DAC_L — n.c. | SPK1 | GND | SPK2 |
| J_DF_R | PM2.54 1×8 (prawa strona DFPlayera) | BUSY — n.c. | n.c. | n.c. | n.c. | n.c. | n.c. | GND | n.c. |
| J_GLOSNIK | PZ2.54 1×2 | SPK1 | SPK2 | | | | | | |
| J_LED | PZ2.54 1×4 (taśma WS2813, Grove) | GND | +5V | n.c. | LED_DIN | | | | |
| J_SWIATLA | PZ2.54 1×5 | L_LEWY | L_PRAWY | L_PRZOD | L_TYL | GND | | | |
| J_BUZZER | PZ2.54 1×3 | BUZZ | +5V | GND | | | | | |

Elementy na płytce:

| Oznaczenie | Wartość | Gdzie |
|---|---|---|
| C1 | 470 µF / 25 V | +6V_BEC – GND (szpilki prądu serwa) |
| C2 | 220 µF / 10 V | +5V – GND (m.in. DFPlayer) |
| C3 | 1000 µF / 10 V | +5V – GND (taśma WS2813) |
| R1 | 1 kΩ | GPIO12 → RX DFPlayera |
| R2 | 330 Ω | GPIO6 → dane WS2813 |

Na płytce **nie ma**: konwertera poziomów dla WS2813, tranzystorów dla diod LED ani buzzera, rezystorów diod LED (montowane przy diodach, poza płytką).

**Uwaga — VIN czujników ToF = +5V.** Na płytkach Pololu 2490 linie SDA i SCL są podciągane do napięcia VIN, więc przy VIN = 5 V na GPIO8/9 ESP32 trafia 5 V, a piny ESP32-S3 nie tolerują 5 V.

### DFPlayer Mini i karta microSD

DFPlayer z wbudowanym wzmacniaczem 3 W, głośnik Adafruit 4227 (1 W / 8 Ω) na wyjściach SPK1/SPK2. Odtwarza jeden plik naraz i ma jedną głośność w skali 0–30. Wyjście BUSY nie jest podłączone — firmware sprawdza stan odtwarzania przez UART.

Układ karty (FAT32):

| Folder | Zawartość | Wywołanie |
|---|---|---|
| `/01/` | klaksony `001.mp3` … `006.mp3` | `playFolder(1, n)` |
| `/02/` | radio `001.mp3` … `005.mp3` | `playFolder(2, n)` |
| `/ADVERT/` | kopie klaksonów `0001.mp3` … `0006.mp3` | `advertise(n)` — klakson w trakcie grającego radia |

Numery w protokole (`horn`, `radio`) są liczone osobno dla każdej listy, od 1. Zawartość karty jest odczytywana przy starcie modułu — aplikacja nie wgrywa plików i nie odczytuje ich nazw. Nazwy dźwięków i utworów są wpisane na stałe w aplikacji, zgodnie z numeracją na karcie.

Klakson podczas radia: tryb „advert" (wstawka z folderu `ADVERT`, po której muzyka wraca) działa tylko wtedy, gdy coś aktualnie gra; wywołany w złym momencie może zatrzymać odtwarzanie. Firmware: gdy radio gra → `advertise(n)`, gdy nie gra → `playFolder(1, n)`.

### Oświetlenie

**Taśma WS2813** (podświetlenie podwozia, „underglow"), 30 diod, do ~1,8 A przy pełnej bieli [SZACUNEK]. Firmware ogranicza maksymalną jasność ze względu na wydajność przetwornicy — 100 % w aplikacji oznacza maksimum dopuszczone przez firmware, nie pełną moc taśmy.

**Pojedyncze diody LED** (złącze J_SWIATLA) sterowane bezpośrednio z GPIO 3,3 V, każda przez własny rezystor szeregowy przy diodzie; prąd na pin ok. 8–10 mA. Diody czerwone/żółte (Vf ~2 V): ok. 150–220 Ω. **Reflektory (L_PRZOD) są niebieskie** — niebieska dioda ma Vf ok. 3,0–3,3 V, więc z pinu 3,3 V przez rezystor praktycznie nie zaświeci.

### Kamera

Seeed Xiao ESP32-S3 Sense z modułem kamery OV3660. Układ całkowicie niezależny od głównego ESP32 — dzieli z nim wyłącznie zasilanie 5 V i masę (złącze J_KAMERA). Komunikacja z aplikacją tylko przez WiFi. Jedna kamera, skierowana do przodu; nie ma kamery tylnej.

## 3. Komunikacja — hotspot iPhone'a

Obie płytki (główny ESP32 i Xiao) łączą się jako klienci z hotspotem iPhone'a, na którym działa aplikacja. Sterowanie i telemetria idą przez WebSocket do głównego ESP32, wideo (MJPEG) z Xiao bezpośrednio do telefonu. Adresy IP są stałe: ustawione w firmware płytek i wpisane w kod aplikacji — aplikacja nie ma ekranu do wpisywania adresów.

### Konfiguracja

| Gdzie | Ustawienie |
|---|---|
| iPhone | Ustawienia → Hotspot osobisty: nazwa sieci i hasło takie jak w firmware, włączone „Pozwalaj innym na łączenie" i „Maksymalizuj zgodność" |
| firmware głównego ESP32 | nazwa sieci, hasło, stały adres `172.20.10.13`, brama `172.20.10.1`, maska `255.255.255.240` |
| firmware Xiao | nazwa sieci, hasło, stały adres `172.20.10.14`, brama `172.20.10.1`, maska `255.255.255.240` |
| aplikacja (stałe w kodzie) | sterowanie: `ws://172.20.10.13/ws` (port 80, ścieżka `/ws`), wideo: `http://172.20.10.14:81/stream` |

Wyjaśnienia:

- **Dlaczego stałe adresy działają:** hotspot iPhone'a używa zakresu `172.20.10.0/28` — telefon ma `.1`, urządzenia dostają adresy z zakresu `.2–.14`. (Według zgodnych doniesień użytkowników — potwierdzić na naszym iPhonie.)
- **Pasmo 2,4 GHz.** iPhone 12 i nowsze domyślnie nadają hotspot w 5 GHz, a ESP32 obsługuje tylko 2,4 GHz — dlatego „Maksymalizuj zgodność" musi być włączone.
- **Hotspot w planie operatora.** Karta SIM w tym iPhonie musi mieć dostępną funkcję hotspotu.
- **Widoczność sieci.** Urządzenia spoza Apple czasem widzą hotspot tylko wtedy, gdy na telefonie jest otwarty ekran ustawień hotspotu — przy pierwszym łączeniu warto go mieć otwartego.
- **Inne urządzenia w hotspocie.** Gdyby inne urządzenie (np. laptop programisty) dostało `.13` albo `.14`, powstałby konflikt z autem. Adresy auta są na końcu zakresu, bo telefon przydziela zwykle niskie numery; w razie problemów odłączyć i ponownie podłączyć to drugie urządzenie.
- **Pierwszy test:** ESP32 ze stałym adresem i prostą stroną WWW, otwartą w Safari na tym samym iPhonie.

### Konsekwencje dla aplikacji

- Obsługa łącza w jednym module (`send(command)`, `onTelemetry(callback)`, `onStatusChange(callback)`), żeby reszta aplikacji nie musiała znać szczegółów WebSocketa.
- Kanał wideo i kanał sterowania są niezależne. **CONNECTION LOST zależy wyłącznie od łącza sterowania** (telemetrii z głównego ESP32) — problem z kamerą nigdy go nie wywołuje.
- Automatyczne wznawianie połączenia w tle — pojazd może się zrestartować albo zgubić łącze w trakcie jazdy.
- **CONNECTION LOST** — tylko na ekranie jazdy. Gdy przez ok. 2 s nie przyjdzie żadna ramka telemetrii, aplikacja pokazuje okienko CONNECTION LOST z przyciskami RETRY i QUIT (makieta 06). Ekran jazdy w tle zastyga w ostatnim stanie (przyciemniony; wskaźnik może pokazywać ostatnią moc). RETRY wymusza próbę połączenia od razu; okienko znika samo, gdy łącze wróci.
- **Po odzyskaniu połączenia ekran jazdy ładuje się od nowa** ze stanem domyślnym (niżej), w tym z mocą 0. Aplikacja nigdy nie wysyła po ponownym połączeniu mocy sprzed utraty łącza — kierowca musi ponownie nacisnąć pedał.
- **Poza ekranem jazdy** brak połączenia nie blokuje aplikacji: profile (tworzenie, zmiana nazwy, usuwanie, wybór aktywnego), zapisywanie ustawień (SAVE na ekranach Drive settings, Light & sound i Radio) i historia jazd działają bez auta. Ustawienia zapisane bez połączenia trafiają do pojazdu przy najbliższym połączeniu (synchronizacja, sekcja 7). Gdy użytkownik wykona akcję, która musi od razu zadziałać na aucie, a połączenia nie ma, aplikacja pokazuje okienko **NO CONNECTION** z przyciskiem CLOSE (makieta 19). Dotyczy to tylko: TEST HORN oraz wyboru stacji na ekranie Radio (wtedy zaznaczenie wraca do poprzedniej pozycji). Samo przesuwanie suwaków i wybór kolorów bez połączenia nie pokazuje błędu (nic nie jest wysyłane).
- **Stan połączenia na ekranie głównym** — kafelek CONNECTION: ONLINE ze wskaźnikiem jakości łącza (niżej) / OFFLINE (makiety 08 i 08A). Bez połączenia przycisk DRIVE jest nieaktywny — na ekran jazdy można wejść tylko przy działającym połączeniu.
- **Wskaźnik jakości łącza** — cztery kreski. Na ekranie jazdy osobny kafelek pod imieniem kierowcy i czasem sesji: kreski i obok ping w ms (ta sama średnia z 3 pomiarów, np. „24 MS”); przy 4 i 3 kreskach liczba jest biała, przy 2 żółta, przy 1 czerwona, a kafelek ma wtedy czerwony pasek z boku. Gdy aplikacja nie ma aktualnego pomiaru pingu (np. po utracie połączenia), zamiast liczby jest „— MS”. Przy okienku CONNECTION LOST wszystkie kreski są zgaszone, a kafelek ma czerwone tło (makieta 06); 1 czerwona kreska przy braku telemetrii dłużej niż ok. 0,5 s dotyczy krótkiej przerwy, zanim okienko się pojawi (ok. 2 s). Na kafelku CONNECTION na ekranie głównym są same kreski. Aplikacja liczy go z danych, które już ma: RSSI z telemetrii, ping (średnia z 3 ostatnich pomiarów, żeby wskaźnik nie skakał co sekundę) i czas od ostatniej ramki telemetrii. Brak telemetrii dłużej niż ok. 0,5 s zawsze daje 1 kreskę. W pozostałych przypadkach wskaźnik pokazuje najwyższy poziom, którego oba warunki (RSSI i ping) są spełnione — czyli decyduje gorszy z dwóch pomiarów:
  - 4 kreski — auto blisko telefonu, bez przeszkód: RSSI ≥ ok. −55 dBm i ping ≤ ok. 30 ms;
  - 3 kreski — normalna jazda w pomieszczeniu: RSSI ≥ ok. −65 dBm i ping ≤ ok. 50 ms;
  - 2 kreski — auto daleko albo za ścianą, obraz może się przycinać: RSSI ≥ ok. −75 dBm i ping ≤ ok. 100 ms;
  - 1 kreska (czerwona) — blisko utraty łącza: RSSI < ok. −75 dBm albo ping > ok. 100 ms albo brak telemetrii dłużej niż ok. 0,5 s.

  Progi to stałe do dobrania w testach (sekcja 12) [SZACUNEK]. Spodziewane warunki, z których wynikają: przy telefonie (do ok. 3 m) RSSI ok. −30…−50 dBm, w pomieszczeniu (ok. 3–10 m) ok. −45…−65 dBm, za ścianą lub dalej ok. −65…−80 dBm; ping w sieci lokalnej typowo ok. 5–30 ms, z chwilowymi skokami przy strumieniu wideo — o ile oszczędzanie energii WiFi w ESP32 jest wyłączone (sekcja 6). Wskaźnik tylko informuje kierowcę i niczego nie blokuje; o utracie łącza nadal decyduje timeout CONNECTION LOST.
- **QUIT** — kończy sesję i wraca do ekranu głównego (Home). Nie zamyka aplikacji: iOS na to nie pozwala (Apple nie udostępnia do tego API, a wymuszone zamknięcie wygląda dla użytkownika jak awaria).
- **Kamera** — przełącznik CAMERA ON/OFF w Drive settings. Przy OFF aplikacja nie otwiera strumienia, a w miejscu obrazu jest napis CAMERA OFF (makieta 05); sterowanie działa normalnie. Aplikacja nie wykrywa problemów z obrazem — przy zamrożonym lub brakującym obrazie kierowca wyłącza kamerę. Wyłączona kamera to też mniej ruchu w sieci WiFi, co może poprawić stabilność sterowania.
- **Po wejściu na ekran jazdy** stan jest domyślny: moc 0, koła prosto (drążek na środku, więc kierunkowskazy nie migają), tempomat wyłączony, E-STOP wyłączony, **podświetlenie wyłączone**. Aplikacja wysyła ten stan do pojazdu. Po włączeniu zasilania pojazd też ma podświetlenie wyłączone — włącza je dopiero przycisk LED.
- **Stan po odzyskaniu połączenia na ekranie jazdy** (RETRY albo samoczynnie): moc, skręt, tempomat i E-STOP wracają do stanu domyślnego, a **podświetlenie wraca do stanu sprzed utraty połączenia** — aplikacja pamięta stan przycisku LED i wysyła go do pojazdu.

## 4. Funkcje pojazdu i ich obsługa w aplikacji

### Ekran jazdy (orientacja pozioma)

**Skręt** — zero-jedynkowy: pełny w lewo / prosto / pełny w prawo, bez lekkiego skrętu. Dwa tryby (wybór w ustawieniach jazdy); logika trybów działa tylko w aplikacji — pojazd dostaje zawsze jedną z trzech wartości.

- **STICK** — okrągły drążek po lewej stronie ekranu. Liczy się tylko wychylenie w poziomie; działa jak przełącznik trzypozycyjny: gałka w lewo = pełny skręt w lewo, w prawo = pełny w prawo, po puszczeniu wraca na środek = prosto. Ruch w pionie nic nie robi. Mała strefa martwa wokół środka (sekcja 12).
- **GYRO** — skręt przechyłem telefonu jak kierownicą. Telefon trzymany poziomo (dłuższa krawędź równolegle do ziemi) = prosto; przechył w lewo/prawo poza próg = pełny skręt w tę stronę. Przechył liczony względem grawitacji (akcelerometr telefonu), więc pozycja „prosto" jest stała i nie wymaga kalibracji — nie zależy od tego, jak mocno ekran jest odchylony w stronę kierowcy. Próg ok. 15°, powrót na prosto poniżej ok. 10°, żeby koła nie drgały przy przechyle bliskim progu (sekcja 12). Ekran jazdy jest zablokowany w **jednej** orientacji poziomej (np. `LANDSCAPE_RIGHT`) — po obróceniu telefonu o 180° przechył w lewo dawałby odwrotny znak i auto skręcałoby w złą stronę.

**Pedały FWD i REV** — rozpędzanie, zwalnianie, hamowanie i jazda wstecz (podsekcja niżej).

**Wskaźnik POWER** — moc wysyłana do silnika w %, gdzie 100 % = limit mocy z profilu. Przy jeździe wstecz pokazuje wartość bez znaku (np. 40 %), a kierunek widać po podświetlonym pedale REV. Pojazd nie zna prędkości (sekcja 5).

**CRUISE (tempomat)** — zatrzymuje bieżącą moc i wysyła ją dalej bez trzymania pedału. To utrzymanie mocy, nie prędkości. Działa tylko przy jeździe do przodu: gdy moc wynosi 0 albo jest ujemna (postój, jazda wstecz), przycisk CRUISE jest nieaktywny (wyszarzony) i dotknięcie nic nie robi. Tempomat wyłącza się, gdy: kierowca ponownie dotknie CRUISE, naciśnie FWD (moc dalej rośnie od bieżącej wartości) albo REV (hamowanie), włączy E-STOP (także przez otwarcie menu), zadziała auto-stop przed przeszkodą albo zostanie utracone połączenie. Przy włączonym tempomacie działa automatyczne zatrzymanie przed przeszkodą z przodu (niżej).

**E-STOP** — ręczny wyłącznik jazdy: dopóki jest włączony, pojazd nie może jechać (moc 0, gaz zablokowany w obu kierunkach). Blokada jest pamiętana w firmware (zatrzask), a nie tylko w aplikacji, więc działa nawet wtedy, gdyby aplikacja przez błąd wysłała gaz. Włączenie E-STOP wyłącza tempomat. Gdy jest aktywny, wskaźnik pokazuje 0 %, a pedały i CRUISE są nieaktywne. Włączenie jednym dotknięciem, zwolnienie przytrzymaniem przez ok. 1 s. Przy włączonym E-STOP **skręt i klakson działają dalej i nie są wyszarzone**; przycisk LED też działa, a kierunkowskazy dalej migają przy skręcie (jeśli są włączone w Drive settings). Stan E-STOP jest w telemetrii (`es`). Po ponownym połączeniu E-STOP jest wyłączony — jak cały stan domyślny (sekcja 3).

**Menu w trakcie jazdy** — otwarcie menu na ekranie jazdy **automatycznie włącza E-STOP** (moc 0, tempomat wyłączony), bo kierowca nie ma wtedy dostępu do pedałów. Po powrocie przyciskiem BACK TO DRIVING E-STOP pozostaje włączony i zwalnia się go jak zwykle — przytrzymaniem przez ok. 1 s.

**HORN** — klakson: dźwięk wybrany w profilu.

**LED** — włącza i wyłącza podświetlenie podwozia (taśmę WS2813); kolor i jasność pochodzą z profilu. Dostępny w obu trybach skrętu. Po wejściu na ekran jazdy wyłączone; po odzyskaniu połączenia w trakcie jazdy — taki stan jak przed utratą połączenia (sekcja 3).

**Kamera** — obraz z kamery albo napis CAMERA OFF, gdy kamera jest wyłączona w Drive settings (sekcja 3).

**Kierunkowskazy** — automatyczne, bez przycisków na ekranie jazdy. Gdy pojazd skręca (`s` w ramce `drv` różne od 0), firmware miga kierunkowskazem po tej stronie; gdy koła wracają na prosto, kierunkowskaz gaśnie. Działa w obu trybach skrętu, także przy włączonym E-STOP, a przy failsafe gaśnie razem z powrotem kół na prosto. Przełącznik BLINKERS OFF/ON w Drive settings (zapisywany w profilu, pole `blk` w `cfg`) wyłącza tę funkcję [PROPOZYCJA: logika w firmware, bo firmware i tak zna skręt — aplikacja nie wysyła osobnych poleceń].

**Reflektory i światła tylne** — bez przycisków, sterowane automatycznie przez firmware: reflektory świecą stale, światła tylne tylko podczas jazdy wstecz (moc ujemna). Pojazd nie ma świateł stop.

### Pedały FWD i REV

Aplikacja trzyma jedną wartość: moc od −100 do +100 % (dodatnia = do przodu, ujemna = do tyłu). Pedały nie ustawiają mocy wprost, tylko zmieniają ją stopniowo — to symuluje rozpędzanie i zwalnianie auta. Zachowanie jest symetryczne: dla jazdy wstecz FWD działa tak, jak REV dla jazdy do przodu.

| Stan | Akcja | Efekt |
|---|---|---|
| moc 0 | trzymasz FWD | moc rośnie stopniowo do +100 % (jazda do przodu) |
| moc 0 | trzymasz REV | moc spada stopniowo do −100 % (jazda wstecz) |
| jazda do przodu | trzymasz FWD | moc dalej rośnie do +100 % |
| jazda do przodu | nic nie trzymasz | moc powoli wraca do 0 (zwalnianie) |
| jazda do przodu | trzymasz REV | moc szybciej wraca do 0 (hamowanie) |
| jazda wstecz | trzymasz REV | moc dalej rośnie do −100 % |
| jazda wstecz | nic nie trzymasz | moc powoli wraca do 0 (zwalnianie) |
| jazda wstecz | trzymasz FWD | moc szybciej wraca do 0 (hamowanie) |

- Puszczenie pedału hamowania nie zeruje mocy od razu — moc dalej powoli wraca do 0.
- Gdy hamujesz i moc dojdzie do 0, a pedał jest dalej trzymany, auto od razu zaczyna jechać w stronę tego pedału (np. trzymany REV: hamowanie → postój → jazda wstecz).
- Działa tylko jeden pedał naraz. Gdy jeden jest wciśnięty, dotknięcie drugiego jest ignorowane, dopóki pierwszy nie zostanie puszczony.
- 100 % = limit mocy z profilu (firmware przelicza wartość przez limit).
- Tempo rozpędzania, zwalniania i hamowania to stałe w kodzie aplikacji (sekcja 12). Liczy to aplikacja przy każdej ramce `drv` (co 50 ms); wskaźnik POWER pokazuje dokładnie to, co jest wysyłane.
- E-STOP, failsafe i auto-stop zerują moc natychmiast, bez stopniowego zwalniania.
- To jest moc wysyłana do silnika, nie zmierzona prędkość. Rzeczywista prędkość podąża za mocą tylko w przybliżeniu (zależy od nawierzchni i akumulatora).

### Tryb regulatora: Fwd/Rev

Regulator pracuje w trybie Fwd/Rev, ustawianym zworką (fabrycznie jest Fwd/Br/Rev, więc zworkę przestawia się przy montażu). W tym trybie sygnał ujemny od razu oznacza jazdę wstecz, bez osobnego hamulca regulatora i bez „podwójnego dotknięcia" — to, co wysyła aplikacja, jest dokładnie tym, co robi silnik. Gdy moc przechodzi przez 0 na wartości ujemne, a auto jeszcze toczy się do przodu, ujemna moc działa jak łagodne hamowanie silnikiem, potem auto rusza do tyłu — płynnie, bo moc zmienia się stopniowo. Przy pierwszym uruchomieniu regulator wymaga kalibracji zakresu gazu wg instrukcji Hobbywing.

### Czujniki odległości w czasie jazdy

Czujniki pracują w czasie rzeczywistym w firmware. Aplikacja nie pokazuje odległości na żywo — odległości trafiają tylko do statystyk sesji (sekcja 7). Czujnik #1 (J_TOF1, XSHUT1, 0x30) jest przedni, #2 (J_TOF2, XSHUT2, 0x31) tylny.

**Tył — pikanie przy cofaniu.** Gdy moc jest ujemna, a tylny czujnik widzi przeszkodę blisko, buzzer w pojeździe pika — tym szybciej, im bliżej (jak czujnik parkowania). Pojazd się nie zatrzymuje. Buzzer jest niezależny od DFPlayera, więc działa też przy grającym radiu. Progi to stałe w firmware (sekcja 12).

**Przód — auto-stop tylko przy tempomacie.** Gdy CRUISE jest włączony, a przedni czujnik wykryje przeszkodę bliżej niż próg AUTO-STOP z ustawień jazdy (0–100 cm), pojazd sam się zatrzymuje. Bez tempomatu auto-stop nie działa — kierowca zwalnia sam.

- Decyzję podejmuje firmware, bo ma odczyt czujnika od razu; przez aplikację doszłoby opóźnienie łącza. Dlatego aplikacja przekazuje w ramce `drv`, że tempomat jest włączony (pole `c`).
- Zatrzymanie: firmware zeruje moc i daje krótki impuls wstecz, który hamuje auto (sekcja 12), potem neutrum. Jeśli auto jechało bardzo wolno, impuls może je cofnąć o kilka centymetrów — czyli od przeszkody.
- Po zatrzymaniu firmware blokuje gaz do przodu, dopóki aplikacja nie wyśle mocy 0. Aplikacja po fladze `as` natychmiast wyłącza tempomat i ustawia moc na 0 (bez stopniowego zwalniania).
- Próg trzeba dobrać z zapasem na drogę zatrzymania, a czujnik widzi tylko wąski stożek na wprost (sekcja 5) [SZACUNEK].

### Personalizacja

- **Podświetlenie (taśma):** 7 gotowych kolorów + jasność w %. Kolor widoczny jako kwadracik przy profilu (ekran Driver profiles).
- **Klakson:** na razie mamy przykładowych 6 dźwięków z karty SD (01 BEEP, 02 TRAM BELL, 03 AIRHORN, 04 DUCK, 05 TRUCK, 06 SIREN); każdy profil ma wybrany jeden. TEST HORN odtwarza zaznaczony dźwięk na pojeździe, więc działa tylko przy połączeniu z autem.
- **Radio:** lista „stacji" = utwory MP3 na karcie (aktualnie jest to 5 przykładowych pozycji: 01 SKIBIDI67, 02 TIKITIKI PHONK, 03 JAGODAFM, 04 WOJTEK&WOJTEK, 05 PIZZAZKEBABEM — nazwy z makiet). Na początku listy jest pozycja „OFF” (bez numeru) = radio wyłączone. Działa to jak TEST HORN: dotknięcie stacji zaznacza ją i od razu włącza na pojeździe (dotknięcie „OFF” zatrzymuje radio). Bez połączenia aplikacja pokazuje NO CONNECTION, a zaznaczenie wraca do poprzedniej pozycji. SAVE zapisuje w aktywnym profilu zaznaczoną stację (także „OFF”) i głośność. Wyjście z ekranu bez SAVE porzuca wybór: aplikacja włącza na pojeździe z powrotem stację zapisaną w profilu (albo zatrzymuje radio, jeśli zapisane jest „OFF”). Po wejściu na ekran Radio zaznaczona jest stacja zapisana w profilu. NOW PLAYING i ikonka korektora przy stacji pokazują to, co faktycznie gra na pojeździe (pole `r` w telemetrii, sekcja 9); gdy nic nie gra albo nie ma połączenia — „—”.
- **Głośność — jedna wartość w dwóch miejscach.** Suwak na ekranie Light & sound i na ekranie Radio zmienia tę samą wartość, bo DFPlayer ma jedną głośność. Skala 0–30.

### Telemetria (pojazd → aplikacja)

- odległość z czujnika przedniego i tylnego (cm), z rozróżnieniem trzech stanów: zmierzona odległość / nic w zasięgu / błąd czujnika — do statystyk sesji
- siła sygnału WiFi (RSSI) między głównym ESP32 a iPhonem
- temperatura chipu ESP32 — mikrokontrolera, nie silnika ani regulatora
- flagi stanu: E-STOP aktywny; auto-stop zatrzymał pojazd
- stan radia: numer odtwarzanego utworu albo cisza — do napisu NOW PLAYING na ekranie Radio

### Dane mierzone przez aplikację

- czas od ostatniej ramki telemetrii — główny wskaźnik czy połączenie jest aktywne
- ping (RTT) i jitter — z wymiany ping/pong (w podsumowaniu sesji; ping także we wskaźniku jakości łącza, sekcja 3)
- stan strumienia wideo (działa / brak)

## 5. Ograniczenia, które kształtują interfejs

Pojazd nie ma: czujnika prędkości ani obrotów, IMU/żyroskopu, pomiaru napięcia akumulatora, telemetrii regulatora, tylnej kamery, zegara czasu rzeczywistego, komputera pokładowego.

- **Brak pomiaru prędkości.** Pojazd zna wyłącznie zadaną moc. Aplikacja nie pokazuje km/h, m/s ani dystansu — jedynie moc (POWER, w telemetrii AVG. POWER).
- **Brak IMU w pojeździe.** Tryb GYRO korzysta z czujników telefonu.
- **Brak pomiaru napięcia akumulatora.** Aplikacja nie pokazuje stanu baterii. Przy rozładowanym akumulatorze LVC regulatora może odciąć silnik, choć łącze działa — aplikacja tego nie wykryje.
- **Wideo.** MJPEG z Xiao, realistycznie 10–20 fps w VGA [SZACUNEK], opóźnienie do zmierzenia. W React Native strumień wyświetla się przez WebView (komponent `Image` nie obsługuje strumienia multipart). Serwer kamery (przykład CameraWebServer) udostępnia strumień na porcie 81 (`/stream`), pojedyncze zdjęcie na porcie 80 (`/capture`) i obsługuje jeden strumień naraz — aplikacja nie otwiera dwóch podglądów jednocześnie, a przy ponownym łączeniu zamyka stare połączenie. Awaryjnie można odpytywać `/capture` (niższy fps, zwykły `Image`).
- **Czujniki ToF (VL53L0X, Pololu 2490).** Zasięg do 2 m wg producenta; w trybie domyślnym typowo ok. 1,2 m, w słońcu krócej, kilka cm niepewne [SZACUNEK]. Pole widzenia — wąski stożek ok. 25°. W statystykach aplikacja pomija odczyty „nic w zasięgu" i „błąd czujnika".
- **Jedna kamera przednia.** Przy cofaniu ostrzega pikanie buzzera.
- **Brak zegara w pojeździe.** Znaczniki czasu nadaje aplikacja.

## 6. Firmware

### Do zrobienia przed integracją z aplikacją

- architektura nieblokująca
- wyłączone oszczędzanie energii WiFi na obu płytkach (`WiFi.setSleep(false)`). Domyślnie ESP32 usypia radio między sygnałami beacon i odbiera dane z opóźnieniem do jednego okresu DTIM punktu dostępowego — to podnosi ping i może wyzwalać failsafe (300 ms) mimo dobrego sygnału. Kosztem jest kilkadziesiąt mA większego poboru, pomijalne przy silniku
- połączenie z hotspotem iPhone'a ze stałym adresem IP (sekcja 3) i serwer WebSocket
- failsafe — brak ramki `drv` przez ok. 300 ms ustawia moc na 0 i **prostuje koła** (serwo na środek), żeby pojazd nie jechał „ostatnią komendą"; niezależnie regulator ma własne zabezpieczenie na zanik sygnału PWM (np. przy restarcie ESP32)
- E-STOP z zatrzaskiem (sekcja 4)
- pikanie buzzera przy cofaniu na podstawie tylnego czujnika (sekcja 4)
- auto-stop przed przeszkodą z przodu przy włączonym tempomacie (sekcja 4)
- światła automatyczne: reflektory stale (GPIO17), światła tylne przy jeździe wstecz (GPIO18)
- kierunkowskazy automatyczne: miganie (GPIO15/16) po stronie skrętu z `drv.s`, gdy włączone w `cfg.blk`
- włączanie/wyłączanie podświetlenia na polecenie aplikacji
- ograniczenie maksymalnej jasności taśmy WS2813
- obsługa DFPlayera: foldery, advert dla klaksonu przy grającym radiu, stan odtwarzania przez UART, wysyłany w telemetrii (pole `r`, sekcja 9)
- zapis ustawień do NVS z opóźnieniem po ostatniej zmianie

### Konsekwencje dla aplikacji

- Ramki sterujące wysyłane w stałym tempie (ok. 20 Hz), nawet gdy wartości się nie zmieniają — służą jednocześnie jako sygnał obecności. W tym samym rytmie aplikacja przelicza moc według tabeli pedałów.
- W React Native timery (`setInterval`) działają w wątku JavaScript. Ciężka praca w tym samym czasie (np. zapis każdej ramki telemetrii do SQLite) może opóźnić wysyłkę i wyzwolić failsafe. Ekran jazdy ma być lekki, a zapisy do bazy grupowane.
- Gdy aplikacja przejdzie w tło lub ekran się zablokuje, wysyłanie ustaje i failsafe zatrzyma pojazd — to zachowanie pożądane. Na ekranie jazdy blokujemy wygaszanie ekranu.
- Przy wideo w tej samej sieci sporadyczne przerwy dłuższe niż 300 ms są możliwe — timeout do dostrojenia w testach [SZACUNEK].

## 7. Dane i persystencja

- **SQLite w aplikacji** — profile kierowców (w tym stacja radia zapisana na ekranie Radio) i historia sesji. NOW PLAYING nie pochodzi z bazy, tylko z telemetrii (`r`)
- **NVS na ESP32** — kopia ustawień aktywnego profilu, żeby pojazd zachowywał konfigurację po restarcie bez czekania na telefon

### Profil kierowcy

Profil obejmuje wszystko z ekranów Drive settings, Light & sound i Radio:

| Pole | Zakres | Gdzie działa |
|---|---|---|
| nazwa | tekst, 1–12 znaków, unikalna (reguły niżej) | aplikacja |
| tryb skrętu | STICK / GYRO | tylko aplikacja |
| kamera | ON / OFF | tylko aplikacja |
| kierunkowskazy automatyczne | ON / OFF | firmware |
| limit mocy | 0–100 % | firmware |
| próg auto-stopu (tylko przy tempomacie) | 0–100 cm | firmware |
| kolor podświetlenia | 1 z 7 kolorów | firmware |
| jasność podświetlenia | 0–100 % | firmware |
| dźwięk klaksonu | numer pliku 1–6 | firmware |
| głośność (wspólna dla klaksonu i radia) | 0–30 | firmware |
| stacja radia | numer utworu 1–5 albo 0 = radio wyłączone | aplikacja wysyła `act radio` (sekcja 9) |

Przykładowe profile z makiet: KAROL, MAJA, DEMO/EXPO (limit 25 %), BENCH (limit 100 %).

### Zarządzanie profilami

- **Aktywacja:** dotknięcie karty profilu go zaznacza; na dole pojawia się przycisk „USE THIS PROFILE", który ustawia zaznaczony profil jako aktywny (znacznik ACTIVE). Przycisk nie pojawia się, gdy zaznaczony jest profil już aktywny. Po aktywacji aplikacja od razu wysyła ustawienia profilu do pojazdu (`cfg` i stację radia).
- **Nowy profil:** okno z nazwą; pozostałe pola dostają wartości domyślne.
- **Reguły nazwy** (przy tworzeniu i edycji): spacje na początku i końcu są obcinane; nazwa nie może być pusta, ma najwyżej 12 znaków (pole tekstowe nie pozwala wpisać więcej) i nie może powtarzać nazwy innego profilu. Duplikaty porównujemy bez rozróżniania wielkości liter, bo makiety pokazują nazwy wielkimi literami. Przy niepoprawnej nazwie (także przy duplikacie) przycisk CREATE / SAVE jest po prostu nieaktywny — bez dodatkowego komunikatu.
- **Edycja:** ikona ołówka otwiera okno z nazwą — edycja zmienia tylko nazwę. Parametry jazdy, światła i dźwięku zmienia się na ekranach Drive settings, Light & sound i Radio (dla aktywnego profilu).
- **Usuwanie:** ikona kosza, z oknem potwierdzenia. Aktywnego profilu nie można usunąć (brak ikony kosza) — zawsze istnieje co najmniej jeden profil.
- Sesje usuniętego profilu zostają w historii — sesja przechowuje nazwę kierowcy jako tekst.

### Zapisywanie ustawień

- Zmiany na ekranach Drive settings, Light & sound i Radio aplikacja wysyła do pojazdu na żywo (gdy jest połączenie), żeby od razu było widać i słychać efekt.
- SAVE zapisuje ustawienia w profilu (SQLite) i, gdy jest połączenie, wysyła je do pojazdu. Bez połączenia SAVE też działa, bez żadnego okienka — ustawienia trafią do pojazdu przy najbliższym połączeniu (synchronizacja, niżej).
- Wyjście z ekranu bez SAVE porzuca zmiany: aplikacja wysyła do pojazdu z powrotem zapisane wartości profilu (gdy jest połączenie) — także stację radia.
- To samo dotyczy wyjścia z aplikacji (przejście w tło albo zamknięcie) przed SAVE: zmiany nie są zapisywane. Aplikacja próbuje od razu wysłać do pojazdu zapisane wartości; jeśli się nie uda, pojazd dostanie je przy najbliższej synchronizacji (niżej).
- Firmware zapisuje ustawienia do NVS z opóźnieniem po ostatniej zmianie, żeby nie zapisywać flasha przy każdym ruchu suwaka.

### Synchronizacja po połączeniu

- Po każdym połączeniu aplikacja wysyła do pojazdu ustawienia aktywnego profilu (`cfg` ze wszystkimi polami); pojazd je stosuje i zapisuje w NVS.
- Radio: po pierwszej ramce telemetrii aplikacja porównuje `r` ze stacją zapisaną w profilu i tylko przy różnicy wysyła `act radio` — dzięki temu utwór, który już gra, nie zaczyna się od nowa po chwilowej utracie łącza.
- Aplikacja nie porównuje ich z tym, co pojazd miał zapisane, i nic nie pokazuje użytkownikowi — źródłem prawdy jest zawsze aktywny profil w aplikacji.

### Sesja jazdy

Sesja trwa od wejścia na ekran jazdy (DRIVE albo START DRIVING) do wyjścia z niego — przez menu do innego ekranu albo przyciskiem QUIT w okienku CONNECTION LOST (sekcja 3). Samo otwarcie menu i powrót przyciskiem BACK TO DRIVING nie kończą sesji (otwarcie menu włącza E-STOP — sekcja 4). Przy końcu sesji aplikacja wysyła moc 0 i skręt 0 (koła prosto, więc kierunkowskazy gasną) i wyłącza tempomat, a dopiero potem przestaje wysyłać ramki `drv` — nie polega wyłącznie na failsafe. Dla każdej sesji aplikacja zapisuje:

- datę, nazwę kierowcy, czas trwania;
- najmniejszą odległość z przodu i z tyłu;
- min / średnią / max dla: mocy (AVG. POWER, %), pingu, jittera, RSSI, temperatury ESP.

Statystyki mocy liczone są z wartości bezwzględnej (0–100 %): jazda wstecz liczy się tak samo jak do przodu. Możliwe usunięcie całej historii (z potwierdzeniem). Surowej telemetrii nie zapisujemy co ramkę — min/średnią/max liczymy w pamięci w trakcie sesji i zapisujemy wynik na końcu.

## 8. Stack aplikacji

- React Native + Expo, tylko iOS
- WebSocket (wbudowany w React Native) — sterowanie i telemetria
- `react-native-webview` — strumień MJPEG
- `expo-sqlite` — baza lokalna
- `expo-sensors` — akcelerometr telefonu (tryb GYRO)
- `expo-screen-orientation` (jazda poziomo, reszta pionowo), `expo-keep-awake` (brak wygaszania ekranu podczas jazdy)
- multi-touch na ekranie jazdy — drążek skrętu i pedał jednocześnie dwoma palcami (np. `react-native-gesture-handler`)

Wszystkie te biblioteki działają w Expo Go, więc do pisania i testowania wystarczy Expo Go na iPhonie. Komputer z serwerem deweloperskim (Metro) musi być wtedy podłączony do tego samego hotspotu iPhone'a (albo trzeba użyć trybu tunnel). Instalacja jako osobna aplikacja wymaga development buildu i konta Apple.

### Pułapki iOS

- **Dostęp do sieci lokalnej.** Od iOS 14 łączenie z urządzeniami w sieci lokalnej wymaga zgody użytkownika i opisu `NSLocalNetworkUsageDescription`. Expo Go ma go u siebie; w development buildzie trzeba go dodać w `app.json` (`ios.infoPlist`).
- **Połączenia nieszyfrowane (`ws://`, `http://`).** W development buildzie potrzebny jest wyjątek App Transport Security: `NSAppTransportSecurity → NSAllowsLocalNetworking: true` (w `ios.infoPlist`). W Expo Go zwykle działa bez konfiguracji; problem ujawnia się dopiero w buildzie.

## 9. Protokół

Format: JSON, krótkie klucze, liczby całkowite. Cały protokół jest szkicem roboczym [PROPOZYCJA] — do uzgodnienia między osobą piszącą aplikację a osobą piszącą firmware.

Adresy: główny ESP32 — WebSocket `ws://172.20.10.13/ws` (port 80), Xiao `172.20.10.14` (strumień `http://172.20.10.14:81/stream`).

Konwencje: moc dodatnia = do przodu, ujemna = do tyłu; skręt `-1` = pełny w lewo, `0` = prosto, `1` = pełny w prawo; odległości w cm; procenty 0–100. Konwencje i jednostki są zapisane tylko tutaj, a nie w ramkach. Każda zmiana protokołu = zmiana tej sekcji i podbicie wersji firmware (`fw` w `hello`).

### Aplikacja → pojazd

| Wiadomość | Znaczenie |
|---|---|
| `{"t":"drv","g":34,"s":-1,"c":0}` | sterowanie, ok. 20 Hz, także przy włączonym tempomacie. `g` moc −100…100 (liczona w aplikacji wg tabeli pedałów), `s` skręt -1/0/1 (firmware: 1250/1500/1750 µs), `c` = 1 gdy tempomat włączony (włącza auto-stop z przodu). Limit mocy nakłada firmware |
| `{"t":"act","a":"horn"}` | klakson (plik wybrany w `cfg.horn`); z polem `n`, np. `{"t":"act","a":"horn","n":2}`, odtwarza konkretny plik — dla TEST HORN |
| `{"t":"act","a":"led","on":1}` | przycisk LED: podświetlenie wł. (`1`) / wył. (`0`) |
| `{"t":"act","a":"estop","on":1}` | włącza E-STOP (zatrzask w firmware); `"on":0` zwalnia. Dopóki jest włączony, firmware ignoruje moc z `drv` |
| `{"t":"act","a":"radio","n":2}` | odtwarzaj utwór nr 2; `"n":0` zatrzymuje |
| `{"t":"cfg","limit":45,"stop":20,"blk":1,"led":"#639922","bri":60,"vol":22,"horn":3}` | ustawienia aktywnego profilu, zapisywane w NVS; można wysłać tylko zmienione pola. `limit` %, `stop` cm (próg auto-stopu), `blk` = 1 gdy kierunkowskazy automatyczne włączone, `led` kolor, `bri` %, `vol` 0–30, `horn` 1–6 |
| `{"t":"ping","id":17}` | pomiar opóźnienia, ok. 1 Hz |

Tryb skrętu (STICK/GYRO) i model pedałów działają wyłącznie w aplikacji — pojazd dostaje tylko wynik w ramce `drv`.

### Pojazd → aplikacja

| Wiadomość | Znaczenie |
|---|---|
| `{"t":"hello","fw":"0.4"}` | zaraz po połączeniu: wersja firmware (aplikacja może ją pokazać w logach / przy diagnostyce) |
| `{"t":"tel","d1":84,"d2":-1,"rssi":-54,"temp":47,"es":0,"as":0,"r":2}` | telemetria, 5–10 Hz. `d1` przód (czujnik #1), `d2` tył (czujnik #2): liczba = cm, `-1` = nic w zasięgu, `null` = błąd czujnika. `rssi` dBm, `temp` °C chipu, `es` = 1 gdy E-STOP aktywny, `as` = 1 gdy auto-stop zatrzymał pojazd, `r` = numer odtwarzanego utworu radia (1–5), `0` = radio nie gra. `r` dotyczy tylko radia (folder `/02/`) — klakson go nie zmienia |
| `{"t":"pong","id":17}` | odpowiedź na ping |

## 10. Funkcje wymagane zakresem pracy

| Wymaganie | Realizacja |
|---|---|
| zdalne sterowanie pojazdem z aplikacji mobilnej | ekran jazdy (01–07) |
| podgląd wideo z pojazdu | ekran jazdy (01–07) |
| wizualizacja telemetrii z czujników | podsumowanie sesji (15–17): najmniejsza odległość przód/tył, statystyki mocy, łącza i temperatury |
| profil kierowcy z personalizacją (kolor podświetlenia, dźwięk klaksonu, parametry jazdy) | profile, ustawienia jazdy, światło i dźwięk (10, 11, 13, 14) |
| historia sesji i zdarzeń zapisywana w bazie danych | historia sesji (15–17); osobnej listy zdarzeń ekrany nie mają |
| sygnalizacja dźwiękowa i świetlna sterowana z aplikacji | klakson, radio, podświetlenie (przycisk LED, kolor i jasność z profilu); automatycznie: kierunkowskazy przy skręcie, pikanie i światła tylne przy cofaniu |

## 11. Ekrany

Język interfejsu: angielski. Numery odpowiadają makietom (numer 12 nie występuje). Jeśli makieta różni się od tego opisu, obowiązuje opis.

### Makiety

Makiety to jeden statyczny plik HTML ze wszystkimi ekranami. Każdy stan ekranu to osobna sekcja `<section id="screen-NN">` z numerem ekranu (np. `screen-01a`), więc konkretny ekran łatwo znaleźć w pliku. Pokazują tylko wygląd — kolory, czcionki, odstępy i teksty można odczytać wprost z kodu. Zachowanie aplikacji opisuje ten dokument.

- **Wymiary trzeba przeskalować, a nie kopiować w punktach.** Ekran poziomy w makiecie ma 812×440, a iPhone 12–14 w poziomie ma 844×390 punktów (iPhone 15 ok. 852×393) — makieta jest o ok. 50 punktów wyższa niż prawdziwy ekran, więc po skopiowaniu wymiarów drążek i pedały wyszłyby poza ekran. Ekran pionowy w makiecie ma 372×844, iPhone 12–14 ma 390×844. Układ dopasowujemy do rzeczywistego rozmiaru ekranu, zachowując rozmieszczenie i proporcje elementów.
- **Obszar bezpieczny (safe area).** Makiety nie uwzględniają wycięcia ekranu (notch / Dynamic Island) ani paska stanu. W poziomie wycięcie zasłania kilkadziesiąt punktów z boku, w pionie górne elementy (np. „HELLO KAROL”) trafiłyby pod pasek stanu. Aplikacja używa `react-native-safe-area-context` (`SafeAreaView` / `useSafeAreaInsets`).
- **Czcionki:** Saira Condensed (700, kursywa) — nagłówki, wartości i przyciski; JetBrains Mono (500/700, wielkie litery) — etykiety i dane. Obie z Google Fonts (licencja OFL), dołączone do aplikacji. Saira Condensed nie ma wersji kursywnej — przeglądarka tylko pochyla zwykłą. Nie wiadomo, czy iOS w React Native zrobi to samo dla czcionki dołączonej do aplikacji — do sprawdzenia na samym początku pracy. Jeśli tekst wyjdzie prosty, obejście to pochylenie przez `transform: [{ skewX: '-10deg' }]`.
- **Zaślepki:** pasiasty prostokąt „camera frame” to miejsce na strumień MJPEG z kamery (sekcja 8), a rysunek auta na ekranie głównym zostanie zastąpiony właściwym obrazkiem.

### Jazda — orientacja pozioma

Wspólne elementy: przycisk menu, imię kierowcy i czas sesji, wskaźnik jakości łącza (kafelek pod imieniem i czasem: cztery kreski i ping w ms, sekcja 3), obraz z kamery, CRUISE (nieaktywny przy mocy 0 i ujemnej), E-STOP, HORN, LED (podświetlenie), wskaźnik POWER (%), pedały REV i FWD.

- **01 Stick drive** — skręt okrągłym drążkiem (liczy się tylko lewo / środek / prawo); na makiecie gałka wychylona w lewo.
- **01A Stick drive — idle** — postój, moc 0 %, CRUISE wyszarzony (niedostępny przy mocy 0).
- **02 Cruise engaged** — przycisk CRUISE podświetlony (wypełniony), wskaźnik podpisany CRUISE.
- **03 E-STOP engaged** — E-STOP podświetlony na czerwono (bez dodatkowego napisu; zwalnia się przytrzymaniem przez ok. 1 s); wskaźnik 0 %, pedały i CRUISE nieaktywne, drążek, HORN i LED działają normalnie.
- **04 Gyro drive** — bez drążka; pedał REV po lewej, FWD po prawej; przyciski HORN i LED.
- **05 Camera off** — kamera wyłączona w Drive settings; w miejscu obrazu „CAMERA OFF", sterowanie działa normalnie.
- **06 Connection lost — popup** — okienko „CONNECTION LOST" z RETRY / QUIT na przyciemnionym ekranie jazdy, który zastygł w ostatnim stanie. Wskaźnik łącza pokazuje „— MS”, wszystkie kreski zgaszone, kafelek czerwony. RETRY — ponowna próba połączenia, QUIT — koniec sesji i powrót do ekranu głównego. Po odzyskaniu połączenia ekran jazdy ładuje się od nowa (moc 0).
- **07 Menu while driving** — menu nałożone na ekran jazdy, przycisk BACK TO DRIVING. Otwarcie menu włącza E-STOP (w tle E-STOP aktywny, moc 0 %); po powrocie ekran wygląda jak 03 (E-STOP aktywny).

### Postój — orientacja pionowa

- **08 Home** — kafelki: DRIVER (aktywny profil), CONNECTION (ONLINE ze wskaźnikiem jakości łącza), STEERING (tryb skrętu), POWER LIMIT; przycisk DRIVE.
- **08A Home — car offline** — kafelek CONNECTION: OFFLINE, przycisk DRIVE nieaktywny.
- **09 Menu** — Home, Drive settings, Driver profiles, Radio, Light & sound, Telemetry.
- **10 Driver profiles** — karty profili: kwadracik z kolorem przed nazwą; karta aktywnego profilu ma dodatkowo LIMIT, HORN i znacznik ACTIVE. Ikony edycji (ołówek) i usuwania (kosz); aktywny profil nie ma kosza. Na dole „+ NEW PROFILE".
- **10A Profile selected** — zaznaczona karta (np. MAJA) wyróżniona, na dole „USE THIS PROFILE".
- **11 New profile** — okno z polem nazwy (na makiecie pustym) i przyciskiem CREATE (nieaktywny przy niepoprawnej nazwie, także przy duplikacie; reguły w sekcji 7).
- **11A Edit profile** — jak New profile, z wypełnioną nazwą i przyciskiem SAVE.
- **11B Delete profile — confirm** — „DELETE MAJA'S PROFILE?" CANCEL / DELETE (DELETE na czerwono).
- **13 Drive settings** — STEERING MODE (STICK / GYRO), POWER LIMIT (0–100 %), AUTO-STOP (0–100 cm, działa tylko przy tempomacie), BLINKERS OFF / ON (kierunkowskazy automatyczne), CAMERA OFF / ON, SAVE.
- **14 Light & sound** — UNDERGLOW: 7 kolorów i jasność; HORN: lista 6 dźwięków (01 BEEP … 06 SIREN); VOLUME (0–30); TEST HORN (dźwięk na pojeździe); SAVE.
- **15 Telemetry — session summary** — przełączanie sesji strzałkami (data, kierowca, czas); CLOSEST FRONT, CLOSEST REAR; AVG. POWER (%), AVG. PING, AVG. JITTER, AVG. RSSI, AVG. ESP TEMP — każda ze średnią, min i max; CLEAR HISTORY.
- **16 Clear history — confirm** — „CLEAR HISTORY?" CANCEL / CLEAR (CLEAR na czerwono).
- **17 Telemetry — no sessions** — stan pusty z przyciskiem START DRIVING.
- **18 Radio** — NOW PLAYING (z telemetrii), VOLUME (ta sama wartość co na ekranie 14), lista: „OFF” (radio wyłączone) i 5 stacji; dotknięcie = zaznaczenie i odtwarzanie na pojeździe, ikonka korektora przy stacji, która faktycznie gra; SAVE (zapis zaznaczonej stacji i głośności w profilu).
- **18A Radio — stopped** — zaznaczone „OFF”, NOW PLAYING „—”.
- **19 No connection — error popup** — okienko „NO CONNECTION" z przyciskiem CLOSE, pokazywane na ekranach pionowych przy akcji wymagającej połączenia: TEST HORN i wybór stacji radia (sekcja 3); na makiecie na ekranie Light & sound.

## 12. Stałe do dobrania i rzeczy do sprawdzenia

### Stałe do dobrania w testach

Wszystkie poniższe to stałe w kodzie — nie ma ich w ustawieniach aplikacji. Wartości wstępne [SZACUNEK]. (Ustawieniami w aplikacji są tylko pola profilu z sekcji 7.)

| Stała | Gdzie | Wartość wstępna |
|---|---|---|
| rozpędzanie 0 → 100 % (pedał w kierunku jazdy) | aplikacja | ok. 4 s |
| zwalnianie 100 → 0 % (żaden pedał) | aplikacja | ok. 6 s |
| hamowanie 100 → 0 % (pedał przeciwny) | aplikacja | ok. 3 s |
| próg przechyłu GYRO / powrót na prosto | aplikacja | ok. 15° / ok. 10° |
| strefa martwa drążka STICK | aplikacja | mała, do dobrania |
| czas przytrzymania do zwolnienia E-STOP | aplikacja | ok. 1 s |
| timeout failsafe (brak ramki `drv`) | firmware | ok. 300 ms |
| impuls hamujący przy auto-stopie | firmware | ok. 30 % przez 0,3 s |
| pikanie przy cofaniu: początek / ciągły dźwięk | firmware | od ok. 30 cm / poniżej ok. 10 cm |
| maksymalna jasność taśmy WS2813 (= 100 % w aplikacji) | firmware | ok. 40–60 % pełnej mocy |
| brak telemetrii do pokazania CONNECTION LOST | aplikacja | ok. 2 s |
| wskaźnik jakości łącza: progi dla 4 / 3 / 2 kresek (poniżej — 1 kreska) | aplikacja | RSSI ≥ −55 / −65 / −75 dBm i ping (średnia z 3) ≤ 30 / 50 / 100 ms; 1 kreska także przy > 0,5 s bez telemetrii |


### Do sprawdzenia na sprzęcie

1. Łączność aplikacji na iPhonie z płytkami podłączonymi do jego hotspotu i zakres adresów `172.20.10.x` (sekcja 3) — najlepiej jako pierwszy test.
2. Próg AUTO-STOP: czy przy różnych mocach tempomatu auto zatrzymuje się przed przeszkodą.
3. Dane WS2813 z 3,3 V bez konwertera poziomów (decyzja schematu: tylko R2 330 Ω). WS2813 przy 5 V formalnie oczekuje ok. 3,5 V na wejściu — jeśli pojawi się migotanie lub złe kolory: skrócić przewód danych, a w kolejnej rewizji płytki rozważyć 74AHCT125.
4. Prąd na pin dla diod sterowanych wprost z GPIO — nie więcej niż ok. 10 mA.
5. Buzzer ST1143 wyzwalany stanem wysokim z 3,3 V (GPIO7, bez tranzystora na płytce).
6. Kolejność żył przewodu Grove taśmy względem J_LED (pin 1 GND, 2 +5V, 3 n.c., 4 DIN).
7. Pobór z szyny 5 V pod obciążeniem (taśma + ESP32 z WiFi + DFPlayer + Xiao) względem LM2596 (realnie ok. 2 A bez radiatora).

## 13. Kosztorys — stan i braki

Aktualny: `WebCar_Kosztorys-5.pdf`, suma **1336 zł** (płytka ESP32 99, DFPlayer 25, TT-02D Drift 589, ESC 169, serwo 31, LM2596 9, 2× VL53L0X 134, buzzer 5, taśma WS2813 35, głośnik 12, adaptery 28, akumulator 155, ładowarka 45).

Pozycje bez ceny (do uzupełnienia po zakupie): 7 złącza akumulatora, 8 bezpiecznik 15 A, 12 diody LED, 14 karta microSD, 15 kamera Xiao ESP32-S3 Sense, 16 płytka główna, 17 rezystory, 21 przewody, 22 wyłącznik główny, 23 bezpiecznik 3 A, 24 kondensatory, 25 złącza płytki, 26 radiator.

## 14. Montaż, okablowanie i bezpieczeństwo

Przeniesione z planu pracy — nadal aktualne.

### Przed pierwszym zasilaniem

- **LM2596 ustawić na 5,0 V miernikiem, bez podłączonej elektroniki.** Przetwornica przychodzi z przypadkowym napięciem — np. 15 V na szynie 5 V od razu uszkodzi ESP32 i peryferia.
- Sprawdzić adaptery i złącza akumulatora oraz polaryzację.
- **Kalibracja ESC:** przy pierwszym uruchomieniu zakres gazu wg instrukcji Hobbywing; przy montażu przestawić zworkę na Fwd/Rev (sekcja 4).
- **Pierwsze próby jazdy z kołami w powietrzu.**

### Pułapki

- **Wspólna masa.** Akumulator, ESC, LM2596, oba ESP32, serwo, czujniki, LED, DFPlayer — wszystkie GND w jednym punkcie. Brak wspólnej masy to najczęstsza przyczyna losowych objawów: niedziałający PWM, resety, migotanie LED, gubienie I²C.
- **BEC 6 V i LM2596 5 V — nie łączyć wyjść** (sekcja 2), tylko masy.
- **Bilans prądowy 5 V.** WS2813 do ~1,8 A + ESP32 z WiFi 0,3–0,5 A + DFPlayer (szpilki 0,5–1 A) + Xiao ~0,3 A może przekroczyć realne ~2 A LM2596 bez radiatora [SZACUNEK]. Dlatego firmware ogranicza jasność taśmy; w razie problemów: radiator, mocniejsza przetwornica (5 A) albo osobne zasilanie taśmy.
- **Adresacja dwóch VL53L0X.** Oba mają domyślnie 0x29. Przy starcie: oba XSHUT = LOW → zwolnić #1 i nadać 0x30 → zwolnić #2 i nadać 0x31. Wejście XSHUT na płytce Pololu nie ma konwersji poziomów i nie toleruje 5 V — bezpieczniej „zwalniać" je, przełączając pin na wejście (płytka sama podciąga XSHUT), zamiast wystawiać stan wysoki.
- **Rezystor 1 kΩ na RX DFPlayera jest obowiązkowy** (R1 na płytce) — bez niego szumy i niestabilny UART. Przewody audio z dala od przewodów silnika.
- **Zakłócenia od silnika (EMI).** Szczotkowy RS-540 mocno zakłóca. Przewody sygnałowe (I²C, UART, dane LED) krótkie i z dala od przewodów silnika; kondensatory 0,1 µF na silniku; skręcanie par przewodów.
- **Bezpiecznik 15 A a prąd rozruchowy.** RS-540 przy starcie lub zablokowanych kołach pobiera chwilowo więcej niż 15 A. Jeśli bezpiecznik przepala się przy normalnej jeździe — dobrać wyższą wartość, ale nigdy powyżej obciążalności przewodów.
- **Piny ESP32-S3** — tylko piny ze schematu; nie podłączać niczego do GPIO0/3/45/46, 19/20, 26–37 (sekcja 2).
- **Dwa nadajniki WiFi blisko siebie** mogą się zakłócać — stąd oba ESP32 jako klienci jednego hotspotu (sekcja 3).

### Akumulator LiPo

- Ładować wyłącznie ładowarką z balanserem 2S, nie zostawiać bez nadzoru.
- Nie rozładowywać poniżej ok. 3,3 V na ogniwo (pomaga LVC regulatora), nie zwierać.
- Spuchnięty lub uszkodzony pakiet wycofać z użycia.

### Przewody

| Odcinek | Przekrój / typ | Uwagi |
|---|---|---|
| akumulator → bezpiecznik → ESC | 14–16 AWG, silikon | wysoki prąd silnika; krótkie |
| ESC → silnik | fabryczne / 16 AWG | |
| węzeł 7,4 V → LM2596 | 18–20 AWG | |
| szyna 5 V → J_5V | 20 AWG | do ok. 2–3 A |
| zasilanie taśmy WS2813 | 20 AWG | do ~1,8 A |
| sygnały GPIO / I²C / UART | 24–26 AWG | jak najkrótsze, z dala od silnika |
| ESC / serwo | przewody serwo RC | złącza JR/Futaba |

### Etapy pracy

Każdy podzespół uruchamiać i testować osobno, dopiero potem integrować.

0. Przygotowanie: złącza, ustawienie LM2596, naładowanie akumulatora.
1. Podwozie i napęd bez ESP32: montaż, ESC + silnik, kalibracja, test testerem serwa.
2. Główny ESP32: zasilanie z 5 V, PWM na GPIO4/5, kalibracja środka skrętu.
3. Peryferia na płytce głównej: VL53L0X (XSHUT), taśma WS2813, diody LED, buzzer, DFPlayer + karta SD.
4. Kamera Xiao osobno: CameraWebServer, stały adres w hotspocie (sekcja 3).
5. Integracja w pojeździe: rozmieszczenie, wspólna masa, kondensatory, pobór prądu pod obciążeniem.
6. Firmware docelowy (sekcja 6), aplikacja (sekcje 7–11), testy zasięgu, opóźnień i failsafe, dokumentacja pracy.
