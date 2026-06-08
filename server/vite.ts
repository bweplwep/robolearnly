import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // dev mode only
  const serverOptions = { middlewareMode: true, hmr: { server }, allowedHosts: true as const };
  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: { ...viteLogger, error: (msg) => { viteLogger.error(msg); process.exit(1); } },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Несколько вариантов путей — один из них сработает
  const possiblePaths = [
    path.resolve(import.meta.dirname, "dist", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(import.meta.dirname, "..", "dist", "public")
  ];

  let distPath = possiblePaths[0];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      distPath = p;
      break;
    }
  }

  console.log(`[Production] Trying to serve from: ${distPath}`);
  console.log(`Current directory: ${process.cwd()}`);

  if (!fs.existsSync(distPath)) {
    console.error("❌ dist/public not found!");
    throw new Error(`Build folder not found: ${distPath}`);
  }

  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  console.log(`✅ Serving static files from ${distPath}`);
}