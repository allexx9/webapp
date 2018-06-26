pipeline {
    agent none
    environment {
        CI = 'false' 
    }
    stages {
        // stage('Init') { 
        //     agent {
        //         docker {
        //             image 'node:6' 
        //             args '-p 3000:3000' 
        //         }
        //     }
        //     steps {
        //         sh 'npm install' 
        //     }
        // }
        // stage('Test') { 
        //     agent {
        //         docker {
        //             image 'node:6' 
        //             args '-p 3000:3000' 
        //         }
        //     }
        //     steps {
        //         sh './scripts/jenkins/test.sh' 
        //     }
        // }
        // stage('Build') { 
        //     agent {
        //         docker {
        //             image 'node:6' 
        //         }
        //     }
        //     steps {
        //         // sh './scripts/build-beta-dev.sh' 
        //         sh 'pwd'
        //         sh 'ls -al'
        //         sh 'ls build/'
        //         sh 'docker -v'
        //     }
        // }
        stage('Deploy') { 
            agent { label 'master' }
            steps {
                sh './scripts/deploy-webapp-docker.sh'
                sh 'docker image list'
                script {
                    docker.withRegistry('https://docker-register.endpoint.network:443', 'rb-docker-login') {
                        docker.image('rb-app').push('latest')
                    }
                }
            }
        }
    }
    post {
        always {
            echo 'One way or another, I have finished'
        }
        success {
            echo 'I succeeeded!'
        }
        unstable {
            echo 'I am unstable :/'
        }
        failure {
            echo 'I failed :('
            sh 'docker rmi $(docker images | grep "^<none>" | awk '{print $3}')'
        }
        changed {
            echo 'Things were different before...'
        }
    }
}