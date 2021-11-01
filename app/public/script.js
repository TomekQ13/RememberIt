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

const reminderEmail = document.getElementById('reminderEmail')
const emailReminderFormGroup = document.getElementsByName('emailReminderFormGroup')

if (reminderEmail) {
    reminderEmail.addEventListener('change', () => {
        emailReminderFormGroup.forEach(el => {
            if (reminderEmail.checked) {
                el.classList.remove('d-none')
            } else {
                el.classList.add('d-none')
            }            
        })
    })
}

const btnAddEmailReminder = document.getElementById('btnAddEmailReminder')
if (btnAddEmailReminder) {
    btnAddEmailReminder.addEventListener('click', () => {
        btnAddEmailReminder.insertAdjacentHTML('beforebegin', 
        `
        <label for="remind_days_before_email">How many days before would you like to get an additional email reminder?</label>
        <input type="number" id="remind_days_before_email" name="remind_days_before_email" min="1" max="365" required>
        <button type="button" class="btn btn-outline-danger btn-sm" name="btnRemoveEmailReminder">+</button><br>
        `        
        )
        const btnRemoveEmailReminders = document.getElementsByName('btnRemoveEmailReminder')
        if (btnRemoveEmailReminders) {
            addRemoveEmailReminderEL([btnRemoveEmailReminders[btnRemoveEmailReminders.length -1]])
        }        
    })
}

function addRemoveEmailReminderEL(elements) {
    elements.forEach(el => {
        el.addEventListener('click', () => {
            el.previousElementSibling.remove()
            el.previousElementSibling.remove()
            el.previousElementSibling.remove()
            el.remove()
        })
    })
}

const btnRemoveEmailReminders = document.getElementsByName('btnRemoveEmailReminder')
addRemoveEmailReminderEL(btnRemoveEmailReminders)


// remove messages after time with fade
// setTimeout(() => {
//     let messages = document.getElementsByClassName('alert')
//     for (let i=0; i< messages.length; i++) {
//         messages[i].classList.add('hide');
//         setTimeout(() => {messages[i].remove();}, 400)
//     }
// }, 2000);
