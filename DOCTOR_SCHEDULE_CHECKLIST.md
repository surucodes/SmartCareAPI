# Doctor Schedule Page - Manual Confirmation Checklist

**Latest Change**: Doctor Schedule Page Implementation (commit ee8a470)  
**Route**: `/doctor` (Doctor role required)  
**Component**: `SmartCareUI/src/pages/doctor/DoctorSchedulePage.tsx`

---

## 📍 How to Access

1. **Start the frontend server**:
   ```bash
   cd SmartCareUI
   npm run dev
   ```

2. **Navigate to Doctor Schedule Page**:
   - URL: `http://localhost:5173/doctor`
   - **Note**: You must be logged in with a Doctor role account

3. **Login with Doctor Credentials**:
   - Go to `/login`
   - Use a test doctor account credentials
   - Doctor accounts should be pre-configured in the database

---

## 🔐 Prerequisites to Check

- [ ] Backend API is running (see backend setup instructions)
- [ ] Doctor user accounts exist in the database with role `Doctor`
- [ ] At least one doctor has appointments assigned
- [ ] Frontend is running on `http://localhost:5173`
- [ ] CORS is properly configured between frontend and backend

---

## ✅ Phase 1: Doctor Selector (One-time Setup)

**Scenario**: First time accessing `/doctor` with no doctor selected  
**UI State**: "Welcome — which doctor are you?" screen

### Selector Appearance
- [ ] Logo displays at the top
- [ ] Header text: "Welcome — which doctor are you?"
- [ ] Subtitle: "One-time setup for this session..."
- [ ] Grid layout shows available doctors (1-2 columns on desktop, 1 on mobile)

### Doctor Card Display
For each doctor card, confirm:
- [ ] Doctor name displays (serif font, bold)
- [ ] Doctor specialty displays (gold uppercase text)
- [ ] Doctor photo displays if available (rounded circle, 14 × 14px avatar)
- [ ] Fallback avatar (teal background with initials) shows if no photo
- [ ] Card has hover effect (border turns teal, shadow appears)
- [ ] Card is clickable and has cursor pointer

### Selection Behavior
- [ ] Clicking a doctor card selects that doctor
- [ ] Page transitions to Schedule View after selection
- [ ] Selected doctor persists in `sessionStorage` (key: `smartcare:doctorId:{email}`)
- [ ] Refreshing page remembers the selected doctor

---

## ✅ Phase 2: Schedule View - Layout & Navigation

**Main Layout** (Desktop & Mobile)

### Desktop Layout
- [ ] Left sidebar visible (fixed width)
- [ ] Main content area takes remaining width
- [ ] Top bar with week navigation visible
- [ ] Scrollable appointment list in center

### Mobile Layout
- [ ] Sidebar hidden on mobile (responsive at `md` breakpoint)
- [ ] Top bar with hamburger menu visible
- [ ] Week strip (sticky below top bar)
- [ ] Scrollable appointment list

### Sidebar (Desktop Only)
- [ ] Doctor name displays
- [ ] Doctor specialty displays
- [ ] Doctor photo/avatar displays
- [ ] Navigation items: "My Schedule", "Today", "Settings"
- [ ] "My Schedule" is highlighted by default
- [ ] "Today" badge shows count (0 or number of pending/confirmed appointments for today)
- [ ] "Today" navigates to today when clicked
- [ ] Logout button at bottom (red text, logout icon)

### Top Bar (Desktop Only)
- [ ] Week navigation arrows visible (< >)
- [ ] Date display visible
- [ ] "Today" button appears when not viewing today
- [ ] "Today" button disappears when viewing today

### Mobile Top Bar
- [ ] Hamburger menu icon on left (min 44×44px touch target)
- [ ] Doctor name displays in center
- [ ] "Today" button on right (when not viewing today)
- [ ] Bottom sheet menu opens when hamburger clicked

