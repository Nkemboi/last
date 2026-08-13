import nodemailer from "nodemailer";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {

    const {
      name,
      company,
      email,
      phone,
      service,
      budget,
      timeline,
      project
    } = req.body;


    // Basic validation

    if (!name || !email || !project) {
      return res.status(400).json({
        success: false,
        message: "Please complete the required fields."
      });
    }


    // Zoho SMTP

    const transporter = nodemailer.createTransport({

      host: process.env.ZOHO_SMTP_HOST,

      port: Number(
        process.env.ZOHO_SMTP_PORT || 465
      ),

      secure: true,

      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD
      }

    });


    // Email sent to Axis Media

    await transporter.sendMail({

      from: `"Axis Media Website" <${process.env.ZOHO_EMAIL}>`,

      to: process.env.LEAD_EMAIL,

      replyTo: email,

      subject: `New Project Enquiry — ${name}`,

      html: `

        <div style="
          font-family: Arial, sans-serif;
          max-width: 700px;
          margin: 0 auto;
          color: #111;
        ">

          <h1 style="
            font-size: 32px;
            margin-bottom: 30px;
          ">
            New Project Enquiry
          </h1>


          <div style="
            background:#f4f2ed;
            padding:25px;
            margin-bottom:20px;
          ">

            <p>
              <strong>Name</strong><br>
              ${name}
            </p>

            <p>
              <strong>Company</strong><br>
              ${company || "Not provided"}
            </p>

            <p>
              <strong>Email</strong><br>
              ${email}
            </p>

            <p>
              <strong>Phone</strong><br>
              ${phone || "Not provided"}
            </p>

          </div>


          <div style="
            background:#f4f2ed;
            padding:25px;
            margin-bottom:20px;
          ">

            <p>
              <strong>Service</strong><br>
              ${service || "Not specified"}
            </p>

            <p>
              <strong>Budget</strong><br>
              ${budget || "Not specified"}
            </p>

            <p>
              <strong>Timeline</strong><br>
              ${timeline || "Not specified"}
            </p>

          </div>


          <div style="
            border-top:1px solid #ddd;
            padding-top:25px;
          ">

            <h2>Project Brief</h2>

            <p style="
              line-height:1.7;
              white-space:pre-line;
            ">
              ${project}
            </p>

          </div>


          <div style="
            margin-top:40px;
            padding-top:20px;
            border-top:1px solid #ddd;
            color:#777;
            font-size:12px;
          ">

            Submitted through
            <strong>Axis Media</strong>
            website.

          </div>

        </div>

      `
    });


    // Confirmation email to client

    await transporter.sendMail({

      from: `"Axis Media" <${process.env.ZOHO_EMAIL}>`,

      to: email,

      subject: "We've received your project enquiry — Axis Media",

      html: `

        <div style="
          font-family:Arial,sans-serif;
          max-width:650px;
          margin:auto;
          color:#111;
        ">

          <h1>
            Thanks, ${name}.
          </h1>

          <p style="
            font-size:18px;
            line-height:1.7;
          ">
            We've received your project enquiry.
          </p>

          <p style="
            font-size:16px;
            line-height:1.7;
            color:#555;
          ">
            Our team will review your brief and
            get back to you to discuss the project
            and next steps.
          </p>

          <div style="
            margin:35px 0;
            padding:25px;
            background:#f4f2ed;
          ">

            <strong>
              Your enquiry
            </strong>

            <p>
              ${service || "Creative / Digital Project"}
            </p>

          </div>

          <p>
            — Axis Media
          </p>

        </div>

      `

    });


    return res.status(200).json({
      success: true,
      message: "Project enquiry received."
    });


  } catch (error) {

    console.error(
      "PROJECT FORM ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to submit enquiry."
    });

  }

}
