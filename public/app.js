
const hamburger = document.querySelector('.hamburger')
const navLinks = document.querySelector('.nav-links')
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active')
})

// // Get the current date and time
// const currentDate = new Date();
// const currentTime = currentDate.toLocaleTimeString();

// Define the time slots
const timeSlots = [
    { startTime: "09:00", endTime: "10:00" },
    { startTime: "10:00", endTime: "11:00" },
    { startTime: "11:00", endTime: "12:00" },
    { startTime: "12:00", endTime: "13:00" },
    { startTime: "13:00", endTime: "14:00" },
    { startTime: "14:00", endTime: "15:00" },
    { startTime: "15:00", endTime: "16:00" },
    // {startTime: "15:45", endTime: "16:25"},
];

// Loop through the time slots and add them to the list
timeSlots.forEach((timeSlot) => {
    const startTime = timeSlot.startTime;
    const endTime = timeSlot.endTime;
    const timeSlotElement = document.createElement("option");
    timeSlotElement.textContent = `${startTime} - ${endTime}`;
    timeSlotElement.setAttribute("value", timeSlot.startTime)
    document.querySelector("select.timeSlots").appendChild(timeSlotElement);
});
