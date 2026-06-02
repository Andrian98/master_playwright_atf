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
                        withDockerContainer(image: 'mcr.microsoft.com/playwright:v1.60.0-noble') {
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

                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            withDockerContainer(image: 'mcr.microsoft.com/playwright:v1.60.0-noble') {
                                sh 'npm run test:ci'
                            }
                        }
                    }
                }

                stage('Process Test Results & Generate Reports') {
                    steps {
                        echo '=================================================='
                        echo '🗄️ STAGE: COLLECTING TEST BUILD EVIDENCE & REPORTS'
                        echo '=================================================='

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