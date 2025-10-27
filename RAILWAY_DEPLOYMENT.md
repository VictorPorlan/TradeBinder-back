# Railway Deployment Guide

This guide explains how to deploy the TradeBinder backend to Railway.

## Prerequisites

1. A Railway account (https://railway.app)
2. A GitHub/GitLab/Bitbucket account connected to your repository
3. Environment variables configured

## Deployment Steps

### 1. Connect Your Repository to Railway

1. Log in to Railway
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `tradebinder-backend` repository
5. Railway will automatically detect it as a Node.js project

### 2. Configure Environment Variables

In Railway, go to your project → Variables tab and add the following environment variables:

#### Database Configuration
```
DB_HOST=<your-postgres-host>
DB_PORT=5432
DB_USERNAME=<your-postgres-username>
DB_PASSWORD=<your-postgres-password>
DB_NAME=tradebinder
```

#### JWT Configuration
```
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=<generate-another-strong-random-secret>
JWT_REFRESH_EXPIRES_IN=7d
```

#### Application Configuration
```
NODE_ENV=production
API_PREFIX=api
CORS_ORIGIN=https://your-frontend-url.com
```

**Note:** Railway automatically provides the `PORT` environment variable, so you don't need to set it.

### 3. Set Up PostgreSQL Database

Railway provides managed PostgreSQL:

1. In your Railway project, click "New" → "Database" → "Add PostgreSQL"
2. Railway will create a PostgreSQL service and automatically set environment variables:
   - `DATABASE_URL` (Railway default)
   - Or individual `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
3. You can either:
   - Use the built-in variables Railway provides
   - Or create your own PostgreSQL database

### 4. Configure Database Connection

The application is already configured to handle Railway's environment variables:
- Reads from `DB_HOST`, `DB_USERNAME`, etc. (your custom vars)
- Or can use Railway's `DATABASE_URL` if you prefer

#### Option A: Use Railway's DATABASE_URL

If you want to use Railway's `DATABASE_URL`, modify `src/config/database.config.ts`:

```typescript
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  // ... rest of config
};
```

#### Option B: Use Individual Variables (Current Setup)

Keep the current setup and configure these variables in Railway:
- `DB_HOST`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_NAME`
- `DB_PORT` (optional, defaults to 5432)

### 5. Run Database Migrations

After your first deployment, you need to run migrations:

1. Go to your Railway project
2. Click on your service → "Deploy Logs"
3. Click the "..." menu → "Run Command"
4. Run: `npm run railway:migrate`

Or use Railway's CLI:
```bash
railway run npm run railway:migrate
```

### 6. Verify Deployment

Once deployed, Railway will provide you with a URL like:
```
https://your-app-name.railway.app
```

Your API will be available at:
```
https://your-app-name.railway.app/api
```

Test the health endpoint:
```bash
curl https://your-app-name.railway.app/api
```

## Post-Deployment

### Running Migrations

Whenever you add new migrations, run them using Railway's CLI:

```bash
railway run npm run railway:migrate
```

Or through Railway's web interface:
1. Go to your project → your service
2. Open "Deploy Logs"
3. Click "..." → "Run Command"
4. Enter: `npm run railway:migrate`

### Environment Variables

Railway provides a useful feature: you can set different variables for different environments (production, staging, preview).

### Monitoring

Railway provides built-in monitoring:
- Deploy logs
- Metrics dashboard
- Health checks
- Automatic restarts

### Custom Domains

You can add a custom domain:
1. Go to your project → your service
2. Click "Settings" → "Networking"
3. Add your custom domain

## Important Notes

1. **SSL/TLS**: Railway handles SSL automatically for all domains
2. **Auto-deploy**: Railway will redeploy on every git push to your main branch
3. **Build time**: The first deployment takes longer as it builds the app
4. **Dependencies**: All `dependencies` (not `devDependencies`) are installed
5. **Environment**: Always set `NODE_ENV=production` in Railway

## Troubleshooting

### Build fails
- Check Railway logs for errors
- Ensure `package.json` has the correct build script
- Verify TypeScript compilation errors

### Database connection fails
- Verify environment variables are set correctly
- Check that PostgreSQL service is running
- Ensure SSL is enabled in production (`ssl: { rejectUnauthorized: false }`)

### Application crashes
- Check application logs in Railway
- Verify all required environment variables are set
- Ensure database migrations have been run

### Port issues
- Railway automatically sets `PORT` - don't override it
- The app already reads from `process.env.PORT`

## Scripts Reference

- `npm start` - Start the production server
- `npm run build` - Build the application
- `npm run railway:migrate` - Run database migrations
- `npm run test` - Run tests locally

## Cost Considerations

Railway offers:
- Free tier with $5 monthly credit
- $0.000463 per GB-hour
- Paid from $20/month for production workloads

## Security Best Practices

1. Use strong JWT secrets (generate random strings)
2. Never commit `.env` files
3. Use Railway's secret management for sensitive variables
4. Enable CORS only for your frontend domain
5. Keep dependencies up to date

## Next Steps

1. Set up CI/CD for automatic deployments
2. Configure staging environment
3. Set up monitoring and alerts
4. Configure custom domain
5. Set up database backups

