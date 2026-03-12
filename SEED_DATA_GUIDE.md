# Grand City Dashboard - Seeding Data Guide

This guide explains how to seed data from your `SeedData` folder JSON files into the Neon database.

## 📁 Seed Data Files

Your `SeedData/` folder contains the following JSON files:

| File | Description | Data Type |
|------|-------------|------------|
| `complete_bills_data.json` | Complete bills with owners, 28 bills | Full dataset |
| `COMPLETE_REFERENCE_DATA.json` | Electricity reference data with account numbers | Reference only |
| `electricity-accounts-data.json` | Eurobiz electricity account references | Reference only |
| `electricity_bills_excel_data.json` | Additional PTCL, Gas, Electricity bills | Bills only |
| `excel_bills_parsed.json` | Various parsed bills | Bills only |

## 🌐 Seeding Endpoints

### 1. Check Database Status

Check what's currently in the database:

```bash
curl https://your-app.vercel.app/api/seed-all?action=status
```

**Response:**
```json
{
  "before": {
    "bills": 0,
    "owners": 0,
    "rentTracking": 0,
    "maintenanceItems": 0,
    "communications": 0
  },
  "actions": [],
  "after": null,
  "timestamp": "2024-03-12T..."
}
```

### 2. Seed All Data (Recommended)

Seeds all data from `SeedData/` folder:

```bash
curl -X POST https://your-app.vercel.app/api/seed-all?action=all
```

This will:
1. Seed 4 owners (Brig Shahid, Fareed Faridi, Waseem Ijaz, Grand City HQ)
2. Seed 28 bills (Electricity, PTCL, Gas, Water)
3. Seed additional bills from other JSON files
4. Seed reference data for tracking

**Response:**
```json
{
  "before": { "bills": 0, "owners": 0, ... },
  "actions": [
    { "name": "Seed Owners", "result": { "seeded": 4, "errors": [] } },
    { "name": "Seed Bills", "result": { "seeded": 28, "errors": [] } },
    { "name": "Seed Additional Bills", "result": { "seeded": 6, "errors": [] } },
    { "name": "Seed Reference Data", "result": { "seeded": 13, "errors": [] } }
  ],
  "after": { "bills": 34, "owners": 4, ... },
  "errors": [],
  "timestamp": "2024-03-12T..."
}
```

### 3. Seed From Application

After deployment, you can also seed data from within the app:

1. Open your deployed application
2. Open browser DevTools console
3. Run:

```javascript
fetch('/api/seed-all?action=all', { method: 'POST' })
  .then(r => r.json())
  .then(data => console.log(data))
```

## 📊 Seeded Data Summary

### Owners (4 total)

| ID | Name | Mobile | Email | Buildings |
|----|------|--------|--------|----------|
| 1 | Brig Shahid | 0323 4194444 | shahid@grandcity.pk | 170 |
| 2 | Fareed Faridi | +92 312 4225106 | fareed@grandcity.pk | 171 |
| 3 | Waseem Ijaz | +92 301 4681313 | waseem@grandcity.pk | 172 |
| 4 | Grand City HQ | +92 300 1234567 | hq@grandcity.pk | 38, 129 |

### Bills Summary (34+ total)

| Type | Count | Buildings |
|------|--------|-----------|
| Electricity | 16+ | 170, 171, 172, 38, 129 |
| PTCL | 6 | 170 |
| Gas | 3 | 170, 38, 129 |
| Water | 3 | 170, 171, 172 |

## 🔄 Re-seeding Data

To clear and re-seed data:

### Option 1: SQL Truncate (Recommended)

Run in Neon SQL Editor:

```sql
-- Clear all tables
TRUNC TABLE communications CASCADE;
TRUNCATE maintenance_items CASCADE;
TRUNCATE rent_tracking CASCADE;
TRUNCATE bills CASCADE;
TRUNCATE owners CASCADE;

-- Reseed owners (keeps IDs)
INSERT INTO owners (id, name, mobile, email, buildings, notes) VALUES
  (1, 'Brig Shahid', '0323 4194444', 'shahid@grandcity.pk', '["170"]', 'Owner of Building 170'),
  (2, 'Fareed Faridi', '+92 312 4225106', 'fareed@grandcity.pk', '["171"]', 'Owner of Building 171'),
  (3, 'Waseem Ijaz', '+92 301 4681313', 'waseem@grandcity.pk', '["172"]', 'Owner of Building 172'),
  (4, 'Grand City HQ', '+92 300 1234567', 'hq@grandcity.pk', '["38", "129"]', 'Additional Properties');
```

### Option 2: API Re-seed

Call the seed endpoint again - it uses `ON CONFLICT DO NOTHING` so duplicates won't be created.

## 📝 Custom Seeding

To add your own data via SQL:

1. Go to Neon Console → SQL Editor
2. Write your INSERT statements
3. Example:

```sql
-- Add a custom owner
INSERT INTO owners (name, mobile, email, buildings, notes)
VALUES ('New Owner', '+92 300 1234567', 'new@owner.com', '["999"]', 'Custom notes');

-- Add a custom bill
INSERT INTO bills (
  company_name, building_number, building_name, floor, unit_number,
  owner_id, bill_type, customer_id, consumer_number, account_number,
  reference_number, due_date, bill_month, status, bill_amount, paid_by, notes
)
VALUES (
  'My Company', '999', 'My Building', '2nd Floor', 'A-101',
  1, 'Electricity', '12345', 'REF-001', 'ACC-001', '123456',
  '2025-04-01', '2025-04', 'Pending', 5000.00, 'Company', 'Custom bill'
);
```

## 🐛 Troubleshooting

### Seed API Returns 404

- Verify `api/seed-all/index.js` is in your project
- Check `vercel.json` includes the API route
- Verify file is committed to Git

### Seed Returns "Database already contains data"

The seed API uses `ON CONFLICT DO NOTHING`, so:
- Duplicate bills won't be inserted
- You can safely re-run the seed
- Only new/unique data will be added

### Partial Seeding

If some data fails to seed:

```json
{
  "actions": [...],
  "errors": [
    {
      "bill": "Building 170 - Electricity",
      "error": "duplicate key value violates unique constraint",
      "table": "bills"
    }
  ]
}
```

Check the `errors` array for specific issues and fix them in the JSON source files.

## 📈 Next Steps After Seeding

1. **Verify data in dashboard**:
   - Refresh the application
   - Check that bills appear in the Bills tab
   - Verify owners are listed correctly

2. **Test operations**:
   - Try adding a new bill
   - Try editing an existing bill
   - Try deleting a bill

3. **Monitor database usage**:
   - Check Neon Console for storage usage
   - Ensure you're within free tier limits

---

## 💡 Tips

- **Backup**: Neon provides automatic backups, but export before major changes
- **Environment**: Use `action=status` to check before and after seeding
- **Incremental**: You can add data incrementally via the app UI, then export as backup
- **Testing**: Always test with `action=all` before using `action=complete` in production

---

For support: ali@grandcity.pk
