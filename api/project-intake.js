export default async function handler(req, res) {
  console.log("PROJECT INTAKE API CALLED");

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    });
  }

  try {
    console.log("BODY:", req.body);

    return res.status(200).json({
      success: true,
      message: "API is working",
      received: req.body || {}
    });

  } catch (error) {

    console.error("API ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "API error",
      error: error.message
    });
  }
}
