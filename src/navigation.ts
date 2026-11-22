import { router, type Href } from 'expo-router';

// Otwiera menu (09). `from` to ścieżka bieżącego ekranu — menu wyróżnia jego pozycję.
export function openMenu(from: string) {
  router.push({ pathname: '/menu', params: { from } });
}

export function navigateFromMenu(href: Href) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  if (href !== '/') {
    router.push(href);
  }
}
