rm -rf dist
webpack --config-name development-web development-server

chmod +x ./dist/buildPages.js

# ./dist/buildPages.js

chmod +x ./dist/uploadPages.js

# ./dist/uploadPages.js

http-server -c-1 ./dist