var WALL_BLOCK = 1;
var PATH_BLOCK = 0;
var GRID_COLUMN = 29;
var GRID_ROW = 19;
var grid = [];

$(document).ready(function () {
    $('.btn-random').click(function () {
        generate_block();
    });

    $('.btn-start').click(function () {
        paths = find_path(block_start(), block_end());
        if (paths.length == 0) {
            alert('No path !!');
        }
        paths.forEach(function (path, key) {
            setTimeout(function() {
                $('.blocks-row').eq(path.x).find('.block').eq(path.y).addClass('block-walked');
            }, 50*(key+1));
        });
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
        'parent': null,
        'type': type,
        'is_map_gen_visited': false,
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

function generate_map_recursive_backtracker() {
    var stack = [];
    var current = block_end();
    current.type = PATH_BLOCK;

    var visited = 1;
    stack.push(current);

    while (visited < Math.ceil(GRID_COLUMN/2)*Math.ceil(GRID_ROW/2)) {
        current.is_map_gen_visited = true;

        var neighbours = get_unvisited_block_neighbours(current);

        if (neighbours.length > 0) {
            var random = Math.floor(Math.random() * neighbours.length);
            var selected_neighbour = neighbours[random];

            stack.push(selected_neighbour);

            // REMOVE THE WALL
            var diff_x = Math.abs(selected_neighbour.x + current.x);
            var diff_y = Math.abs(selected_neighbour.y + current.y);

            wall_block = get_block(diff_x/2, diff_y/2);
            wall_block.type = PATH_BLOCK;

            selected_neighbour.type = PATH_BLOCK;

            current = selected_neighbour;
            visited += 1;
        } else {
            current = stack.pop();
        }
    }
}

function generate_maze_prim_algorithm() {
    var walllist = [];
    var initial = block_end();
    initial.type = PATH_BLOCK;

    walllist.push(initial);

    while (walllist.length > 0) {
        var random = Math.floor(Math.random() * walllist.length);
        var current = walllist[random];

        var neighbours = get_block_neighbours(current, 2);

        var path_neighbours = [];
        var wall_neighbours = [];
        neighbours.forEach(function (neighbour) {
            if (neighbour.type == PATH_BLOCK)
                path_neighbours.push(neighbour);
            else
                wall_neighbours.push(neighbour);
        });

        if (path_neighbours.length > 0) {
            var random = Math.floor(Math.random() * path_neighbours.length);
            var selected = path_neighbours[random];

            // CREATE PATH
            var diff_x = Math.abs(selected.x + current.x);
            var diff_y = Math.abs(selected.y + current.y);

            wall_block = get_block(diff_x/2, diff_y/2);
            wall_block.type = PATH_BLOCK;
            current.type = PATH_BLOCK;
            selected.type = PATH_BLOCK;

            var selected_neighbours = get_block_neighbours(selected, 2);

            selected_neighbours.forEach(function (neighbour) {
                if (neighbour.type == WALL_BLOCK && walllist.indexOf(neighbour) < 0) {
                    walllist.push(neighbour);
                }
            });

            if (walllist.indexOf(current) >= 0)
                walllist.splice(walllist.indexOf(current), 1);

            if (walllist.indexOf(selected) >= 0)
                walllist.splice(walllist.indexOf(selected), 1);
        }

        wall_neighbours.forEach(function (neighbour) {
            if (neighbour.type == WALL_BLOCK && walllist.indexOf(neighbour) < 0) {
                walllist.push(neighbour);
            }
        });
    }
}

function generate_maze_kruskal_algorithm() {
    var sets = [];
    var walllist = [];
    for (var y=0; y<GRID_ROW; y++) {
        for (var x=0; x<GRID_COLUMN; x++) {
            if ((y%2 == 1 && x%2 == 0) || (y%2 == 0 && x%2 == 1)) {
                walllist.push(get_block(y, x));
            } else if (y%2==0 && x%2==0) {
                sets.push( [get_block(y, x)] );
            }
        }
    }

    while (walllist.length > 1) {
        var index = Math.floor(Math.random() * walllist.length);
        var wall = walllist[index];
        walllist.splice(index , 1);

        // get couple wall
        if (wall.x%2 == 1) {
            var first = get_block(wall.x-1, wall.y);
            var second = get_block(wall.x+1, wall.y);
        } else if (wall.y%2 == 1) {
            var first = get_block(wall.x, wall.y-1);
            var second = get_block(wall.x, wall.y+1);
        }

        var first_index = -999, second_index = -999;
        for (var set_index=0; set_index<sets.length; set_index++) {
            if (sets[set_index].indexOf(first) >= 0 ) {
                first_index = set_index;
            }

            if (sets[set_index].indexOf(second) >= 0 ) {
                second_index = set_index;
            }
        }

        if (first_index >= 0 && second_index >= 0 && first_index != second_index) {
            first.type = PATH_BLOCK;
            second.type = PATH_BLOCK;
            wall.type = PATH_BLOCK;

            sets[second_index].forEach(function (item_in_second) {
                sets[first_index].push(item_in_second);
            });
            sets.splice(second_index, 1)
        }
    }
}

function generate_maze_with_loop(density) {

    var density = density || 25;

    var walllist = [];
    for (var y=0; y<GRID_ROW; y++) {
        for (var x=0; x<GRID_COLUMN; x++) {
            var block = get_block(y, x);
            if ((y%2 == 1 && x%2 == 0) || (y%2 == 0 && x%2 == 1)) {
                block.type = PATH_BLOCK;
                walllist.push(block);
            } else if (y%2==1 && x%2==1) {
                block.type = WALL_BLOCK;
            } else {
                block.type = PATH_BLOCK;
            }
        }
    }

    for (var i=0; i<Math.floor(walllist.length*density/100); i++) {
        var randomIndex = Math.floor(Math.random()*walllist.length);
        var wall = walllist[randomIndex];

        // get couple wall
        if (wall.x%2 == 1) {
            var first = get_block(wall.x-1, wall.y);
            var second = get_block(wall.x+1, wall.y);
        } else if (wall.y%2 == 1) {
            var first = get_block(wall.x, wall.y-1);
            var second = get_block(wall.x, wall.y+1);
        }

        if (first.x >=0 && second.x >=0) {
            wall.type = WALL_BLOCK;
            paths = find_path(first, second);
        }
        if (paths.length == 0) {
            wall.type = PATH_BLOCK;
        }

        walllist.splice(randomIndex, 1);
    }
}

function generate_block() {
    var html = '';
    for (var i=0; i<GRID_ROW; i++) {
        grid[i] = [];
        for (var j=0; j<GRID_COLUMN; j++) {
            grid[i][j] = block(i, j, WALL_BLOCK);
        }
    }

    var generate_maze_method = $('.maze-generate-algorithm').val()
    window[generate_maze_method]();
    // generate_map_recursive_backtracker();
    // generate_maze_prim_algorithm();

    for (var i=0; i<GRID_ROW; i++) {
        var html_tmp = '';

        for (var j=0; j<GRID_COLUMN; j++) {
            if (i==0 && j==0) {
                html_tmp += '<div class="block block-path block-start"></div>';
            } else if (i==GRID_ROW-1 && j==GRID_COLUMN-1) {
                html_tmp += '<div class="block block-path block-end"></div>';
            } else if (get_block(i, j).type == PATH_BLOCK) {
                html_tmp += '<div class="block block-path"></div>';
            } else {
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

function get_block_neighbours(block, distance) {
    neighbours = []
    if (grid[block.x-distance] && grid[block.x-distance][block.y]) {
        neighbours.push(grid[block.x-distance][block.y]);
    }
    if (grid[block.x+distance] && grid[block.x+distance][block.y]) {
        neighbours.push(grid[block.x+distance][block.y]);
    }
    if (grid[block.x] && grid[block.x][block.y-distance]) {
        neighbours.push(grid[block.x][block.y-distance]);
    }
    if (grid[block.x] && grid[block.x][block.y+distance]) {
        neighbours.push(grid[block.x][block.y+distance]);
    }
    return neighbours;
}

function get_unvisited_block_neighbours(block) {
    neighbours = []
    if (grid[block.x-2] && grid[block.x-2][block.y]) {
        if (!grid[block.x-2][block.y].is_map_gen_visited) {
            neighbours.push(grid[block.x-2][block.y]);
        }
    }
    if (grid[block.x+2] && grid[block.x+2][block.y]) {
        if (!grid[block.x+2][block.y].is_map_gen_visited) {
            neighbours.push(grid[block.x+2][block.y]);
        }
    }
    if (grid[block.x] && grid[block.x][block.y-2]) {
        if (!grid[block.x][block.y-2].is_map_gen_visited) {
            neighbours.push(grid[block.x][block.y-2]);
        }
    }
    if (grid[block.x] && grid[block.x][block.y+2]) {
        if (!grid[block.x][block.y+2].is_map_gen_visited) {
            neighbours.push(grid[block.x][block.y+2]);
        }
    }
    return neighbours;
}

function manhattan_distance(block_from, block_to) {
    dx = Math.abs(block_from.x, block_to.x);
    dy = Math.abs(block_from.y, block_to.y);
    return (dx+dy);
}

function resetX() {
    for (var i=0; i<GRID_ROW; i++) {
        for (var j=0; j<GRID_COLUMN; j++) {
            grid[i][j].f = 0;
            grid[i][j].g = 0;
            grid[i][j].h = 0;
            grid[i][j].parent = null;
        }
    }
}

function find_path(start, end) {
    resetX();
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
            var parents = [current];
            while (current.parent) {
                parents.push(current.parent);
                current = current.parent;
            }

            parents.reverse();

            parents.forEach(function (parent) {
                console.log('Parent: ' + parent.x + ' - ' + parent.y);
            });

            return parents
        }

        openset = removeItems(openset, current);
        closedset.push(current);

        var neighbours = get_block_neighbours(current, 1);
        neighbours.forEach(function (neighbour) {
            if (closedset.indexOf(neighbour) >= 0 || neighbour.type == WALL_BLOCK) {
                return false;
            }

            // DIST_BETWEEN(current,neighbour) IS ALWAYS 1
            var g_temp = current.g + 1;

            if (openset.indexOf(neighbour) < 0 || g_temp < neighbour.g) {
                // TODO: CAL neighbour.h
                neighbour.h = manhattan_distance(neighbour, end);

                neighbour.parent = current;
                neighbour.g = g_temp;
                neighbour.f = g_temp + neighbour.h;

                if (openset.indexOf(neighbour) < 0) {
                    openset.push(neighbour);
                }
            }

        });
    }

    // NOT HAVE PATH
    return [];
}