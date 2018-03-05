function cleanup-dev {
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml kill
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml rm -f
}

function cleanup-test {
    docker-compose -p moria-tests -f vm/docker-compose.yml -f vm/docker-compose.test.yml kill
    docker-compose -p moria-tests -f vm/docker-compose.yml -f vm/docker-compose.test.yml rm -f
}

function hack {
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml up -d
}

function test {
    docker-compose -p moria-tests -f vm/docker-compose.yml -f vm/docker-compose.test.yml up -d
}

function build {
    docker-compose -p moria-dev -f vm/docker-compose.devbox.yml build
    docker-compose -p moria-tests -f vm/docker-compose.yml -f vm/docker-compose.test.yml build
}

