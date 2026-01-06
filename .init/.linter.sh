#!/bin/bash
cd /home/kavia/workspace/code-generation/python-mysql-sample-project-25597-25606/sample_project_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

