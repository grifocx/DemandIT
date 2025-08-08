# Demand-IT Test Plan

## Overview
This test plan ensures all current functionality in Demand-IT is working properly. The application is a strategic portfolio management tool for IT teams with hierarchical structure: Portfolios → Programs → Projects/Demands.

## Pre-Test Setup
1. Ensure application is running via "Start application" workflow
2. Verify database connection is active
3. Clear browser cache if needed
4. Open application in web browser

## Test Categories

### 1. Authentication & Authorization
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Login Flow** | 1. Navigate to landing page<br>2. Click "Sign In" button | Should redirect to Replit OIDC login and authenticate user | ⏳ |
| **Session Persistence** | 1. Login successfully<br>2. Close browser<br>3. Reopen application | Should remain logged in with valid session | ⏳ |
| **User Profile Display** | 1. Check top navigation<br>2. Verify user dropdown menu | Should show user name, role, and profile options | ⏳ |
| **Logout Functionality** | 1. Click user dropdown<br>2. Select "Log out" | Should log out and redirect to landing page | ⏳ |
| **Development Mode** | In dev environment, verify mock user is created automatically | Should have "Dev User" with admin role | ⏳ |

### 2. Navigation & UI
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Branding Display** | Check header in navigation and landing page | Should show "Demand-IT" consistently | ⏳ |
| **Sidebar Navigation** | Test all sidebar menu items:<br>- Dashboard<br>- Portfolios<br>- Programs<br>- Demands<br>- Projects | Each should navigate to correct page without errors | ⏳ |
| **Global Search** | 1. Type in search box<br>2. Test search functionality | Search box should be functional and responsive | ⏳ |
| **Notifications** | Check notification bell icon | Should display notification count (currently shows 3) | ⏳ |
| **Responsive Design** | Test on different screen sizes | UI should adapt properly to mobile/tablet/desktop | ⏳ |

### 3. Dashboard Functionality
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Metrics Cards** | Verify all 4 metric cards display:<br>- Active Projects<br>- Pending Demands<br>- Budget Utilized<br>- At Risk Projects | All metrics should show numerical values with trends | ⏳ |
| **Portfolio Health Overview** | Check portfolio health section | Should display portfolio status and health indicators | ⏳ |
| **Activity Feed** | Verify recent activity sidebar | Should show recent changes and updates | ⏳ |
| **Data Loading** | Check loading states and error handling | Should show loading indicators while fetching data | ⏳ |

### 4. Portfolio Management
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **View Portfolios** | Navigate to Portfolios page | Should display list of portfolios with cards/table view | ⏳ |
| **Create Portfolio** | 1. Click "Create Portfolio"<br>2. Fill required fields:<br>   - Name<br>   - Description<br>   - Status<br>   - Budget<br>3. Submit form | Should create new portfolio and refresh list | ⏳ |
| **Edit Portfolio** | 1. Select existing portfolio<br>2. Click edit<br>3. Modify fields<br>4. Save changes | Should update portfolio details successfully | ⏳ |
| **Portfolio Card Display** | Check portfolio cards show:<br>- Name & Description<br>- Status badge<br>- Budget formatting<br>- Program/Project counts | All information should be formatted correctly | ⏳ |
| **Form Validation** | 1. Try submitting empty form<br>2. Test invalid data | Should show appropriate validation errors | ⏳ |

### 5. Program Management
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **View Programs** | Navigate to Programs page | Should display list of programs with portfolio relationships | ⏳ |
| **Create Program** | 1. Click "Create Program"<br>2. Fill form:<br>   - Name<br>   - Description<br>   - Portfolio (dropdown)<br>   - Status<br>   - Budget<br>3. Submit | Should create program and link to selected portfolio | ⏳ |
| **Portfolio Dropdown** | When creating/editing program | Should populate with available portfolios | ⏳ |
| **Edit Program** | Modify existing program details | Should update successfully and maintain portfolio relationship | ⏳ |
| **Program-Portfolio Relationship** | Verify programs show their parent portfolio | Portfolio name should be displayed for each program | ⏳ |

### 6. Demand Management  
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **View Demands** | Navigate to Demands page | Should display demand list with filtering options | ⏳ |
| **Create Demand** | 1. Click "Create Demand"<br>2. Fill form:<br>   - Title<br>   - Description<br>   - Program (cascading dropdown)<br>   - Phase<br>   - Status<br>   - Priority<br>   - Estimated Effort<br>   - Business Value<br>3. Submit | Should create demand successfully | ⏳ |
| **Cascading Dropdowns** | 1. Select Portfolio<br>2. Check Program dropdown updates<br>3. Verify Phase/Status dropdowns work | Dropdowns should filter appropriately | ⏳ |
| **Priority Levels** | Test all priority options: High, Medium, Low | Should save and display priority correctly | ⏳ |
| **Demand Conversion** | If implemented, test converting demand to project | Should create project from demand details | ⏳ |

