#!/usr/bin/env node

import { Command } from "commander";
import { registerResource } from "./commands/resource";
import { registerConfigCommand } from "./commands/config";
import { getClient } from "./client";
import { output, outputError } from "./output";

const program = new Command();

program
  .name("bexio")
  .description("CLI for bexio ERP — JSON output for AI tool integration")
  .version("1.0.0");

// Config command
registerConfigCommand(program);

// --- Contacts ---
registerResource(program, {
  name: "contacts",
  description: "Manage contacts",
  resourceKey: "contacts",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
});

registerResource(program, {
  name: "contact-types",
  description: "View contact types",
  resourceKey: "contactTypes",
  operations: { list: true, show: true, search: true },
});

registerResource(program, {
  name: "contact-sectors",
  description: "View contact sectors",
  resourceKey: "contactSectors",
  operations: { list: true, show: true, search: true },
});

registerResource(program, {
  name: "contact-groups",
  description: "Manage contact groups",
  resourceKey: "contactGroups",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    search: true,
  },
});

registerResource(program, {
  name: "contact-relations",
  description: "Manage contact relations",
  resourceKey: "contactRelations",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
});

// --- Sales & Orders ---
registerResource(program, {
  name: "orders",
  description: "Manage sales orders",
  resourceKey: "orders",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
});

registerResource(program, {
  name: "invoices",
  description: "Manage invoices",
  resourceKey: "invoices",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
  customCommands: (cmd) => {
    cmd
      .command("send <id>")
      .description("Send an invoice. Optional JSON body for recipient info")
      .argument("[json]", "Optional JSON with recipient_email, etc.")
      .action(async (id: string, json?: string) => {
        try {
          const client = getClient();
          const data = json ? JSON.parse(json) : {};
          const result = await client.invoices.sent(parseInt(id, 10), data);
          output(result);
        } catch (err) {
          outputError(`Failed to send invoice ${id}`, err);
        }
      });

    cmd
      .command("revert-issue <id>")
      .description("Revert an invoice issue")
      .action(async (id: string) => {
        try {
          const client = getClient();
          const result = await client.invoices.revertIssue(parseInt(id, 10));
          output(result);
        } catch (err) {
          outputError(`Failed to revert invoice ${id}`, err);
        }
      });

    cmd
      .command("create-payment <invoiceId>")
      .description("Create a payment for an invoice")
      .requiredOption("--date <date>", "Payment date (YYYY-MM-DD)")
      .requiredOption("--value <amount>", "Payment amount")
      .option("--bank-account-id <id>", "Bank account ID", parseInt)
      .option("--payment-service-id <id>", "Payment service ID", parseInt)
      .action(async (invoiceId: string, opts) => {
        try {
          const client = getClient();
          const result = await client.invoices.createPayment(
            parseInt(invoiceId, 10),
            new Date(opts.date),
            opts.value,
            opts.bankAccountId,
            opts.paymentServiceId
          );
          output(result);
        } catch (err) {
          outputError(
            `Failed to create payment for invoice ${invoiceId}`,
            err
          );
        }
      });

    cmd
      .command("get-payment <invoiceId> <paymentId>")
      .description("Get a specific payment for an invoice")
      .action(async (invoiceId: string, paymentId: string) => {
        try {
          const client = getClient();
          const result = await client.invoices.getPayment(
            parseInt(invoiceId, 10),
            parseInt(paymentId, 10)
          );
          output(result);
        } catch (err) {
          outputError(`Failed to get payment`, err);
        }
      });

    cmd
      .command("delete-payment <invoiceId> <paymentId>")
      .description("Delete a payment from an invoice")
      .action(async (invoiceId: string, paymentId: string) => {
        try {
          const client = getClient();
          await client.invoices.deletePayment(
            parseInt(invoiceId, 10),
            parseInt(paymentId, 10)
          );
          output({ success: true });
        } catch (err) {
          outputError(`Failed to delete payment`, err);
        }
      });
  },
});

registerResource(program, {
  name: "expenses",
  description: "Manage expenses",
  resourceKey: "expenses",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
});

