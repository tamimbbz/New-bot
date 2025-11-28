const fs = require("fs");
const axios = require("axios");

module.exports = {
    config: {
        name: "groupinfo",
        version: "1.0",
        author: "Tamim x ChatGPT",
        countDown: 5,
        role: 0,
        shortDescription: "Group full info + profile picture",
        category: "group",
    },

    onStart: async function ({ api, event }) {
        try {
            const threadID = event.threadID;

            // গ্রুপ ইনফো লোড
            const info = await api.getThreadInfo(threadID);

            const groupName = info.threadName || "Unknown Group";
            const memberCount = info.participantIDs.length;
            const admins = info.adminIDs.map(a => a.id);
            const adminCount = admins.length;

            // গ্রুপ প্রোফাইল পিকচার ডাউনলোড
            const avatarUrl = info.imageSrc || null;
            let avatarPath = null;

            if (avatarUrl) {
                const img = await axios.get(avatarUrl, { responseType: "arraybuffer" });
                avatarPath = __dirname + "/group_avatar.jpg";
                fs.writeFileSync(avatarPath, Buffer.from(img.data));
            }

            const msg = 
`📌 **Group Information**
━━━━━━━━━━━━━━━━━
👥 Group Name: ${groupName}
🆔 Group ID: ${threadID}
👤 Total Members: ${memberCount}
⭐ Admins: ${adminCount}
━━━━━━━━━━━━━━━━━
📸 Profile Picture: Attached`;

            await api.sendMessage(
                {
                    body: msg,
                    attachment: avatarPath ? fs.createReadStream(avatarPath) : null
                },
                threadID,
                () => {
                    if (avatarPath && fs.existsSync(avatarPath)) {
                        fs.unlinkSync(avatarPath);
                    }
                }
            );

        } catch (err) {
            console.log(err);
        }
    }
};
