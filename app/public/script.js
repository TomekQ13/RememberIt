const reminderSMS = document.getElementById('reminderSMS')
const smsReminderFormGroup = document.getElementsByName('smsReminderFormGroup')

if (reminderSMS) {
    reminderSMS.addEventListener('change', (el, i) => {
        smsReminderFormGroup.forEach(el => {
            if (reminderSMS.checked) {
                el.classList.remove('d-none')
            } else {
                el.classList.add('d-none')
            }            
        })
    })

}