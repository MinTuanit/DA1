const parseTimeToDate = (baseDate, timeStr) => {
    const [hour, minute] = timeStr.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hour, minute, 0, 0);
    return date;
}

module.exports = {
    parseTimeToDate
}