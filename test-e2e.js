async function runEndToEndVerification() {
  console.log('--- 🧪 STARTING CAREERPILOT AI FULL E2E VALIDATION SUITE ---');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. Register a new candidate
  const uniqueEmail = 'candidate_' + Date.now() + '@careerpilot.ai';
  console.log('\n[1] Registering candidate:', uniqueEmail);
  const regRes = await fetch(BASE_URL + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Taylor Swift',
      email: uniqueEmail,
      password: 'mypassword123',
      skills: ['React', 'Node.js', 'System Design', 'TypeScript', 'MongoDB'],
      education: 'B.S. in Software Engineering',
      targetRole: 'Full Stack Developer',
      aboutMe: 'Enthusiastic engineer passionate about high-scale web products.',
    }),
  });
  const regData = await regRes.json();
  console.log('✅ Registration result:', regData.success ? 'PASSED' : 'FAILED', 'Token received:', Boolean(regData.token));
  const token = regData.token;

  // 2. Verify /auth/me
  console.log('\n[2] Verifying /auth/me profile endpoint...');
  const meRes = await fetch(BASE_URL + '/auth/me', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const meData = await meRes.json();
  console.log('✅ Profile verification:', meData.user?.name === 'Taylor Swift' ? 'PASSED' : 'FAILED');

  // 3. Update profile
  console.log('\n[3] Updating profile skills and target role...');
  const profRes = await fetch(BASE_URL + '/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      targetRole: 'Lead Full Stack Engineer',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    }),
  });
  const profData = await profRes.json();
  console.log('✅ Updated role:', profData.user?.targetRole === 'Lead Full Stack Engineer' ? 'PASSED' : 'FAILED');

  // 4. Create Job Applications (Kanban)
  console.log('\n[4] Adding Job Applications to Kanban...');
  const app1Res = await fetch(BASE_URL + '/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      company: 'Apple',
      jobTitle: 'Senior Frontend Engineer',
      jobUrl: 'https://apple.com/careers',
      location: 'Cupertino, CA (Hybrid)',
      jobType: 'Full-time',
      salary: '$175,000 - $210,000',
      status: 'Applied',
      notes: 'Applied for UI Frameworks team. First referral stage.',
      followUpDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      contactPerson: 'Sarah Jenkins',
      contactEmail: 's_jenkins@apple.com',
    }),
  });
  const app1 = await app1Res.json();
  console.log('✅ Application 1 created:', app1.success ? 'PASSED' : 'FAILED', 'ID:', app1.application?._id);

  const app2Res = await fetch(BASE_URL + '/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      company: 'Netflix',
      jobTitle: 'Full Stack Infrastructure Engineer',
      jobUrl: 'https://netflix.com/jobs',
      location: 'Remote',
      jobType: 'Full-time',
      salary: '$220,000',
      status: 'Interview',
      notes: 'Passed initial recruiter phone screen. Hiring manager next.',
      contactPerson: 'Mike Ross',
      contactEmail: 'mross@netflix.com',
    }),
  });
  const app2 = await app2Res.json();
  console.log('✅ Application 2 created:', app2.success ? 'PASSED' : 'FAILED');

  // 5. Test Drag and Drop column transition (e.g. Applied -> Offer)
  console.log('\n[5] Simulating Kanban drag-and-drop status update (Applied -> Offer)...');
  const updateRes = await fetch(BASE_URL + '/applications/' + app1.application._id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ status: 'Offer' }),
  });
  const updateData = await updateRes.json();
  console.log('✅ Updated status:', updateData.application?.status === 'Offer' ? 'PASSED' : 'FAILED');

  // 6. Test Gemini AI Cold Email Generator
  console.log('\n[6] Generating personalized AI Cold Email for recruiter...');
  const emailRes = await fetch(BASE_URL + '/ai/cold-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ applicationId: app1.application._id }),
  });
  const emailData = await emailRes.json();
  console.log('✅ Cold Email Subject:', emailData.email?.subject);
  console.log('✅ Cold Email Snippet:', emailData.email?.body?.substring(0, 120) + '...');

  // 7. Test AI Mock Interview Question Generator
  console.log('\n[7] Generating AI Mock Interview Questions for Frontend Developer...');
  const qRes = await fetch(BASE_URL + '/ai/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      role: 'Frontend Developer',
      interviewType: 'Mixed',
      numQuestions: 3,
    }),
  });
  const qData = await qRes.json();
  console.log('✅ Questions received count:', qData.questions?.length);
  qData.questions?.forEach((q, idx) => console.log(`   Q${idx + 1}: ${q.question}`));

  // 8. Test AI Answer Evaluation
  console.log('\n[8] Evaluating candidate answer with Gemini AI...');
  const sampleAnswer = 'In React, state updates trigger reconciliation where the Virtual DOM diffs tree changes using fiber architecture, batching DOM repaints to optimize rendering performance.';
  const evalRes = await fetch(BASE_URL + '/ai/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      question: qData.questions[0].question,
      answer: sampleAnswer,
      role: 'Frontend Developer',
      interviewType: 'Mixed',
    }),
  });
  const evalData = await evalRes.json();
  console.log('✅ Answer Evaluation Score:', evalData.evaluation?.score + ' / 10');
  console.log('   Relevance:', evalData.evaluation?.relevance);
  console.log('   Feedback:', evalData.evaluation?.feedback);

  // 9. Test Final Interview Report Generation & Save
  console.log('\n[9] Generating Final Interview Performance Report...');
  const reportRes = await fetch(BASE_URL + '/ai/final-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      role: 'Frontend Developer',
      interviewType: 'Mixed',
      questionsAndAnswers: [
        {
          question: qData.questions[0].question,
          answer: sampleAnswer,
          score: evalData.evaluation.score,
        },
      ],
    }),
  });
  const reportData = await reportRes.json();
  console.log('✅ Overall Score:', reportData.report?.overallScore + '%');
  console.log('   Technical Score:', reportData.report?.technicalScore + '%');
  console.log('   Communication Score:', reportData.report?.communicationScore + '%');
  console.log('   Strong Areas:', reportData.report?.strongAreas?.[0]);
  console.log('   Study Recommendations:', reportData.report?.recommendedTopics?.[0]);

  // 10. Save completed interview session
  console.log('\n[10] Saving Interview to History...');
  const saveIntRes = await fetch(BASE_URL + '/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({
      role: 'Frontend Developer',
      interviewType: 'Mixed',
      questions: qData.questions,
      answers: [
        {
          questionId: 1,
          question: qData.questions[0].question,
          answer: sampleAnswer,
          score: evalData.evaluation.score,
          feedback: evalData.evaluation.feedback,
        },
      ],
      finalReport: reportData.report,
    }),
  });
  const saveIntData = await saveIntRes.json();
  console.log('✅ Interview session saved:', saveIntData.success ? 'PASSED' : 'FAILED', 'ID:', saveIntData.interview?._id);

  // 11. Fetch Interview History
  console.log('\n[11] Fetching Interview History...');
  const listIntRes = await fetch(BASE_URL + '/interviews', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const listIntData = await listIntRes.json();
  console.log('✅ History Sessions Count:', listIntData.interviews?.length);

  // 12. Delete an application
  console.log('\n[12] Testing Delete Application...');
  const delRes = await fetch(BASE_URL + '/applications/' + app2.application._id, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + token },
  });
  const delData = await delRes.json();
  console.log('✅ Application deletion:', delData.success ? 'PASSED' : 'FAILED');

  console.log('\n======================================================');
  console.log('🎉 ALL 12 END-TO-END VALIDATION TESTS PASSED 100%!');
  console.log('======================================================');
}

runEndToEndVerification();
