pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  environment {
    IMAGE_NAME  = 'app-js'
    BRANCH      = "${(env.BRANCH_NAME ?: 'main').replaceAll('[^A-Za-z0-9]', '-').toLowerCase()}"
    REACT_IMAGE = "${IMAGE_NAME}:${BRANCH}-${BUILD_NUMBER}"
    APP_PORT    = '8083'
  }

  stages {

    stage('1. Security Scan (Semgrep)') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          sh '''
            docker run --rm --volumes-from jenkins -w "$PWD" semgrep/semgrep:latest \
              semgrep --config auto --error --exclude node_modules .
          '''
        }
      }
    }

    stage('2. Docker build') {
      steps {
        sh 'docker build -t $REACT_IMAGE .'
      }
    }

    stage('3. Scan image et dependances') {
      steps {
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          sh '''
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:0.50.0 \
              image --exit-code 1 --severity HIGH,CRITICAL $REACT_IMAGE
          '''
        }
        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
          sh '''
            docker run --rm --volumes-from jenkins -w "$PWD" node:22-alpine npm audit --audit-level=high
          '''
        }
      }
    }

    stage('4. Deploiement Compose') {
      when {
        allOf {
          not { changeRequest() }
          anyOf {
            branch 'main'
            branch 'develop'
          }
        }
      }
      steps {
        script {
          def composeFile = "docker-compose.${BRANCH}.yml"
          if (!fileExists(composeFile)) {
            echo "Fichier ${composeFile} introuvable, utilisation de docker-compose.yml"
            composeFile = 'docker-compose.yml'
          }
          sh """
            docker compose -f ${composeFile} up -d --remove-orphans
            docker compose -f ${composeFile} ps
          """
        }
      }
    }
  }

  post {
    success { echo "Pipeline OK : ${env.REACT_IMAGE} (branche ${BRANCH}, port ${env.APP_PORT})" }
    failure { echo 'Pipeline en echec, voir le stage rouge.' }
  }
}