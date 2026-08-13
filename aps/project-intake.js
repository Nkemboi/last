/* =========================================================
   AXIS MEDIA — PROJECT INTAKE API
   Diagnostic + Zoho SMTP version
   ========================================================= */

const nodemailer = require("nodemailer");


export default async function handler(req, res) {

  console.log("======================================");
  console.log("AXIS MEDIA PROJECT INTAKE");
  console.log("Request received");
  console.log("Method:", req.method);
  console.log("======================================");


  /* =======================================================
     METHOD
     ======================================================= */

  if (req.method !== "POST") {

    return res.status(405).json({

      success: false,

      message: "Method not allowed."

    });

  }


  try {

    /* =====================================================
       READ BODY
       ===================================================== */

    let data = req.body || {};


    if (typeof data === "string") {

      try {

        data =
          JSON.parse(data);

      } catch (error) {

        console.error(
          "JSON parsing failed:",
          error.message
        );

        return res.status(400).json({

          success: false,

          message:
            "Invalid request data."

        });

      }

    }


    console.log(
      "Received fields:",
      Object.keys(data)
    );


    /* =====================================================
       NORMALISE DATA
       ===================================================== */

    const name =
      String(
        data.name ||
        data.fullName ||
        data.full_name ||
        ""
      ).trim();


    const company =
      String(
        data.company ||
        data.organisation ||
        data.organization ||
        ""
      ).trim();


    const email =
      String(
        data.email ||
        data.emailAddress ||
        data.email_address ||
        ""
      ).trim();


    const phone =
      String(
        data.phone ||
        data.telephone ||
        data.mobile ||
        data.whatsapp ||
        ""
      ).trim();


    const service =
      String(
        Array.isArray(data.service)
          ? data.service.join(", ")
          : (
              data.service ||
              data.services ||
              data.projectType ||
              data.project_type ||
              ""
            )
      ).trim();


    const budget =
      String(
        Array.isArray(data.budget)
          ? data.budget.join(", ")
          : (
              data.budget ||
              data.projectBudget ||
              data.project_budget ||
              ""
            )
      ).trim();


    const timeline =
      String(
        Array.isArray(data.timeline)
          ? data.timeline.join(", ")
          : (
              data.timeline ||
              data.timeframe ||
              data.projectTimeline ||
              data.project_timeline ||
              ""
            )
      ).trim();


    const project =
      String(
        data.project ||
        data.projectBrief ||
        data.project_brief ||
        data.brief ||
        data.message ||
        data.description ||
        data.details ||
        ""
      ).trim();


    /* =====================================================
       VALIDATION
       ===================================================== */

    const missing = [];


    if (!name) {
      missing.push("name");
    }


    if (!email) {
      missing.push("email");
    }


    if (!project) {
      missing.push("project");
    }


    if (missing.length) {

      console.error(
        "Validation failed:",
        missing
      );


      return res.status(400).json({

        success: false,

        message:
          "Please complete the required fields.",

        missing

      });

    }


    /* =====================================================
       ENVIRONMENT CHECK
       ===================================================== */

    console.log(
      "Checking Zoho configuration..."
    );


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


    /*
     * NEVER log the password.
     */

    console.log(
      "ZOHO_SMTP_HOST:",
      smtpHost
        ? "SET"
        : "MISSING"
    );


    console.log(
      "ZOHO_SMTP_PORT:",
      smtpPort
    );


    console.log(
      "ZOHO_EMAIL:",
      zohoEmail
        ? "SET"
        : "MISSING"
    );


    console.log(
      "ZOHO_PASSWORD:",
      zohoPassword
        ? "SET"
        : "MISSING"
    );


    console.log(
      "LEAD_EMAIL:",
      leadEmail
        ? "SET"
        : "MISSING"
    );


    /* =====================================================
       ENVIRONMENT VALIDATION
       ===================================================== */

    const missingEnvironment = [];


    if (!smtpHost) {

      missingEnvironment.push(
        "ZOHO_SMTP_HOST"
      );

    }


    if (!zohoEmail) {

      missingEnvironment.push(
        "ZOHO_EMAIL"
      );

    }


    if (!zohoPassword) {

      missingEnvironment.push(
        "ZOHO_PASSWORD"
      );

    }


    if (!leadEmail) {

      missingEnvironment.push(
        "LEAD_EMAIL"
      );

    }


    if (missingEnvironment.length) {

      console.error(
        "Missing environment variables:",
        missingEnvironment
      );


      return res.status(500).json({

        success: false,

        message:
          "Zoho email configuration is incomplete.",

        missingEnvironment

      });

    }


    /* =====================================================
       CREATE SMTP TRANSPORT
       ===================================================== */

    console.log(
      "Creating Zoho SMTP transporter..."
    );


    const transporter =
      nodemailer.createTransport({

        host:
          smtpHost,

        port:
          smtpPort,

        secure:
          smtpPort === 465,

        auth: {

          user:
            zohoEmail,

          pass:
            zohoPassword

        }

      });


    /* =====================================================
       VERIFY SMTP
       ===================================================== */

    console.log(
      "Verifying Zoho SMTP connection..."
    );


    try {

      await transporter.verify();


      console.log(
        "Zoho SMTP verification successful."
      );

    } catch (smtpError) {

      console.error(
        "ZOHO SMTP VERIFICATION FAILED"
      );


      console.error(
        "SMTP error code:",
        smtpError.code
      );


      console.error(
        "SMTP error command:",
        smtpError.command
      );


      console.error(
        "SMTP error response:",
        smtpError.response
      );


      console.error(
        "SMTP error message:",
        smtpError.message
      );


      return res.status(500).json({

        success: false,

        message:
          "Zoho SMTP connection failed.",

        error:
          smtpError.message

      });

    }


    /* =====================================================
       EMAIL TO AXIS MEDIA
       ===================================================== */

    console.log(
      "Sending project enquiry to:",
      leadEmail
    );


    await transporter.sendMail({

      from:
        `"Axis Media Website" <${zohoEmail}>`,

      to:
        leadEmail,

      replyTo:
        email,

      subject:
        `New Project Enquiry — ${name}`,

      text: `

AXIS MEDIA — NEW PROJECT ENQUIRY

Name:
${name}

Company:
${company || "Not provided"}

Email:
${email}

Phone:
${phone || "Not provided"}

Service:
${service || "Not specified"}

Budget:
${budget || "Not specified"}

Timeline:
${timeline || "Not specified"}

Project Brief:
${project}

      `,

      html: `

<div style="
  font-family:Arial,Helvetica,sans-serif;
  max-width:700px;
  margin:auto;
  color:#111;
">

  <div style="
    padding:35px;
    background:#f4f2ed;
  ">

    <div style="
      color:#ff5b35;
      font-size:12px;
      font-weight:bold;
      letter-spacing:2px;
      margin-bottom:20px;
    ">
      AXIS MEDIA
    </div>

    <h1 style="
      font-size:36px;
      margin:0;
    ">
      New Project Enquiry
    </h1>

  </div>


  <div style="
    padding:35px;
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
      padding:20px;
      background:#f4f2ed;
      line-height:1.7;
      white-space:pre-line;
    ">
      ${escapeHtml(project)}
    </div>

  </div>

</div>

      `

    });


    console.log(
      "Project enquiry email sent successfully."
    );


    /* =====================================================
       CONFIRMATION EMAIL TO CLIENT
       ===================================================== */

    console.log(
      "Sending client confirmation..."
    );


    await transporter.sendMail({

      from:
        `"Axis Media" <${zohoEmail}>`,

      to:
        email,

      subject:
        "We've received your project enquiry — Axis Media",

      text: `

Hi ${name},

We've received your project enquiry.

We'll review your brief and get back to you shortly.

Axis Media Solutions
hello@axismedia.co.ke

      `,

      html: `

<div style="
  font-family:Arial,Helvetica,sans-serif;
  max-width:650px;
  margin:auto;
  padding:40px;
">

  <div style="
    color:#ff5b35;
    font-size:12px;
    font-weight:bold;
    letter-spacing:2px;
  ">
    AXIS MEDIA
  </div>


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
    margin-top:35px;
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


  <p style="
    margin-top:40px;
    color:#777;
  ">
    Axis Media Solutions
  </p>


  <p style="
    color:#777;
  ">
    Branding · Design · Digital
  </p>


  <p style="
    color:#777;
  ">
    hello@axismedia.co.ke
  </p>

</div>

      `

    );


    console.log(
      "Client confirmation sent."
    );


    /* =====================================================
       SUCCESS
       ===================================================== */

    return res.status(200).json({

      success: true,

      message:
        "Project enquiry received successfully."

    });


  } catch (error) {

    /* =====================================================
       GLOBAL ERROR
       ===================================================== */

    console.error(
      "======================================"
    );


    console.error(
      "AXIS MEDIA PROJECT INTAKE ERROR"
    );


    console.error(
      "Error name:",
      error.name
    );


    console.error(
      "Error code:",
      error.code
    );


    console.error(
      "Error message:",
      error.message
    );


    console.error(
      "Error stack:",
      error.stack
    );


    console.error(
      "======================================"
    );


    return res.status(500).json({

      success: false,

      message:
        "Unable to process project enquiry.",

      error:
        error.message

    });

  }

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}
