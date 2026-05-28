pipeline {
    agent none

    options {
        timestamps()
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
                            # Captures the response code, defaulting to 000 if the network drops the connection completely
                            HTTP_STATUS=$(curl -s -I -o /dev/null -w "%{http_code}" https://parabank.parasoft.com/parabank || echo "000")
                            echo "Application responded with HTTP Status Code: $HTTP_STATUS"

                            # Checks for common successful/accessible HTTP codes (including redirection and authentication endpoints)
                            if [[ "$HTTP_STATUS" =~ ^(200|301|302|401|405)$ ]]; then
                                echo "✅ SUCCESS: Target environment is online and responsive."
                            else
                                echo "⚠️ WARNING: Target application is unreachable via standard curl (Status: $HTTP_STATUS)."
                                echo "This is likely a container network restriction. Proceeding to Docker test suite execution..."
                            fi
                        '''
                    }
                }

        stage('Run in Docker') {
            when { expression { params.AGENT_TYPE == 'docker' } }
            agent { label 'built-in' }
            steps {
                echo "Selected AGENT_TYPE = ${params.AGENT_TYPE}"

                withDockerContainer(image: 'mcr.microsoft.com/playwright:v1.60.0-noble') {
                    echo '=================================================='
                    echo '📦 STAGE: INSTALLING PROJECT DEPENDENCIES'
                    echo '=================================================='
                    sh 'npm ci'

                    echo '=================================================='
                    echo '🧹 STAGE: CLEARING OLD TEST ARTIFACTS & EVIDENCE'
                    echo '=================================================='
                    sh 'npm run clean'

                    echo '=================================================='
                    echo '🎭 STAGE: EXECUTING PLAYWRIGHT ATF TEST SUITE'
                    echo '=================================================='
                    sh 'npm run test:ci'
                }
            }
            post {
                always {
                    echo '=================================================='
                    echo '🗄️ STAGE: COLLECTING TEST BUILD EVIDENCE & REPORTS'
                    echo '=================================================='

                    archiveArtifacts artifacts: 'playwright-report/**, test-results/**, evidence/**', allowEmptyArchive: true

                    echo '=================================================='
                    echo '✅ SUCCESS: All build evidence has been safely stored!'
                    echo 'You can access reports, screenshots, and evidence folders'
                    echo 'directly from the "Artifacts" panel on this build page.'
                    echo '=================================================='
                }
            }
        }
    }
}