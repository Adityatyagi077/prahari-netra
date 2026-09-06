# Login + Ground Officer Monitoring Update

## New login flow
The separate `Select Command Station` page has been removed from the active flow.
The `/login` screen now contains two rank choices:
- ADMIN
- GROUND OFFICER

The operator selects a rank, enters its local demo password, and is taken directly to the corresponding dashboard.

Demo passwords:
- Admin: `admin@prahari`
- Ground Officer: `officer@prahari`

## Admin visibility of Ground Officer activity
The Ground Officer workspace publishes a lightweight local presence heartbeat to browser `localStorage` under:
`prahari-netra:officer-presence`

The Admin Overview reads this state and displays:
- Officer online/offline status
- Operator name and rank
- Current activity
- Current route/view
- Current camera and visible/thermal mode when in Camera Watch
- Last local heartbeat

This is intentionally local browser telemetry for the demonstration. It is not a cloud tracking system.

## Demonstrating it
1. Open Prahari Netra in one browser tab and log in as Ground Officer.
2. Open another tab/window on the same browser profile and open Prahari Netra.
3. Log in as Admin.
4. The Admin Overview will show the Ground Officer's current activity.
5. Navigate the Ground Officer tab between My Sector, Camera Watch, Alerts, Sector Map, and Evidence. The Admin Overview updates automatically.
6. In Camera Watch, changing camera or Visible/Thermal updates the Admin panel as well.
