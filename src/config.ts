import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".bexio-cli");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  token?: string;
}

function readConfig(): Config {
  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeConfig(config: Config): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), {
    mode: 0o600,
  });
}

export function getToken(): string {
  const envToken = process.env.BEXIO_API_TOKEN;
  if (envToken) return envToken;

  const config = readConfig();
  if (config.token) return config.token;

  process.stderr.write(
    "Error: No API token found. Set BEXIO_API_TOKEN env var or run: bexio config set-token <token>\n"
  );
  process.exit(1);
}

export function setToken(token: string): void {
  const config = readConfig();
  config.token = token;
  writeConfig(config);
}

export function clearToken(): void {
  const config = readConfig();
  delete config.token;
  writeConfig(config);
}
