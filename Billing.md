# Billing Management API Documentation

## Overview

The Billing Management API provides comprehensive CRUD operations for managing billing invoices in the SAI Travel system. It includes auto-calculation features, advanced search capabilities, and export functionality. All endpoints require JWT authentication and follow a consistent response format.

## Base URL
```
http://localhost:4000/api/billings
```

## Authentication

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this consistent format:
```json
{
  "status": boolean,
  "message": string,
  "data": object | array | null
}
```

---

## API Endpoints

### 1. Create Billing

**Endpoint:** `POST /api/billings`  
**Description:** Creates a new billing invoice with auto-calculation of tax and total amounts  
**Authentication:** Required

#### Request Payload
```json
{
  "companyName": "string",              // Required, max 100 characters
  "vehicleId": "string",               // Required, MongoDB ObjectId
  "billingDate": "Date",               // Optional, defaults to current date
  "recipientName": "string",           // Required, max 100 characters
  "recipientAddress": "string",        // Required, max 500 characters
  "workingTime": "string",             // Required, max 50 characters
  "hsnCode": "string",                 // Optional, defaults to "996601"
  "quantity": number,                  // Optional, defaults to 1, min 0.01
  "rate": number                       // Required, min 0.01
}
```

#### Request Example
```json
{
  "companyName": "ABC Transport Co.",
  "vehicleId": "68d3613183b498b51cbbc11a",
  "recipientName": "John Doe",
  "recipientAddress": "123 Main Street, Mumbai, Maharashtra 400001",
  "workingTime": "Two Days",
  "quantity": 2,
  "rate": 5000
}
```

#### Success Response (201)
```json
{
  "status": true,
  "message": "Billing created successfully",
  "data": {
    "userId": "68d3613183b498b51cbbc114",
    "companyName": "ABC Transport Co.",
    "vehicleId": {
      "_id": "68d3613183b498b51cbbc11a",
      "vehicleNumber": "MH12AB1234"
    },
    "billingDate": "2025-09-24T03:10:42.000Z",
    "recipientName": "John Doe",
    "recipientAddress": "123 Main Street, Mumbai, Maharashtra 400001",
    "workingTime": "Two Days",
    "hsnCode": "996601",
    "quantity": 2,
    "rate": 5000,
    "subtotal": 10000,
    "taxAmount": 1800,
    "total": 11800,
    "isCompleted": true,
    "_id": "68d3613283b498b51cbbc128",
    "createdAt": "2025-09-24T03:10:42.567Z",
    "updatedAt": "2025-09-24T03:10:42.567Z"
  }
}
```

#### Error Responses

**400 - Bad Request (Missing Required Fields)**
```json
{
  "status": false,
  "message": "All required fields must be provided",
  "data": null
}
```

**404 - Vehicle Not Found**
```json
{
  "status": false,
  "message": "Vehicle not found or doesn't belong to user",
  "data": null
}
```

---

### 2. Get All Billings

**Endpoint:** `GET /api/billings`  
**Description:** Retrieves all billings for the authenticated user with advanced filtering and pagination  
**Authentication:** Required

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| searchQuery | string | No | - | Search in company name, recipient name, working time |
| companyName | string | No | - | Filter by company name (partial match) |
| vehicleId | string | No | - | Filter by specific vehicle |
| dateFrom | string | No | - | Filter bills from this date (ISO format) |
| dateTo | string | No | - | Filter bills until this date (ISO format) |
| isCompleted | boolean | No | - | Filter by completion status |
| page | number | No | 1 | Page number for pagination (min: 1) |
| limit | number | No | 10 | Items per page (min: 1, max: 50) |

