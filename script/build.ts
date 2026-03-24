import { build as viteBuild } from "vite";
import { build as esbuild } from "esbuild";
import { rm, readFile } from "fs/promises";

const allowlist = [
  // React
  "react",
  "react-dom",
  // UI & Styling
  "class-variance-authority",
  "clsx",
  "tailwind-merge",
  "tailwindcss-animate",
  "@radix-ui/react-slot",
  // Forms & Validation
  "@hookform/resolvers",
  "react-hook-form",
  "zod",
  "zod-validation-error",
  // Data & State
  "@tanstack/react-query",
  "drizzle-zod",
  // Routing
  "wouter",
  // Animations
  "framer-motion",
  // Date handling
  "date-fns",
  "react-day-picker",
  // Icons & UI Components
  "lucide-react",
  "react-icons",
  "embla-carousel-react",
  "react-resizable-panels",
  "vaul",
  "input-otp",
  "cmdk",
  "recharts",
  // Auth
  "passport",
  "passport-local",
  // Themes
  "next-themes",
  // WebSocket
  "ws",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  console.log("build complete!");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
