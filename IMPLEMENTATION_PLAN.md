# Project 62 - Multi-Subscription Implementation Plan

## Current Issues to Fix

### 1. ✅ BACKEND FIXES (Done)
- [x] Store multiple subscriptions per customer (using unique subscription_id)
- [x] Include price_per_meal and commitment_weeks in subscription data
- [x] Return all subscriptions via API
- [x] Calculate total_weeks correctly (sum of all subscriptions)
- [x] Include complete order data (meal_cost, delivery_cost, total_amount)

### 2. 🚧 FRONTEND UPDATES NEEDED

#### A. CustomerDashboard.jsx - Multi-Subscription Display

**Current State:**
- Shows only 1 subscription (subscriptionData.subscription)
- Displays: Plan Name, Meals/Day, Commitment, Price, Billing, Auto-Renew

**Required Changes:**
```jsx
// Instead of:
subscriptionData.subscription

// Use:
subscriptionData.subscriptions // Array of all subscriptions
subscriptionData.subscription_count // Number of subscriptions
```

**UI Changes:**
1. **Replace single subscription card with:**
   - Accordion/Collapsible panels
   - Each panel labeled: "Subscription 1", "Subscription 2", etc.
   - Show: Plan name, dates, commitment weeks
   
2. **Inside each subscription panel, show:**
   - Plan details (meals/day, price/meal, commitment)
   - Start date → End date
   - Payment amount and date
   - **Weekly delivery schedule** (expandable)
   - Date picker for each delivery (with 3-day validation)

3. **Delivery Schedule Component:**
```jsx
{subscription.deliveries.map((delivery, idx) => (
  <div key={delivery.delivery_id}>
    <span>Week {delivery.week_number}</span>
    <DatePicker 
      value={delivery.delivery_date}
      minDate={today + 3 business days}
      onChange={(date) => handleDeliveryDateChange(delivery.delivery_id, date)}
    />
    <span>{delivery.status}</span>
  </div>
))}
```

#### B. Order History Display Fixes

**Current Issues:**
- Showing $0 for some orders
- Missing status labels
- Missing order type

**Required Changes:**
1. Display actual order amounts from `subscriptionData.orders`
2. Map status codes:
   - "active" → "Approved"
   - "pending" → "Pending"
   - "completed" → "Completed"
3. Show order type: "Meal Prep Subscription"

#### C. Loyalty Tier Meter

**Current Issue:**
- Not showing correct total (should be 6 weeks for 2×3 week purchases)

**Fix:**
- Backend already calculates `loyalty.total_weeks` correctly
- Frontend should use: `subscriptionData.loyalty.total_weeks`
- Update progress bar calculation

### 3. 🆕 NEW FEATURES TO IMPLEMENT

#### Feature 1: Overlapping Subscription Detection

**Location:** MealPrepCheckout.jsx (before payment)

**Logic:**
1. When user clicks "Proceed to Payment"
2. Check if they have active subscriptions
3. Get start/end dates of all active subscriptions
4. Check if new subscription dates overlap

```javascript
const checkOverlap = (newStart, newEnd, existingSubscriptions) => {
  for (const sub of existingSubscriptions) {
    const subStart = new Date(sub.start_date);
    const subEnd = new Date(sub.end_date);
    
    if ((newStart >= subStart && newStart <= subEnd) ||
        (newEnd >= subStart && newEnd <= subEnd)) {
      return true;
    }
  }
  return false;
};
```

**UI:**
- Show modal/popup warning
- Options: "Continue Anyway" or "Change Start Date"
- If "Change Start Date", show date picker

#### Feature 2: Individual Delivery Date Changes

**Backend Endpoint Needed:**
```
PUT /api/project62/deliveries/{delivery_id}/reschedule
Body: { "new_date": "2025-11-15" }

Validation:
- Check new_date is at least 3 business days from today
- Check new_date is not a weekend (Saturday/Sunday)
- Update delivery record
- Send notification to admin
```

**Frontend:**
- Add date picker to each delivery row
- Show business days only
- Display success message after change
- Refresh delivery schedule

#### Feature 3: Admin Dashboard Improvements

**Orders Page:**
- Group orders by customer
- Show customer name and email
- Display order amounts (meal_cost, delivery_cost, total)
- Show order status with color coding

**Deliveries Page:**
- Group deliveries by customer
- Accordion for each customer showing:
  - Customer name, email, phone
  - Expand to see all their deliveries
- Each delivery shows:
  - Week number
  - Delivery date (editable)
  - Address
  - Status
  - Meals per day

### 4. IMPLEMENTATION PRIORITY

**Phase 1 (High Priority - 4 hours):**
1. ✅ Fix order history display (amounts, status, type)
2. ✅ Fix loyalty tier meter calculation
3. ✅ Display multiple subscriptions with accordion

