// Service Worker pour Noxis PWA
const CACHE_NAME = 'noxis-v1'
const STATIC_CACHE = 'noxis-static-v1'

// Fichiers à mettre en cache
const STATIC_FILES = [
  '/',
  '/today',
  '/tasks',
  '/projects',
  '/auth/sign-in',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
]

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Service Worker: Skip waiting')
        return self.skipWaiting()
      })
  )
})

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('Service Worker: Claiming clients')
      return self.clients.claim()
    })
  )
})

// Stratégie de cache pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requêtes non-HTTP
  if (!request.url.startsWith('http')) return

  // Stratégie Cache First pour les fichiers statiques
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request)
        })
    )
    return
  }

  // Stratégie Network First pour les API Supabase
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cloner la réponse car elle ne peut être consommée qu'une fois
          const responseClone = response.clone()
          
          // Mettre en cache seulement les réponses réussies
          if (response.status === 200) {
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          
          return response
        })
        .catch(() => {
          // En cas d'échec réseau, essayer le cache
          return caches.match(request)
        })
    )
    return
  }

  // Stratégie Network First pour les autres requêtes
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request)
      })
  )
})

// Gestion des notifications push (pour les futures fonctionnalités)
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/icons/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icons/icon-192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification
  const action = event.action

  if (action === 'close') {
    notification.close()
  } else {
    // Ouvrir l'application
    event.waitUntil(
      clients.openWindow('/')
    )
    notification.close()
  }
})

// Synchronisation en arrière-plan (pour les futures fonctionnalités)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Ici on pourrait synchroniser les données hors ligne
      console.log('Background sync triggered')
    )
  }
})
