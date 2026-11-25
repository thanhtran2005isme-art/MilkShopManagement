import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { parseMariaDbUrl } from "./src/database/database-url";

const url = env("DATABASE_URL");
parseMariaDbUrl(url);
export default defineConfig({ schema: "prisma/schema.prisma", datasource: { url } });