### Mobile Bottom Sheet Menu
- [ ] Appears from bottom with rounded corners
- [ ] Shows navigation items
- [ ] Selected item highlighted in teal
- [ ] Logout button at bottom with red text
- [ ] Close button (X icon) at top right
- [ ] Clicking outside closes menu
- [ ] Overlay with 40% black opacity behind menu

---

## ✅ Phase 3: Date & Week Navigation

### Week Strip Display
- [ ] Shows 7 days of the current week (Monday-Sunday)
- [ ] Current day highlighted differently
- [ ] Days with appointments show a dot indicator
- [ ] Day names: "Mon", "Tue", "Wed", etc.
- [ ] Today's date highlighted in teal

### Week Navigation (Desktop Top Bar)
- [ ] Previous week button (`<`) visible and clickable
- [ ] Next week button (`>`) visible and clickable
- [ ] Clicking previous week loads prior week's appointments
- [ ] Clicking next week loads next week's appointments
- [ ] Week display updates correctly

### Date Selection
- [ ] Clicking a day in week strip selects that date
- [ ] Selected date highlights in teal/dark color
- [ ] Page shows appointments for selected date
- [ ] Date heading updates: "{Day Name}, {Date} (Month)"
  - Example: "Monday, May 26 2025"

### Today Button
- [ ] "Today" button appears when viewing past/future dates
- [ ] Button disappears when viewing today
- [ ] Clicking "Today" resets to current date
- [ ] Clicking "Today" highlights today in week strip

### Historical Date Handling
- [ ] Can navigate to past dates (shows past appointments)
- [ ] Viewing past date shows "Past & Closed" section with completed/cancelled appointments

---

## ✅ Phase 4: Appointment Display & Filtering

### Status Filter Pills
- [ ] Filter pills visible below date heading
- [ ] Pills show: "All", "Confirmed", "Pending", "Cancelled"
- [ ] "All" is selected by default
- [ ] Clicking a filter updates the list immediately

### Filter Behavior - "All"
- [ ] Shows: Pending + Confirmed appointments (active section)
- [ ] Shows: Completed + Cancelled + NoShow appointments (past section under "Past & Closed")
- [ ] Past appointments only shown when filter = "All"

### Filter Behavior - "Confirmed"
- [ ] Shows only Confirmed appointments
- [ ] No past appointments section
- [ ] Count updates in date heading

### Filter Behavior - "Pending"
- [ ] Shows only Pending appointments
- [ ] No past appointments section
- [ ] Count updates in date heading

### Filter Behavior - "Cancelled"
- [ ] Shows Cancelled + NoShow appointments
- [ ] No active/past separation

### Appointment Count Badge
- [ ] Badge shows in date heading: "{count} appointment(s)"
- [ ] Singular/plural handled correctly
- [ ] Updates when filter changes

---

## ✅ Phase 5: Appointment Cards & Actions

### Card Display (each appointment)
- [ ] Patient name displays
- [ ] Appointment slot/time displays
- [ ] Consultation type displays
- [ ] Current status displays (Pending, Confirmed, Completed, etc.)
- [ ] Status has appropriate color coding
- [ ] Patient phone number visible (if available)
- [ ] Patient email visible (if available)

### Card Actions (buttons visible on appointment card)
For each appointment, confirm these actions are available:

#### Confirm Action (for Pending)
- [ ] "Confirm" button appears for Pending appointments
- [ ] Clicking "Confirm" changes status to "Confirmed"
- [ ] Button disappears after confirmation
- [ ] Confirmation persists (reload confirms it worked)

#### Complete Action (for Confirmed)
- [ ] "Complete" button appears for Confirmed appointments
- [ ] Clicking "Complete" changes status to "Completed"
- [ ] Completed appointment moves to "Past & Closed" section

#### Cancel Action (for any active appointment)
- [ ] "Cancel" button appears for Pending/Confirmed
- [ ] Clicking "Cancel" shows confirmation dialog
- [ ] Confirming dialog cancels appointment
- [ ] Cancelled appointment moves to "Past & Closed" section

#### No Show Action
- [ ] "No Show" button appears for Pending/Confirmed
- [ ] Clicking "No Show" marks appointment as no-show
- [ ] Moves to "Past & Closed" section

