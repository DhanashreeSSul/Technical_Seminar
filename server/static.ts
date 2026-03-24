import type { Express } from "express";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

export async function serveStatic(app: Express) {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    // Development: Use Vite's dev middleware for hot-reload
    // Uses the project's vite.config.ts which has root: "client/" and @ aliases
    const vite = await createViteServer({
      configFile: path.resolve(rootDir, "vite.config.ts"),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware attached");
  } else {
    // Production: Serve pre-built static files
    const staticPath = path.resolve(rootDir, "dist/public");
    app.use(express.static(staticPath));

    // Fallback for SPA routing
    app.get("*", (_req, res) => {
      const indexPath = path.resolve(staticPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          res.status(404).send("Not found");
        }
      });
    });
  }
}
