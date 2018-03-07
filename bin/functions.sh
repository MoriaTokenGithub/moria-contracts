function cleanup-dev {
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml kill
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml rm -f
}

function hack {
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml up -d
}

function build {
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml build
}

