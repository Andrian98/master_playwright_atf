pipeline {
    agent none

    options {
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    parameters {
        choice(
            name: 'AGENT_TYPE',
            choices: ['docker'],
            description: 'Select Jenkins execution environment'
        )
        string(
            name: 'PLAYWRIGHT_DOCKER_IMAGE',
            defaultValue: 'mcr.microsoft.com/playwright:v1.60.0-noble',
            description: 'Playwright Docker image used by Jenkins'
        )
        choice(
            name: 'BROWSER_PROJECT',
            choices: ['chromium', 'firefox', 'webkit', 'all'],
            description: 'Select browser project for Playwright execution'
        )
        choice(
            name: 'TEST_SCOPE',
            choices: ['all', 'ui', 'api'],
            description: 'Select test scope for Playwright execution'
        )
        choice(
            name: 'HEADLESS',
            choices: ['true', 'false'],
            description: 'Run browser in headless mode'
        )
        string(
            name: 'WORKERS',
            defaultValue: '2',
            description: 'Number of Playwright workers'
        )
        choice(
            name: 'CAPTURE_CHECKPOINT_SCREENSHOTS',
            choices: ['false', 'true'],
            description: 'Enable manual checkpoint screenshots for UI evidence'
        )
    }

    stages {
        stage('Pre-Flight Health Check') {
            agent { label 'built-in' }
            steps {
                echo '=================================================='
                echo '🚀 STARTING PRE-FLIGHT ENVIRONMENT HEALTH CHECK'
                echo '=================================================='

                sh '''
                    echo "Checking target application accessibility..."
                    HTTP_STATUS=$(curl -s -I -o /dev/null -w "%{http_code}" https://parabank.parasoft.com/parabank || echo "000")
                    echo "Application responded with HTTP Status Code: $HTTP_STATUS"

                    case "$HTTP_STATUS" in
                        200|301|302|401|405)
                            echo "✅ SUCCESS: Target environment is online and responsive."
                            ;;
                        *)
                            echo "⚠️ WARNING: Target application returned unexpected status (Status: $HTTP_STATUS)."
                            echo "Proceeding to Docker test suite execution anyway..."
                            ;;
                    esac
                '''
            }
        }

        stage('Docker Automation Pipeline') {
            when { expression { params.AGENT_TYPE == 'docker' } }
            agent { label 'built-in' }

            stages {
                stage('Install & Clean') {
                    steps {
                        echo '=================================================='
                        echo '📦 STAGE: INSTALLING PROJECT DEPENDENCIES'
                        echo '=================================================='
                        withDockerContainer(image: params.PLAYWRIGHT_DOCKER_IMAGE) {
                            sh 'npm ci'

                            echo '=================================================='
                            echo '🧹 STAGE: CLEARING OLD TEST ARTIFACTS & EVIDENCE'
                            echo '=================================================='
                            sh 'npm run clean'
                        }
                    }
                }

                stage('Execute Playwright Tests') {
                    steps {
                        echo '=================================================='
                        echo '🎭 STAGE: EXECUTING PLAYWRIGHT ATF TEST SUITE'
                        echo '=================================================='

                        script {
                            def testTarget = [
                                all: 'tests',
                                ui : 'tests/ui',
                                api: 'tests/api'
                            ][params.TEST_SCOPE]
                            def workers = params.WORKERS.trim()

                            if (!(workers ==~ /^[1-9][0-9]*$/)) {
                                error("WORKERS must be a positive integer. Current value: ${params.WORKERS}")
                            }

                            echo "Selected test scope: ${params.TEST_SCOPE}"
                            echo "Selected browser project: ${params.BROWSER_PROJECT}"
                            echo "Selected headless mode: ${params.HEADLESS}"
                            echo "Selected workers: ${workers}"
                            echo "Checkpoint screenshots enabled: ${params.CAPTURE_CHECKPOINT_SCREENSHOTS}"

                            catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                                withDockerContainer(image: params.PLAYWRIGHT_DOCKER_IMAGE) {
                                    withEnv([
                                        'CI=true',
                                        'NODE_OPTIONS=--no-deprecation',
                                        "BROWSER_PROJECT=${params.BROWSER_PROJECT}",
                                        "TEST_SCOPE=${params.TEST_SCOPE}",
                                        "HEADLESS=${params.HEADLESS}",
                                        "CAPTURE_CHECKPOINT_SCREENSHOTS=${params.CAPTURE_CHECKPOINT_SCREENSHOTS}",
                                        "WORKERS=${workers}"
                                    ]) {
                                        sh "npx playwright test ${testTarget} --workers=${workers} --retries=1"
                                    }
                                }
                            }
                        }
                    }
                }

                stage('Process Test Results & Generate Reports') {
                    steps {
                        echo '=================================================='
                        echo '🗄️ STAGE: COLLECTING TEST BUILD EVIDENCE & REPORTS'
                        echo '=================================================='

                        echo 'Archiving Playwright report, test results, evidence, and metrics HTML report.'
                        echo 'Metrics report path pattern: evidence/**/metrics/system-metrics-report.html'
                        archiveArtifacts artifacts: 'playwright-report/**, test-results/**, evidence/**', allowEmptyArchive: true

                        echo '=================================================='
                        echo '✅ SUCCESS: All build evidence processing complete!'
                        echo '=================================================='
                    }
                }
            }
        }
    }
}
