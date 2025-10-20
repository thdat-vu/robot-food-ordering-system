# Deployment Guide for Robot Food Ordering System

This guide explains how to deploy the frontend to Vercel and configure environment variables for production.

## Environment Variables Setup

### For Vercel Deployment

1. **Go to your Vercel project dashboard**
2. **Navigate to Settings > Environment Variables**
3. **Add the following environment variable:**

```
Name: NEXT_PUBLIC_API_URL
Value: https://be-robo.zd-dev.xyz/api
Environment: Production
```

### For Development

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5235/api
```

## Environment Configuration

The application uses a centralized environment configuration in `env.config.ts`:

- **Development**: Uses `http://localhost:5235/api` (fallback)
- **Production**: Uses `https://be-robo.zd-dev.xyz/api` (fallback)
- **Custom**: Uses `NEXT_PUBLIC_API_URL` environment variable if set

## API Configuration

The application has two API client configurations:

1. **`lib/axios.ts`**: Main API client used throughout the application
2. **`api/api.ts`**: Secondary API client (legacy, consider removing)

Both now use the centralized environment configuration.

## Deployment Steps

### 1. Prepare for Production

1. Ensure your backend API is deployed and accessible at `https://be-robo.zd-dev.xyz/api`
2. Test the API endpoints from your local environment

### 2. Deploy to Vercel

1. **Connect your GitHub repository to Vercel**
2. **Set environment variables in Vercel dashboard:**
   - `NEXT_PUBLIC_API_URL`: `https://be-robo.zd-dev.xyz/api`
3. **Deploy the application**

### 3. Verify Deployment

1. **Check that the frontend can connect to the backend API**
2. **Test all major functionalities:**
   - Chef page (order management)
   - Waiter page (serving orders)
   - User page (ordering)
   - Moderator page (feedback)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your Vercel domain
2. **API Connection Issues**: Verify the API URL is correct and accessible
3. **Environment Variables**: Make sure `NEXT_PUBLIC_API_URL` is set in Vercel

### Debugging

1. **Check browser console** for API request logs
2. **Verify environment variables** are loaded correctly
3. **Test API endpoints** directly in browser or Postman

## Environment-Specific Configurations

### Development
- API URL: `http://localhost:5235/api`
- Environment: `development`

### Production
- API URL: `https://be-robo.zd-dev.xyz/api`
- Environment: `production`

### Testing
- API URL: `http://localhost:5235/api`
- Environment: `test`

## Notes

- The `NEXT_PUBLIC_` prefix is required for client-side access in Next.js
- Environment variables are embedded at build time
- Changes to environment variables require redeployment
- The application falls back to development URLs if environment variables are not set 