---

## ✅ Phase 6: Empty States & Loading

### Loading State
- [ ] Skeleton loaders appear while appointments load
- [ ] 3 skeleton cards display in a column
- [ ] Loaders animate smoothly
- [ ] Clears when data loads

### Empty Day State
- [ ] When no appointments exist for selected date:
  - [ ] Empty calendar icon displays (gray, centered)
  - [ ] Message: "No appointments for this day."
  - [ ] No filter pills shown or pills shown but disabled

### Error State
- [ ] If appointment fetch fails:
  - [ ] Error message displays: "Failed to load your schedule. Please refresh."
  - [ ] Refresh button available (or page refresh works)

### Failed Doctor List
- [ ] If doctors can't load:
  - [ ] Message: "Failed to load doctor list."
  - [ ] Subtext: "Please refresh the page to try again."
  - [ ] Allows page refresh

---

## ✅ Phase 7: Settings Tab

### Settings UI
- [ ] Settings nav item navigable
- [ ] Shows: "Settings coming soon."
- [ ] Placeholder message displayed
- [ ] No errors when clicked

---

## ✅ Phase 8: Responsive Design

### Desktop (>= md breakpoint)
- [ ] Sidebar visible and fixed width
- [ ] Top bar with week navigation visible
- [ ] Appointment cards layout properly
- [ ] Max-width 3xl for content area

### Tablet (md breakpoint)
- [ ] Layout adapts smoothly
- [ ] No horizontal scrolling
- [ ] All elements touch-friendly (44×44px minimum)

### Mobile (< md breakpoint)
- [ ] Sidebar hidden (hamburger menu shows instead)
- [ ] Top bar shows hamburger, doctor name, "Today" button
- [ ] Week strip sticky below top bar
- [ ] No horizontal scrolling
- [ ] All buttons/taps are 44×44px minimum
- [ ] Touch targets have adequate spacing

---

## ✅ Phase 9: Authentication & Role Protection

### Route Protection
- [ ] Accessing `/doctor` without login redirects to `/login`
- [ ] Accessing `/doctor` with non-Doctor role redirects (or shows error)
- [ ] Logging out from page redirects to `/login`

### Logout Functionality
- [ ] Logout button in sidebar (desktop) / bottom sheet (mobile)
- [ ] Clicking logout clears session
- [ ] Clears `sessionStorage` with doctor selection
- [ ] Redirects to `/login`
- [ ] Cannot access `/doctor` after logout without re-login

---

## ✅ Phase 10: Data Persistence & Caching

### Doctor Selection Persistence
- [ ] Refreshing page keeps selected doctor (sessionStorage)
- [ ] Closing and reopening tab keeps selected doctor
- [ ] Logging out clears doctor selection
- [ ] Logging back in shows selector again

### Appointment Auto-Refresh
- [ ] Appointments auto-refresh every 60 seconds (`refetchInterval: 60000`)
- [ ] Manual refetch via "Refetch" button (if implemented)
- [ ] New appointments appear without manual refresh
- [ ] Status updates appear in real-time or on next refresh

### Stale Data Handling
- [ ] Fresh data loaded when switching dates
- [ ] Cache properly invalidated on actions (confirm, complete, cancel)
- [ ] No stale appointment statuses shown

---

## ✅ Phase 11: Date/Time Handling

### Timezone Handling
- [ ] All dates use IST (Indian Standard Time)
- [ ] getTodayIST() provides correct today's date
- [ ] Time slots display correctly in user's timezone
- [ ] Appointment times don't shift based on browser timezone

### Date Formatting
- [ ] Display date format: "{DayName}, {MonthName} {Day} {Year}"
- [ ] Storage format: "YYYY-MM-DD" (ISO format)
- [ ] Week starts on Monday
- [ ] Month boundaries handled correctly

---

## ✅ Phase 12: Edge Cases & Error Scenarios

### No Doctors in System
- [ ] Graceful error message if no doctors exist
- [ ] Doesn't crash or hang

