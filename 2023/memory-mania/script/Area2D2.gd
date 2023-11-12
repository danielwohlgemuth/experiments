extends Area2D


var id = 0
var active = true

signal clicked(id)


func _ready():
    $CollisionShape2D/AnimatedSprite.play("default")

    var enemynode = get_tree().get_root().find_node("Node2D", true, false)
    enemynode.connect("hit", self, "_on_Hit")


func _on_Area2D2_input_event(_viewport, event, _shape_idx):
    if (!active):
        return

    if event is InputEventMouseButton:
        if event.button_index == BUTTON_LEFT and event.pressed:
            emit_signal("clicked", id)
    else:        
        $CollisionShape2D/AnimatedSprite.play( "focused")


func _on_Area2D2_mouse_exited():
    if (!active):
        return

    $CollisionShape2D/AnimatedSprite.play("default")


func _on_Hit(id, result, play_sound):
    if (id == self.id):
        active = false
        if (result):
            $CollisionShape2D/AnimatedSprite.play("correct")
            if (play_sound):
                $hit.play()
        else:
            $CollisionShape2D/AnimatedSprite.play("wrong")
            if (play_sound):
                $missed.play()

        if ($CollisionShape2D/AnimatedSprite.animation == "correct"):
            yield(get_tree().create_timer(1), "timeout")
            active = true
            $CollisionShape2D/AnimatedSprite.play("default")
