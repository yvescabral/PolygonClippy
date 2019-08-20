shape_array = {
    "polygon" : [{
        name : "Trapezoid",
        coords : [[20,0],[80,0],[100,100],[0,100]]
    }]
};
  
$html = $("html");
$body = $("body");
$box = $("#box");
$side = $(".side");
$clipboard = $(".clipboard");
$handles = $(".handles");
$shapes = $(".shapes ul");
$functions = $(".functions");
$clip_path = $(".clip-path");
$unprefixed = $(".unprefixed");
$demo = $(".demo");
$codepen = $(".edit-in-codepen");
$inset_round = $("#inset_round");

$demo_width = $("#demo_width");
$demo_height = $("#demo_height");
  
var start = shape_array.polygon[0];
    start_type = "polygon",
    start_coords = start.coords,
    start_name = start.name,

    mobile_px_breakpoint = 800,
    width = 280,
    height = 280,
    flickity = false,
    grid = [0,0];


$(function() {
    sizes();
    init();

    // Reevaluates max width/height on window resize
    $(window).resize(function() {
        var old_width = width;
        var old_height = height;

        handleReposition(old_width, old_height);
        sizes();
    });

    // Add/remove prefixes
    // Classes determine if code block is displayed
    $("#webkit").change(function() {
        if($(this).is(":checked")) {
            $(".webkit").addClass("show");
        } else {
            $(".webkit").removeClass("show");
        }

        clipIt();
        scrollTop();
    });


    // Toggle showing background outside clip-path
    $('#shadowboard-toggle').change(function() {
        if($(this).is(":checked")) {
        $(".shadowboard").css("opacity", ".25");
        } else {
        $(".shadowboard").css("opacity", "0");
        }

        scrollTop();
    });


    // Resize width/height of the demo
    $('input[type="number"]').change(function(){
        var old_width = width;
        var old_height = height;

        width = $demo_width.val();
        if($(window).width() < 800) {
            var max_width = $(window).width() - 42;
        } else {
            var max_width = $(".demo-container").width() - 42;
        }

        var min_width = 100;

        if(width > max_width) { width = max_width; }
        if(width < min_width) { width = min_width; }

        height = $demo_height.val();

        if($(window).width() < 800) {
            var max_height = $(window).height() - $("header").outerHeight() - 42;
        } else {
            var max_height = $(".demo-container").height() - 42;
        }

        var min_height = 100;

        if(height > max_height) { height = max_height; }
        if(height < min_height) { height = min_height; }

        // Calculate new position for each handle
        handleReposition(old_width, old_height);

        // Resize the demo
        $demo_width.val(width);
        $demo_height.val(height);

        sizes();
        scrollTop();
    });


    // Change clipboard background image
    $(".backgrounds img").mousedown(function() {
        var url = $(this).attr("src");

        setCustomBackground(url);
    });
});


function setCustomBackground(url) {
    var style = '.shadowboard, .clipboard { background-image: url(' + url + '); }';
    $("#custom_background").html(style);

    // Scroll to top of page
    scrollTop();
}

function scrollTop() {
// Only if we are on the small screen
    if($(window).width() < mobile_px_breakpoint) {
        $(window).scrollTop(0);
    }
}


function init() {
    console.log("init();");

    type = start_type;

    // Setup polygons
    $.each(shape_array.polygon, function(i, shape){
        paths = '';

        $.each(shape.coords, function(i, coord){
            type = "polygon";

            var x = coord[0] + "%";
            var y = coord[1] + "%";

            var coord = '';

            if(i == shape.coords.length - 1) {
                // last coordinate to add, omits a comma at the end
                paths += x + ' ' + y;

                var clip_path = 'polygon(' + paths + ')';

                appendFigure(clip_path, shape);

            } else {
                // loops through each coordinate and adds it to a list to add
                paths += x + ' ' + y + ', ';
            }
        });
    });

    type = start_type;

    setupDemo(start_coords);
}


function appendFigure(clip_path, shape) {
    // Add all the buttons to the .shapes container
    // considering using some other element other than figure for buttons to be more semantic...

    var webkit = '';
    var unprefixed = 'clip-path: ' + clip_path;

    // Disable the element if we are not ready for it to be enabled
    if(shape.disabled == true) {
        var disabled = 'class="disabled" ';
    } else { var disabled = ""; }

    if($(".webkit.block").hasClass("show")) {
        var webkit = '-webkit-clip-path: ' + clip_path + ';';
    }

    if(type == "polygon") {
        var fig = '<figure class="gallery-cell" ' + disabled + 'data-name="' + shape.name + '" data-type="polygon" data-coords="' + shape.coords.join(" ") + '">'
                + '<div style="' + webkit + ' ' + ' ' + unprefixed + '" class="shape ' + shape.name + '"></div>'
                + '<figcaption>' + shape.name + '</figcaption>'
                + '</figure>';
    }

    console.log("appendFigure();");
    $shapes.append(fig);


    // Add .on class to the figure we are starting with
    $('[data-name="' + start.name + '"]').addClass("on");

    // listen for clicks on the figure buttons
    $("figure:not(.disabled)").unbind().click(function() {
        $("figure").removeClass("on");
        $(this).addClass("on");

        type = $(this).attr("data-type");

        if(type == "inset") {
            var shape = shape_array.inset[0];
                start_coords = shape.coords;

            setupDemo(shape.coords);
        }

        if(type == "polygon") {
            new_shape = [];

            // Coords at stored with data-coords attribute and turned into array
            var coords = $(this).attr("data-coords").split(" ");

            var coords = $.each(coords, function(i, coordinate){
                var coordinate = coordinate.split(",");
                new_shape.push(coordinate);

                if(i == coords.length - 1) {
                start_coords = new_shape;
                setupDemo(start_coords);
                }
            });
        }
    });
}


