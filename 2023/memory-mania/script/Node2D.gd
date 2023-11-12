extends Node2D

signal hit(id, result, sound)

var Area2D2 = preload("res://scene/Area2D2.tscn")
var rng = RandomNumberGenerator.new()
var counter = 0
var ids
var current_id = 0
var game_ready = false
var highscore = 0
var area2d2s = []

var MAX_BLOCKS_WIDE = 6
var MAX_BLOCKS_HIGH = 4


func _ready():
    start_game()


func start_game():
    game_ready = false
    rng.randomize()
    highscore = min(highscore, MAX_BLOCKS_WIDE * MAX_BLOCKS_HIGH)
    ids = range(highscore + 1)
    
    for area2d2 in area2d2s:
        area2d2.queue_free()
    area2d2s = []
    $Toplevel/Highscore.text = "Highscore: " + String(highscore)
    $Toplevel/Title.text = ""
    current_id = 0
    counter = 0
    
    var positions = []
    for x in MAX_BLOCKS_WIDE:
        for y in MAX_BLOCKS_HIGH:
            var horizontal_position = 100 + 1000 * x / MAX_BLOCKS_WIDE
            var vertical_position = 150 + 550 * y / MAX_BLOCKS_HIGH
            positions.append(Vector2(horizontal_position, vertical_position))

    for id in ids:
        var instance = Area2D2.instance()
        instance.id = id
        instance.set("z", 10)
        instance.connect("clicked", self, "_on_Clicked")
        var random_position = rng.randi_range(0, positions.size() - 1)
        instance.position = positions[random_position] + Vector2(rng.randi_range(-20, 20), rng.randi_range(-20, 20))
        positions.remove(random_position)
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
            current_id += 1
            if current_id == ids.size():
                $Toplevel/Title.text = "You won!"
                $won.play()
                emit_signal("hit", id, true, false)
                highscore += 1
                $Toplevel/Highscore.text = "Highscore: " + String(highscore)
                
                yield(get_tree().create_timer(1), "timeout")
                
                $Toplevel/Button.show()
            else:
                emit_signal("hit", id, true, true)
        else:
            $Toplevel/Title.text = "You lost!"
            emit_signal("hit", id, false, true)
            game_ready = false
            
            yield(get_tree().create_timer(1), "timeout")
            
            $Toplevel/Button.show()


func _on_Button_pressed():
    $Toplevel/Button.hide()
    start_game()
