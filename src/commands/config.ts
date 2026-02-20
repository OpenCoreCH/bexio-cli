import { Command } from "commander";
import { setToken, clearToken } from "../config";
import { output } from "../output";

export function registerConfigCommand(program: Command): void {
  const cmd = program
    .command("config")
    .description("Manage CLI configuration");

  cmd
    .command("set-token <token>")
    .description("Save API token to ~/.bexio-cli/config.json")
    .action((token: string) => {
      setToken(token);
      output({ success: true, message: "Token saved" });
    });

  cmd
    .command("clear-token")
    .description("Remove saved API token")
    .action(() => {
      clearToken();
      output({ success: true, message: "Token cleared" });
    });
}
