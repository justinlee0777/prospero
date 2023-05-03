rm -rf dist
webpack --config-name development-web development-server

chmod +x ./dist/buildPages.js

./dist/buildPages.js

http-server -c-1 ./dist