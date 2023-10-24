extends Area2D


var id = 0
var red = Color(1, 0, 0)
var green = Color(0, 1, 0)
var blue = Color(0, 0, 1)
var light_blue = Color(0.4, 0.4, 1)

signal clicked(id)


func _ready():
    $CollisionShape2D/Box.set_texture(unicolor_gradient(blue))

    var enemynode = get_tree().get_root().find_node("Node2D",true,false)
    enemynode.connect("hit", self, "_on_Hit")


func _on_Area2D2_input_event(viewport, event, shape_idx):
    var color = light_blue
    if event is InputEventMouseButton:
        if event.button_index == BUTTON_LEFT and event.pressed:
            color = blue
            emit_signal("clicked", id)

    $CollisionShape2D/Box.set_texture(unicolor_gradient(color))


func _on_Area2D2_mouse_exited():
    $CollisionShape2D/Box.set_texture(unicolor_gradient(blue))


func unicolor_gradient(color):
    var gradient = Gradient.new()
    gradient.colors = PoolColorArray([color])
    var gradient2d = GradientTexture2D.new()
    gradient2d.gradient = gradient
    return gradient2d


func _on_Hit(id, result, sound):
    if (id == self.id):
        var color
        if (result):
            color = green
            if (sound):
                $hit.play()
        else:
            color = red
            if (sound):
                $missed.play()
            
        $CollisionShape2D/Box.set_texture(unicolor_gradient(color))
        yield(get_tree().create_timer(1), "timeout")
        $CollisionShape2D/Box.set_texture(unicolor_gradient(blue))
        
