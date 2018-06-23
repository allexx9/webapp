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
        stage('Build') { 
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
    }
}