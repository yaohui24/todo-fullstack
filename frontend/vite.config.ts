import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite 配置：注册 React 和 Tailwind 两个插件
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
