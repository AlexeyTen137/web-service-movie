module.exports = (phase) => ({
  distDir: phase === "phase-development-server" ? ".next-dev" : ".next",
  allowedDevOrigins: ["127.0.0.1", "localhost"],
});
