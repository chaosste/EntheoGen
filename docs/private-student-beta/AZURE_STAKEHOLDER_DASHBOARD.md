# Azure stakeholder dashboard (NEW-227)

This file pair delivers a starter Azure Portal dashboard JSON for **EntheoGen Student Beta Launch Hub**.

## Files

- `docs/private-student-beta/azure-stakeholder-dashboard.json`
- `docs/private-student-beta/AZURE_STAKEHOLDER_DASHBOARD.md`

## Import steps (Azure Portal)

1. Open **Dashboard** in Azure Portal.
2. Select **Create** or **New dashboard**.
3. Choose **Upload** (or **Advanced settings / JSON view** depending on portal UI).
4. Paste/upload `azure-stakeholder-dashboard.json`.
5. Save as shared dashboard in the desired resource group.

## Connect & test checklist

- Confirm all markdown tiles render and links open.
- Replace placeholder source repo URL with the canonical GitHub repo URL.
- Replace each "Add issue link" cell with actual Linear issue URLs.
- Update "Last dataset snapshot date" after latest `npm run dataset:build-beta -- .` run.
- Pin live visualization/workbook tiles for the five dataset chart slots.
- Validate stakeholder navigation labels match the issue guidance.

## Notes

- The template uses markdown parts to keep deployment simple and easily editable.
- For production automation, you can deploy this JSON via ARM/Bicep using `Microsoft.Portal/dashboards`.