### One Doctor in System
- [ ] Auto-selects the single doctor (no selector shown)
- [ ] Directly shows schedule view

### Concurrent Appointments
- [ ] Multiple appointments for same doctor/date display correctly
- [ ] Sorted by time slot
- [ ] No overlapping/visual conflicts

### Past Date with Future Appointments
- [ ] Handled correctly (shouldn't show future on past date)

### Network Failure
- [ ] Error message shows if API unreachable
- [ ] Retry mechanism available (refresh page)

### Browser Back/Forward
- [ ] Back button works correctly
- [ ] Forward button works correctly
- [ ] Doesn't lose doctor selection

---

## 🧪 Testing Scenarios

### Scenario A: Full Workflow (Happy Path)
1. [ ] Login as doctor
2. [ ] Select doctor from selector (or auto-select if one doctor)
3. [ ] View schedule for today
4. [ ] See pending appointments
5. [ ] Confirm an appointment
6. [ ] Filter by "Confirmed" and verify confirmed appointment shows
7. [ ] Complete an appointment
8. [ ] View past & closed section
9. [ ] Navigate to previous/next week
10. [ ] Logout and verify redirect to login

### Scenario B: Mobile Experience
1. [ ] Open on mobile device (or use DevTools mobile view)
2. [ ] Login as doctor
3. [ ] Confirm hamburger menu appears
4. [ ] Open menu and navigate
5. [ ] Confirm week strip is sticky
6. [ ] Confirm appointment cards fit screen
7. [ ] Confirm touch targets are adequate (44×44px)
8. [ ] Test landscape orientation

### Scenario C: No Appointments
1. [ ] Navigate to a date with no appointments
2. [ ] Verify empty state displays
3. [ ] Verify empty calendar icon shows
4. [ ] Try filtering (should still be empty)

### Scenario D: Appointment Actions
1. [ ] Confirm a pending appointment
2. [ ] Complete a confirmed appointment
3. [ ] Cancel an appointment (verify confirmation dialog)
4. [ ] Mark as no-show
5. [ ] Verify each action persists after refresh

### Scenario E: Error Recovery
1. [ ] Simulate network error (DevTools network throttle)
2. [ ] Verify error message shows
3. [ ] Refresh page and verify recovery
4. [ ] Test API timeout scenarios

---

## 🔗 Related Components & Services

### Hooks Used
- `useAuth()` - Authentication context
- `useDoctorSchedule()` - Manages schedule state, filtering, date navigation
- `useDoctorAppointmentActions()` - Handles appointment actions (confirm, complete, cancel, no-show)
- `useQuery()` - Data fetching via React Query

### Services Used
- `doctorsService.getAll()` - Fetch all doctors
- `appointmentsService.getByDoctor()` - Fetch doctor's appointments

### Sub-components
- `DoctorSidebar` - Left sidebar (desktop only)
- `DoctorTopBar` - Top week navigation bar
- `WeekStrip` - Clickable week days
- `StatusFilterPills` - Filter buttons
- `DoctorAppointmentCard` - Individual appointment card

### Other Files Modified
- Router configuration (`src/router/index.tsx`)
- Hooks: `useDoctorSchedule.ts`, `useDoctorAppointmentActions.ts`
- Services: `appointmentsService`, `doctorsService`

---

## 📋 Final Sign-off

After completing all checks above:

- [ ] All core functionality works as expected
- [ ] No console errors or warnings
- [ ] Responsive design works on all screen sizes
- [ ] Authentication/authorization working correctly
- [ ] Data persistence works
- [ ] All edge cases handled gracefully
- [ ] Ready to move forward with integration testing

---

## Notes for QA/Testing

- **Affected Users**: Doctor role users only
- **Impact Level**: High (primary interface for doctor appointments)
- **Browser Compatibility**: Test on Chrome, Safari, Firefox
- **Performance**: Monitor network requests - should see reasonable load times
- **Accessibility**: Test keyboard navigation, screen reader compatibility

---

**Created**: 2026-05-28  
**Last Updated**: 2026-05-28
