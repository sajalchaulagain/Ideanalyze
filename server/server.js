const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const { checkDbHealth } = require("./db/health");
const authRoutes = require("./routes/authRoutes");
const ideaRoutes = require("./routes/ideaRoutes");
const aiRoutes = require("./routes/aiRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const colors = {
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
};

const PLACEHOLDER_JWT_SECRETS = new Set([
  "change_me_generate_a_real_secret",
  "your_jwt_secret",
  "your-secret",
  "changeme",
  "secret",
]);

const allowedOrigins = [
  ...new Set(
    [...(process.env.CLIENT_URL || "").split(","), "http://localhost:5173"]
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean)
  ),
];

function assertProductionJwtSecret() {
  if (process.env.NODE_ENV !== "production") return;

  const secret = (process.env.JWT_SECRET || "").trim();
  const normalized = secret.toLowerCase();

  if (!secret || PLACEHOLDER_JWT_SECRETS.has(normalized) || normalized.startsWith("change_me")) {
    throw new Error(
      "Refusing to start in production: JWT_SECRET is missing, empty, or still a placeholder. " +
        "Generate a long random value and set it in the Render environment."
    );
  }
}

function effectiveAIConfiguration() {
  const apiKey = (process.env.AI_API_KEY || "").trim();
  const configuredBaseUrl = (process.env.AI_BASE_URL || "").trim();
  let baseUrl = configuredBaseUrl;
  let model = (process.env.AI_MODEL || "").trim();

  if (model.startsWith("http://") || model.startsWith("https://")) {
    baseUrl = model;
    model = (process.env.AI_MODEL_NAME || "gpt-3.5-turbo").trim();
  }
  if (!model) model = "gemini-flash-lite-latest";

  let safeBaseUrl = "";
  if (baseUrl) {
    try {
      const parsed = new URL(baseUrl);
      safeBaseUrl = `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, "");
    } catch {
      safeBaseUrl = "configured endpoint";
    }
  }

  const provider = baseUrl
    ? "openai-compatible"
    : /^AIza[0-9A-Za-z_-]+$/.test(apiKey)
    ? "gemini"
    : "not configured";
  // Never log any part of the key, even in development.
  const keySummary = apiKey ? "set" : "not set";
  return { provider, baseUrl: safeBaseUrl, model, keySummary, configuredBaseUrl, configuredModel: (process.env.AI_MODEL || "").trim() };
}

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, same-origin, health checks) are allowed.
      if (!origin || allowedOrigins.includes(origin.replace(/\/+$/, ""))) {
        return callback(null, true);
      }

      const error = new Error("Origin not allowed by CORS");
      error.statusCode = 403;
      error.code = "CORS_ORIGIN_DENIED";
      return callback(error);
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "100kb" }));

// Request logger middleware with colors
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor =
      res.statusCode >= 500
        ? colors.red
        : res.statusCode >= 400
        ? colors.yellow
        : colors.green;
    console.log(
      `${colors.magenta(req.method)} ${colors.cyan(req.originalUrl)} → ${statusColor(
        res.statusCode
      )} (${duration}ms)`
    );
  });
  next();
});

// Health check uses a bounded Supabase probe.
app.get("/api/health", async (req, res) => {
  const health = await checkDbHealth();
  if (!health.ok) {
    return res.status(503).json({ status: "degraded", db: "disconnected", provider: health.provider });
  }

  res.json({
    status: "ok",
    db: "connected",
    provider: health.provider,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/ai", aiRoutes);

// Unknown API routes must not fall through to HTML or a hanging handler.
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    code: "ROUTE_NOT_FOUND",
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  assertProductionJwtSecret();
  const aiConfiguration = effectiveAIConfiguration();
  if (aiConfiguration.provider === "openai-compatible") {
    console.log(
      colors.cyan(
        `AI provider: openai-compatible → ${aiConfiguration.baseUrl} (model: ${aiConfiguration.model}; key: ${aiConfiguration.keySummary})`
      )
    );
    if (!aiConfiguration.configuredModel || !aiConfiguration.configuredModel.includes("/")) {
      console.warn(
        colors.yellow(
          "WARNING: AI_MODEL has no vendor prefix; OpenAI-compatible providers usually need e.g. 'google/gemma-4-31b-it:free'."
        )
      );
    }
  } else if (aiConfiguration.provider === "gemini") {
    console.log(colors.cyan(`AI provider: gemini (model: ${aiConfiguration.model}; key: ${aiConfiguration.keySummary})`));
  } else {
    console.log(colors.cyan(`AI provider: not configured (model: ${aiConfiguration.model}; key: ${aiConfiguration.keySummary})`));
  }
  const dbProvider = (process.env.DB_PROVIDER || "supabase").trim().toLowerCase();
  if (dbProvider === "mongo") {
    console.log(colors.yellow("MongoDB support was removed; continuing with Supabase."));
  }
  console.log(colors.cyan("DB provider: supabase"));

  const server = app.listen(PORT, () => {
    console.log(
      colors.bold(colors.green(`\n🚀 Server running on http://localhost:${PORT}`)) +
        colors.cyan(` [Env: ${process.env.NODE_ENV || "development"}]\n`)
    );
    console.log(colors.cyan(`   Allowed origins: ${allowedOrigins.join(", ")}\n`));
  });

  let shuttingDown = false;

  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(colors.yellow(`\n🛑 ${signal} received — closing server gracefully...`));

    const forceExit = setTimeout(() => {
      console.error(colors.red("Graceful shutdown timed out; forcing exit."));
      process.exit(1);
    }, 10000);
    forceExit.unref();

    server.close(async () => {
      try {
        console.log(colors.green("✅ Server closed. Bye."));
      } catch (error) {
        console.error(colors.red(`Error closing server: ${error.message}`));
      } finally {
        clearTimeout(forceExit);
        process.exit(0);
      }
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return server;
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(colors.red(`\n❌ Server failed to start: ${error.message}\n`));
    process.exit(1);
  });
}

process.on("unhandledRejection", (reason) => {
  console.error(colors.red(`\n❌ Unhandled promise rejection: ${reason}`));
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error(colors.red(`\n❌ Uncaught exception: ${error.stack || error.message}`));
  process.exit(1);
});

app.startServer = startServer;
app.allowedOrigins = allowedOrigins;

module.exports = app;
