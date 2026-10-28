const express = require("express");
const supabase = require("../supabase");
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { data: students, error: studentError } = await supabase.from("students").select("id,name,roll_number,course,email").order("name");
    if (studentError) throw studentError;
    const { data: records, error: attendanceError } = await supabase.from("attendance").select("student_id,status");
    if (attendanceError) throw attendanceError;
    const totals = new Map();
    for (const row of records) {
      const t = totals.get(row.student_id) || {present:0,absent:0};
      if (row.status === "present") t.present++;
      else if (row.status === "absent") t.absent++;
      totals.set(row.student_id,t);
    }
    res.json(students.map(s=>{
      const t=totals.get(s.id)||{present:0,absent:0};
      const marked=t.present+t.absent;
      return {...s,present_days:t.present,absent_days:t.absent,marked_days:marked,attendance_percentage:marked?Number((t.present/marked*100).toFixed(1)):0};
    }));
  } catch (e) { next(e); }
});
module.exports = router;
