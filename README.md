# Introduction 

## Packaging instructions

To create a clean build of the WATT to provide to a client, perform these steps. (You may have to run npm install before these steps.)

If the gollowing direct directories exist, delete them:

1. data
2. the migrations folder in the prisma directory.
3. dist

If your drive contains a previous package, delete it by typing npm run clean

The type npm run buildwatt

Then type npm run package.

This will create a folder called 