function setupDemo(coords) {
    console.log("setupDemo();");

    clearDemo();

    // Run through each coordinate for polygons
    $.each(coords, function(i, coord){
        var x = coord[0];
        var y = coord[1];

        // Add unit to % coordinates
        var code_x = x + "%";
        var code_y = y + "%";

        // Convert % to px coordinates
        var x_px = Math.round((x/100) * width);
        var y_px = Math.round((y/100) * height);

        console.log("type: " + type);

        // Setup polygon demo
        if(type == "polygon") {
            $handles.append('<div class="handle" data-handle="' + i + '" style="top: ' + y_px + 'px; left: ' + x_px + 'px;"></div>')

            if(i == coords.length - 1) {
                $functions.append('<code class="point" data-point="' + i + '">' + code_x + ' ' + code_y + '</code>')
                $functions.prepend("polygon(").append(")");

                clipIt();
                readyDrag();
            } else {
                $functions.append('<code class="point" data-point="' + i + '">' + code_x + ' ' + code_y + '</code>, ');
            }
        }
    });
}


// Set side handles for inset shape
function setHandleBars(bar) {
    var coords = $unprefixed.attr("data-coords").split(" ");

    var top = coords[0];
    var right = coords[1];
    var bottom = coords[2];
    var left = coords[3];

    var top_px = Math.round((top/100) * height);
    var right_px = Math.round((1 - (right/100)) * width);
    var bottom_px = Math.round((1 - (bottom/100)) * height);
    var left_px = Math.round((left/100) * width);

    var x_center = (right_px + left_px)/2;
    var y_center = (top_px + bottom_px)/2;

    if(bar !== "top") {
        $(".top.bar").css("top", top_px).css("left", x_center);
    }
    if(bar !== "right") {
        $(".right.bar").css("top", y_center).css("left", right_px);
    }
    if(bar !== "bottom") {
        $(".bottom.bar").css("top", bottom_px).css("left", x_center);
    }
    if(bar !== "left") {
        $(".left.bar").css("top", y_center).css("left", left_px);
    }
}


function readyDrag() {
    // Utilizes the awesome draggabilly.js by Dave Desandro
    // Works well on touch devices
    console.log("readyDrag();");

    var box = document.querySelector("#box");
    var handles = box.querySelectorAll(".handle");

    // If we have a polygon setup draggibilly normally
    if(type == "polygon") {

        // We have already appended handles, now we will attach draggabilly to each of them
        for ( var i = 0, len = handles.length; i < len; i++ ) {
            var handle = handles[i];

            new Draggabilly(handle, {
                containment: true,
                grid: grid
            }).on("dragStart", function(instance, e, pointer) {

                i = instance.element.dataset.handle;

                // .changing triggers the bubble burst animation
                $point = $('[data-point="' + i + '"]');
                $point.addClass("changing");

            }).on("dragMove", function(instance, e, pointer) {

                // Returns current position of the dragging handle
                var x = instance.position.x;
                var y = instance.position.y;

                // Dragging a polygon handle, easy...
                if(type == "polygon") {
                setPoint(x, y);
                }

                clipIt();

            }).on("dragEnd", function(instance) {

                // Remove all the bubble animations
                $(".point").removeClass("changing");

            });
        }
    }

}


function getRadius(x2, x, y2, y) {
    // More fun geometry from high school

    var distance = Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));
    var radius = ((distance/width) * 100).toFixed(1);

    return radius;
}


function setPoint(x, y) {
    // Changes the coordinates of a single point in the code block
    // Snap to the edges of demo
    // Consider using something like this instead of draggabilly's built-in grid[]
    var snap = 1;

    var x = (x/width * 100).toFixed(0);
        if(x < snap) { var x = 0; }
        if(x > (100 - snap)) { var x = 100; }
    var y = (y/height * 100).toFixed(0);
        if(y < snap) { var y = 0; }
        if(y > (100 - snap)) { var y = 100; }

    // Add % if number is not zero
    if(x !== 0) { var x = x + "%"; }
    if(y !== 0) { var y = y + "%"; }

    $point.text(x + ' ' + y);
}


// Reset the demo
function clearDemo() {
    console.log("clearDemo();");

    // Reset from inset function
    $html.removeClass("insetting");
    $(".inset-round").val("5% 20% 0 10%");

    // Empty the demo
    $handles.empty();
    $functions.empty();
}


// Get the code in the code blocks and set the style inline on the clipboard
function clipIt() {
    var clip_path = $(".show.block").text();

    console.log(clip_path);

    $clipboard.attr('style', clip_path);
}

// If the demo area's size is changed we need to reposition each handle
function handleReposition(old_width, old_height) {
    $(".handle").each(function() {
        var x_pct = parseInt($(this).css("left")) / old_width;
        var y_pct = parseInt($(this).css("top")) / old_height;

        var new_x = x_pct * width + "px";
        var new_y = y_pct * height + "px";

        // Reposition each handle
        $(this).css({
        "left" : new_x,
        "top" : new_y
        });
    });
}


// Resize the demo box
function sizes() {
    console.log("sizes();");

    // Adjust for 10px padding on each side because of the handles
    var adjusted_width = parseInt(width) + 20;
    var adjusted_height = parseInt(height) + 20;

    $demo_width.val(width);
    $demo_height.val(height);

    $box.css({
        "width" : adjusted_width,
        "height" : adjusted_height
    });
}
