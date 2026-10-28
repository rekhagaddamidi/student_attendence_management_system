const express = require("express");
const supabase = require("../supabase");
const router = express.Router();
const validText = (v, max) => typeof v === "string" && v.trim().length > 0 && v.trim().length <= max;

router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("students").select("id,name,roll_number,course,email,created_at").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (e) { next(e); }
});
router.post("/", async (req, res, next) => {
  try {
    const { name, rollNumber, course, email = "" } = req.body || {};
    if (!validText(name,100) || !validText(rollNumber,30) || !validText(course,80)) return res.status(400).json({error:"Name, roll number, and course are required and must be within the length limits."});
    if (typeof email !== "string" || email.length > 254 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return res.status(400).json({error:"Enter a valid email address."});
    const { data, error } = await supabase.from("students").insert({name:name.trim(),roll_number:rollNumber.trim(),course:course.trim(),email:email.trim()||null}).select("id,name,roll_number,course,email,created_at").single();
    if (error) { if (error.code === "23505") return res.status(409).json({error:"That roll number is already registered."}); throw error; }
    res.status(201).json(data);
  } catch (e) { next(e); }
});
router.delete("/:id", async (req, res, next) => {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(req.params.id)) return res.status(400).json({error:"Invalid student ID."});
    const { error } = await supabase.from("students").delete().eq("id",req.params.id);
    if (error) throw error;
    res.status(204).end();
  } catch (e) { next(e); }
});
module.exports = router;
