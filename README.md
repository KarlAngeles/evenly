### Getting Started

#### 1. Build Evenly Frontend & Backend Docker Images
```bash
$ make build
```
After building the image, evenly-local should now appear when executing `docker images` in Terminal.

#### 2. Start Evenly Docker Containers
```bash
$ make start
```
Starts the prerequisite containers.

#### 3. Access the Evenly app
:tada: Evenly should now be accessible at:
```bash
Frontend: <http://localhost:8000>
Backend: <http://localhost:3000>
```

### Features
- Authentication
- Bill Creation
- Bill and Debt Tracking
- Debt Settlement

### To Do
- Refactor session handling
- Full transition to TS
- Transactions page and datatable
- Friends feature so that adding participants isn't global