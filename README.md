# Parabank Playwright Automation Test Framework (ATF)

A robust, enterprise-grade TypeScript test automation framework engineered for the **Parabank** demo platform. This
framework supports end-to-end (E2E) UI validation, state-isolated authentication workflows, and API regression suites,
integrated natively into both **GitHub Actions** and a local dockerized **Jenkins via Rancher Desktop** CI/CD pipeline.

---

## 1. Project Overview

This project serves as a production-ready showcase of modern QA engineering patterns. It simulates realistic business
flows on the Parabank system (e.g., user authentication, dynamic checking account creation, fund transfers, and loan
request approvals) using highly parallelized, isolated, and resilient test blocks.

---

## 2. Tech Stack

* **Language:** TypeScript
* **Test Runner:** Playwright Test v1.60.0
* **CI/CD Orchestration:** Jenkins LTS (Dockerized), GitHub Actions
* **Containerization:** Docker via Rancher Desktop (Noble Linux Image)
* **Reporting:** Playwright HTML Reports & Embedded PNG/Video Evidence

---

## 3. Framework Structure

```text
.
├── .github/
│   └── workflows/                 # GitHub Actions workflow definitions
├── api/
│   ├── clients/                   # Low-level API HTTP clients
│   ├── models/                    # Typed API response/request models
│   └── services/                  # Business-level API service methods
├── config/                        # Environment and framework configuration
├── evidence/                      # Runtime evidence output: logs, screenshots, API failure evidence
├── fixtures/                      # Playwright custom fixtures for UI/API services and pages
├── pages/                         # Page Object Model classes and reusable UI components
├── test-data/                     # Static and reusable test input data
├── tests/
│   ├── api/                       # API regression suites
│   └── ui/                        # UI/E2E regression suites
├── utils/                         # Logging, evidence, metrics, assertion, and helper utilities
├── global-setup.ts                # Admin setup, user registration, auth state, evidence run initialization
├── Jenkinsfile.groovy             # Jenkins declarative pipeline
├── package.json                   # NPM scripts and dependencies
├── package-lock.json              # Locked dependency versions
├── playwright.config.ts           # Playwright execution configuration
└── README.md                      # Framework documentation
```

### 3.1 Architecture Layers

**UI Layer** (manages user interface interactions and page structure using the Page Object Model (POM) to isolate the
test logic from the underlying UI structure, ensuring maintainability and scalability.)

- Page Objects
- Components
- UI Fixtures

**API Layer** (handles programmatic HTTP communication with the target system endpoints, abstracting away low-level
request details and providing a clean interface for test cases to interact with the backend services.)

- Clients
- Services
- Models

**Execution Layer** (orchestrates the framework configuration, global preconditions, and dependency injection context
needed to run the test validation suites. It also manages the test execution flow, including parallelization, retries,
and evidence capture strategies.)

- Playwright Tests
- Fixtures
- Global Setup
- ESLint Configuration

**Observability Layer** (captures real-time execution telemetry, network transaction payloads, and visual media files
during execution to ensure rapid debugging logs. It implements a structured logging format and an evidence retention
policy to optimize storage while preserving critical failure artifacts for analysis.)

- Logger
- Evidence Manager
- API Evidence
- Screenshots

**CI/CD Layer** (Controls automated pipeline trigger hooks, software dependency provisioning, and artifact archiving
across local and cloud environments.)

- GitHub Actions
- Jenkins

### 3.2 Current Framework Capabilities

✔ Global Setup
✔ Authenticated Storage State
✔ Playwright Fixtures
✔ API Service Layer
✔ Typed Models
✔ Dynamic Runtime Data
✔ UI Evidence
✔ API Failure Evidence
✔ GitHub Actions
✔ Jenkins Docker Pipeline
✔ Evidence Retention
✔ Structured Logging
✔ Resource Monitoring

## 4. Prerequisites

Before executing tests locally, ensure you have the following software installed on your machine:

* Node.js: v18.x or higher
* Rancher Desktop / Docker Desktop: For containerized pipeline runtimes
* WSL (Windows Subsystem for Linux): Optional backend engine for Rancher daemon

## 5. Local Execution

Follow these steps to initialize the environment and run tests from your local machine:

* Clone the repository:

```Bash
git
clone https://github.com/Andrian98/master_playwright_atf.git
cd master_playwright_atf
````

* Install project dependencies:

```Bash
npm ci
```

* Install Playwright system browsers (Host Mode):

```Bash
npx playwright install --with-deps
```

* Available Run Scripts:

```text
# Clean legacy trace files, screenshots, and report folders
npm run clean
# Scan the codebase for syntax errors and architectural style rule violations
npm run lint
# Automatically fix formatting errors and missing semicolons
npm run lint:fix
npm run test
npm run test:ui
# Run UI tests in headless mode
npm run test:ui:headless
# Run UI tests with a visible browser window
npm run test:ui:headed
# Run UI tests with manual checkpoint screenshots enabled
npm run test:ui:evidence
npm run test:api
# Run all tests headlessly across configured targets
npm run test:ci
npm run report
````

### UI Browser Mode:

The UI test browser mode is controlled by the `HEADLESS` environment variable in `playwright.config.ts`.

- Default execution is headless.
- Use `HEADLESS=true` to keep the browser hidden.
- Use `HEADLESS=false` to open the browser window during UI execution.
- Use `npm run test:ui:headed` for local debugging.
- Use `npm run test:ui:headless` for standard local or CI-style UI execution.

### UI Checkpoint Screenshots:

Manual checkpoint screenshots are controlled by the `CAPTURE_CHECKPOINT_SCREENSHOTS` environment variable.

- Default execution does not create manual checkpoint screenshots.
- Use `CAPTURE_CHECKPOINT_SCREENSHOTS=true` to save and attach checkpoint screenshots.
- Use `npm run test:ui:evidence` when screenshot evidence is needed for a UI run.

### Execution Configuration:

Parallel execution and browser selection can be controlled from `playwright.config.ts` or overridden from the command line.

- Use `npm run test` to run both UI and API tests from the configured `tests` directory.
- Use `npm run test:ui` to run only UI tests.
- Use `npm run test:api` to run only API tests.
- Use `workers` in `playwright.config.ts` to control default parallel execution.
- Use `--workers=<number>` in the command line to override parallel execution for one run.
- Use `projects` in `playwright.config.ts` to configure one or multiple browsers.
- Use `--project=<browser-name>` in the command line to run a specific configured browser.

Examples:

```Bash
npx playwright test tests/ui --workers=2
npx playwright test tests/api --workers=4
npx playwright test --project=chromium
```

### Environment Configuration:

Environment and application route values are stored in `config/environment.ts`.

- `baseUrl` is used for UI navigation.
- `apiBaseUrl` is used by the API client layer.
- Page paths such as `loginPath`, `registerPath`, `openNewAccountPath`, and `accountOverviewPath` are stored separately from tests.
- `authStatePath` defines where the authenticated browser state is saved.
- `captureCheckpointScreenshots` is controlled by `CAPTURE_CHECKPOINT_SCREENSHOTS`.

### Global Setup:

The framework uses `global-setup.ts` through the `globalSetup` option in `playwright.config.ts`.

- It initializes the evidence run directory.
- It prepares the Parabank admin setup.
- It registers the test user.
- It validates that the registered user is logged in.
- It saves authenticated browser state to `playwright/.auth/user.json`.

### CI Execution Behavior:

CI behavior is controlled by `CI=true` and the `test:ci` script.

- `forbidOnly` is enabled in CI to prevent committed `test.only` usage.
- The Playwright config defines CI retry and worker defaults.
- The current `npm run test:ci` command runs tests with `--workers=2 --retries=1`.
- Jenkins runs the suite inside `mcr.microsoft.com/playwright:v1.60.0-noble`.

### Browser Projects:

Browser targets are configured in the `projects` section of `playwright.config.ts`.

- `chromium` is currently enabled.
- Firefox and WebKit are prepared in the config but commented out.
- Enable additional projects when cross-browser execution is required.
- Use `--project=<browser-name>` to run one configured browser.

## 6. Evidence and Reports

The framework automatically logs rich debugging artifacts dynamically based on run context to minimize clutter while
guaranteeing traceability:

The configured reporters are:

- HTML reporter with `open: 'on-failure'`.
- List reporter for terminal output.

Failure artifact behavior is configured in `playwright.config.ts`:

