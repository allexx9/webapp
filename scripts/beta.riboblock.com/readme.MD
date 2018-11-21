# Test on beta.rigoblock.com

Because of Ethfinex CORS setting only the domain `beta.rigoblock.com` is allowed to call their API.

For testing locally run `run-proxy.sh` and then add the following line to your `/etc/hosts` file:

    172.17.0.2 beta.rigoblock.com

`172.17.0.2` is the IP assigned to the nginx proxy container. It may be different on your local setup. Use `docker inspect nginx-proxy` to find it.

Once the proxy is running, you can then run `yarn start` and load the application at https://beta.rigoblock.com on your browser. You will have to accept the self-signed certificate.

Only works with Firefox. Chrome needs to be lunched with special command line parameters.
