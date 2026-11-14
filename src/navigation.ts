import { router, type Href } from 'expo-router';

export function navigateFromMenu(href: Href) {
  if (router.canDismiss()) {
    router.dismissAll();
  }
  if (href !== '/') {
    router.push(href);
  }
}
