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
                echo "PATH=$PATH"
                sh 'npm install' 
            }
        }
        stage('Test') { 
            steps {
                sh './scripts/jenkins/test.sh' 
            }
        }
        stage('Build') { 
            steps {
                sh './scripts/build-beta-dev.sh' 
            }
        }
    }
}