const nodemailer = require("nodemailer");

export default async function handler(req, res) {

  /*
   * =====================================================
   * ONLY ACCEPT POST
   * =====================================================
   */

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }


  try {

    /*
     * =====================================================
     * READ REQUEST BODY
     * =====================================================
     */

    let data = req.body || {};


    /*
     * Vercel normally parses JSON automatically.
     * This fallback also supports stringified JSON.
     */

    if (typeof data === "string") {

      try {
        data = JSON.parse(data);
      } catch (error) {
        data = {};
      }

    }


    /*
     * =====================================================
     * NORMALISE FIELD NAMES
     * =====================================================
     *
     * This protects us if the frontend uses slightly
     * different field names.
     */

    const name =
      data.name ||
      data.fullName ||
      data.full_name ||
      "";

    const company =
      data.company ||
      data.organisation ||
      data.organization ||
      "";

    const email =
      data.email ||
      data.emailAddress ||
      data.email_address ||
      "";

    const phone =
      data.phone ||
      data.telephone ||
      data.whatsapp ||
      "";

    const service =
      data.service ||
      data.services ||
      "";

    const budget =
      data.budget ||
      "";

    const timeline =
      data.timeline ||
      data.timeframe ||
      "";

    const project =
      data.project ||
      data.projectBrief ||
      data.project_brief ||
      data.message ||
      data.brief ||
      "";


    /*
     * =====================================================
     * DEBUG LOG
     * =====================================================
     *
     * This does NOT log passwords.
     */

    console.log(
      "AXIS MEDIA FORM DATA:",
      {
        name: !!name,
        company: !!company,
        email: !!email,
        phone: !!phone,
        service: !!service,
        budget: !!budget,
        timeline: !!timeline,
        project: !!project
      }
    );


    /*
     * =====================================================
     * REQUIRED FIELD VALIDATION
     * =====================================================
     */

    const missing = [];

    if (!name.trim()) {
      missing.push("name");
    }

    if (!email.trim()) {
      missing.push("email");
    }

    if (!project.trim()) {
      missing.push("project");
    }


    if (missing.length > 0) {

      console.error(
        "AXIS MEDIA FORM VALIDATION FAILED:",
        missing
      );

      return res.status(400).json({

        success: false,

        message:
          "Please complete the required fields.",

        missing

      });

    }


    /*
     * =====================================================
     * ENVIRONMENT VARIABLES
     * =====================================================
     */

    const smtpHost =
      process.env.ZOHO_SMTP_HOST;

    const smtpPort =
      Number(
        process.env.ZOHO_SMTP_PORT || 465
      );

    const zohoEmail =
      process.env.ZOHO_EMAIL;

    const zohoPassword =
      process.env.ZOHO_PASSWORD;

    const leadEmail =
      process.env.LEAD_EMAIL ||
      zohoEmail;


    if (
      !smtpHost ||
      !zohoEmail ||
      !zohoPassword ||
      !leadEmail
    ) {

      console.error(
        "AXIS MEDIA: Missing email environment variables."
      );

      return res.status(500).json({

        success: false,

        message:
          "Email service is not configured."

      });

    }


    /*
     * =====================================================
     * CREATE SMTP TRANSPORT
     * =====================================================
     */

    const transporter =
      nodemailer.createTransport({

        host: smtpHost,

        port: smtpPort,

        secure:
          smtpPort === 465,

        auth: {

          user:
            zohoEmail,

          pass:
            zohoPassword

        }

      });


    /*
     * =====================================================
     * VERIFY ZOHO SMTP
     * =====================================================
     */

    await transporter.verify();


    /*
     * =====================================================
     * SEND LEAD EMAIL TO AXIS MEDIA
     * =====================================================
     */

    await transporter.sendMail({

      from:
        `"Axis Media Website" <${zohoEmail}>`,

      to:
        leadEmail,

      replyTo:
        email,

      subject:
        `New Project Enquiry — ${name}`,

      html: `

        <!DOCTYPE html>

        <html>

        <body style="
          margin:0;
          padding:40px 20px;
          background:#f4f2ed;
          font-family:Arial,Helvetica,sans-serif;
          color:#111;
        ">

          <div style="
            max-width:700px;
            margin:auto;
            background:#ffffff;
            padding:40px;
          ">

            <p style="
              color:#ff5b35;
              font-size:12px;
              font-weight:bold;
              letter-spacing:2px;
            ">
              AXIS MEDIA
            </p>

            <h1 style="
              font-size:36px;
              line-height:1;
            ">
              New Project Enquiry
            </h1>

            <hr style="
              border:0;
              border-top:1px solid #ddd;
              margin:30px 0;
            ">


            <h2>Contact</h2>

            <p>
              <strong>Name</strong><br>
              ${escapeHtml(name)}
            </p>

            <p>
              <strong>Company</strong><br>
              ${escapeHtml(company || "Not provided")}
            </p>

            <p>
              <strong>Email</strong><br>
              ${escapeHtml(email)}
            </p>

            <p>
              <strong>Phone</strong><br>
              ${escapeHtml(phone || "Not provided")}
            </p>


            <h2 style="margin-top:40px;">
              Project
            </h2>

            <p>
              <strong>Service</strong><br>
              ${escapeHtml(service || "Not specified")}
            </p>

            <p>
              <strong>Budget</strong><br>
              ${escapeHtml(budget || "Not specified")}
            </p>

            <p>
              <strong>Timeline</strong><br>
              ${escapeHtml(timeline || "Not specified")}
            </p>


            <h2 style="margin-top:40px;">
              Project Brief
            </h2>

            <div style="
              padding:25px;
              background:#f4f2ed;
              line-height:1.7;
              white-space:pre-line;
            ">
              ${escapeHtml(project)}
            </div>


            <p style="
              margin-top:40px;
              color:#888;
              font-size:12px;
            ">
              Submitted through axismedia.co.ke
            </p>

          </div>

        </body>

        </html>

      `

    });


    /*
     * =====================================================
     * SEND CONFIRMATION TO CLIENT
     * =====================================================
     */

    await transporter.sendMail({

      from:
        `"Axis Media" <${zohoEmail}>`,

      to:
        email,

      subject:
        "We've received your project enquiry — Axis Media",

      html: `

        <div style="
          max-width:650px;
          margin:auto;
          padding:40px 20px;
          font-family:Arial,Helvetica,sans-serif;
          color:#111;
        ">

          <p style="
            color:#ff5b35;
            font-size:12px;
            font-weight:bold;
            letter-spacing:2px;
          ">
            AXIS MEDIA
          </p>

          <h1 style="
            font-size:42px;
            line-height:1;
          ">
            Thanks, ${escapeHtml(name)}.
          </h1>

          <p style="
            font-size:18px;
            line-height:1.7;
          ">
            We've received your project enquiry.
          </p>

          <p style="
            color:#666;
            line-height:1.7;
          ">
            We'll review your brief and get back to you
            shortly to discuss the project and next steps.
          </p>

          <div style="
            margin:35px 0;
            padding:25px;
            background:#f4f2ed;
          ">

            <strong>
              PROJECT RECEIVED
            </strong>

            <p>
              ${escapeHtml(
                service ||
                "Creative / Digital Project"
              )}
            </p>

          </div>

          <p>
            <strong>Axis Media Solutions</strong>
          </p>

          <p style="color:#777;">
            Branding · Design · Digital
          </p>

          <p style="color:#777;">
            hello@axismedia.co.ke
          </p>

        </div>

      `

    });


    /*
     * =====================================================
     * SUCCESS
     * =====================================================
     */

    console.log(
      "AXIS MEDIA PROJECT ENQUIRY SENT:",
      email
    );


    return res.status(200).json({

      success: true,

      message:
        "Project enquiry received."

    });


  } catch (error) {

    /*
     * =====================================================
     * ERROR HANDLING
     * =====================================================
     */

    console.error(
      "AXIS MEDIA PROJECT INTAKE ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to send your enquiry.",

      error:
        process.env.NODE_ENV !== "production"
          ? error.message
          : undefined

    });

  }

}


/*
 * =====================================================
 * HTML ESCAPE
 * =====================================================
 */

function escapeHtml(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}
