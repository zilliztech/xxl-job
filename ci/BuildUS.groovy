#!/usr/bin/env groovy

def gitShortCommit=''
def date=''
def image_tag=''
def app_name='xxl-job-admin'
def github='https://github.com/zilliztech/xxl-job.git'

pipeline {
   options{
    disableConcurrentBuilds(abortPrevious: true)
    skipDefaultCheckout()
   }
   agent {
        kubernetes {
            label 'build'
            inheritFrom 'default'
            defaultContainer 'main'
            yamlFile 'ci/pod/ci-us.yaml'
            customWorkspace '/home/jenkins/agent/workspace'
        }
   }
    parameters {
        gitParameter branchFilter: 'origin/(.*)', defaultValue: 'master', name: 'BRANCH', type: 'PT_BRANCH'
    }
   environment{
      DOCKER_IMAGE="harbor-us-vdc.zilliz.cc/vdc/${app_name}"
      GITHUB_TOKEN_ID="github-token"
      GIT_REPO="${github}"
      GIT_COMMIT=""
   }
    stages {
        stage('Checkout'){
            steps{
                git  credentialsId: 'zilliz-ci',  branch: "${params.BRANCH}", url: "${github}"
                script {
                    date = sh(returnStdout: true, script: 'date +%Y%m%d').trim()

                    gitShortCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
                    GIT_COMMIT=sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    image_tag="${params.BRANCH}-${date}-${gitShortCommit}"
                    //Copy settings
                    sh 'cp /apps/.m2/settings.xml  settings.xml'
                }
            }
        }
        stage('Build & Publish Image') {
            steps{
                container(name: 'kaniko',shell: '/busybox/sh') {
                  script {
                    sh 'ls -lah '
                    sh """
                    executor \
                    --context="`pwd`" \
                    --registry-mirror="nexus-nexus-repository-manager-docker-5000.nexus:5000"\
                    --insecure-registry="nexus-nexus-repository-manager-docker-5000.nexus:5000" \
                    --build-arg=GIT_REPO=${GIT_REPO} \
                    --build-arg=GIT_BRANCH=${params.BRANCH} \
                    --build-arg=GIT_COMMIT_HASH=${GIT_COMMIT} \
                    --dockerfile "ci/docker/Dockerfile" \
                    --destination=${DOCKER_IMAGE}:${image_tag}
                    """
                  }
                }
            }
        }
    }
}
