currentPath="`dirname \"$0\"`"
processJsonPath=${currentPath}/process.json
node ${currentPath}/genProcess.js $1 > ${processJsonPath}
pm2 delete ${processJsonPath}
pm2 start ${processJsonPath}
