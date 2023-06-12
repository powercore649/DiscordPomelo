let socket;
$(window).on("load", async function() {
    await printApiStatus();

    showMessage("message-4", "<strong>NOTE: </strong>Due the high demand we expect higher loading times and some errors");

    $(".check").on("click", async function(e) {
        let val = $(".username").val().trim().toLowerCase();

        if(val == "") {
            showMessage("message-3", `
            ⚠️Username can't be empty!
            `);
            return;
        }

        //MOST SECURED SLOWDOWN SYSTEM
        if(getCookie("slow")) {
            showMessage("message-3", "⌛SLOW DOWN!");
            return;
        } else {
            setCookie("slow", 1, 10000);
        }

        if(!apiStatus) {
            showMessage("message-3", `
            🚨Internal error, try again in one hour!
            `);
            return;
        }

        showMessage("message-5", `
        🔍Checking... Wait up to 30 seconds!
        `);

        $(".check").attr("disabled", "disabled");
        $(".check").val("● ● ●");

        let res = await sendApi({
            url: "https://api.lixqa.de/v2/discord/pomelo-lookup/?username=" + val
        });
        console.log(res);

        $(".check").removeAttr("disabled");
        $(".check").val("Check");

        hideMessage();

        if(!res.error) {
            if(res.message == "Available") {
                showMessage("message-1", `
                ✔️You're lucky!<br>
                <strong><span style="text-decoration:underline;">` + val + `</span> is available.</strong>
                `);
            } else if(res.message == "Taken or reserved") {
                showMessage("message-2", `
                😭Sorry...<br>
                <strong><span style="text-decoration:underline;">` + val + `</span> is taken or reserved.</strong>
                `);
            }
        } else {
            showMessage("message-3", "🚨" + res.message + ((res.message.includes("Error") || res.message.includes("error")) ? " | If this still happends in some minutes, report on: discord.gg/8n7kfX6S4h" : ""));
        }
    });

    $(".username").on("input", function(e) {
        hideMessage();
    });

    socket = new WebSocket('wss://lixqa.de:2319');
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({
        channel: "SYSTEM",
        action: "authorization",
        name: "PomeloV1-" + (Math.random() + 1).toString(36).substring(7),
        wsKey: "8gGzif3T4YVqV8d8",
        channels: ["Pomelo","StatusSystem"]
        }));

        socket.addEventListener('message', async function (event) {
            let socketData = JSON.parse(event.data);
            if(socketData.channel != "Pomelo" && socketData.channel != "StatusSystem") return;
            
            if(socketData.action == "connectedClients") {
                $(".counterValue").html(socketData.clients.filter(client => client?.name?.includes("Pomelo")).length);
            } else if(socketData.action == "alert") {
                alert(socketData.value);
            } else if(socketData.action == "reload") {
                window.location.reload();
            }
        });
    });
});

function showMessage(type, message) {
    let element = $(".message");

    element.removeClass("message-1");
    element.removeClass("message-2");
    element.removeClass("message-3");
    element.removeClass("message-4");
    element.removeClass("message-5");

    element.html(message);
    element.addClass(type);

    element.show();
}

function hideMessage() {
    $(".message").hide();
}