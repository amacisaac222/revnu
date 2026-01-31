# REVNU Scripts

Utility scripts for MVP verification and testing.

## verify-mvp.ts

Comprehensive verification script that checks:
- Database connectivity
- Schema integrity
- Standard flows presence
- Environment variables
- Implementation files
- Organization settings
- Scheduled messages status

### Usage

```bash
# Run verification
npx ts-node scripts/verify-mvp.ts
```

### Output

```
= Running MVP Verification Checks...

=Ê Verification Results:

PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP
 Database Connection                    Successfully connected to database
 Organizations Table                    Found 3 organizations
   count: 3
 SequenceTemplate Table                 Found 24 sequence templates
   count: 24
 Standard Flows                         Found 18 standard flows
   - Standard Collections - 0 days
   - Urgent Collections - 15 days
   - New Customer Welcome (Manual Trigger)
   - Partial Payment Follow-up (Partial Status)
   - High-Value Invoice (-3 days, 2x Average)
   - Mechanic's Lien Protection - California
 Lien Sequences                         Found 3 lien sequences
   - Mechanic's Lien Protection - California (CA)
   - Mechanic's Lien Protection - Texas (TX)
   - Mechanic's Lien Protection - Florida (FL)
 ScheduledMessage Table                 Total: 125, Pending: 42, Sent: 83
   total: 125
   pending: 42
   sent: 83
 Required Environment Variables         All required variables set
   Optional Environment Variables        Missing: ANTHROPIC_API_KEY
   Some features may not work without these
 Required Implementation Files          All required files present
 Organization: Smith Electric           All settings configured
PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP

=È Summary: 9 passed, 1 warnings, 0 failed

   MVP is mostly ready, but some warnings need attention.
```

### Exit Codes

- `0` - All checks passed (or warnings only)
- `1` - One or more critical failures

---

## Future Scripts

Add more scripts here for:
- Seeding test data
- Running cron jobs manually
- Generating reports
- Database migrations
