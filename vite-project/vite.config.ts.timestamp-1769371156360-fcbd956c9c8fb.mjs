// vite.config.ts
import { defineConfig } from "file:///D:/DEV/NANDU/simple-vue-chat/v2/vue3-tailwindcss4-starter/vite-project/node_modules/.pnpm/vite@5.4.20_lightningcss@1.30.1_terser@5.44.0/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/DEV/NANDU/simple-vue-chat/v2/vue3-tailwindcss4-starter/vite-project/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vi_517e3b7846f688d2d3c1547410b3183e/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import tailwindcss from "file:///D:/DEV/NANDU/simple-vue-chat/v2/vue3-tailwindcss4-starter/vite-project/node_modules/.pnpm/@tailwindcss+vite@4.1.14_vi_3121b6ff160498fdd03c972776456de7/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    host: "127.0.0.1",
    port: 3e3,
    proxy: {
      "/api/v1": {
        target: "https://fmcg-agent.elevatics.site",
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, _req, _res) => {
            proxyReq.setHeader("X-API-Key", "44d5c2ac18ced6fc25c1e57dcdfygmdmrstt4577bf56e67540671a647465df4");
          });
          proxy.on("proxyRes", (proxyRes, _req, _res) => {
            delete proxyRes.headers["x-served-by"];
            delete proxyRes.headers["server"];
            proxyRes.headers["x-powered-by"] = "Vue Chat App";
            proxyRes.headers["server"] = "Vite Dev Server";
          });
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxERVZcXFxcTkFORFVcXFxcc2ltcGxlLXZ1ZS1jaGF0XFxcXHYyXFxcXHZ1ZTMtdGFpbHdpbmRjc3M0LXN0YXJ0ZXJcXFxcdml0ZS1wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxERVZcXFxcTkFORFVcXFxcc2ltcGxlLXZ1ZS1jaGF0XFxcXHYyXFxcXHZ1ZTMtdGFpbHdpbmRjc3M0LXN0YXJ0ZXJcXFxcdml0ZS1wcm9qZWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9ERVYvTkFORFUvc2ltcGxlLXZ1ZS1jaGF0L3YyL3Z1ZTMtdGFpbHdpbmRjc3M0LXN0YXJ0ZXIvdml0ZS1wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ0B0YWlsd2luZGNzcy92aXRlJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3Z1ZSgpLCB0YWlsd2luZGNzcygpXSxcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogJzEyNy4wLjAuMScsXG4gICAgcG9ydDogMzAwMCxcbiAgICBwcm94eToge1xuICAgICAgJy9hcGkvdjEnOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHBzOi8vZm1jZy1hZ2VudC5lbGV2YXRpY3Muc2l0ZScsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCBfcmVxLCBfcmVzKSA9PiB7XG4gICAgICAgICAgICAvLyBBZGQgQVBJIGtleSB0byBhbGwgcmVxdWVzdHNcbiAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignWC1BUEktS2V5JywgJzQ0ZDVjMmFjMThjZWQ2ZmMyNWMxZTU3ZGNkZnlnbWRtcnN0dDQ1NzdiZjU2ZTY3NTQwNjcxYTY0NzQ2NWRmNCcpXG4gICAgICAgICAgfSlcbiAgICAgICAgICBcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIF9yZXEsIF9yZXMpID0+IHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBvciBtb2RpZnkgaGVhZGVycyB0aGF0IHJldmVhbCB0aGUgZXh0ZXJuYWwgZG9tYWluXG4gICAgICAgICAgICBkZWxldGUgcHJveHlSZXMuaGVhZGVyc1sneC1zZXJ2ZWQtYnknXVxuICAgICAgICAgICAgZGVsZXRlIHByb3h5UmVzLmhlYWRlcnNbJ3NlcnZlciddXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2V0IGN1c3RvbSBoZWFkZXJzIHRvIG1hc2sgdGhlIG9yaWdpblxuICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1sneC1wb3dlcmVkLWJ5J10gPSAnVnVlIENoYXQgQXBwJ1xuICAgICAgICAgICAgcHJveHlSZXMuaGVhZGVyc1snc2VydmVyJ10gPSAnVml0ZSBEZXYgU2VydmVyJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtaLFNBQVMsb0JBQW9CO0FBQy9hLE9BQU8sU0FBUztBQUNoQixPQUFPLGlCQUFpQjtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQzlCLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFdBQVc7QUFBQSxRQUNULFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxNQUFNLFNBQVM7QUFFN0MscUJBQVMsVUFBVSxhQUFhLGlFQUFpRTtBQUFBLFVBQ25HLENBQUM7QUFFRCxnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLE1BQU0sU0FBUztBQUU3QyxtQkFBTyxTQUFTLFFBQVEsYUFBYTtBQUNyQyxtQkFBTyxTQUFTLFFBQVEsUUFBUTtBQUdoQyxxQkFBUyxRQUFRLGNBQWMsSUFBSTtBQUNuQyxxQkFBUyxRQUFRLFFBQVEsSUFBSTtBQUFBLFVBQy9CLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
