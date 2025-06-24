import { lazy, LazyExoticComponent, ComponentType } from 'react';

// Extend the lazy component type to include preload method
type PreloadableComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<void>;
};

/**
 * Enhanced lazy loading with preload capability
 * Allows components to be preloaded before they're actually rendered
 */
export function lazyWithPreload<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const Component = lazy(importFunc) as PreloadableComponent<T>;
  Component.preload = importFunc as () => Promise<void>;
  return Component;
}

/**
 * Preload components when the app is idle
 */
export function preloadComponents(components: PreloadableComponent<any>[]) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      components.forEach(component => component.preload());
    });
  } else {
    // Fallback for browsers that don't support requestIdleCallback
    setTimeout(() => {
      components.forEach(component => component.preload());
    }, 1);
  }
}