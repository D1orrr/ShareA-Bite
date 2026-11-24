// Copies the "[id].html" shells of dynamic routes to "_id.html" so Vercel can serve them
// for any id (AI recipes and cheaper variants get ids beyond the pre-rendered ones).
const fs = require("fs");
const path = require("path");

for (const dir of ["recipe", "cook", "finish"]) {
  const from = path.join(__dirname, "..", "dist", dir, "[id].html");
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(path.dirname(from), "_id.html"));
}
