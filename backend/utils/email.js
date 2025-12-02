const nodemailer =require("nodemailer");


const transporter =nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS,
    },
});


const sendSecurityAlertEmail =async(info)=>{

    const html =`
     <div style="background:#0f172a;padding:24px;color:#e2e8f0;font-family:'Arial'">
      <div style="max-width:520px;margin:auto;background:#1e293b;border-radius:16px;padding:24px;border:1px solid #38bdf8;">
        <h2 style="color:#38bdf8;">Security Alert: New Login Detected</h2>

        <p>A new login to your Cybrex account was detected. If this wasn’t you, secure your account immediately.</p>

        <div style="background:#0f172a;padding:16px;border-radius:12px;margin-top:12px;">
          <p><b>Device:</b> ${info.device}</p>
          <p><b>Browser:</b> ${info.browser} (${info.os})</p>
          <p><b>IP Address:</b> ${info.ipAddress}</p>
          <p><b>Location:</b> ${info.city}, ${info.region}, ${info.country}</p>
          <p><b>Time:</b> ${info.time}</p>
        </div>

        <p style="margin-top:20px;font-size:12px;color:#94a3b8;">Cybrex Security System</p>
      </div>
    </div>
    `;

    await transporter.sendMail({
        from:process.env.SMTP_USER,
        to:info.to,
        subject:"Cybrex Security Alert",
        html,
    });
};


module.exports ={sendSecurityAlertEmail};