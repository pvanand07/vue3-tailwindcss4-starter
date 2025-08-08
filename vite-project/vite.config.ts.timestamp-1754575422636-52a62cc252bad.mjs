// vite.config.ts
import { defineConfig } from "file:///D:/DEV/NANDU/simple-vue-chat/v2/vue3-tailwindcss4-starter/vite-project/node_modules/.pnpm/vite@5.4.19/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/DEV/NANDU/simple-vue-chat/v2/vue3-tailwindcss4-starter/vite-project/node_modules/.pnpm/@vitejs+plugin-vue@5.2.4_vite@5.4.19_vue@3.5.18/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import tailwindcss from "file:///D:/DEV/NANDU/simple-vue-chat/v2/vue3-tailwindcss4-starter/vite-project/node_modules/.pnpm/@tailwindcss+vite@4.1.11_vite@5.4.19/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    proxy: {
      "/api/v1/chat": {
        target: "http://localhost:8000",
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxERVZcXFxcTkFORFVcXFxcc2ltcGxlLXZ1ZS1jaGF0XFxcXHYyXFxcXHZ1ZTMtdGFpbHdpbmRjc3M0LXN0YXJ0ZXJcXFxcdml0ZS1wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxERVZcXFxcTkFORFVcXFxcc2ltcGxlLXZ1ZS1jaGF0XFxcXHYyXFxcXHZ1ZTMtdGFpbHdpbmRjc3M0LXN0YXJ0ZXJcXFxcdml0ZS1wcm9qZWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9ERVYvTkFORFUvc2ltcGxlLXZ1ZS1jaGF0L3YyL3Z1ZTMtdGFpbHdpbmRjc3M0LXN0YXJ0ZXIvdml0ZS1wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3Z1ZSgpLCB0YWlsd2luZGNzcygpXSxcclxuICBzZXJ2ZXI6IHtcclxuICBwcm94eToge1xyXG4gICAgJy9hcGkvdjEvY2hhdCc6IHtcclxuICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcclxuICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcclxuICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIF9yZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgIC8vIEFkZCBBUEkga2V5IHRvIGFsbCByZXF1ZXN0c1xyXG4gICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdYLUFQSS1LZXknLCAnNDRkNWMyYWMxOGNlZDZmYzI1YzFlNTdkY2RmeWdtZG1yc3R0NDU3N2JmNTZlNjc1NDA2NzFhNjQ3NDY1ZGY0JylcclxuICAgICAgICB9KVxyXG4gICAgICAgIFxyXG4gICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcycsIChwcm94eVJlcywgX3JlcSwgX3JlcykgPT4ge1xyXG4gICAgICAgICAgLy8gUmVtb3ZlIG9yIG1vZGlmeSBoZWFkZXJzIHRoYXQgcmV2ZWFsIHRoZSBleHRlcm5hbCBkb21haW5cclxuICAgICAgICAgIGRlbGV0ZSBwcm94eVJlcy5oZWFkZXJzWyd4LXNlcnZlZC1ieSddXHJcbiAgICAgICAgICBkZWxldGUgcHJveHlSZXMuaGVhZGVyc1snc2VydmVyJ11cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gT3B0aW9uYWxseSBzZXQgY3VzdG9tIGhlYWRlcnMgdG8gbWFzayB0aGUgb3JpZ2luXHJcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWyd4LXBvd2VyZWQtYnknXSA9ICdWdWUgQ2hhdCBBcHAnXHJcbiAgICAgICAgICBwcm94eVJlcy5oZWFkZXJzWydzZXJ2ZXInXSA9ICdWaXRlIERldiBTZXJ2ZXInXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWtaLFNBQVMsb0JBQW9CO0FBQy9hLE9BQU8sU0FBUztBQUNoQixPQUFPLGlCQUFpQjtBQUd4QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztBQUFBLEVBQzlCLFFBQVE7QUFBQSxJQUNSLE9BQU87QUFBQSxNQUNMLGdCQUFnQjtBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsV0FBVyxDQUFDLE9BQU8sYUFBYTtBQUM5QixnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLE1BQU0sU0FBUztBQUU3QyxxQkFBUyxVQUFVLGFBQWEsaUVBQWlFO0FBQUEsVUFDbkcsQ0FBQztBQUVELGdCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsTUFBTSxTQUFTO0FBRTdDLG1CQUFPLFNBQVMsUUFBUSxhQUFhO0FBQ3JDLG1CQUFPLFNBQVMsUUFBUSxRQUFRO0FBR2hDLHFCQUFTLFFBQVEsY0FBYyxJQUFJO0FBQ25DLHFCQUFTLFFBQVEsUUFBUSxJQUFJO0FBQUEsVUFDL0IsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDQSxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
