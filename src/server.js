import express from 'express';
import schedule from 'node-schedule';
import mongoose from 'mongoose';
import logger from './common/logger.js';

const app = express();

// Define a schema for the scheduled jobs
const jobSchema = new mongoose.Schema({
  day: String,
  time: String,
  job: Object,
});

// Create a model for the scheduled jobs
const Job = mongoose.model('Job', jobSchema);

// API endpoint to schedule a job
app.post('/schedule', async (req, res) => {
  const { day, time } = req.body;

  // Schedule the job
  const scheduleString = `${time} * * ${day.substring(0, 3).toUpperCase()} *`;
  const job = schedule.scheduleJob(scheduleString, () => {
    logger.info( `Job scheduled for ${day} at ${time}`);
  });

  // Save the job to the database
  const newJob = new Job({
    day,
    time,
    job,
 });
  await newJob.save();

  res.send(`Job scheduled for ${day} at ${time}`);
});

// API endpoint to update a scheduled job
app.put('/schedule/:id', async (req, res) => {
  const jobId = req.params.id;
  const { day, time } = req.body;

  // Find the job in the database
  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(404).send('Job not found');
  }

  // Cancel the old job
  job.job.cancel();

  // Schedule the new job
  const scheduleString = `${time} * * ${day.substring(0, 3).toUpperCase()} *`;
  const newJob = schedule.scheduleJob(scheduleString, () => {
    logger.info(`Job updated for ${day} at ${time}`);
  });

  // Update the job in the database
  job.day = day;
  job.time = time;
  job.job = newJob;
  await job.save();

  res.send(`Job updated for ${day} at ${time}`);
});

// API endpoint to delete a scheduled job
app.delete('/schedule/:id', async (req, res) => {
  const jobId = req.params.id;

  // Find the job in the database
  const job = await Job.findById(jobId);

  if (!job) {
    return res.status(404).send('Job not found');
  }

  // Cancelthe job
  job.job.cancel();

  // Remove the job from the database
  await job.remove();

  res.send('Job deleted');
});

const PORT = process.env.PORT;
// Start the server
app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));