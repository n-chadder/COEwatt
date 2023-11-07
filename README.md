# Introduction 

## Packaging instructions

To create a clean build of the WATT to provide to a client, perform these steps. (You may have to run npm install before these steps.)

If the gollowing direct directories exist, delete them:

1. data
2. the migrations folder in the prisma directory.
3. dist

If your drive contains a previous package, delete it by typing npm run clean

First type npm install to install the dependencies for the project.

The type npm run buildwatt.

Then type npm run package.

This will create a folder called dist.

Then type npm run serve to start the coewatt and tester.
The coewatt will be running at http://127.0.0.1:3000/. (tester runs at port 8080 by default)

To stop the coe and tester type npm run stop.