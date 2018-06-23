pipeline {
    agent {
        docker {
            image 'node:6' 
            args '-p 3000:3000' 
        }
    }
    environment {
        CI = 'true' 
    }
    stages {
        stage('Init') { 
            steps {
                sh 'npm install' 
            }
        }
        stage('Test') { 
            steps {
                sh './scripts/jenkins/test.sh' 
            }
        }
        stage('Build') { 
            agent {
            dockerfile {
                filename 'Dockerfile'
                dir 'scripts/containers/beta-dev'
            }
}
            steps {
                // sh './scripts/build-beta-dev.sh' 
                sh 'pwd'
                sh 'ls -al'
            }
        }
    }
}