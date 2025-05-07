const Project = require('../models/Project');
const Client = require('../models/Client');
const Freelancer = require('../models/Freelancer');
const Notification = require('../models/Notification');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    let query = Project.find(JSON.parse(queryStr))
      .populate({
        path: 'client',
        select: 'name email',
      })
      .populate({
        path: 'freelancer',
        select: 'name email skills averageRating',
      });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Project.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const projects = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      pagination,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'client',
        select: 'name email',
      })
      .populate({
        path: 'freelancer',
        select: 'name email skills averageRating',
      })
      .populate({
        path: 'bids',
        populate: {
          path: 'freelancer',
          select: 'name email skills averageRating',
        },
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Client only)
exports.createProject = async (req, res, next) => {
  try {
    // Add client to req.body
    req.body.client = req.user.id;

    // Check if client exists
    const client = await Client.findById(req.user.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found',
      });
    }

    // Create project
    const project = await Project.create(req.body);

    // Add project to client's projects
    await Client.findByIdAndUpdate(req.user.id, {
      $push: { projects: project._id },
    });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Client only)
exports.updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Make sure user is project owner
    if (
      project.client.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this project',
      });
    }

    // Don't allow status change through this route
    if (req.body.status) {
      delete req.body.status;
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Client only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Make sure user is project owner
    if (
      project.client.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this project',
      });
    }

    // Check if project can be deleted
    if (project.status !== 'open') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete a project that is not in open status',
      });
    }

    await project.deleteOne();

    // Remove project from client's projects
    await Client.findByIdAndUpdate(req.user.id, {
      $pull: { projects: project._id },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update project status
// @route   PUT /api/projects/:id/status
// @access  Private (Client only)
exports.updateProjectStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a status',
      });
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Check authorization based on role and status change
    if (req.user.role === 'client') {
      // Make sure user is project owner
      if (project.client.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this project',
        });
      }
    } else if (req.user.role === 'freelancer') {
      // Make sure user is the assigned freelancer
      if (project.freelancer?.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this project',
        });
      }

      // Freelancers can only mark projects as completed
      if (status !== 'completed') {
        return res.status(401).json({
          success: false,
          error: 'Freelancers can only mark projects as completed',
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this project',
      });
    }

    // Validate status transition
    const validTransitions = {
      open: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!validTransitions[project.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from ${project.status} to ${status}`,
      });
    }

    // Update status
    project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'completed' ? { completedAt: Date.now() } : {}),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // If project is completed, create notification for the other party
    if (status === 'completed') {
      if (req.user.role === 'client' && project.freelancer) {
        // Client marked project as complete, notify freelancer
        await Notification.create({
          recipient: project.freelancer,
          sender: req.user.id,
          type: 'project-completed',
          title: 'Project Completed',
          message: `The client has marked the project "${project.title}" as completed.`,
          relatedProject: project._id,
        });
      } else if (req.user.role === 'freelancer' && project.client) {
        // Freelancer marked project as complete, notify client
        await Notification.create({
          recipient: project.client,
          sender: req.user.id,
          type: 'project-completed',
          title: 'Project Completion Request',
          message: `The freelancer has marked the project "${project.title}" as completed. Please review and confirm.`,
          relatedProject: project._id,
        });
      }

      // Update freelancer's completedProjects array
      if (project.freelancer) {
        await Freelancer.findByIdAndUpdate(project.freelancer, {
          $addToSet: { completedProjects: project._id },
          $pull: { activeProjects: project._id },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add milestone to project
// @route   POST /api/projects/:id/milestones
// @access  Private (Client only)
exports.addMilestone = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Make sure user is project owner
    if (
      project.client.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to add milestones to this project',
      });
    }

    // Add milestone
    project.milestones.push(req.body);
    await project.save();

    // If project has a freelancer, create notification
    if (project.freelancer) {
      await Notification.create({
        recipient: project.freelancer,
        sender: req.user.id,
        type: 'project-milestone',
        title: 'New Milestone Added',
        message: `A new milestone "${req.body.title}" has been added to the project "${project.title}".`,
        relatedProject: project._id,
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update milestone status
// @route   PUT /api/projects/:id/milestones/:milestoneId
// @access  Private (Client/Freelancer)
exports.updateMilestoneStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a status',
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Find milestone
    const milestone = project.milestones.id(req.params.milestoneId);

    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found',
      });
    }

    // Check authorization based on status change
    if (req.user.role === 'freelancer') {
      // Freelancer can only mark milestone as completed
      if (status !== 'completed') {
        return res.status(401).json({
          success: false,
          error: 'Freelancer can only mark milestone as completed',
        });
      }

      // Make sure user is the project freelancer
      if (project.freelancer.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this milestone',
        });
      }
    } else if (req.user.role === 'client') {
      // Client can only approve or reject completed milestone
      if (
        milestone.status !== 'completed' ||
        (status !== 'approved' && status !== 'in-progress')
      ) {
        return res.status(401).json({
          success: false,
          error: 'Client can only approve or reject completed milestones',
        });
      }

      // Make sure user is the project client
      if (project.client.toString() !== req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this milestone',
        });
      }
    }

    // Update milestone status
    milestone.status = status;

    // Add timestamps based on status
    if (status === 'completed') {
      milestone.completedAt = Date.now();
    } else if (status === 'approved') {
      milestone.approvedAt = Date.now();
    }

    await project.save();

    // Create notification for the other party
    const recipient =
      req.user.role === 'client' ? project.freelancer : project.client;
    const action =
      status === 'completed'
        ? 'marked as completed'
        : status === 'approved'
        ? 'approved'
        : 'returned for revision';

    await Notification.create({
      recipient,
      sender: req.user.id,
      type: 'project-milestone',
      title: 'Milestone Update',
      message: `The milestone "${milestone.title}" has been ${action}.`,
      relatedProject: project._id,
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get projects for current user
// @route   GET /api/projects/me
// @access  Private
exports.getMyProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'client') {
      projects = await Project.find({ client: req.user.id })
        .populate({
          path: 'freelancer',
          select: 'name email skills averageRating',
        })
        .populate({
          path: 'bids',
          populate: {
            path: 'freelancer',
            select: 'name email skills averageRating',
          },
        })
        .sort('-createdAt');
    } else if (req.user.role === 'freelancer') {
      // Get projects where freelancer is assigned or has bid
      const freelancer = await Freelancer.findById(req.user.id);

      // Get projects where freelancer is assigned
      const assignedProjects = await Project.find({ freelancer: req.user.id })
        .populate({
          path: 'client',
          select: 'name email',
        })
        .populate({
          path: 'freelancer',
          select: 'name email skills averageRating',
        })
        .sort('-createdAt');

      // Get projects where freelancer has bid
      let bidProjectIds = [];

      // Check if freelancer has bids
      if (freelancer && freelancer.bids && freelancer.bids.length > 0) {
        // Extract project IDs from bids, handling both object and string references
        bidProjectIds = freelancer.bids
          .map((bid) =>
            typeof bid === 'object' && bid.project ? bid.project : bid
          )
          .filter((id) => id); // Filter out any undefined/null values
      }

      const bidProjects = await Project.find({
        _id: { $in: bidProjectIds },
        freelancer: { $exists: false }, // Only include projects that don't have a freelancer assigned
      })
        .populate({
          path: 'client',
          select: 'name email',
        })
        .populate({
          path: 'freelancer',
          select: 'name email skills averageRating',
        })
        .populate({
          path: 'bids',
          populate: {
            path: 'freelancer',
            select: 'name email skills averageRating',
          },
        })
        .sort('-createdAt');

      projects = [...assignedProjects, ...bidProjects];
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    next(err);
  }
};
