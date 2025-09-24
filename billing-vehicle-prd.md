# Product Requirement Document
## Billing Generation & Vehicle Management System

### 1. Product Overview

**Product Name:** Billing & Vehicle Management System  
**Version:** 1.0  
**Target Users:** Small businesses (Travel companies, Taxi companies)  
**Tech Stack:** React (Frontend), MongoDB (Backend), Render (Deployment)

### 2. Problem Statement

Small travel and taxi companies need a simple, efficient way to:
- Manage their vehicle fleet information
- Generate professional billing documents for clients
- Maintain organized records of all transactions
- Export billing data in standard formats (PDF/Excel)

### 3. Product Goals

**Primary Goals:**
- Streamline billing process for small transportation businesses
- Provide centralized vehicle management
- Enable quick generation and export of professional invoices
- Maintain organized billing history with easy access

**Success Metrics:**
- User can create a bill in under 2 minutes
- 95% uptime on free Render deployment
- Clean, intuitive interface requiring minimal training

### 4. Target Users

**Primary Users:**
- Small travel company owners/operators
- Taxi service providers
- Fleet managers
- Individual drivers with multiple vehicles

**User Characteristics:**
- Limited technical expertise
- Need quick, professional billing solutions
- Manage 1-20 vehicles typically
- Process 5-50 bills per month

### 5. Core Features & Functionality

#### 5.1 User Authentication & Profile Management
- **User Registration/Login** (Required)
  - Simple email/password authentication
  - Individual user accounts with isolated data
  - Password reset functionality
  - Session management with JWT tokens
  - Secure logout functionality

#### 5.2 Vehicle Management Module
- **Add Vehicle**
  - Vehicle Number (Required - Primary identifier)
  - Basic vehicle information only
- **View All Vehicles**
  - Mobile-friendly list view with search/filter capabilities
  - Touch-friendly quick actions (Edit, Delete)
  - Swipe gestures for mobile actions
- **Edit/Update Vehicle Details**
- **Delete Vehicle** (with mobile-friendly confirmation prompt)

#### 5.3 Billing Management Module

