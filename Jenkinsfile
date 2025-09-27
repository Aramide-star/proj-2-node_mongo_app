pipeline {
  agent { label 'linux-agent' }

  environment {
    APP_NAME   = 'nodeapp'
    NEXUS_URL  = 'http://172.31.25.163:8081'
    NEXUS_REPO = 'nodeapp'
    NEXUS_CREDS = 'nexus_creds'
    INVENTORY  = '/home/jenkins/ansible/nodeapp/hosts.ini'
    SMTP_TO    = 'memberA@example.com,memberB@example.com,memberC@example.com'
  }

  options { ansiColor('xterm') }

  triggers { pollSCM('@hourly') } // or use GitHub webhook

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/Aramide-star/proj-2-node_mongo_app.git'
      }
    }

    stage('Node Setup') {
      steps {
        sh '''
          node -v || (curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash - && sudo dnf -y install nodejs)
          npm -v
        '''
      }
    }

    stage('Install + Lint + Test') {
      steps {
        sh '''
          npm ci || npm install
          npm run lint || true
          npm test || true
        '''
      }
    }

    stage('Package ZIP') {
      steps {
        sh '''
          npm run buildzip || (zip -r build.zip . -x ".git/*" "node_modules/*")
          mv build.zip ${APP_NAME}-${BUILD_NUMBER}.zip
        '''
        archiveArtifacts artifacts: "${APP_NAME}-${BUILD_NUMBER}.zip", fingerprint: true
      }
    }

    stage('Upload to Nexus') {
      steps {
        withCredentials([usernamePassword(credentialsId: env.NEXUS_CREDS,
          usernameVariable: 'NUSER', passwordVariable: 'NPASS')]) {
          sh '''
            curl -u "$NUSER:$NPASS" \
              --upload-file ${APP_NAME}-${BUILD_NUMBER}.zip \
              ${NEXUS_URL}/repository/${NEXUS_REPO}/${APP_NAME}-${BUILD_NUMBER}.zip
          '''
        }
      }
    }

    stage('Deploy via Ansible') {
      steps {
        sh '''
          ansible-playbook /home/jenkins/ansible/nodeapp/deploy.yml -i ${INVENTORY} \
            -e build_number=${BUILD_NUMBER}
        '''
      }
    }

    stage('Smoke Test') {
      steps {
        sh 'curl -sf http://54.243.121.113/ | head -n 5'
      }
    }
  }

  post {
    success {
      emailext subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
               body: "Build succeeded and deployed. URL: http://54.243.121.113/",
               to: env.SMTP_TO
    }
    failure {
      emailext subject: "FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
               body: "Build failed. Check Jenkins console logs.",
               to: env.SMTP_TO
    }
  }
}
