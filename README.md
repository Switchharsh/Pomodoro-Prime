# Pomodoro Prime

A beautiful and functional Pomodoro timer Android application built with modern Android development practices.

## Features

- **Pomodoro Timer**: 25-minute work sessions with automatic break scheduling
  - Short breaks (5 minutes) after each work session
  - Long breaks (15 minutes) after 4 completed pomodoros
  - Visual progress indicator with countdown timer
  - Start, pause, reset, and skip controls

- **Task Management**
  - Create, edit, and delete tasks
  - Set estimated pomodoros for each task
  - Track completed pomodoros per task
  - Mark tasks as complete/incomplete
  - Select active task for timer

- **Statistics**
  - Track total work sessions and duration
  - Daily, weekly, and monthly statistics
  - Visual progress cards

- **Settings**
  - Customizable timer durations
  - Notification preferences (sound, vibration)
  - Dark mode support
  - Auto-start options for breaks and work sessions

- **Background Timer**
  - Foreground service keeps timer running when app is minimized
  - Notifications when timer completes
  - Vibration feedback

## Technology Stack

- **Language**: Kotlin
- **Architecture**: MVVM with Repository Pattern
- **UI Framework**: Jetpack Compose / Material Design
- **Database**: Room (SQLite)
- **Async**: Coroutines & Flow
- **Navigation**: Jetpack Navigation
- **Dependency Injection**: Manual DI (ViewModels)

## Project Structure

```
app/src/main/java/com/pomodoroprime/
├── model/                 # Data models
├── data/
│   ├── database/          # Room database, entities, DAOs
│   └── repository/         # Repository layer
├── service/                # Foreground timer service
├── notification/            # Notification manager
└── ui/
    ├── MainActivity.kt
    ├── timer/               # Timer screen
    ├── tasks/               # Tasks screen
    ├── settings/            # Settings screen
    └── statistics/           # Statistics screen
```

## Getting Started

### Prerequisites

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Gradle 8.2

### Building the Project

1. Clone the repository
2. Open the project in Android Studio
3. Wait for Gradle sync to complete
4. Build the project: `Build > Make Project`
5. Run on emulator or device: `Run > Run 'app'`

## Pomodoro Technique

The Pomodoro Technique is a time management method developed by Francesco Cirillo:

1. **Decide** on the task to be done
2. **Set** the Pomodoro timer (typically 25 minutes)
3. **Work** on the task until the timer rings
4. **Take** a short break (typically 5 minutes)
5. **Repeat** steps 2-4 until you complete four pomodoros
6. **Take** a long break (typically 15-30 minutes) after four pomodoros

## Screens

### Timer Screen
- Large circular progress indicator
- Digital time display (MM:SS)
- Current timer type (Work/Short Break/Long Break)
- Cycle progress (1/4, 2/4, 3/4, 4/4)
- Completed pomodoros counter
- Current task display
- Control buttons (Start/Pause, Reset, Stop, Skip)

### Tasks Screen
- Tab navigation (Active/Completed)
- Task list with cards
- Add task FAB
- Task details (title, description, estimated pomodoros)
- Pomodoro progress bar
- Complete, select, and delete actions

### Statistics Screen
- Total sessions and duration
- Today's statistics
- This week's statistics
- This month's statistics
- Refresh button

### Settings Screen
- Timer duration sliders (Work, Short Break, Long Break)
- Notification toggles (Notifications, Sound, Vibration)
- Dark mode toggle
- Auto-start toggles (Auto Start Breaks, Auto Start Work)
- Reset to defaults button

## Permissions

The app requires the following permissions:
- `FOREGROUND_SERVICE` - To keep timer running in background
- `POST_NOTIFICATIONS` - To show timer completion notifications
- `VIBRATE` - For vibration feedback

## License

This project is open source and available for modification and distribution.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
