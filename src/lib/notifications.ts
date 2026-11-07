/**
 * Módulo de Notificações Nativas do Navegador (Web Notifications API)
 * Alertas diretos no Windows / Mac / Linux / Android sem dependência de serviços externos.
 */

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendLocalPriceAlert(
  gameTitle: string,
  priceBRL: string,
  gameUrl: string = '/'
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notification = new Notification(`🎯 Alerta de Preço: ${gameTitle}`, {
        body: `O jogo atingiu a meta de R$ ${priceBRL}! Clique para aproveitar a oferta.`,
        icon: '/logo-mark.png',
        badge: '/logo-mark.png',
      });

      notification.onclick = () => {
        window.focus();
        window.location.href = gameUrl;
      };

      return true;
    } catch (e) {
      console.warn('Erro ao disparar notificação nativa:', e);
    }
  }

  return false;
}
