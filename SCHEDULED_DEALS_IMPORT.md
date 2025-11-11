# Scheduled Deal Import Job

## Overview

SmartCart now includes an automated scheduled job that imports deals daily. This eliminates the need for manual deal imports and ensures your shopping lists always have up-to-date pricing information.

## How It Works

The `DealImportScheduler` service runs automatically every day at **2:00 AM** (configurable) and:

1. Reads the deals JSON file (`deals.comprehensive.json`)
2. Updates the date to today's date automatically
3. Imports all deals into the DynamoDB database
4. Logs the results

## Configuration

### Application Properties

Add these to `application.yml` (already configured):

```yaml
deals:
  import:
    enabled: true                    # Set to false to disable
    cron: "0 0 2 * * *"            # Daily at 2 AM (cron format)
    path: "src/main/resources/data/deals.comprehensive.json"
```

### Environment Variables

You can override via environment variables:

- `DEALS_IMPORT_ENABLED=true` - Enable/disable scheduler
- `DEALS_IMPORT_CRON="0 0 2 * * *"` - Cron schedule
- `DEALS_IMPORT_PATH="path/to/deals.json"` - Path to deals file

### Cron Schedule Format

```
┌───────────── second (0-59)
│ ┌───────────── minute (0-59)
│ │ ┌───────────── hour (0-23)
│ │ │ ┌───────────── day of month (1-31)
│ │ │ │ ┌───────────── month (1-12)
│ │ │ │ │ ┌───────────── day of week (0-7, Sunday = 0 or 7)
│ │ │ │ │ │
* * * * * *
```

**Examples:**
- `0 0 2 * * *` - Daily at 2:00 AM
- `0 0 */6 * * *` - Every 6 hours
- `0 0 9 * * 1` - Every Monday at 9:00 AM
- `0 30 14 * * *` - Daily at 2:30 PM

## Manual Trigger

For testing or immediate import, you can manually trigger the job:

```bash
curl -X POST http://localhost:8080/api/deals/admin/trigger-import \
  -H "X-Admin-Token: admin-secret-token-change-in-production"
```

**Response:**
```json
{
  "success": true,
  "message": "Scheduled import job triggered successfully"
}
```

## File Location

The scheduler looks for the deals file in these locations (in order):

1. Configured path (`deals.import.path`)
2. Current working directory + configured path
3. `backend/` + configured path
4. `backend/src/main/resources/data/deals.comprehensive.json`

## Logging

The scheduler logs important events:

- **INFO**: Successful imports, job start/completion
- **WARN**: File not found, disabled scheduler
- **ERROR**: Import failures, parsing errors

Check logs for:
```
Starting scheduled deal import job
Importing deals for date: 20251105
Successfully imported 31 deals for store: Walmart on date: 20251105
```

## Disabling the Scheduler

### Option 1: Configuration
Set `deals.import.enabled=false` in `application.yml`

### Option 2: Environment Variable
```bash
export DEALS_IMPORT_ENABLED=false
```

### Option 3: Comment Out Annotation
Remove `@EnableScheduling` from `SmartCartApplication.java` (disables all scheduled jobs)

## Testing

1. **Test manually**: Use the `/admin/trigger-import` endpoint
2. **Test locally**: Change cron to `0 * * * * *` (every minute) for testing
3. **Check logs**: Verify import success in application logs
4. **Verify data**: Query `/api/deals` to see imported deals

## Troubleshooting

### Deals Not Importing

1. **Check if scheduler is enabled**:
   ```bash
   grep "Deal import scheduler" logs/application.log
   ```

2. **Verify file exists**:
   ```bash
   ls -la backend/src/main/resources/data/deals.comprehensive.json
   ```

3. **Check file permissions**: Ensure the app can read the file

4. **Verify date format**: File should have date in `YYYYMMDD` format

### Import Fails

1. **Check JSON validity**: Ensure `deals.comprehensive.json` is valid JSON
2. **Check DynamoDB connection**: Verify database is accessible
3. **Review error logs**: Look for specific error messages

### Wrong Schedule

- Verify cron expression format
- Use [cron expression tester](https://crontab.guru/) to validate
- Remember: cron uses server timezone

## Future Enhancements

- Support multiple deal files (one per store)
- Fetch deals from external APIs/feeds
- Email notifications on import failures
- Retry logic for failed imports
- Import history tracking

## Related Files

- `DealImportScheduler.java` - Scheduler service
- `DealService.java` - Import logic
- `DealsController.java` - Manual trigger endpoint
- `deals.comprehensive.json` - Deal data file
- `application.yml` - Configuration









