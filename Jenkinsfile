pipeline {
    agent none
    environment {
        CI = 'true' 
    }
    stages {
        stage('Init') { 
            agent {
                docker {
                    image 'node:6' 
                    args '-p 3000:3000' 
                }
            }
            steps {
                sh 'npm install' 
            }
        }
        stage('Test') { 
            agent {
                docker {
                    image 'node:6' 
                    args '-p 3000:3000' 
                }
            }
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