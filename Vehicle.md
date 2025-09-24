# Vehicle Management API Documentation

## Overview

The Vehicle Management API provides comprehensive CRUD operations for managing vehicles in the SAI Travel system. All endpoints require JWT authentication and follow a consistent response format.

## Base URL
```
http://localhost:4000/api/vehicles
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

### 1. Create Vehicle

**Endpoint:** `POST /api/vehicles`  
**Description:** Creates a new vehicle for the authenticated user  
**Authentication:** Required

#### Request Payload
```json
{
  "vehicleNumber": "string" // Required, 1-20 characters, alphanumeric with spaces and hyphens
}
```

#### Request Example
```json
{
  "vehicleNumber": "MH12AB1234"
}
```

#### Success Response (201)
```json
{
  "status": true,
  "message": "Vehicle created successfully",
  "data": {
    "userId": "68d3613183b498b51cbbc114",
    "vehicleNumber": "MH12AB1234",
    "_id": "68d3613183b498b51cbbc11a",
    "createdAt": "2025-09-24T03:10:41.999Z",
    "updatedAt": "2025-09-24T03:10:41.999Z"
  }
}
```

#### Error Responses

**400 - Bad Request (Missing Vehicle Number)**
```json
{
  "status": false,
  "message": "Vehicle number is required",
  "data": null
}
```

**409 - Conflict (Duplicate Vehicle Number)**
```json
{
  "status": false,
  "message": "Vehicle number already exists",
  "data": null
}
```

**401 - Unauthorized**
```json
{
  "status": false,
  "message": "User authentication required",
  "data": null
}
```

---

### 2. Get All Vehicles

**Endpoint:** `GET /api/vehicles`  
**Description:** Retrieves all vehicles for the authenticated user with search and pagination  
**Authentication:** Required

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| search | string | No | - | Search term for vehicle number (partial match) |
| page | number | No | 1 | Page number for pagination (min: 1) |
| limit | number | No | 10 | Items per page (min: 1, max: 50) |

#### Request Examples
```
GET /api/vehicles
GET /api/vehicles?search=MH12
GET /api/vehicles?page=2&limit=5
GET /api/vehicles?search=AB&page=1&limit=20
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Vehicles retrieved successfully",
  "data": {
    "vehicles": [
      {
        "_id": "68d3613183b498b51cbbc11a",
        "userId": "68d3613183b498b51cbbc114",
        "vehicleNumber": "MH12AB1234",
        "createdAt": "2025-09-24T03:10:41.999Z",
        "updatedAt": "2025-09-24T03:10:41.999Z"
      },
      {
        "_id": "68d3613283b498b51cbbc127",
        "userId": "68d3613183b498b51cbbc114",
        "vehicleNumber": "GJ01CD5678",
        "createdAt": "2025-09-24T03:10:42.107Z",
        "updatedAt": "2025-09-24T03:10:42.107Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalVehicles": 2,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

#### Success Response (200) - No Vehicles Found
```json
{
  "status": true,
  "message": "No vehicles found",
  "data": {
    "vehicles": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalVehicles": 0,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 3. Get Vehicle by ID

**Endpoint:** `GET /api/vehicles/:id`  
**Description:** Retrieves a single vehicle by its ID  
**Authentication:** Required

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the vehicle |

#### Request Example
```
GET /api/vehicles/68d3613183b498b51cbbc11a
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Vehicle retrieved successfully",
  "data": {
    "_id": "68d3613183b498b51cbbc11a",
    "userId": "68d3613183b498b51cbbc114",
    "vehicleNumber": "MH12AB1234",
    "createdAt": "2025-09-24T03:10:41.999Z",
    "updatedAt": "2025-09-24T03:10:41.999Z"
  }
}
```

#### Error Responses

**404 - Not Found**
```json
{
  "status": false,
  "message": "Vehicle not found",
  "data": null
}
```

**400 - Bad Request (Invalid ID)**
```json
{
  "status": false,
  "message": "Invalid vehicle ID",
  "data": null
}
```

---

### 4. Update Vehicle

**Endpoint:** `PUT /api/vehicles/:id`  
**Description:** Updates an existing vehicle  
**Authentication:** Required

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the vehicle |

#### Request Payload
```json
{
  "vehicleNumber": "string" // Required, 1-20 characters, alphanumeric with spaces and hyphens
}
```

#### Request Example
```json
{
  "vehicleNumber": "MH12XY9999"
}
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Vehicle updated successfully",
  "data": {
    "_id": "68d3613183b498b51cbbc11a",
    "userId": "68d3613183b498b51cbbc114",
    "vehicleNumber": "MH12XY9999",
    "createdAt": "2025-09-24T03:10:41.999Z",
    "updatedAt": "2025-09-24T03:15:30.123Z"
  }
}
```

#### Error Responses

**400 - Bad Request (Missing Vehicle Number)**
```json
{
  "status": false,
  "message": "Vehicle number is required",
  "data": null
}
```

**404 - Not Found**
```json
{
  "status": false,
  "message": "Vehicle not found",
  "data": null
}
```

**409 - Conflict (Duplicate Vehicle Number)**
```json
{
  "status": false,
  "message": "Vehicle number already exists",
  "data": null
}
```

---

### 5. Delete Vehicle

**Endpoint:** `DELETE /api/vehicles/:id`  
**Description:** Deletes a vehicle by its ID  
**Authentication:** Required

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | MongoDB ObjectId of the vehicle |

#### Request Example
```
DELETE /api/vehicles/68d3613183b498b51cbbc11a
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Vehicle deleted successfully",
  "data": {
    "_id": "68d3613183b498b51cbbc11a",
    "userId": "68d3613183b498b51cbbc114",
    "vehicleNumber": "MH12AB1234",
    "createdAt": "2025-09-24T03:10:41.999Z",
    "updatedAt": "2025-09-24T03:10:41.999Z"
  }
}
```

#### Error Responses

**404 - Not Found**
```json
{
  "status": false,
  "message": "Vehicle not found",
  "data": null
}
```

---

### 6. Get Vehicle Statistics

**Endpoint:** `GET /api/vehicles/stats`  
**Description:** Retrieves dashboard statistics for vehicles  
**Authentication:** Required

#### Request Example
```
GET /api/vehicles/stats
```

#### Success Response (200)
```json
{
  "status": true,
  "message": "Vehicle statistics retrieved successfully",
  "data": {
    "totalVehicles": 5,
    "recentVehicles": [
      {
        "_id": "68d3613283b498b51cbbc127",
        "userId": "68d3613183b498b51cbbc114",
        "vehicleNumber": "GJ01CD5678",
        "createdAt": "2025-09-24T03:10:42.107Z",
        "updatedAt": "2025-09-24T03:10:42.107Z"
      },
      {
        "_id": "68d3613183b498b51cbbc11a",
        "userId": "68d3613183b498b51cbbc114",
        "vehicleNumber": "MH12AB1234",
        "createdAt": "2025-09-24T03:10:41.999Z",
        "updatedAt": "2025-09-24T03:10:41.999Z"
      }
    ]
  }
}
```

---

## Data Models

### Vehicle Model
```typescript
interface VehicleInterface {
  _id?: string;
  userId: string;
  vehicleNumber: string;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Pagination Response
```typescript
interface VehiclePaginationResponse {
  vehicles: VehicleInterface[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalVehicles: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

## Business Rules

### Vehicle Number Rules
1. **Format**: Alphanumeric characters, spaces, and hyphens allowed
2. **Length**: 1-20 characters
3. **Uniqueness**: Each vehicle number must be unique per user
4. **Case**: Automatically converted to uppercase for consistency
5. **Validation**: Regex pattern: `^[A-Za-z0-9\s-]+$`

### Authentication Rules
1. All endpoints require valid JWT token
2. Users can only access their own vehicles
3. Token must be included in Authorization header
4. Invalid or expired tokens return 401 Unauthorized

### Search & Pagination Rules
1. **Search**: Case-insensitive partial matching on vehicle number
2. **Pagination**: Default page size is 10, maximum is 50
3. **Sorting**: Results sorted by creation date (newest first)
4. **Performance**: Database indexes on userId and vehicleNumber for fast queries

---

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors, invalid parameters)
- **401**: Unauthorized (missing or invalid token)
- **404**: Not Found (vehicle doesn't exist)
- **409**: Conflict (duplicate vehicle number)
- **500**: Internal Server Error

### Error Response Format
All error responses follow this format:
```json
{
  "status": false,
  "message": "Error description",
  "data": null
}
```

---

## Mobile Optimization Features

### Responsive Design Support
- **Pagination**: Configurable page sizes for different screen sizes
- **Search**: Real-time search with debouncing support
- **Touch-Friendly**: All responses designed for mobile UI integration

### Performance Optimizations
- **Database Indexes**: Fast search and retrieval
- **Lean Queries**: Minimal data transfer
- **Efficient Pagination**: Optimized for mobile networks

### Mobile-Specific Considerations
- **Confirmation Dialogs**: Delete responses include full vehicle data
- **Error Messages**: Clear, user-friendly error messages
- **Status Codes**: Proper HTTP status codes for mobile app handling

---

## Example Usage

### Complete CRUD Flow
```javascript
// 1. Create a vehicle
const createResponse = await fetch('/api/vehicles', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    vehicleNumber: 'MH12AB1234'
  })
});

