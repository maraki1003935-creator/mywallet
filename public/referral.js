const refCode = document.getElementById("refCode");
const refLink = document.getElementById("refLink");
const invited = document.getElementById("invited");
const earnings = document.getElementById("earnings");

const phone = localStorage.getItem("phone");

async function loadReferral() {

    try {

        const response = await fetch("/referral/" + phone);

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        refCode.value = data.user.referralCode;

        refLink.value =
            window.location.origin +
            "/?ref=" +
            data.user.referralCode;

        invited.textContent = data.user.invitedUsers;

        earnings.textContent =
            data.user.referralEarnings +
            " ETB";

    } catch (err) {

        alert("Server Error");

    }

}

function copyLink() {

    navigator.clipboard.writeText(refLink.value);

    alert("Referral link copied.");

}

async function shareLink() {

    if (navigator.share) {

        await navigator.share({

            title: "Join My Website",

            text: "Register using my referral link and make your first deposit of 5,000 ETB or more.",

            url: refLink.value

        });

    } else {

        copyLink();

    }

}

loadReferral();