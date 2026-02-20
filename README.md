# bexio-cli

A command-line interface for the [bexio](https://www.bexio.com) ERP system. All output is structured JSON, making it ideal for scripting, automation, and AI tool integration (e.g. [Claude Code](https://claude.com/claude-code)).

Built on top of the [bexio TypeScript library](https://github.com/mathewmeconry/bexio) (included as a git submodule).

## Installation

```bash
git clone --recursive https://github.com/your-org/bexio-cli.git
cd bexio-cli

# Build the bexio library
cd lib/bexio && npm install && npm run build && cd ../..

# Build the CLI
npm install
npm run build
```

Optionally, link it globally:

```bash
npm link
```

### Requirements

- Node.js >= 18.14.0
- A bexio API token ([generate one here](https://office.bexio.com/index.php/admin/apiTokens))

## Authentication

The CLI reads your API token from the `BEXIO_API_TOKEN` environment variable, falling back to a config file at `~/.bexio-cli/config.json`.

```bash
# Option 1: Environment variable (recommended for CI/automation)
export BEXIO_API_TOKEN="your-token-here"

# Option 2: Persistent config file (stored with 0600 permissions)
bexio config set-token "your-token-here"

# Remove stored token
bexio config clear-token
```

## Usage

```
bexio <resource> <action> [options]
```

All successful responses are written as formatted JSON to **stdout**.
Errors are written as JSON to **stderr** with the format `{"error": "...", "details": {...}}`.

### Quick examples

```bash
# List all contacts
bexio contacts list

# Show a specific contact
bexio contacts show 42

# Search contacts
bexio contacts search '[{"field":"name_1","value":"Acme","criteria":"like"}]'

# Create a contact
bexio contacts create '{"name_1":"Acme Corp","contact_type_id":1,"owner_id":1,"user_id":1,"country_id":1,"contact_group_ids":[1]}'

# Edit a contact (partial update)
bexio contacts edit 42 '{"name_1":"Acme Corporation"}'

# Delete a contact
bexio contacts delete 42

# List invoices with pagination
bexio invoices list --limit 10 --offset 20 --order-by title

# Send an invoice
bexio invoices send 15

# Record a payment on an invoice
bexio invoices create-payment 15 --date 2026-02-20 --value 1500.00
```

## Available Resources

| Category | Resource | Actions |
|---|---|---|
| **Contacts** | `contacts` | list, show, create, edit, overwrite, delete, search |
| | `contact-types` | list, show, search |
| | `contact-sectors` | list, show, search |
| | `contact-groups` | list, show, create, edit, overwrite, search |
| | `contact-relations` | list, show, create, edit, overwrite, delete, search |
| **Sales** | `orders` | list, show, create, edit, overwrite, delete, search |
| | `invoices` | list, show, create, edit, overwrite, delete, search + [special commands](#invoice-commands) |
| | `expenses` | list, show, create, edit, overwrite, delete, search |
| **Bills** | `bills` | list, show, create, edit, overwrite, delete + [special commands](#bill-commands) |
| | `outgoing-payments` | list (requires `--bill-id`), show, create + [special commands](#outgoing-payment-commands) |
| **Projects** | `projects` | list, show, create, edit, overwrite, delete, search |
| | `project-statuses` | list, show, search |
| | `project-types` | list, show, search |
| **Time Tracking** | `timetrackings` | list, show, create, edit, delete, search |
| | `timetracking-statuses` | list, show, search |
| **Business** | `business-activities` | list, show, create, edit, overwrite, delete, search |
| **Users** | `users` | list, show, search |
| **Items** | `items` | list, show, create, edit, overwrite, delete, search |
| **Accounting** | `currencies` | list, show, create, delete |
| | `bank-accounts` | list, show |
| | `accounts` | list, search, delete |
| | `manual-entries` | list, create, delete + [special commands](#manual-entry-commands) |
| | `taxes` | list |

### Invoice commands

```bash
bexio invoices send <id> [json]                        # Send invoice (optional recipient JSON)
bexio invoices revert-issue <id>                       # Revert an issued invoice
bexio invoices create-payment <id> --date <d> --value <v> [--bank-account-id <n>]
bexio invoices get-payment <invoiceId> <paymentId>     # Get payment details
bexio invoices delete-payment <invoiceId> <paymentId>  # Remove a payment
```

### Bill commands

```bash
bexio bills update-status <id> <DRAFT|BOOKED>          # Change bill status
bexio bills execute-action <id> <DUPLICATE>             # Execute bill action
bexio bills validate-doc-number <number>                # Check document number availability
```

### Outgoing payment commands

```bash
bexio outgoing-payments list --bill-id <id>            # List payments for a bill
bexio outgoing-payments cancel <id>                     # Cancel a payment
bexio outgoing-payments update <json>                   # Update a payment
```

### Manual entry commands

```bash
bexio manual-entries next-ref-number                   # Get next available reference number
```

## Common Options

Most `list` commands support:

| Flag | Description |
|---|---|
| `--limit <n>` | Maximum number of results to return |
| `--offset <n>` | Number of results to skip |
| `--order-by <field>` | Field to sort by |

## Search

Search commands accept a JSON array of filter objects:

```bash
bexio contacts search '[{"field":"name_1","value":"Acme","criteria":"like"}]'
```

Each filter object has:
- `field` — The field to search on
- `value` — The value to match
- `criteria` (optional, defaults to `=`) — One of: `=`, `!=`, `>`, `<`, `>=`, `<=`, `like`, `not_like`, `is_null`, `not_null`, `in`, `not_in`

Multiple filters can be combined:

```bash
bexio contacts search '[{"field":"name_1","value":"Acme","criteria":"like"},{"field":"city","value":"Zurich"}]'
```

## AI Tool Integration

This CLI includes a `CLAUDE.md` file that provides a complete command reference for AI tools. To use it with [Claude Code](https://claude.com/claude-code) or similar, point the tool at this repository and it will automatically pick up the available commands.

## Development

```bash
# Build
npm run build

# Run without building (requires ts-node)
npm run dev
```

### Project Structure

```
bexio-cli/
  src/
    index.ts              # CLI entry point, resource registration
    client.ts             # Bexio client singleton
    config.ts             # Token management (env var + config file)
    output.ts             # JSON output helpers
    commands/
      resource.ts         # Generic resource command generator
      config.ts           # Config subcommand
  lib/
    bexio/                # bexio library (git submodule)
  CLAUDE.md               # AI tool integration reference
```

## License

MIT