// 2. Get all vehicles with search
const listResponse = await fetch('/api/vehicles?search=MH12&page=1&limit=10', {
  headers: {
    'Authorization': 'Bearer your_token'
  }
});

// 3. Update a vehicle
const updateResponse = await fetch('/api/vehicles/vehicle_id', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer your_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    vehicleNumber: 'MH12XY9999'
  })
});

// 4. Delete a vehicle
const deleteResponse = await fetch('/api/vehicles/vehicle_id', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer your_token'
  }
});

// 5. Get dashboard stats
const statsResponse = await fetch('/api/vehicles/stats', {
  headers: {
    'Authorization': 'Bearer your_token'
  }
});
```

---

## Testing

### Test Script
A PowerShell test script is available at `test-vehicle-api.ps1` that tests all endpoints:
```powershell
PowerShell -ExecutionPolicy Bypass -File test-vehicle-api.ps1
```

### Test Coverage
- ✅ User authentication flow
- ✅ Vehicle creation and validation
- ✅ Search and pagination
- ✅ CRUD operations
- ✅ Error handling
- ✅ Duplicate prevention
- ✅ Dashboard statistics

---

## Version Information

**API Version**: 1.0  
**Last Updated**: September 24, 2025  
**Compatibility**: Node.js 18+, MongoDB 7+  

---

*This documentation covers all vehicle management API endpoints and is designed for both backend developers and frontend integration teams.*