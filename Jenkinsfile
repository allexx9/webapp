pipeline {
    agent {
        docker {
            image 'alpine-node-git' 
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