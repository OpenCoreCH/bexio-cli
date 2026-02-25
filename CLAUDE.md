# bexio CLI

A command-line interface for the bexio ERP system. All output is JSON, designed for AI tool consumption.

## Setup

```bash
cd <project-root>
git submodule update --init --recursive
cd lib/bexio && corepack enable && yarn install --immutable && yarn build && cd ../..
npm install && npm run build
```

## Authentication

Set the API token via environment variable (preferred) or config file:

```bash
export BEXIO_API_TOKEN="your-token-here"
# OR
bexio config set-token "your-token-here"  # saves to ~/.bexio-cli/config.json
```

## Usage

Run with: `node dist/index.js <resource> <action> [options]`

All commands output JSON to stdout. Errors go to stderr as JSON.

## Available Resources and Commands

### Contacts & Relations
- `contacts list|show|create|edit|overwrite|delete|search` — Full CRUD on contacts
- `contact-types list|show|search` — Read-only contact types
- `contact-sectors list|show|search` — Read-only contact sectors
- `contact-groups list|show|create|edit|overwrite|search` — Manage contact groups
- `contact-relations list|show|create|edit|overwrite|delete|search` — Manage relations

### Sales & Invoicing
- `orders list|show|create|edit|overwrite|delete|search` — Sales orders
- `invoices list|show|create|edit|overwrite|delete|search` — Invoices
  - `invoices send <id> [json]` — Send an invoice
  - `invoices revert-issue <id>` — Revert an issued invoice
  - `invoices create-payment <id> --date YYYY-MM-DD --value <amount>` — Add payment
  - `invoices get-payment <invoiceId> <paymentId>` — Get payment details
  - `invoices delete-payment <invoiceId> <paymentId>` — Remove payment
- `expenses list|show|create|edit|overwrite|delete|search` — Expenses

### Bills & Payments
- `bills list|show|create|edit|overwrite|delete` — Bills (v4 API)
  - `bills update-status <id> <DRAFT|BOOKED>` — Change bill status
  - `bills execute-action <id> <DUPLICATE>` — Execute bill action
  - `bills validate-doc-number <number>` — Check document number availability
- `outgoing-payments list|show|create` — Outgoing payments (list requires `--bill-id`)
  - `outgoing-payments cancel <id>` — Cancel a payment
  - `outgoing-payments update <json>` — Update a payment

### Projects
- `projects list|show|create|edit|overwrite|delete|search` — Projects
- `project-statuses list|show|search` — Project statuses
- `project-types list|show|search` — Project types

### Time Tracking
- `timetrackings list|show|create|edit|delete|search` — Time entries
- `timetracking-statuses list|show|search` — Timetracking statuses

### Business
- `business-activities list|show|create|edit|overwrite|delete|search` — Business activities

### Users & Items
- `users list|show|search` — Users (read-only)
- `items list|show|create|edit|overwrite|delete|search` — Products/items

### Accounting
- `currencies list|show|create|delete` — Currencies
- `bank-accounts list|show` — Bank accounts (read-only)
- `accounts list|search|delete` — Chart of accounts
- `manual-entries list|create|delete` — Manual journal entries
  - `manual-entries next-ref-number` — Get next reference number
- `taxes list` — Tax definitions (read-only)

### Configuration
- `config set-token <token>` — Save API token
- `config clear-token` — Remove saved token

## Common Options

Most `list` commands support:
- `--limit <n>` — Max number of results
- `--offset <n>` — Skip first n results
- `--order-by <field>` — Sort field
- `--order-direction <asc|desc>` — Sort direction (default: `asc`)

You can also append `_asc` or `_desc` directly to the `--order-by` field.

Most `search` commands accept a JSON array:
```bash
bexio contacts search '[{"field":"name_1","value":"Acme","criteria":"like"}]'
```

Search criteria: `=`, `!=`, `>`, `<`, `>=`, `<=`, `like`, `not_like`, `is_null`, `not_null`, `in`, `not_in`

## Create/Edit Data Format

Pass data as JSON strings:
```bash
bexio contacts create '{"name_1":"Acme Corp","contact_type_id":1,"owner_id":1,"user_id":1,"country_id":1,"contact_group_ids":[1]}'
bexio contacts edit 42 '{"name_1":"Acme Corporation"}'
```

### Invoice `document_nr`

The `document_nr` field on invoices depends on the bexio frontend setting "automatic numbering" (see https://help.bexio.com/s/article/000001784):
- **Automatic numbering enabled**: `document_nr` cannot be provided; bexio assigns it automatically.
- **Automatic numbering disabled**: `document_nr` is required. You must determine the next number by inspecting existing invoices (e.g. search by `contact_id`, find the latest `document_nr`, and increment it).

## Error Handling

Errors are written to stderr as JSON: `{"error":"message","details":{...}}`
Successful responses are written to stdout as formatted JSON.
