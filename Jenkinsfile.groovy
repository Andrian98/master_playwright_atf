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

                // Pings the Parabank application base URL to verify it returns a successful HTTP status code
                sh '''
                    echo "Checking target application accessibility..."
                    curl -s -I -o /dev/null -w "%{http_code}" https://parabank.parasoft.com/ | grep -E "200|302" || {
                        echo "❌ ERROR: Target application server is down or unreachable!"
                        exit 1
                    }
                    echo "✅ Success: Target environment is responsive and healthy."
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