import { JobApplication } from '../models/JobApplication.js';

// @desc    Get all applications for current user
// @route   GET /api/applications
// @access  Private
export const getApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error('[Get Applications Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('[Get Application Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new job application
// @route   POST /api/applications
// @access  Private
export const createApplication = async (req, res) => {
  try {
    const {
      company,
      jobTitle,
      jobUrl,
      location,
      jobType,
      salary,
      applicationDate,
      status,
      notes,
      followUpDate,
      contactPerson,
      contactEmail,
    } = req.body;

    if (!company || !jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Company name and Job title are required',
      });
    }

    const application = await JobApplication.create({
      userId: req.user._id,
      company,
      jobTitle,
      jobUrl: jobUrl || '',
      location: location || 'Remote',
      jobType: jobType || 'Full-time',
      salary: salary || '',
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      status: status || 'Applied',
      notes: notes || '',
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      contactPerson: contactPerson || '',
      contactEmail: contactEmail || '',
    });

    res.status(201).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error('[Create Application Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application
// @route   PUT /api/applications/:id
// @access  Private
export const updateApplication = async (req, res) => {
  try {
    const application = await JobApplication.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const fields = [
      'company',
      'jobTitle',
      'jobUrl',
      'location',
      'jobType',
      'salary',
      'applicationDate',
      'status',
      'notes',
      'followUpDate',
      'contactPerson',
      'contactEmail',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'applicationDate' || field === 'followUpDate') {
          application[field] = req.body[field] ? new Date(req.body[field]) : null;
        } else {
          application[field] = req.body[field];
        }
      }
    });

    const updated = await application.save();

    res.json({
      success: true,
      application: updated,
    });
  } catch (error) {
    console.error('[Update Application Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
export const deleteApplication = async (req, res) => {
  try {
    const application = await JobApplication.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    console.error('[Delete Application Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
