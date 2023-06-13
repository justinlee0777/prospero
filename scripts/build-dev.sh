rm -rf dist
webpack --config-name development-web development-server

chmod +x ./dist/buildPages.js

chmod +x ./dist/uploadPages.js

chmod +x ./dist/upload-ulysses.js