### 7. Project Management
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **View Projects** | Navigate to Projects page | Should display project table with all columns | ⏳ |
| **Project Table Columns** | Verify table shows:<br>- Title<br>- Program<br>- Status<br>- Phase<br>- Priority<br>- Progress<br>- Start/End Dates<br>- Budget<br>- Project Manager<br>- Actions | All columns should display correctly formatted data | ⏳ |
| **Create Project** | 1. Click "Create Project"<br>2. Fill comprehensive form:<br>   - Title<br>   - Description<br>   - Program (cascading from Portfolio)<br>   - Phase<br>   - Status<br>   - Project Manager<br>   - Priority<br>   - Start/End Dates<br>   - Budget<br>3. Submit | Should create project with all relationships | ⏳ |
| **Edit Project** | Modify existing project details | Should update and maintain all relationships | ⏳ |
| **Project Manager Assignment** | Select user from dropdown | Should assign project manager correctly | ⏳ |
| **Date Validation** | Test date fields and validation | Should enforce proper date formats and logic | ⏳ |
| **Budget Formatting** | Enter budget values | Should format as currency correctly | ⏳ |

### 8. Data Relationships & Hierarchy
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Portfolio-Program Relationship** | Create program under portfolio | Should maintain proper parent-child relationship | ⏳ |
| **Program-Project Relationship** | Create project under program | Project should show correct program association | ⏳ |
| **Program-Demand Relationship** | Create demand under program | Demand should link to correct program | ⏳ |
| **User-Entity Ownership** | Check ownership across all entities | Should properly track owners and assignees | ⏳ |
| **Cascade Filtering** | Test dependent dropdowns throughout app | Should filter options based on parent selections | ⏳ |

### 9. Status & Phase Management
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Default Phases** | Check phase options in forms | Should have predefined phases for demands and projects | ⏳ |
| **Default Statuses** | Check status options in forms | Should have predefined statuses with appropriate colors | ⏳ |
| **Status Color Coding** | View entities with different statuses | Should display correct color badges for each status | ⏳ |
| **Phase Progression** | If implemented, test phase transitions | Should follow logical phase progression | ⏳ |

### 10. Audit & Tracking
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Audit Log Creation** | 1. Create new entity<br>2. Check if audit record is created | Should log creation action | ⏳ |
| **Audit Log Updates** | 1. Modify existing entity<br>2. Check audit trail | Should log modification details | ⏳ |
| **Activity Feed Updates** | Perform actions and check dashboard activity feed | Should show recent changes in activity feed | ⏳ |

### 11. Error Handling & Validation
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Form Validation** | Submit forms with invalid/missing data | Should show clear validation messages | ⏳ |
| **API Error Handling** | Test with network issues or API failures | Should show user-friendly error messages | ⏳ |
| **Authentication Errors** | Test expired sessions | Should redirect to login gracefully | ⏳ |
| **Database Errors** | Test edge cases that might cause DB errors | Should handle gracefully without crashes | ⏳ |
| **Loading States** | Check all async operations | Should show appropriate loading indicators | ⏳ |

### 12. Performance & UX
| Test Case | Steps | Expected Result | Status |
|-----------|-------|----------------|--------|
| **Page Load Speed** | Navigate between pages | Should load reasonably quickly | ⏳ |
| **Data Caching** | Navigate back to previously visited pages | Should cache data appropriately | ⏳ |
| **Toast Notifications** | Perform CRUD operations | Should show success/error toast messages | ⏳ |
| **Modal Interactions** | Open/close modals for forms | Should work smoothly without UI issues | ⏳ |
| **Table Sorting/Filtering** | If implemented, test table features | Should work correctly | ⏳ |

## Role-Based Testing
Test with different user roles (if role switching is available):
- **Admin**: Full access to all features
- **Portfolio Manager**: Portfolio and program management
- **Program Manager**: Program, demand, and project management  
- **Project Manager**: Project-focused access
- **Contributor**: Read-only or limited access

## Test Data Requirements
Ensure these sample entities exist for testing:
- At least 2 portfolios with different statuses
- Multiple programs across portfolios
- Various demands in different phases
- Multiple projects with different statuses and priorities
- Users with different roles for assignment testing

## Browser Compatibility
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Responsiveness
Test responsive design on:
- Mobile phones (320px - 768px)
- Tablets (768px - 1024px)
- Desktop (1024px+)

## Success Criteria
- ✅ All critical paths work without errors
- ✅ Data relationships are maintained correctly
- ✅ UI is responsive and user-friendly
- ✅ Error handling provides clear feedback
- ✅ Authentication and authorization work properly
- ✅ Performance is acceptable for typical usage

## Notes
- Mark each test case as ✅ (Pass), ❌ (Fail), or ⚠️ (Issue Found)
- Document any bugs or issues found during testing
- Retest failed cases after fixes are implemented
- Update test plan when new features are added

## Test Environment
- **Application URL**: Check current Replit deployment URL
- **Database**: PostgreSQL (development environment)  
- **Authentication**: Replit OIDC (development mode uses mock user)
- **Test Date**: [Fill in when testing]
- **Tester**: [Fill in who performed tests]