**Phase 2 (Medium Priority - 3 hours):**
1. ✅ Implement overlapping subscription warning
2. ✅ Add delivery schedule display under each subscription

**Phase 3 (Medium Priority - 3 hours):**
1. ✅ Add delivery date modification feature
2. ✅ Implement 3-business-day validation

**Phase 4 (Low Priority - 2 hours):**
1. ✅ Update admin dashboard orders page
2. ✅ Update admin dashboard deliveries grouping

### 5. QUICK FIXES (Do First)

These can be done immediately:

**File: CustomerDashboard.jsx**

```jsx
// Line ~540 - Fix Order History Display
{subscriptionData.orders.map((order, idx) => (
  <div key={order.order_id} className="order-item">
    <div className="order-header">
      <span>Order #{idx + 1}</span>
      <span className="order-status approved">Approved</span>
    </div>
    <div className="order-details">
      <p>Type: Meal Prep Subscription</p>
      <p>Date: {new Date(order.created_at).toLocaleDateString()}</p>
      <p>Duration: {order.weeks} weeks</p>
      <p>Meals/Day: {order.meals_per_day}</p>
      <p className="order-total">Total: ${order.total_amount || 0} SGD</p>
      {order.meal_cost > 0 && (
        <p className="order-breakdown">
          Meals: ${order.meal_cost} + Delivery: ${order.delivery_cost}
        </p>
      )}
    </div>
  </div>
))}
```

```jsx
// Line ~450 - Fix Loyalty Tier Display
<div className="progress-fill" 
  style={{ 
    width: `${Math.min((subscriptionData.loyalty.total_weeks / 12) * 100, 100)}%` 
  }} 
/>
<p className="progress-text">
  {subscriptionData.loyalty.total_weeks} / 12 weeks
</p>
```

```jsx
// Line ~460 - Display Multiple Subscriptions
{subscriptionData.subscriptions.length > 0 ? (
  <div className="subscriptions-container">
    <h3>Your Active Subscriptions ({subscriptionData.subscription_count})</h3>
    {subscriptionData.subscriptions.map((subscription, idx) => (
      <div key={subscription.subscription_id} className="subscription-card">
        <div className="subscription-header" onClick={() => toggleSubscription(idx)}>
          <h4>Subscription #{idx + 1}</h4>
          <span className="toggle-icon">{expanded[idx] ? '▼' : '▶'}</span>
        </div>
        
        {expanded[idx] && (
          <div className="subscription-body">
            <div className="info-item">
              <span>Plan:</span>
              <span>{subscription.plan_name}</span>
            </div>
            <div className="info-item">
              <span>Meals per Day:</span>
              <span>{subscription.meals_per_day}</span>
            </div>
            <div className="info-item">
              <span>Commitment:</span>
              <span>{subscription.commitment_weeks} weeks</span>
            </div>
            <div className="info-item">
              <span>Price per Meal:</span>
              <span>${subscription.price_per_meal}</span>
            </div>
            <div className="info-item">
              <span>Duration:</span>
              <span>{formatDate(subscription.start_date)} → {formatDate(subscription.end_date)}</span>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
) : (
  <p>No active subscriptions</p>
)}
```

### 6. DATA STRUCTURE REFERENCE

**Backend API Response:**
```json
{
  "status": "active",
  "subscription": {...},  // First subscription (backward compatible)
  "subscriptions": [      // All subscriptions (NEW)
    {
      "subscription_id": "uuid-1",
      "plan_name": "1 Meal/Day Plan",
      "meals_per_day": 1,
      "commitment_weeks": 3,
      "price_per_meal": 14.00,
      "start_date": "2025-11-10",
      "end_date": "2025-12-01",
      "payment_amount": 312.00
    },
    {
      "subscription_id": "uuid-2",
      "plan_name": "1 Meal/Day Plan",
      "meals_per_day": 1,
      "commitment_weeks": 3,
      "price_per_meal": 14.00,
      "start_date": "2025-11-12",
      "end_date": "2025-12-03",
      "payment_amount": 312.00
    }
  ],
  "subscription_count": 2,
  "orders": [
    {
      "order_id": "uuid",
      "total_amount": 312.00,
      "meal_cost": 252.00,
      "delivery_cost": 60.00,
      "weeks": 3,
      "meals_per_day": 1,
      "status": "active"
    }
  ],
  "loyalty": {
    "tier": "Bronze",
    "total_weeks": 6,  // Sum of all subscriptions
    "discount": 0,
    "free_delivery": false
  }
}
```

## NEXT STEPS

1. Start with Quick Fixes above
2. Test order history display
3. Test loyalty tier calculation
4. Implement multi-subscription accordion
5. Add overlapping subscription detection
6. Implement delivery date changes
7. Update admin dashboard

Estimated Total Time: 12-15 hours
