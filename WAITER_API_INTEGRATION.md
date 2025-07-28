# Waiter API Integration

This document describes the API integration for the waiter page to replace mock data with real data from the .NET backend.

## Setup

### 1. Environment Variables

Create a `.env.local` file in the root of the Next.js project with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5235/api
```

### 2. API Endpoints Used

The waiter page integrates with the following .NET API endpoints:

- `GET /api/Order` - Get all orders with pagination
- `PATCH /api/Order/{orderId}/items/{itemId}/status` - Update order item status
- `GET /api/Category` - Get all categories
- `GET /api/ProductCategory` - Get products with their category information

### 3. Data Flow

1. **Fetch Categories**: The `useWaiterOrders` hook fetches categories and product-category mappings
2. **Fetch Ready Orders**: Fetches orders from the API and filters for items with status 3 (Ready)
3. **Category Mapping**: Maps order items to categories based on product-category relationships
4. **Group by Categories**: Groups dishes by proper categories (Tráng Miệng, Món Chính, Đồ Uống)
5. **Status Updates**: When waiter serves dishes, order item status is updated to 4 (Served)
6. **Error Handling**: Shows loading and error states with retry functionality

## Files Modified/Created

### New Files:
- `hooks/use-waiter-orders.ts` - Hook to fetch and manage waiter orders with category grouping
- `lib/api/categories.ts` - API service functions for categories
- `WAITER_API_INTEGRATION.md` - This documentation

### Modified Files:
- `app/waiter/ServePanel.tsx` - Updated to use category-based grouping
- `app/waiter/PaymentPanel.tsx` - Updated to work with new WaiterDish interface

## Category Mapping

The system now properly groups order items by their actual categories:

| Category Name | Description | Color Theme |
|---------------|-------------|-------------|
| Tráng Miệng | Desserts | Orange |
| Món Chính | Main Dishes | Green |
| Đồ Uống | Beverages | Blue |
| Khác | Others | Gray |

## Status Mapping

| Frontend Status | API Status (Number) | API Status (String) |
|----------------|-------------------|-------------------|
| Ready to Serve | 3 | Ready |
| Served | 4 | Served |

## Features

- **Real-time Order Loading**: Fetches orders with status 3 (Ready) from API
- **Category-based Grouping**: Groups dishes by proper categories from the database
- **Product-Category Mapping**: Maps products to categories using ProductCategory API
- **Quantity Display**: Shows quantity for each dish
- **Serve Functionality**: Updates order item status to 4 (Served) when served
- **Loading States**: Shows loading indicator during API calls
- **Error Handling**: Shows error message with retry button
- **Payment Integration**: Works with served dishes for payment processing

## Testing

1. Start the .NET API server on port 5235
2. Create the `.env.local` file with the API URL
3. Start the Next.js development server
4. Navigate to `/waiter` page
5. Verify that real data is loaded instead of dummy data
6. Test the serve functionality by selecting dishes and clicking "Phục vụ"
7. Verify that dishes are properly grouped by categories

## Notes

- The integration filters orders to only show items with status 3 (Ready)
- Category mapping is done using the ProductCategory API to get accurate category information
- The serve functionality updates the order item status to 4 (Served)
- Payment panel shows served dishes for billing
- Error handling includes retry functionality
- Fallback categories are provided if the category API fails 