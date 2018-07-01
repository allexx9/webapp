# Private Docker register installation

These guide will set-up a private Docker register at registry.yourdomain.com with SSL and Github OAuth on Ubuntu 16.05 LTS.

## Example

The following steps will install the required file in `~/rb-docker-registry`.

Create a directory named `rb-docker-registry`. We will store scripts, images and other configuration files in there. 

    mkdir ~/rb-docker-registry

Create a folder `data` for persistent data:

    mkdir ~/rb-docker-registry/data


Enter `~/rb-docker-registry` and run the install script to generate a SSL certificate and login credentials:

    cd ~/rb-docker-registry
    chmod u+x rb-registry-install.sh
    ./rb-registry-install.sh registry.yourdomain.com

Start the container:

    ./rb-registry-run.sh

Strop and remove the container:

    ./rb-registry-stop.sh