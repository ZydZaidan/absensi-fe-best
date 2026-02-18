import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa' // Import ini

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: '/smart-presence-best', // ID unik aplikasi
        start_url: '.',
        display: 'standalone', // Menghilangkan bar navigasi browser
        orientation: 'portrait',
        name: 'Smart Presence PT BEST',
        short_name: 'PresenceBEST',
        description: 'Aplikasi Absensi Karyawan PT BEST',
        theme_color: '#2563eb', // Warna Biru Dashboard kamu
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})