public class TodoItem
{
    public required int Id { get; set; }
    public string? Title { get; set; }
    public bool IsDone { get; set; } = false;
}