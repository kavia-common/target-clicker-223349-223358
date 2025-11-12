#!/bin/bash
cd /home/kavia/workspace/code-generation/target-clicker-223349-223358/frontend_react
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

