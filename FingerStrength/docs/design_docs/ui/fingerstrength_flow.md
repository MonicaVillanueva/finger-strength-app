# FingerStrength App - Screen Specifications & UI Flows

Style guide: see docs/ui/style.md — clear, minimalistic, high-contrast; numeric readouts first.

# FingerStrength App - Screen Specifications & UI Flows

This document outlines the UI/UX design for the **FingerStrength** app, a high-performance training tool for climbers using crane scale data.

---

## 1. Home Screen (Tab)
The central dashboard providing a high-level view of progress and quick access to training.

*   **Header**: App branding "FingerStrength" with the user's profile avatar (Alex).
*   **Analytics Section**: Three high-contrast cards displaying:
    *   **Current Max**: Live weight (kg) with a "STALE" or "FRESH" status tag and Personal Best (PB) reference.
    *   **Strength Index**: A strength-to-weight ratio (e.g., 1.02x) relative to a target.
    *   **Training Streak**: Current streak with a flame icon and "Best" record.
*   **Primary Action**: A large, bright green button labeled **"START LIVE DATA"** to jump into a free-form session.
*   **Workouts Section**: A horizontal scrolling list of saved workout routines (e.g., "7/7 Repeaters") showing duration, set/rep counts, and hand-switch requirements.
*   **Navigation**: Bottom navigation bar with icons for *Home, Workouts, Live Data,* and *Profile*.

---

## 2. Workout Library (Tab)

### 2.1 Workout Editor
### 2.2 Exercise Editor
A granular configuration screen for defining the exact parameters of a specific finger exercise.

*   **Core Parameters**:
    *   **Hold Time**: Numeric stepper for duration in seconds.
    *   **Hand Selection**: Segmented control for *Left, Both,* or *Right*.
    *   **Intensity Range**: Toggleable "Off" or "Range" setting. If "Range" is active, it provides two numeric inputs (e.g., 60% and 80%) to define the target window.
    *   **Hand Switch**: Logic for swapping hands: *None, Per Set,* or *Per Rep*.
*   **Grip Details**:
    *   **Grip Type**: Dropdown menu (e.g., Crimp, Sloper, Jug).
    *   **Edge Size**: Numeric stepper for edge depth in millimeters.
    *   **Finger Selector**: Individual toggle buttons for *Thumb, Index, Middle, Ring,* and *Pinkie*. (Thumb and Pinkie follow a unified "disabled/inactive" style).
*   **Volume & Timing**: Numeric inputs for total **Sets**, **Reps**, and the respective **Rest** periods (in seconds) between each.

---

## 3. Profile (Tab)

The Profile screen centralizes user-specific settings and history.

*   Profile actions: create, rename, switch, delete. Favorite profile for quick start.
*   Visible fields: name, 
*   Settings & actions: weight (kg), preferred_unit, cached_current_max_kg and expiration parameters, workout threshold.

---

## 4. Running Workout (Live Data)
The execution screen designed for maximum "glanceability" during high-intensity effort.

*   **Header Information**: Displays Workout Title, Exercise Name, and a descriptive string of the grip (e.g., *"Crimp | 20mm | Index, Middle, Ring"*). Includes a small **Audio Toggle** for voice cues.
*   **Upper Banner (The "Now")**:
    *   **Timer**: Large digital countdown with a depletion ring. **Green** for workout intervals, **Orange** for rest.
    *   **Force Indicator**: "Current Pull" displayed in large bold text (kg) with a dumbbell icon. Displays the target range (e.g., 48.0 - 64.0 kg) as a sub-label.
*   **Middle Section (The Plot)**:
    *   **Live Graph**: Real-time line plot showing the force pulled against the crane scale.
    *   **Y-Axis**: Clearly labeled in kg increments.
    *   **Target Region**: A green semi-transparent band painted onto the plot background representing the goal range.
    *   **Ghost Hand**: A large, faint silhouette of a **Left** or **Right** hand in the background, updating dynamically to show which hand should be active.
*   **Lower Banner (The Progress)**: Split trackers for **Sets** (Current/Total) and **Reps** (Current/Total).



### 4.1 Workout Summary
The post-session review screen for data analysis and logging.

*   **Header**: "Session Complete!" followed by the workout name and total duration.
*   **Session Quality**: A list of exercises with a "Quality" score based on how well the user stayed within the target zones (e.g., *"Repeater Hangs: 98% Quality"*).
*   **View Selector**: A prominent dropdown to toggle all numerical cards between **Total Load**, **Average Force**, and **Max Force**.
*   **Combined Metrics**: A single card showing the aggregate data for the entire session.
    *   *Example*: **2,450 kg** (Total Load) with a sub-label: **PB: 2,380 kg**.
*   **Hand-Specific Metrics**: Two side-by-side cards for Left and Right hands:
    *   **Left (Red Theme)**: 1,220 kg | PB: 1,190 kg.
    *   **Right (Blue Theme)**: 1,230 kg | PB: 1,190 kg.
*   **Historical Trends**: A line plot displaying data for each hand across different workout dates.
*   **RPE (Perceived Exertion)**: A color-coded 1–10 scale (Green to Red).
    *   *Example*: **7 - Hard**: "Challenging, required deep focus to complete."
*   **Final Action**: A large green **"SAVE & CLOSE"** button to log the session data.