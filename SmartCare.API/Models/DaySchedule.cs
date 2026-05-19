namespace SmartCare.API.Models
{
    public class DaySchedule
    {
        public string Start { get; set; } = string.Empty;
        public string End { get; set; } = string.Empty;
        public bool EmergencyOnly { get; set; } = false;
        public List<BreakPeriod> Breaks { get; set; } = new();
    }
}
