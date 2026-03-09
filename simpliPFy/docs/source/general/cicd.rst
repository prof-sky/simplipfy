GitLab CI/CD
=============

Setup a Runner
---------------
Setup the runner as described on the GitLab Page.
Complete this ``config.toml`` with the created one in the setup process of a runner.
you can find this file at ``/etc/gitlab-runner/config.toml``. You will need a sudo shell to access it::

    concurrent = 1
    check_interval = 0
    connection_max_age = "15m0s"
    shutdown_timeout = 0

    [session_server]
      session_timeout = 1800

    [[runners]]
      name = "inskale-debug-runner"
      url = "<url>"
      id = <id>
      token = "<yourToken"
      token_obtained_at = <token_obtained_at>
      token_expires_at = <token_expires_at>
      executor = "docker"
      [runners.cache]
        MaxUploadedArchiveSize = 0
        [runners.cache.s3]
        [runners.cache.gcs]
        [runners.cache.azure]
      [runners.docker]
        tls_verify = false
        volumes = ["/var/run/docker.sock:/var/run/docker.sock", "/cache"]
        pull_policy = ["never"]
        image = "inskale"
        privileged = false
        disable_entrypoint_overwrite = false
        oom_kill_disable = false
        disable_cache = false
        shm_size = 0
        network_mtu = 0


Build the inskale:latest image in the docker environment with, while at ``.../inskale/``::

    docker build -t "inskale:latest" -f .\DockerfileRunner .\

Host the image locally with::

    docker run -d -p 5000:5000 --name local-registry --restart=always registry:2

Then run::

    docker tag inskale:latest localhost:5000/inskale:latest
    docker push localhost:5000/inskale:latest

to update the image in the local hosting.
You should now be able to debug the ci cd with a runner that runs on your pc e.g. in wsl (windows subsystem for linux)