* Trace Files: `retain-on-failure` for deep DOM timeline inspection.
* Screenshots:
    * Manual business checkpoint screenshots
    * Automatic failure screenshots through `screenshot: 'only-on-failure'`
* API failure evidence:
    - Request payload
    - Response payload
    - Headers
    - Status codes
* Videos: Recorded through `video: 'retain-on-failure'`.
* Resource Metrics: CPU and RAM snapshots captured during execution.

Evidence Retention Policy

- Maximum 2 date folders retained
- Maximum 5 execution runs retained per day
- Oldest executions are removed automatically.
- Screenshots, logs, metrics and API evidence are grouped per execution.

All execution artifacts are cataloged inside the ./evidence and ./playwright-report directories under structured
timestamps corresponding to the execution thread:

```Plaintext
evidence/YYYY-MM-DD/run-YYYY-MM-DD_HH-MM-SS/ui/screenshots/
evidence/YYYY-MM-DD/run-YYYY-MM-DD_HH-MM-SS/metrics/system-metrics.csv
evidence/YYYY-MM-DD/run-YYYY-MM-DD_HH-MM-SS/metrics/system-metrics.json
evidence/YYYY-MM-DD/run-YYYY-MM-DD_HH-MM-SS/metrics/system-metrics-summary.json
```

Resource monitoring starts after the evidence run directory is initialized and stops in `global-teardown.ts`.

## 7. GitHub Actions

The repository includes an active .github/workflows/ pipeline that triggers on code pushes. It initializes a virtual
Ubuntu instance, provisions Node modules cleanly via cache blocks, fires npm run test:ci, and securely preserves the
resulting report zip files inside GitHub Build Artifacts for up to 90 days.

## 8. Jenkins Execution

The project contains an advanced declarative multi-stage Jenkinsfile.groovy optimized for containerized runner daemons.

Pipeline Stage Architecture

1. Pre-Flight Health Check: Safely pings https://parabank.parasoft.com/parabank via a POSIX-compliant shell script
   to verify environment accessibility before allocating computational resources.
2. Install & Clean: Provisions a production-ready mcr.microsoft.com/playwright:v1.60.0-noble container layer over your
   Unix socket, triggers a lightning-fast npm ci, and wipes out old logs.
3. Execute Playwright Tests: Orchestrates test processing. Leverages catchError boundaries to ensure that even if a test
   assertion crashes, the pipeline continues processing gracefully to preserve logs.
4. Process Test Results & Generate Reports: Collects execution data and calls archiveArtifacts to make test results
   readily available in the Jenkins UI dashboard.

Local Permission Prerequisites (Rancher Desktop Only)
If you reboot your system or restart the Jenkins controller container, open Windows PowerShell with administrative
privileges and clear the Unix socket security bridge:

```PowerShell
docker exec -u 0 -it jenkins-local chmod 666 /var/run/docker.sock
```

## 9. How to Add UI Tests

* Navigate to the tests/ui/ directory.
* Create a new descriptive spec file: my-feature.spec.ts.
* Structure your execution using the framework's native page objects and step loggers:

```typescript
import {test, expect} from '../../fixtures/appFixtures';

test.describe('Feature Group Name', () => {
    test('should execute targeted interaction flow', async ({page}) => {
        await page.goto('/');
        // Your page action logic steps go here...
    });
});
```

## 10. How to Add API Tests

* Navigate to the tests/api/ directory.
* Create a new spec file: feature-endpoint.spec.ts.
* Use Playwright's native request context utility to manage endpoint calls efficiently:

```typescript
import {test, expect} from '../../fixtures/appFixtures';

test('should validate secure REST response', async ({request}) => {
    const response = await request.post('/parabank/services/store', {
        data: {customerId: 12345}
    });
    expect(response.status()).toBe(200);
});
```

## 11. Current Test Coverage

The automation framework actively validates the following critical paths:

⚙️ API Functional Coverage

* Account API: Verifies valid account creation parameters and dynamic invalid customer ID exception responses.
* Login API: Evaluates system security token parsing under valid and invalid runtime authentication payloads.

💻 End-to-End UI Coverage

* Account Operations: Validates business workflows for account creation, fund transfer and loan approval.
* Security Layer: Confirms UI element transitions across valid login dashboard entries and explicit error message
  display during validation crashes.
