import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JMNL Productivity',
    short_name: 'JMNL Productivity',
    description: 'Application de productivité personnelle avec gestion des tâches et projets',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0b12',
    theme_color: '#7c3aed',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    categories: ['productivity', 'utilities'],
    lang: 'fr'
  }
}
