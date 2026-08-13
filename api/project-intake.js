const nodemailer = require("nodemailer");

export default async function handler(req, res) {

  // Only accept POST
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
    } = req.body || {};


    // Required fields
    if (!name || !email || !project) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields."
      });
    }


    // Check environment variables
    if (
      !process.env.ZOHO_EMAIL ||
      !process.env.ZOHO_PASSWORD ||
      !process.env.ZOHO_SMTP_HOST
    ) {

      console.error(
        "Missing Zoho environment variables"
      );

      return res.status(500).json({
        success: false,
        message: "Email service is not configured."
      });

    }


    // Create Zoho SMTP connection
    const transporter = nodemailer.createTransport({

      host: process.env.ZOHO_SMTP_HOST,

      port: Number(
        process.env.ZOHO_SMTP_PORT || 465
      ),

      secure:
        Number(
          process.env.ZOHO_SMTP_PORT || 465
        ) === 465,

      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD
      }

    });


    // Verify SMTP connection
    await transporter.verify();


    // Send lead notification to Axis Media
    await transporter.sendMail({

      from:
        `"Axis Media Website" <${process.env.ZOHO_EMAIL}>`,

      to:
        process.env.LEAD_EMAIL ||
        process.env.ZOHO_EMAIL,

      replyTo:
        email,

      subject:
        `New Project Enquiry — ${name}`,

      html: `

        <div style="
          font-family:Arial,sans-serif;
          max-width:700px;
          margin:auto;
          color:#111;
        ">

          <h1>
            New Project Enquiry
          </h1>

          <hr>

          <h2>Contact</h2>

          <p>
            <strong>Name:</strong>
            ${name}
          </p>

          <p>
            <strong>Company:</strong>
            ${company || "Not provided"}
          </p>

          <p>
            <strong>Email:</strong>
            ${email}
          </p>

          <p>
            <strong>Phone:</strong>
            ${phone || "Not provided"}
          </p>


          <h2>Project</h2>

          <p>
            <strong>Service:</strong>
            ${service || "Not specified"}
          </p>

          <p>
            <strong>Budget:</strong>
            ${budget || "Not specified"}
          </p>

          <p>
            <strong>Timeline:</strong>
            ${timeline || "Not specified"}
          </p>


          <h2>Project Brief</h2>

          <div style="
            background:#f4f2ed;
            padding:20px;
            line-height:1.7;
          ">

            ${project}

          </div>


          <p style="
            margin-top:40px;
            color:#777;
            font-size:12px;
          ">

            Submitted through
            axismedia.co.ke

          </p>

        </div>

      `

    });


    // Send confirmation to prospect
    await transporter.sendMail({

      from:
        `"Axis Media" <${process.env.ZOHO_EMAIL}>`,

      to:
        email,

      subject:
        "We've received your project enquiry — Axis Media",

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
            color:#555;
            line-height:1.7;
          ">

            We'll review your brief and get back
            to you shortly to discuss the project
            and next steps.

          </p>

          <hr>

          <p>
            <strong>Axis Media Solutions</strong>
          </p>

          <p>
            Branding · Design · Digital
          </p>

          <p>
            hello@axismedia.co.ke
          </p>

        </div>

      `

    });


    // SUCCESS
    return res.status(200).json({

      success: true,

      message:
        "Project enquiry received."

    });


  } catch (error) {

    console.error(
      "AXIS MEDIA FORM ERROR:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Unable to send your enquiry.",

      // Useful while testing.
      // Remove this in production.
      error:
        process.env.NODE_ENV !== "production"
          ? error.message
          : undefined

    });

  }

}
