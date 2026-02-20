import { Command } from "commander";
import { getClient } from "../client";
import { output, outputError } from "../output";

interface ListOption {
  flags: string;
  description: string;
  parser?: (value: string) => unknown;
}

interface ResourceConfig {
  name: string;
  description: string;
  resourceKey: string;
  stringIds?: boolean;
  extraListOptions?: ListOption[];
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

function parseId(value: string, useStringIds: boolean): string | number {
  if (useStringIds) return value;
  const num = parseInt(value, 10);
  if (isNaN(num)) return value;
  return num;
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
  const useStringIds = config.stringIds ?? false;

  if (ops.list) {
    const listCmd = cmd
      .command("list")
      .description(`List all ${config.name}`)
      .option("--limit <n>", "Max results to return", parseInt)
      .option("--offset <n>", "Number of results to skip", parseInt)
      .option("--order-by <field>", "Field to order by");

    if (config.extraListOptions) {
      for (const opt of config.extraListOptions) {
        if (opt.parser) {
          listCmd.option(opt.flags, opt.description, opt.parser);
        } else {
          listCmd.option(opt.flags, opt.description);
        }
      }
    }

    listCmd.action(async (opts) => {
      try {
        const client = getClient();
        const resource = (client as any)[config.resourceKey];
        const options: Record<string, unknown> = {};
        if (opts.limit !== undefined) options.limit = opts.limit;
        if (opts.offset !== undefined) options.offset = opts.offset;
        if (opts.orderBy) options.order_by = opts.orderBy;
        if (config.extraListOptions) {
          for (const opt of config.extraListOptions) {
            const match = opt.flags.match(/--([a-z-]+)/);
            if (match) {
              const camelKey = match[1].replace(/-([a-z])/g, (_, c) =>
                c.toUpperCase()
              );
              const snakeKey = match[1].replace(/-/g, "_");
              if (opts[camelKey] !== undefined) {
                options[snakeKey] = opts[camelKey];
              }
            }
          }
        }
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
          const result = await resource.show(parseId(id, useStringIds));
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
          const result = await resource.edit(parseId(id, useStringIds), data);
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
          const result = await resource.overwrite(
            parseId(id, useStringIds),
            data
          );
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
          const result = await resource.delete(parseId(id, useStringIds));
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
