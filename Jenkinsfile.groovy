pipeline {
    agent none

    options {
        timestamps()
    }
    parameters {
        choice(
            name: 'AGENT_TYPE',
            choices: ['docker', 'windows', 'linux'],
            description: 'Select Jenkins execution environment'
        )
    }

    stages {
//        stage('Run on Linux') {
//            when { expression { params.AGENT_TYPE == 'linux' } }
//            agent { label 'linux' }
//            steps {
//                echo "Selected AGENT_TYPE = ${params.AGENT_TYPE}"
//                sh 'npm ci'
//                sh 'npx playwright install --with-deps chromium'
//                sh 'npm run clean'
//                sh 'npm run test:ci'
//            }
//        }

//        stage('Run on Windows') {
//            when { expression { params.AGENT_TYPE == 'windows' } }
//            agent { label 'windows' }
//            steps {
//                echo "Selected AGENT_TYPE = ${params.AGENT_TYPE}"
//                bat 'npm ci'
//                bat 'npx playwright install chromium'
//                bat 'npm run clean'
//                bat 'npm run test:ci'
//            }
//        }

        stage('Run in Docker') {
            when { expression { params.AGENT_TYPE == 'docker' } }
            agent { label 'built-in' }
            steps {
                echo "Selected AGENT_TYPE = ${params.AGENT_TYPE}"
                withDockerContainer(image: 'mcr.microsoft.com/playwright:v1.59.1-noble') {
                    sh 'npm ci'
                    sh 'npm run clean'
                    sh 'npm run test:ci'
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'playwright-report/**, test-results/**, evidence/**', allowEmptyArchive: true
                }
            }
        }
    }
}