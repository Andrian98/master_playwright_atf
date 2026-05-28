pipeline {
    agent none

    tools {
        dockerTool 'default'
    }

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
        stage('Diagnostic and Tool Verification') {
            when { expression { params.AGENT_TYPE == 'docker' } }
            // Force execution on the built-in controller node so it doesn't crash on agent startup
            agent { label 'built-in' }
            steps {
                echo "=== DIAGNOSTIC LOGS ==="
                echo "Current PATH environment variable:"
                sh 'echo $PATH'

                echo "Checking if Jenkins downloaded the tool to the tools directory:"
                sh 'ls -la /var/jenkins_home/tools/org.jenkinsci.plugins.docker.commons.tools.DockerTool/ || echo "Tool folder not found"'

                echo "Testing if the docker command works when explicitly running from a shell step:"
                sh 'docker --version || echo "Docker CLI still not found in path"'
                echo "======================="
            }
        }
    }
}