##### 5.3.1 Create New Billing
**Required Fields:**
1. Company Name (Text input)
2. Vehicle Selection (Dropdown from user's vehicle list)
3. Billing Date (Date picker, default: today)
4. Recipient Name (Text input)
5. Recipient Address (Textarea)
6. Working Time (Text input - e.g., "One Day", "Two Days")
7. HSN/ASC Code (Text input, default: "996601")
8. Quantity (Number input, default: 1)
9. Rate (Number input with currency symbol)

**Auto-calculated Fields:**
- Subtotal (Qty × Rate)
- Tax calculations (GST/VAT as applicable)
- Total Amount (Subtotal + Taxes)
- All calculations update in real-time

##### 5.3.2 Billing Template
- Single predefined template for all users (Phase 1)
- Professional invoice format
- Company branding placeholder
- Standard business invoice layout

##### 5.3.3 Live Preview
- Real-time preview of billing document
- Show exactly how PDF will appear
- Update preview as user fills form fields

##### 5.3.4 Export Functionality
- **PDF Export:** Custom invoice format (template provided later)
- **Excel Export:** Structured data format
- Mobile-friendly download process
- Filename format: `Bill_[CompanyName]_[Date]_[VehicleNumber]`
- Share functionality for mobile devices

#### 5.4 Dashboard
- **Overview Statistics**
  - Total vehicles count
  - Total bills generated
  - Recent billing activity
- **Quick Actions**
  - Create New Bill (Primary CTA)
  - Add New Vehicle
- **Recent Items**
  - Last 5 bills created
  - Recently added vehicles
- **Navigation Menu**
  - All Vehicles
  - All Bills
  - Create New Bill
  - Profile/Settings

#### 5.5 Billing History (Required)
- **Mobile-Optimized List View**
  - Card-based layout for mobile
  - Tabular display for desktop
  - Columns: Date, Company, Vehicle, Amount, Actions
- **Advanced Search & Filter** (Required)
  - Filter by date range (mobile date pickers)
  - Filter by company name
  - Filter by vehicle
  - Search by recipient name
  - Mobile-friendly filter interface
- **Actions per Bill**
  - View details (mobile modal)
  - Re-download PDF/Excel
  - Delete (completed bills only)
- **Data Persistence:** Only completed bills are saved

### 6. Technical Specifications

#### 6.1 Frontend (React)
- **Framework:** React 18+
- **Styling:** CSS Modules or Styled Components
- **State Management:** React Context API or Redux Toolkit
- **Routing:** React Router
- **Form Management:** React Hook Form
- **PDF Generation:** jsPDF or react-pdf
- **Excel Generation:** xlsx library
- **Date Handling:** date-fns or dayjs

#### 6.2 Backend & Database
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT tokens
- **API:** RESTful endpoints

**Data Models:**

```javascript
User {
  _id: ObjectId,
  email: String,
  password: String (hashed),
  businessName: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
}

Vehicle {
  _id: ObjectId,
  userId: ObjectId (ref: User),
  vehicleNumber: String (required, unique per user),
  createdAt: Date,
  updatedAt: Date
}

Billing {
  _id: ObjectId,
  userId: ObjectId (ref: User),
  companyName: String,
  vehicleId: ObjectId (ref: Vehicle),
  billingDate: Date,
  recipientName: String,
  recipientAddress: String,
  workingTime: String,
  hsnCode: String (default: "996601"),
  quantity: Number (default: 1),
  rate: Number,
  subtotal: Number (calculated: qty × rate),
  taxAmount: Number (calculated),
  total: Number (calculated: subtotal + tax),
  isCompleted: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

#### 6.3 Deployment
- **Platform:** Render (Free tier)
- **Environment:** Node.js
- **Database:** MongoDB Atlas (Free tier)

### 7. User Interface Requirements

#### 7.1 Design Principles
- **Mobile-First Design:** All modules optimized for mobile devices
- Touch-friendly interface with adequate tap targets (44px minimum)
- Responsive design that works seamlessly on phones, tablets, and desktop
- Intuitive navigation with mobile-friendly menus
- Clear visual hierarchy with mobile considerations
- Professional appearance suitable for business use on any device
- Fast loading times on mobile networks

#### 7.2 Key UI Components
- **Mobile-Optimized Dashboard** with cards/widgets
- **Responsive Data Tables** with horizontal scroll on mobile
- **Full-Screen Modal Dialogs** for forms on mobile
- **Toast Notifications** positioned for mobile viewing
- **Loading States** and error handling across all screen sizes
- **Mobile-Friendly Billing Preview** with zoom/pinch capabilities
- **Touch Gestures** for common actions (swipe, tap, hold)
- **Bottom Navigation** for mobile primary actions
- **Floating Action Buttons** for quick access to create functions

### 8. Development Checklist

#### 8.1 Setup & Configuration
- [❌] Initialize React application with mobile-first approach
- [❌] Set up MongoDB connection and authentication
- [❌] Configure environment variables for all environments
- [❌] Set up responsive routing structure
- [❌] Implement JWT-based authentication system
- [❌] Create database models/schemas with validation

#### 8.2 Vehicle Management Features
- [ ] Create Vehicle model and mobile-optimized API endpoints
- [ ] Add touch-friendly search/filter functionality for vehicles
- [ ] Implement vehicle deletion with mobile confirmation dialog
- [ ] Add comprehensive form validation for vehicle data
- [ ] Test vehicle management on mobile devices

#### 8.3 Billing Management Features
- [ ] Create Billing model with auto-calculation fields
- [ ] Build mobile-optimized billing creation form with all required fields
- [ ] Implement responsive vehicle selection dropdown
- [ ] Add real-time auto-calculation for subtotal, tax, and total
- [ ] Create mobile-friendly live preview component with zoom functionality
- [ ] Implement PDF generation with custom template (provided later)
- [ ] Implement Excel export functionality
- [ ] Add comprehensive form validation and mobile error handling
- [ ] Ensure completed bills only are persisted to database

#### 8.4 Dashboard & History
- [ ] Create mobile-first dashboard layout and components
- [ ] Implement mobile-optimized billing history list view (card-based)
- [ ] Add touch-friendly search and filter functionality for bills
- [ ] Create mobile-optimized bill detail view modal
- [ ] Add delete functionality for completed bills only
- [ ] Implement responsive navigation between modules
- [ ] Add pull-to-refresh functionality for mobile

#### 8.5 UI/UX Implementation
- [ ] Design and implement mobile-first responsive layout
- [ ] Create consistent mobile-friendly component library
- [ ] Add loading states and error boundaries for all screen sizes
- [ ] Implement mobile-optimized toast notifications
- [ ] Add mobile-friendly confirmation dialogs for destructive actions
- [ ] Ensure touch targets meet accessibility standards (44px minimum)
- [ ] Implement swipe gestures and touch interactions
- [ ] Test thoroughly on various mobile devices and screen sizes

#### 8.6 Export & Print Features
- [ ] Implement custom PDF template based on provided invoice design
- [ ] Ensure Excel export includes all calculated fields
- [ ] Add mobile-friendly download and share functionality
- [ ] Implement proper filename generation with sanitization
- [ ] Test export functionality across mobile browsers and devices
- [ ] Add download progress indicators for mobile users

#### 8.7 Testing & Quality Assurance
- [ ] Test all CRUD operations on mobile and desktop
- [ ] Verify form validations work correctly across all devices
- [ ] Test PDF/Excel generation with various data on mobile
- [ ] Ensure responsive design works on phones, tablets, and desktop
- [ ] Test authentication flow on mobile devices
- [ ] Verify data persistence and retrieval across sessions
- [ ] Test touch interactions and mobile gestures
- [ ] Perform cross-browser mobile testing

#### 8.8 Deployment & Launch
- [ ] Set up MongoDB Atlas database
- [ ] Configure Render deployment
- [ ] Set up environment variables on Render
- [ ] Test production deployment
- [ ] Verify all features work in production
- [ ] Monitor performance and error logs

### 9. Future Enhancements (Phase 2)

- **Multiple Billing Templates:** Allow users to create custom templates
- **Advanced Reporting:** Monthly/yearly billing reports
- **Client Management:** Store client details for quick billing
- **Recurring Bills:** Set up automatic recurring invoices
- **Multi-currency Support:** Handle different currencies
- **Advanced Filters:** More sophisticated search and filtering options
- **Backup/Export:** Full data export capabilities
- **API Integration:** Connect with accounting software

### 10. Success Criteria

**Phase 1 Success Metrics:**
- [ ] User can register, login, and logout successfully on mobile and desktop
- [ ] User can add, edit, delete vehicles using mobile interface
- [ ] User can create bills with all required information on mobile
- [ ] Auto-calculations work correctly for subtotal, tax, and total
- [ ] Live preview shows accurate billing information on mobile
- [ ] PDF and Excel exports work correctly on mobile devices
- [ ] Dashboard displays user data accurately on all screen sizes
- [ ] Application is deployed and mobile-accessible online
- [ ] All modules are fully functional on mobile devices
- [ ] Only completed bills are saved to database

**Quality Metrics:**
- [ ] Page load times under 3 seconds
- [ ] Forms submit without errors
- [ ] Data persists correctly between sessions
- [ ] No console errors in production
- [ ] Professional-looking exported documents

### 11. Risk Assessment

**Technical Risks:**
- Free tier limitations on Render and MongoDB Atlas
- PDF generation performance with complex templates
- File download limitations in different browsers

**Mitigation Strategies:**
- Monitor usage against free tier limits
- Optimize PDF generation for performance
- Test download functionality across major browsers
- Implement error handling and user feedback

---

*This PRD serves as the primary reference document for developing the Billing & Vehicle Management System. Regular updates should be made as requirements evolve during development.*