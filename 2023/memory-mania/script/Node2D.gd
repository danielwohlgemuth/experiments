extends Node2D

signal hit(id, result, sound)

var area2d2 = preload("res://scene/Area2D2.tscn")
var rng = RandomNumberGenerator.new()
var counter = 0
var ids
var current_id = 0
var game_ready = false
var streak = 1
var area2d2s = []


func _ready():
    start_game()


func start_game():
    game_ready = false
    rng.randomize()
    ids = range(streak)
    
    for area2d2 in area2d2s:
        area2d2.queue_free()
    area2d2s = []
    $Counter.text = ""
    current_id = 0
    counter = 0

    for id in ids:
        var instance = area2d2.instance()
        instance.id = id
        instance.connect("clicked", self, "_on_Clicked")
        instance.position = Vector2(rng.randi_range(50, 950), rng.randi_range(150, 550))
        add_child(instance)
        area2d2s.append(instance)
        
    for area2d2 in area2d2s:
        emit_signal("hit", area2d2.id, true, false)
        yield(get_tree().create_timer(1), "timeout")
        
    game_ready = true


func _on_Clicked(id):
    if game_ready and current_id in ids:
        if ids[current_id] == id:
            counter += 1
            $Counter.text = String(counter)
            current_id += 1
            if current_id == ids.size():
                $Counter.text = "You won!"
                $won.play()
                emit_signal("hit", id, true, false)
                streak += 1
                
                yield(get_tree().create_timer(1), "timeout")
                
                $Button.show()
            else:
                emit_signal("hit", id, true, true)
        else:
            $Counter.text = "You lost!"
            emit_signal("hit", id, false, true)
            game_ready = false
            
            yield(get_tree().create_timer(1), "timeout")
            
            $Button.show()


func _on_Button_pressed():
    $Button.hide()
    start_game()
