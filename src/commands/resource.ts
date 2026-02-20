import { Command } from "commander";
import { getClient } from "../client";
import { output, outputError } from "../output";

interface ResourceConfig {
  name: string;
  description: string;
  resourceKey: string;
  operations: {
    list?: boolean;
    show?: boolean;
    create?: boolean;
    edit?: boolean;
    overwrite?: boolean;
    delete?: boolean;
    search?: boolean;
  };
  customCommands?: (cmd: Command) => void;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    outputError("Invalid JSON input", { input: value });
  }
}

function parseSearchParams(
  value: string
): Array<{ field: string; value: unknown; criteria?: string }> {
  const parsed = parseJson(value);
  if (!Array.isArray(parsed)) {
    outputError(
      "Search params must be a JSON array",
      {
        example: [{ field: "name_1", value: "Acme", criteria: "like" }],
      }
    );
  }
  return parsed as Array<{ field: string; value: unknown; criteria?: string }>;
}

export function registerResource(
  program: Command,
  config: ResourceConfig
): void {
  const cmd = program
    .command(config.name)
    .description(config.description);

  const ops = config.operations;

  if (ops.list) {
    cmd
      .command("list")
      .description(`List all ${config.name}`)
      .option("--limit <n>", "Max results to return", parseInt)
      .option("--offset <n>", "Number of results to skip", parseInt)
      .option("--order-by <field>", "Field to order by")
      .action(async (opts) => {
        try {
          const client = getClient();
          const resource = (client as any)[config.resourceKey];
          const options: Record<string, unknown> = {};
          if (opts.limit !== undefined) options.limit = opts.limit;
          if (opts.offset !== undefined) options.offset = opts.offset;
          if (opts.orderBy) options.order_by = opts.orderBy;
          const result = await resource.list(
            Object.keys(options).length > 0 ? options : undefined
          );
          output(result);
        } catch (err) {
          outputError(`Failed to list ${config.name}`, err);
        }
      });
  }

  if (ops.show) {
    cmd
      .command("show <id>")
      .description(`Show a single ${config.name} by ID`)
      .action(async (id: string) => {
        try {
          const client = getClient();
          const resource = (client as any)[config.resourceKey];
          const result = await resource.show(parseInt(id, 10));
          output(result);
        } catch (err) {
          outputError(`Failed to show ${config.name} ${id}`, err);
        }
      });
  }

  if (ops.search) {
    cmd
      .command("search <params>")
      .description(
        `Search ${config.name}. Params: JSON array of {field, value, criteria?}`
      )
      .option("--limit <n>", "Max results", parseInt)
      .option("--offset <n>", "Skip results", parseInt)
      .option("--order-by <field>", "Order by field")
      .action(async (params: string, opts) => {
        try {
          const client = getClient();
          const resource = (client as any)[config.resourceKey];
          const searchParams = parseSearchParams(params);
          const options: Record<string, unknown> = {};
          if (opts.limit !== undefined) options.limit = opts.limit;
          if (opts.offset !== undefined) options.offset = opts.offset;
          if (opts.orderBy) options.order_by = opts.orderBy;
          const result = await resource.search(
            searchParams,
            Object.keys(options).length > 0 ? options : undefined
          );
          output(result);
        } catch (err) {
          outputError(`Failed to search ${config.name}`, err);
        }
      });
  }

  if (ops.create) {
    cmd
      .command("create <json>")
      .description(`Create a new ${config.name}. Provide data as JSON string`)
      .action(async (json: string) => {
        try {
          const client = getClient();
          const resource = (client as any)[config.resourceKey];
          const data = parseJson(json);
          const result = await resource.create(data);
          output(result);
        } catch (err) {
          outputError(`Failed to create ${config.name}`, err);
        }
      });
  }

  if (ops.edit) {
    cmd
      .command("edit <id> <json>")
      .description(
        `Edit (partial update) a ${config.name} by ID. Provide fields as JSON`
      )
      .action(async (id: string, json: string) => {
        try {
          const client = getClient();
          const resource = (client as any)[config.resourceKey];
          const data = parseJson(json);
          const result = await resource.edit(parseInt(id, 10), data);
          output(result);
        } catch (err) {
          outputError(`Failed to edit ${config.name} ${id}`, err);
        }
      });
  }

  if (ops.overwrite) {
    cmd
      .command("overwrite <id> <json>")
      .description(
        `Overwrite (full replace) a ${config.name} by ID. Provide full data as JSON`
      )
      .action(async (id: string, json: string) => {
        try {
          const client = getClient();
          const resource = (client as any)[config.resourceKey];
          const data = parseJson(json);
          const result = await resource.overwrite(parseInt(id, 10), data);
          output(result);
        } catch (err) {
          outputError(`Failed to overwrite ${config.name} ${id}`, err);
        }
      });
  }

  if (ops.delete) {
    cmd
      .command("delete <id>")
      .description(`Delete a ${config.name} by ID`)
      .action(async (id: string) => {
        try {
          const client = getClient();
          const resource = (client as any)[config.resourceKey];
          const result = await resource.delete(parseInt(id, 10));
          output(result);
        } catch (err) {
          outputError(`Failed to delete ${config.name} ${id}`, err);
        }
      });
  }

  if (config.customCommands) {
    config.customCommands(cmd);
  }
}