registerResource(program, {
  name: "bills",
  description: "Manage bills (v4 API)",
  resourceKey: "billsV4",
  stringIds: true,
  sortConfig: {
    fieldParam: "sort",
    directionParam: "order",
  },
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
  },
  customCommands: (cmd) => {
    cmd
      .command("update-status <id> <status>")
      .description("Update bill status (DRAFT or BOOKED)")
      .action(async (id: string, status: string) => {
        try {
          const client = getClient();
          const result = await client.billsV4.updateStatus(
            id,
            status as any
          );
          output(result);
        } catch (err) {
          outputError(`Failed to update bill status`, err);
        }
      });

    cmd
      .command("execute-action <id> <action>")
      .description("Execute an action on a bill (e.g. DUPLICATE)")
      .action(async (id: string, action: string) => {
        try {
          const client = getClient();
          const result = await client.billsV4.executeAction(
            id,
            action as any
          );
          output(result);
        } catch (err) {
          outputError(`Failed to execute action on bill`, err);
        }
      });

    cmd
      .command("validate-doc-number <documentNo>")
      .description("Validate a document number for bills")
      .action(async (documentNo: string) => {
        try {
          const client = getClient();
          const result =
            await client.billsV4.validateDocumentNumber(documentNo);
          output(result);
        } catch (err) {
          outputError(`Failed to validate document number`, err);
        }
      });
  },
});

registerResource(program, {
  name: "outgoing-payments",
  description: "Manage outgoing payments",
  resourceKey: "outgoingPayments",
  stringIds: true,
  sortConfig: {
    fieldParam: "sort",
    directionParam: "order",
  },
  extraListOptions: [
    {
      flags: "--bill-id <id>",
      description: "Filter by bill ID (required)",
    },
  ],
  operations: {
    list: true,
    show: true,
    create: true,
  },
  customCommands: (cmd) => {
    cmd
      .command("cancel <id>")
      .description("Cancel an outgoing payment")
      .action(async (id: string) => {
        try {
          const client = getClient();
          const result = await client.outgoingPayments.cancel(id);
          output(result);
        } catch (err) {
          outputError(`Failed to cancel payment ${id}`, err);
        }
      });

    cmd
      .command("update <json>")
      .description("Update an outgoing payment")
      .action(async (json: string) => {
        try {
          const client = getClient();
          const data = JSON.parse(json);
          const result = await client.outgoingPayments.update(data);
          output(result);
        } catch (err) {
          outputError(`Failed to update payment`, err);
        }
      });
  },
});

// --- Projects ---
registerResource(program, {
  name: "projects",
  description: "Manage projects",
  resourceKey: "projects",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
});

registerResource(program, {
  name: "project-statuses",
  description: "View project statuses",
  resourceKey: "projectStatuses",
  operations: { list: true, show: true, search: true },
});

registerResource(program, {
  name: "project-types",
  description: "View project types",
  resourceKey: "projectTypes",
  operations: { list: true, show: true, search: true },
});

// --- Timesheets ---
registerResource(program, {
  name: "timetrackings",
  description: "Manage time tracking entries",
  resourceKey: "timetrackings",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    delete: true,
    search: true,
  },
});

registerResource(program, {
  name: "timetracking-statuses",
  description: "View timetracking statuses",
  resourceKey: "timetrackingStatuses",
  operations: { list: true, show: true, search: true },
});

// --- Business ---
registerResource(program, {
  name: "business-activities",
  description: "Manage business activities",
  resourceKey: "businessActivities",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
});

// --- Users ---
registerResource(program, {
  name: "users",
  description: "View users",
  resourceKey: "users",
  operations: { list: true, show: true, search: true },
});

// --- Items ---
registerResource(program, {
  name: "items",
  description: "Manage items/products",
  resourceKey: "items",
  operations: {
    list: true,
    show: true,
    create: true,
    edit: true,
    overwrite: true,
    delete: true,
    search: true,
  },
});

// --- Accounting ---
registerResource(program, {
  name: "currencies",
  description: "Manage currencies",
  resourceKey: "currencies",
  operations: { list: true, show: true, create: true, delete: true },
});

registerResource(program, {
  name: "bank-accounts",
  description: "View bank accounts",
  resourceKey: "bankAccounts",
  operations: { list: true, show: true },
});

registerResource(program, {
  name: "accounts",
  description: "View chart of accounts",
  resourceKey: "accounts",
  operations: { list: true, search: true, delete: true },
});

registerResource(program, {
  name: "manual-entries",
  description: "Manage manual journal entries",
  resourceKey: "manualEntries",
  operations: { list: true, create: true, delete: true },
  customCommands: (cmd) => {
    cmd
      .command("next-ref-number")
      .description("Get next available reference number")
      .action(async () => {
        try {
          const client = getClient();
          const result = await client.manualEntries.getNextReferenceNumber();
          output(result);
        } catch (err) {
          outputError(`Failed to get next reference number`, err);
        }
      });
  },
});

registerResource(program, {
  name: "taxes",
  description: "View tax definitions",
  resourceKey: "taxes",
  operations: { list: true },
});

// Parse and execute
program.parseAsync(process.argv).catch((err) => {
  outputError("Unexpected error", err);
});
