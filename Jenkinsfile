pipeline {
    agent none
    environment {
        CI = 'false' 
        RANCHER_TOKEN = credentials('rancher-bearer-token') 
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
        //         sh 'yarn install' 
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
        //         sh 'yarn test' 
        //     }
        // }
        // stage('Build') { 
        //     agent {
        //         docker {
        //             image 'node:6' 
        //         }
        //     }
        //     steps {
        //         sh './scripts/build-beta-dev.sh' 
        //         sh 'pwd'
        //         sh 'ls -al'
        //         sh 'ls build/'
        //     }
        // }
        stage('Deploy') { 
            agent { label 'master' }
            steps {
                // sh './scripts/deploy-webapp-docker.sh'
                // script {
                //     docker.withRegistry('https://rb-registry.endpoint.network', 'rb-docker-registry') {
                //         docker.image('rb-app').push('latest')
                //     }
                // }
                sh 'printenv'
                sh 'curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl'
                sh 'chmod +x ./kubectl'
                sh 'mv ./kubectl /usr/local/bin/kubectl'
                sh 'wget https://github.com/rancher/cli/releases/download/v2.0.3-rc1/rancher-linux-amd64-v2.0.3-rc1.tar.gz -O rancher-linux-amd64-v2.0.3-rc1.tar.gz'
                sh 'tar xzvf rancher-linux-amd64-v2.0.3-rc1.tar.gz && cd rancher-v2.0.3-rc1/ && chmod +x rancher'
                sh 'echo "1" | rancher-v2.0.3-rc1/rancher login https://dev-03.endpoint.network --token $RANCHER_TOKEN'
                sh 'rancher-v2.0.3-rc1/rancher kubectl set image deployment/webapp-v1-staging webapp-v1-staging=rb-registry.endpoint.network/rb-app'

            }
        }
        stage('Clean Up') { 
            agent { label 'master' }
            steps {
                sh 'rm -rf rancher-v2.0.3-rc1/'
                sh 'echo donet'
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