var WALL_BLOCK = 1;
var PATH_BLOCK = 0;
var GRID_COLUMN = 30;
var GRID_ROW = 20;
var grid = [];

$(document).ready(function () {
    $('.btn-random').click(function () {
        generate_block();
    });

    $('.btn-start').click(function () {
        find_path(block_start(), block_end());
    });

    generate_block();
});

function block(x, y, type) {
    return {
        'x': x,
        'y': y,
        'f': 0,
        'g': 0,
        'h': 0,
        'type': type,
    }
}

function get_block(x, y) {
    return grid[x][y];
}

function block_start() {
    return grid[0][0];
}

function block_end() {
    return grid[GRID_ROW-1][GRID_COLUMN-1];
}

function generate_block() {
    var html = '';
    for (var i=0; i<GRID_ROW; i++) {
        var html_tmp = '';
        grid[i] = [];

        for (var j=0; j<GRID_COLUMN; j++) {

            var random = Math.random() * 10;

            if (i==0 && j==0) {
                grid[i][j] = block(i, j, PATH_BLOCK);
                html_tmp += '<div class="block block-path block-start"></div>';
            } else if (i==GRID_ROW-1 && j==GRID_COLUMN-1) {
                grid[i][j] = block(i, j, PATH_BLOCK);
                html_tmp += '<div class="block block-path block-end"></div>';
            } else if (random < 7) {
                grid[i][j] = block(i, j, PATH_BLOCK);
                html_tmp += '<div class="block block-path"></div>';
            } else {
                grid[i][j] = block(i, j, WALL_BLOCK);
                html_tmp += '<div class="block block-wall"></div>';
            }
        }

        html += '<div class="blocks-row">' + html_tmp + '</div>';
    }

    $('.blocks').html(html);
}

function removeItems(array, item) {
    var index = array.indexOf(item);
    array.splice(index, 1);
    return array;
}

function get_block_neighbours(block) {
    neighbours = []
    if (grid[block.x-1] && grid[block.x-1][block.y]) {
        neighbours.push(grid[block.x-1][block.y]);
    }
    if (grid[block.x+1] && grid[block.x+1][block.y]) {
        neighbours.push(grid[block.x+1][block.y]);
    }
    if (grid[block.x] && grid[block.x][block.y-1]) {
        neighbours.push(grid[block.x][block.y-1]);
    }
    if (grid[block.x] && grid[block.x][block.y+1]) {
        neighbours.push(grid[block.x][block.y+1]);
    }
    return neighbours;
}

function find_path(start, end) {
    var closedset = [];
    var openset = [];

    openset.push(start);

    while (openset.length > 0) {

        var lower_f = 9999;
        var current = null;
        openset.forEach(function (node) {
            if (node.f < lower_f) {
                lower_f = node.f;
                current = node;
            }
        });

        if (current == end) {
            alert('success !!');
        }

        openset = removeItems(openset, current);
        closedset.push(current);

        var neighbours = get_block_neighbours(current);
        neighbours.forEach(function (neighbour) {
            if (closedset.indexOf(neighbour) >= 0 || neighbour.type == WALL_BLOCK) {
                return false;
            }

            // DIST_BETWEEN(current,neighbour) IS ALWAYS 1
            var g_temp = current.g + 1;

            if (openset.indexOf(neighbour) < 0 || g_temp < neighbour.g) {
                // TODO: came_from[neighbour] := current
                // TODO: CAL neighbour.h

                neighbour.g = g_temp;
                neighbour.f = g_temp + neighbour.h;

                if (openset.indexOf(neighbour) < 0) {
                    openset.push(neighbour);
                }
            }

        });
    }
}