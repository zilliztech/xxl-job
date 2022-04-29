#!/usr/bin/env groovy

def app_name='xxl-job-admin'
def devops_cd_git="github.com/zilliztech/vdc-deploy.git"
pipeline {
   options{
    disableConcurrentBuilds(abortPrevious: true)
   }
   agent {
        kubernetes {
            label "${app_name}-sit-deploy"
            inheritFrom 'default'
            defaultContainer 'main'
            yamlFile 'ci/pod/ci.yaml'
            customWorkspace '/home/jenkins/agent/workspace'
        }
   }
   environment{
      DOCKER_IMAGE="harbor-ap1.zilliz.cc/vdc/${app_name}"
      GITHUB_TOKEN_ID="github-token"
      TEST_ENVIRONMENT="sit"
      ARGOCD_TOKEN_ID="argocd-token"
   }
    parameters{
        string(
            description: 'Image Tag',
            name: 'image_tag',
            defaultValue: 'Please fill in the image tag like master-20220408-1961bb2'
        )
    }
    stages {
        stage('Deploy'){
            steps{
                script{
                    withCredentials([usernamePassword(credentialsId: "${env.GITHUB_TOKEN_ID}", usernameVariable: 'GITHUB_USER', passwordVariable: 'GITHUB_TOKEN')]){
                    sh """
                        git remote set-url origin https://${GITHUB_USER}:${GITHUB_TOKEN}@${devops_cd_git}
                        git config --global user.name "${GITHUB_USER}"
                        git config --global user.email "wei.hu@zilliz.com"
                        git clone https://${GITHUB_USER}:${GITHUB_TOKEN}@${devops_cd_git} /opt/devops-cd
                        cd /opt/devops-cd
                        git pull
                        cd /opt/devops-cd/${app_name}/overlays/${TEST_ENVIRONMENT}
                        kustomize edit set image ${app_name}=${DOCKER_IMAGE}:${params.image_tag}
                        git commit -am "[automated]Update ${app_name} Docker image for ${TEST_ENVIRONMENT} test environment" --allow-empty
                        git push origin master
                    """
                    }
                    withCredentials([usernamePassword(credentialsId: "${env.ARGOCD_TOKEN_ID}", usernameVariable: 'ARGOCD_SERVER', passwordVariable: 'ARGOCD_AUTH_TOKEN')]){
                        sh """
                         argocd app sync sit-${app_name} --retry-limit 3 --prune --grpc-web
                         argocd app wait sit-${app_name} --grpc-web
                        """
                    }

                }
            }
        }
    }
    post{
        always {
            container('jnlp') {
                script {
                    emailext subject: '$DEFAULT_SUBJECT',
                    body: '$DEFAULT_CONTENT',
                    recipientProviders: [developers(), culprits()],
                    replyTo: '$DEFAULT_REPLYTO',
                    to: "jincheng.huang@zilliz.com,wei.hu@zilliz.com"
                }
            }
        }
    }
}
