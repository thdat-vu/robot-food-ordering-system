# API Integration for Chef Page

This document describes the API integration for the chef page to replace mock data with real data from the .NET backend.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root of the Next.js project with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5xxx/api
```

### 2. API Endpoints Used

The chef page integrates with the following .NET API endpoints:

- `GET /api/orders` - Get all orders with pagination
- `PATCH /api/orders/{orderId}/items/{itemId}/status` - Update order item status

### 3. Data Flow

1. **Fetch Orders**: The `useKitchenOrders` hook fetches orders from the API on component mount
2. **Transform Data**: API response is transformed to match frontend Order type
3. **Status Updates**: When chef updates order status, both local state and API are updated
4. **Error Handling**: Falls back to mock data if API is unavailable

## Files Modified/Created

### New Files:
- `lib/axios.ts` - Axios client configuration
- `lib/api/orders.ts` - API service functions
- `lib/utils/order-transformer.ts` - Data transformation utilities
- `API_INTEGRATION.md` - This documentation

### Modified Files:
- `hooks/use-kitchen-orders.ts` - Updated to use API instead of mock data
- `app/chef/page.tsx` - Added loading and error states

## Status Mapping

| Frontend Status | API Status (Number) | API Status (String) |
|----------------|-------------------|-------------------|
| đang chờ | 1 | Pending |
| đang thực hiện | 2 | Preparing |
| bắt đầu phục vụ | 3 | Ready |

## Error Handling

- **API Unavailable**: Falls back to mock data
- **Status Update Failures**: Reverts local state changes
- **Loading States**: Shows loading indicator during API calls
- **Error States**: Shows error message with retry button

## Testing

1. Start the .NET API server
2. Set the `NEXT_PUBLIC_API_URL` environment variable
3. Start the Next.js development server
4. Navigate to `/chef` page
5. Verify that real data is loaded instead of mock data

## Notes

- The integration maintains backward compatibility with mock data
- ID mappings are used to track frontend order IDs to API order item IDs
- Product categorization is done client-side based on product names
- Images are mapped based on product names 