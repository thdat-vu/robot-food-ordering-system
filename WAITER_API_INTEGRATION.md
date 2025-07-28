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
- `GET /api/Table` - Get all tables
- `GET /api/Order/table/{tableId}/status/{status}` - Get orders for a specific table with status filter (e.g., Delivering)
- `POST /api/Order/{orderId}/pay` - Initiate payment for an order

### 3. Data Flow

1. **Fetch Categories**: The `useWaiterOrders` hook fetches categories and product-category mappings
2. **Fetch Ready Orders**: Fetches orders from the API and filters for items with status 3 (Ready)
3. **Category Mapping**: Maps order items to categories based on product-category relationships
4. **Group by Categories**: Groups dishes by proper categories (Tráng Miệng, Món Chính, Đồ Uống)
5. **Status Updates**: When waiter serves dishes, order item status is updated to 4 (Served)
6. **Payment Processing**: Fetches orders by table and processes COD payments
7. **Error Handling**: Shows loading and error states with retry functionality

## Files Modified/Created

### New Files:
- `hooks/use-waiter-orders.ts` - Hook to fetch and manage waiter orders with category grouping
- `hooks/use-payment.ts` - Hook for payment functionality
- `lib/api/categories.ts` - API service functions for categories
- `lib/api/tables.ts` - API service functions for tables
- `WAITER_API_INTEGRATION.md` - This documentation

### Modified Files:
- `app/waiter/ServePanel.tsx` - Updated to use category-based grouping
- `app/waiter/PaymentPanel.tsx` - Completely rewritten with API integration
- `lib/api/orders.ts` - Added payment and table-specific order endpoints

## Category Mapping

The system now properly groups order items by their actual categories:

| Category Name | Description | Color Theme |
|---------------|-------------|-------------|
| Tráng Miệng | Desserts | Orange |
| Món Chính | Main Dishes | Green |
| Đồ Uống | Beverages | Blue |
| Khác | Others | Gray |

## Payment Flow

The payment system implements a complete payment workflow:

1. **Table Selection**: User selects a table from the available tables
2. **Order Loading**: Fetches orders with "Delivering" status for the selected table
3. **Order Display**: Shows all order items with actual prices from the API (including detailed price breakdown)
4. **Payment Initiation**: "Xác nhận thanh toán & In hóa đơn" button initiates COD payment
5. **Payment Confirmation**: "Xác nhận đã nhận tiền" button confirms money received
6. **Invoice Printing**: Automatically prints invoice after successful payment

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
- **Payment Integration**: Complete payment flow with COD method
- **Table Management**: Fetches and displays actual tables from database
- **Price Calculation**: Uses actual prices from API including toppings with detailed breakdown
- **Status Filtering**: Only shows orders with "Delivering" status for payment
- **Invoice Generation**: Automatic invoice printing with detailed order information
- **Loading States**: Shows loading indicator during API calls
- **Error Handling**: Shows error message with retry button

## Testing

1. Start the .NET API server on port 5235
2. Create the `.env.local` file with the API URL
3. Start the Next.js development server
4. Navigate to `/waiter` page
5. Test the "Điều khiển" tab:
   - Verify that real data is loaded instead of dummy data
   - Test the serve functionality by selecting dishes and clicking "Phục vụ"
   - Verify that dishes are properly grouped by categories
6. Test the "Thanh toán" tab:
   - Select a table to view orders
   - Verify order items and prices are displayed correctly
   - Test payment flow with "Xác nhận thanh toán & In hóa đơn"
   - Test money confirmation with "Xác nhận đã nhận tiền"

## Notes

- The integration filters orders to only show items with status 3 (Ready) in the control tab
- Category mapping is done using the ProductCategory API to get accurate category information
- The serve functionality updates the order item status to 4 (Served)
- Payment panel shows all orders for a table regardless of status
- Payment uses COD method with proper API integration
- Error handling includes retry functionality
- Fallback categories are provided if the category API fails
- Invoice printing includes detailed order information with toppings and prices 

## Price Calculation

The payment system now properly calculates prices:

1. **Individual Item Price**: Each order item shows the actual price from `ProductSize.Price`
2. **Quantity**: All items are set to quantity = 1 (business rule)
3. **Toppings Price**: Additional toppings are calculated per item
4. **Total Calculation**: 
   - Item Total = (ProductSize.Price × Quantity) + (Toppings.Price × Quantity)
   - Order Total = Sum of all item totals
   - Table Total = Sum of all order totals

### Price Display Format:
- **Base Price**: Shows "25.000đ × 1 = 25.000đ"
- **With Toppings**: Shows "25.000đ × 1 = 25.000đ + 5.000đ (toppings)"
- **Item Total**: Shows the final price for each item
- **Order Total**: Shows total for each order
- **Table Total**: Shows total for all orders on the table 