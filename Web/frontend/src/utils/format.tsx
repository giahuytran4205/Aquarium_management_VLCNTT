function formatTime(hour: number, minute: number): string {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    let displayHour = hour % 12;
    if (displayHour === 0)
        displayHour = 12;
    const displayMinute = String(minute).padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
}

export { formatTime }
