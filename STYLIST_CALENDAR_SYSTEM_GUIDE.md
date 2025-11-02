# Stylist Calendar Management System

## Overview

A comprehensive calendar management system for stylists to set their availability, manage bookings, and control their schedule.

## Features

### ✅ **Core Features:**
- Weekly schedule management
- Date-specific overrides
- Break time management
- Booking preferences
- Calendar view with bookings
- Availability toggle

## API Endpoints

### **Stylist Calendar Routes** (`/stylist-calendar/*`)

#### 1. Set Availability
```http
POST /stylist-calendar/set-availability
```
**Description:** Set or update stylist's weekly availability schedule

**Request Body:**
```json
{
  "weeklySchedule": {
    "monday": {
      "isAvailable": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breaks": [
        {
          "startTime": "12:00",
          "endTime": "13:00",
          "reason": "Lunch break"
        }
      ]
    },
    "tuesday": {
      "isAvailable": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breaks": []
    },
    "wednesday": {
      "isAvailable": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breaks": []
    },
    "thursday": {
      "isAvailable": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breaks": []
    },
    "friday": {
      "isAvailable": true,
      "startTime": "09:00",
      "endTime": "18:00",
      "breaks": []
    },
    "saturday": {
      "isAvailable": true,
      "startTime": "10:00",
      "endTime": "16:00",
      "breaks": []
    },
    "sunday": {
      "isAvailable": false,
      "startTime": "09:00",
      "endTime": "18:00",
      "breaks": []
    }
  },
  "bookingPreferences": {
    "minAdvanceBooking": 2,
    "maxAdvanceBooking": 30,
    "slotDuration": 60,
    "maxBookingsPerDay": 8,
    "bufferTime": 15
  }
}
```

#### 2. Get Availability
```http
GET /stylist-calendar/get-availability
```
**Description:** Get stylist's current availability settings

#### 3. Add Date Override
```http
POST /stylist-calendar/add-date-override
```
**Description:** Add a date-specific override to the schedule

**Request Body:**
```json
{
  "date": "2023-12-25",
  "isAvailable": false,
  "startTime": "09:00",
  "endTime": "18:00",
  "reason": "Christmas Day - Closed",
  "breaks": []
}
```

#### 4. Remove Date Override
```http
DELETE /stylist-calendar/remove-date-override/:date
```
**Description:** Remove a date-specific override

#### 5. Get Calendar View
```http
GET /stylist-calendar/calendar-view?startDate=2023-12-01&endDate=2023-12-31
```
**Description:** Get calendar view with availability and bookings

#### 6. Toggle Availability
```http
POST /stylist-calendar/toggle-availability
```
**Description:** Enable/disable availability for bookings

**Request Body:**
```json
{
  "isActive": true
}
```

## Default Availability

When a stylist doesn't have custom availability set, the system creates a default schedule:

```json
{
  "monday": { "isAvailable": true, "startTime": "09:00", "endTime": "18:00" },
  "tuesday": { "isAvailable": true, "startTime": "09:00", "endTime": "18:00" },
  "wednesday": { "isAvailable": true, "startTime": "09:00", "endTime": "18:00" },
  "thursday": { "isAvailable": true, "startTime": "09:00", "endTime": "18:00" },
  "friday": { "isAvailable": true, "startTime": "09:00", "endTime": "18:00" },
  "saturday": { "isAvailable": true, "startTime": "09:00", "endTime": "18:00" },
  "sunday": { "isAvailable": false, "startTime": "09:00", "endTime": "18:00" }
}
```

## Booking Preferences

| Setting | Description | Default |
|---------|-------------|---------|
| `minAdvanceBooking` | Minimum hours before booking | 2 hours |
| `maxAdvanceBooking` | Maximum days in advance | 30 days |
| `slotDuration` | Default slot duration | 60 minutes |
| `maxBookingsPerDay` | Maximum bookings per day | 8 |
| `bufferTime` | Buffer time between bookings | 15 minutes |

## Date Overrides

Stylists can set specific dates with different availability:

### Examples:
- **Holidays:** `{ "date": "2023-12-25", "isAvailable": false, "reason": "Christmas Day" }`
- **Extended Hours:** `{ "date": "2023-12-24", "startTime": "08:00", "endTime": "20:00", "reason": "Christmas Eve" }`
- **Personal Time:** `{ "date": "2023-12-26", "isAvailable": false, "reason": "Personal day" }`

## Break Management

Stylists can set breaks during their working hours:

```json
{
  "breaks": [
    {
      "startTime": "12:00",
      "endTime": "13:00",
      "reason": "Lunch break"
    },
    {
      "startTime": "15:00",
      "endTime": "15:15",
      "reason": "Coffee break"
    }
  ]
}
```

## Integration with Booking System

### Available Slots Generation
The system automatically generates available slots based on:
1. **Weekly Schedule** - Regular working hours
2. **Date Overrides** - Specific date modifications
3. **Existing Bookings** - Already booked slots
4. **Break Times** - Scheduled breaks
5. **Buffer Time** - Time between bookings

### Slot Calculation Logic
```javascript
// For each day:
1. Check if day is available in weekly schedule
2. Apply date-specific overrides if any
3. Generate 30-minute slots within working hours
4. Exclude break times
5. Exclude already booked slots
6. Apply buffer time between slots
```

## Frontend Integration

### React Example
```jsx
const StylistCalendar = () => {
  const [availability, setAvailability] = useState(null);
  
  const setWeeklySchedule = async (schedule) => {
    try {
      const response = await fetch('/stylist-calendar/set-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ weeklySchedule: schedule })
      });
      
      const data = await response.json();
      if (data.success) {
        setAvailability(data.data);
      }
    } catch (error) {
      console.error('Error setting availability:', error);
    }
  };
  
  return (
    <div>
      {/* Calendar UI components */}
    </div>
  );
};
```

### Flutter Example
```dart
class StylistCalendarService {
  Future<void> setAvailability(Map<String, dynamic> schedule) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/stylist-calendar/set-availability'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token'
        },
        body: json.encode({'weeklySchedule': schedule}),
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success']) {
          // Handle success
        }
      }
    } catch (e) {
      print('Error: $e');
    }
  }
}
```

## Testing

### Test the Calendar System
```bash
node test-stylist-calendar.js
```

### Manual Testing Examples

#### Set Availability
```bash
curl -X POST http://localhost:5000/stylist-calendar/set-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "weeklySchedule": {
      "monday": {"isAvailable": true, "startTime": "09:00", "endTime": "18:00", "breaks": []},
      "tuesday": {"isAvailable": true, "startTime": "09:00", "endTime": "18:00", "breaks": []}
    }
  }'
```

#### Get Availability
```bash
curl -X GET http://localhost:5000/stylist-calendar/get-availability \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Test Available Slots
```bash
curl -X GET "http://localhost:5000/stylist-booking/available-slots/68f89eff9be127308581fed8?date=2023-12-25&duration=60"
```

## Error Handling

### Common Errors
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - User doesn't have stylist role
- **404 Not Found** - Stylist profile not found
- **400 Bad Request** - Invalid request data

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Security

- **Authentication Required** - All calendar endpoints require JWT authentication
- **Role-Based Access** - Only users with "Stylist" role can access
- **Data Validation** - All input data is validated
- **Date Validation** - Date formats and ranges are validated

## Performance Considerations

- **Indexing** - Database indexes on stylistId and dates
- **Caching** - Availability data can be cached
- **Pagination** - Large date ranges are paginated
- **Optimization** - Efficient slot calculation algorithms

This comprehensive calendar system gives stylists full control over their availability and integrates seamlessly with the booking system! 🎉
