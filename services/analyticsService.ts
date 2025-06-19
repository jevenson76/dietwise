
export const trackEvent = (eventName: string, eventDetails?: Record<string, any>): void => {
  console.log(`[Analytics] Event: ${eventName}`, eventDetails || '');
  // In a real app, this would integrate with an analytics library like Google Analytics 4:
  // if (typeof window !== 'undefined' && (window as any).gtag) {
  //   (window as any).gtag('event', eventName, eventDetails);
  // }
};
