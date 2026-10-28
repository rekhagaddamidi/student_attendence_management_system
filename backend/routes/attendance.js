const express = require("express");
const supabase = require("../supabase");
const router = express.Router();
const validDate = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0,10) === s;

router.get("/", async (req, res, next) => {
  try {
    const date = req.query.date;
    if (!validDate(date)) return res.status(400).json({error:"Provide a valid date in YYYY-MM-DD format."});
    const { data, error } = await supabase.from("attendance").select("id,student_id,attendance_date,status").eq("attendance_date",date);
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});
router.post("/bulk", async (req, res, next) => {
  try {
    const { date, records } = req.body || {};
    if (!validDate(date)) return res.status(400).json({error:"Provide a valid attendance date."});
    if (!Array.isArray(records) || records.length < 1 || records.length > 1000) return res.status(400).json({error:"Provide attendance records for at least one student."});
    const seen = new Set();
    for (const r of records) {
      if (!r || typeof r.studentId !== "string" || !/^[0-9a-f-]{36}$/i.test(r.studentId) || !["present","absent"].includes(r.status)) return res.status(400).json({error:"Each record needs a valid student ID and a Present or Absent status."});
      if (seen.has(r.studentId)) return res.status(400).json({error:"Duplicate student in this attendance submission."});
      seen.add(r.studentId);
    }
    const rows = records.map(r=>({student_id:r.studentId,attendance_date:date,status:r.status}));
    const { data, error } = await supabase.from("attendance").upsert(rows,{onConflict:"student_id,attendance_date"}).select("id");
    if (error) { if (error.code === "23503") return res.status(400).json({error:"One or more students do not exist. Refresh the page and try again."}); throw error; }
    res.json({saved:data.length,date});
  } catch (e) { next(e); }
});
module.exports = router;
