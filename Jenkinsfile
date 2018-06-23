pipeline {
    agent {
        docker {
            image 'node:6' 
            args '-p 3000:3000' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                echo "PATH=$PATH"
                sh 'npm install' 
            }
        }
    }
}