#### Request Examples
```
GET /api/billings
GET /api/billings?searchQuery=ABC&page=1&limit=5
GET /api/billings?companyName=Transport&vehicleId=68d3613183b498b51cbbc11a
GET /api/billings?dateFrom=2025-09-01&dateTo=2025-09-30
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Billings retrieved successfully",
  "data": {
    "bills": [
      {
        "_id": "68d3613283b498b51cbbc128",
        "userId": "68d3613183b498b51cbbc114",
        "companyName": "ABC Transport Co.",
        "vehicleId": {
          "vehicleNumber": "MH12AB1234"
        },
        "billingDate": "2025-09-24T03:10:42.000Z",
        "recipientName": "John Doe",
        "recipientAddress": "123 Main Street, Mumbai, Maharashtra 400001",
        "workingTime": "Two Days",
        "hsnCode": "996601",
        "quantity": 2,
        "rate": 5000,
        "subtotal": 10000,
        "taxAmount": 1800,
        "total": 11800,
        "isCompleted": true,
        "createdAt": "2025-09-24T03:10:42.567Z",
        "updatedAt": "2025-09-24T03:10:42.567Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalBills": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 3. Get Billing by ID

**Endpoint:** `GET /api/billings/:id`  
**Description:** Retrieves a single billing by its ID  
**Authentication:** Required

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the billing |

#### Success Response (200)
```json
{
  "status": true,
  "message": "Billing retrieved successfully",
  "data": {
    "_id": "68d3613283b498b51cbbc128",
    "userId": "68d3613183b498b51cbbc114",
    "companyName": "ABC Transport Co.",
    "vehicleId": {
      "_id": "68d3613183b498b51cbbc11a",
      "vehicleNumber": "MH12AB1234"
    },
    "billingDate": "2025-09-24T03:10:42.000Z",
    "recipientName": "John Doe",
    "recipientAddress": "123 Main Street, Mumbai, Maharashtra 400001",
    "workingTime": "Two Days",
    "hsnCode": "996601",
    "quantity": 2,
    "rate": 5000,
    "subtotal": 10000,
    "taxAmount": 1800,
    "total": 11800,
    "isCompleted": true,
    "createdAt": "2025-09-24T03:10:42.567Z",
    "updatedAt": "2025-09-24T03:10:42.567Z"
  }
}
```

---

### 4. Update Billing

**Endpoint:** `PUT /api/billings/:id`  
**Description:** Updates an existing billing with auto-recalculation  
**Authentication:** Required

#### Request Payload (All fields optional)
```json
{
  "companyName": "string",
  "vehicleId": "string",
  "billingDate": "Date",
  "recipientName": "string",
  "recipientAddress": "string",
  "workingTime": "string",
  "hsnCode": "string",
  "quantity": number,
  "rate": number
}
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Billing updated successfully",
  "data": {
    // Updated billing object with recalculated amounts
  }
}
```

---

### 5. Delete Billing

**Endpoint:** `DELETE /api/billings/:id`  
**Description:** Deletes a billing (only completed bills can be deleted)  
**Authentication:** Required

#### Success Response (200)
```json
{
  "status": true,
  "message": "Billing deleted successfully",
  "data": {
    // Deleted billing object
  }
}
```

---

### 6. Get Billing Statistics

**Endpoint:** `GET /api/billings/stats`  
**Description:** Retrieves dashboard statistics for billings  
**Authentication:** Required

#### Success Response (200)
```json
{
  "status": true,
  "message": "Billing statistics retrieved successfully",
  "data": {
    "totalBills": 15,
    "totalRevenue": 125000.50,
    "monthlyBills": 8,
    "monthlyRevenue": 68500.25,
    "recentBills": [
      {
        "_id": "68d3613283b498b51cbbc128",
        "companyName": "ABC Transport Co.",
        "vehicleId": {
          "vehicleNumber": "MH12AB1234"
        },
        "total": 11800,
        "billingDate": "2025-09-24T03:10:42.000Z",
        "createdAt": "2025-09-24T03:10:42.567Z"
      }
    ]
  }
}
```

---

### 7. Calculate Billing Amounts

**Endpoint:** `POST /api/billings/calculate`  
**Description:** Utility endpoint for real-time billing calculations  
**Authentication:** Required

#### Request Payload
```json
{
  "quantity": number,     // Optional, defaults to 1
  "rate": number         // Required
}
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Billing calculation completed",
  "data": {
    "quantity": 2,
    "rate": 5000,
    "subtotal": 10000,
    "taxAmount": 1800,
    "total": 11800,
    "taxRate": 0.18
  }
}
```

---

## Auto-Calculation Features

### Tax Calculation
- **Tax Rate:** 18% GST (configurable)
- **Calculation:** Tax Amount = Subtotal × 0.18
- **Precision:** All amounts rounded to 2 decimal places

### Total Calculation
- **Subtotal:** Quantity × Rate
- **Total:** Subtotal + Tax Amount
- **Real-time:** Calculations happen automatically on create/update

---

## Data Models

### Billing Interface
```typescript
interface BillingInterface {
  _id?: string;
  userId: string;
  companyName: string;
  vehicleId: string;
  billingDate: Date;
  recipientName: string;
  recipientAddress: string;
  workingTime: string;
  hsnCode: string;
  quantity: number;
  rate: number;
  subtotal: number;      // Auto-calculated
  taxAmount: number;     // Auto-calculated
  total: number;         // Auto-calculated
  isCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Search Filters Interface
```typescript
interface BillingSearchFilters {
  searchQuery?: string;
  companyName?: string;
  vehicleId?: string;
  dateFrom?: string;
  dateTo?: string;
  isCompleted?: boolean;
  page?: number;
  limit?: number;
}
```

---

## Business Rules

### Validation Rules
1. **Company Name**: 1-100 characters, required
2. **Vehicle ID**: Must exist and belong to authenticated user
3. **Recipient Name**: 1-100 characters, required
4. **Recipient Address**: 1-500 characters, required
5. **Working Time**: 1-50 characters, required
6. **HSN Code**: Default "996601", max 10 characters
7. **Quantity**: Minimum 0.01, maximum 999,999
8. **Rate**: Minimum 0.01, maximum 999,999,999

### Auto-Calculation Rules
1. **Subtotal** = Quantity × Rate
2. **Tax Amount** = Subtotal × 18% (GST)
3. **Total** = Subtotal + Tax Amount
4. All amounts rounded to 2 decimal places
5. Calculations triggered on create/update operations

### Security Rules
1. All endpoints require JWT authentication
2. Users can only access their own billings
3. Billing data isolated by user ID
4. Only completed bills can be deleted

---

## Export Features (Planned)

### PDF Export
- Professional invoice template
- Company branding support
- Mobile-friendly download
- Filename: `Bill_[CompanyName]_[Date]_[VehicleNumber].pdf`

### Excel/CSV Export
- Structured data format
- Bulk export capability
- Summary calculations included
- Filename: `Bill_[CompanyName]_[Date]_[VehicleNumber].csv`

---

## Mobile Optimization Features

### Search & Filter
- Text-based search across multiple fields
- Date range filtering with mobile date pickers
- Company and vehicle-based filtering
- Touch-friendly pagination controls

### Performance Optimizations
- Database indexes for fast queries
- Efficient pagination with lean queries
- Optimized for mobile networks
- Real-time calculations without server round-trips

### Mobile-Specific Considerations
- Consistent API response format
- Proper HTTP status codes
- Clear error messages for mobile UI
- Touch-friendly data structures

---

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found (billing/vehicle doesn't exist)
- **500**: Internal Server Error

### Error Response Format
```json
{
  "status": false,
  "message": "Error description",
  "data": null
}
```

---

## Testing

### Test Script
A comprehensive PowerShell test script is available at `test-billing-api.ps1`:
```powershell
PowerShell -ExecutionPolicy Bypass -File test-billing-api.ps1
```

### Test Coverage
- ✅ Authentication flow
- ✅ Billing CRUD operations
- ✅ Auto-calculation functionality
- ✅ Search and filtering
- ✅ Pagination
- ✅ Data validation
- ✅ Error handling
- ✅ Dashboard statistics

---

## Performance Considerations

### Database Optimization
- Compound indexes for efficient queries
- Text indexes for search functionality
- Lean queries for better performance
- Pagination to limit data transfer

### Mobile Network Optimization
- Minimal response payload size
- Efficient data structures
- Real-time calculations reduce API calls
- Compressed responses where applicable

---

## Integration Examples

### Frontend Integration
```javascript
// Create billing
const createBilling = async (billingData) => {
  const response = await fetch('/api/billings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(billingData)
  });
  return response.json();
};

// Real-time calculation
const calculateAmounts = async (quantity, rate) => {
  const response = await fetch('/api/billings/calculate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity, rate })
  });
  return response.json();
};
```

---

## Version Information

**API Version**: 1.0  
**Last Updated**: September 24, 2025  
**Compatibility**: Node.js 18+, MongoDB 7+, TypeScript 4.9+  

---

*This documentation covers the complete Billing Management API and is designed for both backend developers and frontend integration teams building mobile-first applications.*