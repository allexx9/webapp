pipeline {
    agent none
    environment {
        CI = 'false' 
        RANCHER_TOKEN = credentials('rancher-bearer-token') 
        JENKINS_PASSWORD = credentials('wnz99-jenkins-user-password') 
        NPM_TOKEN = credentials('npm-token') 
    }
    stages {
        stage('Init') { 
            agent {
                docker {
                    image 'node:8-alpine' 
                    args '-p 3000:3000' 
                }
            }
            steps {
                sh 'echo //registry.npmjs.org/:_authToken=\\${NPM_TOKEN} > ~/.npmrc'
                sh 'yarn install --frozen-lockfile' 
            }
        }
        stage('Test') { 
            agent {
                docker {
                    image 'node:8-alpine' 
                    args '-p 3000:3000' 
                }
            }
            steps {
                sh 'yarn test' 
            }
        }
        stage('Build') { 
            agent {
                docker {
                    image 'node:8-alpine' 
                }
            }
            steps {
                sh './scripts/build-beta-dev-jenkins.sh' 
            }
        }
        stage('Deploy') { 
            agent { label 'master' }
            steps {
                sh './scripts/deploy-webapp-docker-jenkins.sh'
            }
        }
        stage('Clean Up') { 
            agent { label 'master' }
            steps {
                sh 'rm -rf rancher-v2.0.3-rc1/'
            }
        }
    }
    // post {
    //     always {
    //         echo 'One way or another, I have finished'
    //     }
    //     success {
    //         echo 'I succeeeded!'
    //     }
    //     unstable {
    //         echo 'I am unstable :/'
    //     }
    //     failure {
    //         echo 'I failed :('
    //         sh 'docker rmi $(docker images | grep "^<none>" | awk '{print $3}')'
    //     }
    //     changed {
    //         echo 'Things were different before...'
    //     }
    // }
}